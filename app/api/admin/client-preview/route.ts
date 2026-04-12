import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: NextRequest) {
  // Verify the requesting user is an authenticated admin
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: { user }, error: userError } = await anonClient.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin =
    user.user_metadata?.role === 'admin' ||
    user.email === 'blake@nardonidigital.com'

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const clientId = req.nextUrl.searchParams.get('clientId')
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 })
  }

  const [reportsResult, servicesResult, invoicesResult] = await Promise.all([
    supabaseAdmin
      .from('client_reports')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'published')
      .order('week_start', { ascending: false }),

    supabaseAdmin
      .from('client_service_values')
      .select('*')
      .eq('client_id', clientId)
      .eq('active', true)
      .order('display_order', { ascending: true }),

    supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    reports: reportsResult.data || [],
    services: servicesResult.data || [],
    invoices: invoicesResult.data || [],
  })
}
