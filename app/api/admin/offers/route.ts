import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createStripePaymentLink } from '../../../../src/lib/stripe'

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

// GET /api/admin/offers?clientId=xxx
export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clientId = req.nextUrl.searchParams.get('clientId')
  const query = supabaseAdmin
    .from('service_offers')
    .select('*')
    .order('created_at', { ascending: false })

  if (clientId) query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/offers — create offer + stripe payment link
export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { client_id, service_name, description, features, price, period } = body

  if (!service_name || !price) {
    return NextResponse.json({ error: 'service_name and price are required' }, { status: 400 })
  }

  // Create Stripe payment link
  let stripeUrl = null
  let stripeLinkId = null
  try {
    const link = await createStripePaymentLink({
      name: service_name,
      amount: Math.round(price * 100),
      recurring: period === 'monthly' ? 'month' : period === 'yearly' ? 'year' : undefined,
    })
    stripeUrl = link.url
    stripeLinkId = link.id
  } catch (e: any) {
    return NextResponse.json({ error: `Stripe error: ${e.message}` }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin
    .from('service_offers')
    .insert([{
      client_id: client_id || null,
      service_name,
      description: description || null,
      features: features || null,
      price,
      period,
      stripe_payment_link_url: stripeUrl,
      stripe_payment_link_id: stripeLinkId,
      status: 'pending',
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/admin/offers?id=xxx
export async function DELETE(req: NextRequest) {
  const user = await verifyAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('service_offers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
