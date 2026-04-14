import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createStripePaymentLink, createStripePaymentLinkMulti } from '../../../../src/lib/stripe'

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

// Returns all non-empty subsets of an array of indices
function subsets(indices: number[]): number[][] {
  return indices.reduce<number[][]>(
    (acc, i) => acc.concat(acc.map(s => [...s, i])),
    [[]]
  ).filter(s => s.length > 0)
}

// Build Stripe line items for a given set of addons + base offer
function buildLineItems(
  baseName: string,
  basePrice: number,
  basePeriod: string,
  selectedAddons: any[]
) {
  const recurring = RECURRING_MAP[basePeriod]

  // Separate recurring vs one-time addons
  const recurringAddons = selectedAddons.filter(a => (a.period || basePeriod) !== 'one-time')
  const onetimeAddons = selectedAddons.filter(a => (a.period || basePeriod) === 'one-time')

  const items: Array<{ name: string; amount: number; recurring?: 'week' | 'month' | 'year' }> = []

  // Base + all recurring addons combined into one recurring line item
  const recurringTotal = basePrice + recurringAddons.reduce((s: number, a: any) => s + a.price, 0)
  const recurringName = recurringAddons.length > 0
    ? `${baseName} + ${recurringAddons.map((a: any) => a.name).join(' + ')}`
    : baseName
  items.push({ name: recurringName, amount: Math.round(recurringTotal * 100), recurring })

  // Each one-time addon as its own line item
  for (const a of onetimeAddons) {
    items.push({ name: a.name, amount: Math.round(a.price * 100) })
  }

  return items
}

// Generate all Stripe links for an offer: base + each addon combo
// Returns addons array with stripe_combos populated, plus the base stripe URL
async function generateAllStripeLinks(
  serviceName: string,
  price: number,
  period: string,
  addons: any[]
): Promise<{ stripeUrl: string; stripeLinkId: string; addonsWithLinks: any[] }> {
  // Base link (no addons)
  const baseLink = await createStripePaymentLink({
    name: serviceName,
    amount: Math.round(price * 100),
    recurring: RECURRING_MAP[period],
  })

  if (!addons || addons.length === 0) {
    return { stripeUrl: baseLink.url, stripeLinkId: baseLink.id, addonsWithLinks: [] }
  }

  // Build all non-empty subsets of addon indices
  const allSubsets = subsets(addons.map((_: any, i: number) => i))

  // Map: subset key → stripe URL (e.g. "0" → url, "1" → url, "0,1" → url)
  const comboMap: Record<string, string> = {}
  for (const subset of allSubsets) {
    const key = subset.join(',')
    const selectedAddons = subset.map(i => addons[i])
    const items = buildLineItems(serviceName, price, period, selectedAddons)
    try {
      const link = items.length === 1
        ? await createStripePaymentLink({ ...items[0] })
        : await createStripePaymentLinkMulti({ items })
      comboMap[key] = link.url
    } catch {
      comboMap[key] = ''
    }
  }

  // Attach stripe_combos to each addon so the pay page can look up the right URL
  const addonsWithLinks = addons.map((addon: any, i: number) => {
    const soloKey = String(i)
    const combos: Record<string, string> = {}
    // All subsets that include this addon
    for (const [key, url] of Object.entries(comboMap)) {
      const indices = key.split(',').map(Number)
      if (indices.includes(i)) {
        combos[key] = url
      }
    }
    return {
      ...addon,
      stripe_payment_link_url: comboMap[soloKey] || '',
      stripe_combos: combos,
    }
  })

  return { stripeUrl: baseLink.url, stripeLinkId: baseLink.id, addonsWithLinks }
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

// POST /api/admin/offers
export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { client_id, service_name, description, features, price, period, addons, service_cards } = body

  if (!service_name || !price) {
    return NextResponse.json({ error: 'service_name and price are required' }, { status: 400 })
  }

  let stripeUrl = null
  let stripeLinkId = null
  let addonsWithLinks = addons || null

  try {
    const result = await generateAllStripeLinks(service_name, price, period, addons || [])
    stripeUrl = result.stripeUrl
    stripeLinkId = result.stripeLinkId
    addonsWithLinks = result.addonsWithLinks.length > 0 ? result.addonsWithLinks : null
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
      addons: addonsWithLinks,
      service_cards: service_cards || null,
      status: 'pending',
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/admin/offers
export async function PATCH(req: NextRequest) {
  const user = await verifyAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, service_name, description, features, addons, service_cards } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data: current } = await supabaseAdmin
    .from('service_offers')
    .select('price, period, service_name, stripe_payment_link_url, stripe_payment_link_id')
    .eq('id', id)
    .single()

  const baseName = service_name ?? current?.service_name
  const basePrice = current?.price ?? 0
  const basePeriod = current?.period ?? 'monthly'

  const updates: Record<string, any> = {}
  if (service_name !== undefined) updates.service_name = service_name
  if (description !== undefined) updates.description = description || null
  if (features !== undefined) updates.features = features || null
  if (service_cards !== undefined) updates.service_cards = service_cards

  // Regenerate base Stripe link if missing
  if (!current?.stripe_payment_link_url) {
    try {
      const link = await createStripePaymentLink({
        name: baseName,
        amount: Math.round(basePrice * 100),
        recurring: RECURRING_MAP[basePeriod],
      })
      updates.stripe_payment_link_url = link.url
      updates.stripe_payment_link_id = link.id
    } catch { /* keep null */ }
  }

  // Regenerate all combo Stripe links for addons
  if (addons !== undefined) {
    try {
      const result = await generateAllStripeLinks(baseName, basePrice, basePeriod, addons || [])
      updates.addons = result.addonsWithLinks.length > 0 ? result.addonsWithLinks : null
      if (!current?.stripe_payment_link_url) {
        updates.stripe_payment_link_url = result.stripeUrl
        updates.stripe_payment_link_id = result.stripeLinkId
      }
    } catch {
      updates.addons = addons
    }
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
