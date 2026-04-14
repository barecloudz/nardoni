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

const RECURRING_MAP: Record<string, 'week' | 'month' | 'year' | undefined> = {
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
}

// GET /api/admin/offers
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

// POST /api/admin/offers — create offer + auto-generate Stripe links for base + every addon
export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { client_id, service_name, description, features, price, period, addons, service_cards } = body

  if (!service_name || !price) {
    return NextResponse.json({ error: 'service_name and price are required' }, { status: 400 })
  }

  // Create base Stripe payment link
  let stripeUrl = null
  let stripeLinkId = null
  try {
    const link = await createStripePaymentLink({
      name: service_name,
      amount: Math.round(price * 100),
      recurring: RECURRING_MAP[period],
    })
    stripeUrl = link.url
    stripeLinkId = link.id
  } catch (e: any) {
    return NextResponse.json({ error: `Stripe error: ${e.message}` }, { status: 500 })
  }

  // Auto-generate Stripe links for each addon
  let addonsWithLinks = null
  if (Array.isArray(addons) && addons.length > 0) {
    addonsWithLinks = await Promise.all(
      addons.map(async (addon: any) => {
        const addonPeriod: string = addon.period || period
        const isOneTime = addonPeriod === 'one-time'
        // Recurring addons: link price = base + addon (one payment covers the full package)
        // One-time addons: link price = addon price only (charged separately)
        const linkAmount = isOneTime ? addon.price : price + addon.price
        const linkName = isOneTime ? addon.name : `${service_name} + ${addon.name}`
        try {
          const link = await createStripePaymentLink({
            name: linkName,
            amount: Math.round(linkAmount * 100),
            recurring: isOneTime ? undefined : RECURRING_MAP[period],
          })
          return { ...addon, stripe_payment_link_url: link.url }
        } catch {
          return { ...addon, stripe_payment_link_url: '' }
        }
      })
    )
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
      addons: addonsWithLinks,
      service_cards: service_cards || null,
      status: 'pending',
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/admin/offers — update offer; regenerates Stripe links for any addon missing one
export async function PATCH(req: NextRequest) {
  const user = await verifyAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, service_name, description, features, addons, service_cards } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Fetch the current offer so we know the base price + period for link generation
  const { data: current } = await supabaseAdmin
    .from('service_offers')
    .select('price, period, service_name, stripe_payment_link_url, stripe_payment_link_id')
    .eq('id', id)
    .single()

  const baseName = service_name ?? current?.service_name
  const basePrice = current?.price ?? 0
  const basePeriod = current?.period ?? 'monthly'

  // Regenerate base Stripe link if missing
  let baseStripeUrl = current?.stripe_payment_link_url
  let baseStripeLinkId = current?.stripe_payment_link_id
  if (!baseStripeUrl) {
    try {
      const link = await createStripePaymentLink({
        name: baseName,
        amount: Math.round(basePrice * 100),
        recurring: RECURRING_MAP[basePeriod],
      })
      baseStripeUrl = link.url
      baseStripeLinkId = link.id
    } catch { /* keep null */ }
  }

  // Regenerate Stripe links for addons that are missing one
  let resolvedAddons = addons ?? undefined
  if (Array.isArray(addons)) {
    resolvedAddons = await Promise.all(
      addons.map(async (addon: any) => {
        if (addon.stripe_payment_link_url) return addon
        const addonPeriod: string = addon.period || basePeriod
        const isOneTime = addonPeriod === 'one-time'
        const linkAmount = isOneTime ? addon.price : basePrice + addon.price
        const linkName = isOneTime ? addon.name : `${baseName} + ${addon.name}`
        try {
          const link = await createStripePaymentLink({
            name: linkName,
            amount: Math.round(linkAmount * 100),
            recurring: isOneTime ? undefined : RECURRING_MAP[basePeriod],
          })
          return { ...addon, stripe_payment_link_url: link.url }
        } catch {
          return addon
        }
      })
    )
  }

  const updates: Record<string, any> = {}
  if (service_name !== undefined) updates.service_name = service_name
  if (description !== undefined) updates.description = description || null
  if (features !== undefined) updates.features = features || null
  if (resolvedAddons !== undefined) updates.addons = resolvedAddons
  if (service_cards !== undefined) updates.service_cards = service_cards
  if (baseStripeUrl) {
    updates.stripe_payment_link_url = baseStripeUrl
    updates.stripe_payment_link_id = baseStripeLinkId
  }

  const { data, error } = await supabaseAdmin
    .from('service_offers')
    .update(updates)
    .eq('id', id)
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
