import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: { user } } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''))
  if (!user) return null
  const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'blake@nardonidigital.com'
  return isAdmin ? user : null
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [clientsResult, invoicesResult, contactsResult, reportsResult] = await Promise.all([
    supabaseAdmin
      .from('clients')
      .select('id, name, company, status, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('invoices')
      .select('id, amount, status, number, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('contacts')
      .select('id, name, email, status, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('client_reports')
      .select('id, client_id, week_start, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const clients = clientsResult.data || []
  const invoices = invoicesResult.data || []
  const contacts = contactsResult.data || []
  const reports = reportsResult.data || []

  const totalRevenuePaid = invoices
    .filter((i: any) => i.status === 'paid')
    .reduce((sum: number, i: any) => sum + (Number(i.amount) || 0), 0)

  const unreadContacts = contacts.filter((c: any) => c.status === 'unread').length

  // Build real recent activity from actual DB events
  const activity: { type: string; message: string; created_at: string }[] = []

  clients.slice(0, 4).forEach((c: any) => {
    activity.push({
      type: 'client',
      message: `Client "${c.name}"${c.company ? ` (${c.company})` : ''} added`,
      created_at: c.created_at,
    })
  })

  invoices
    .filter((i: any) => i.status === 'paid')
    .slice(0, 3)
    .forEach((i: any) => {
      activity.push({
        type: 'invoice',
        message: `Invoice ${i.number ? `#${i.number}` : ''} paid — $${Number(i.amount).toLocaleString()}`,
        created_at: i.created_at,
      })
    })

  contacts
    .filter((c: any) => c.status === 'unread')
    .slice(0, 3)
    .forEach((c: any) => {
      activity.push({
        type: 'contact',
        message: `New contact from ${c.name || c.email}`,
        created_at: c.created_at,
      })
    })

  reports
    .filter((r: any) => r.status === 'published')
    .slice(0, 3)
    .forEach((r: any) => {
      activity.push({
        type: 'report',
        message: `Weekly report published (week of ${r.week_start})`,
        created_at: r.created_at,
      })
    })

  activity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json({
    clientCount: clients.length,
    totalRevenuePaid,
    unreadContacts,
    publishedReports: reports.filter((r: any) => r.status === 'published').length,
    recentActivity: activity.slice(0, 6),
  })
}
