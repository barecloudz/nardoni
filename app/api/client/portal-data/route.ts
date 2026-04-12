import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// GET /api/client/portal-data — returns all data the client portal needs
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify the user is authenticated
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: { user }, error: userError } = await anonClient.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Look up the client record by user_id
  const { data: clientRecord, error: clientError } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (clientError || !clientRecord) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Fetch all portal data in parallel
  const [reportsResult, servicesResult, invoicesResult] = await Promise.all([
    supabaseAdmin
      .from('client_reports')
      .select('*')
      .eq('client_id', clientRecord.id)
      .eq('status', 'published')
      .order('week_start', { ascending: false }),

    supabaseAdmin
      .from('client_service_values')
      .select('*')
      .eq('client_id', clientRecord.id)
      .eq('active', true)
      .order('display_order', { ascending: true }),

    supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('client_id', clientRecord.id)
      .order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    client: clientRecord,
    reports: reportsResult.data || [],
    services: servicesResult.data || [],
    invoices: invoicesResult.data || [],
  })
}
