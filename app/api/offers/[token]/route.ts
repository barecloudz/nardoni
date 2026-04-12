import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Public — GET /api/offers/[token]
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params

  const { data: offer, error } = await supabaseAdmin
    .from('service_offers')
    .select('id, service_name, description, features, price, period, stripe_payment_link_url, status, client_id')
    .eq('token', token)
    .single()

  if (error || !offer) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
  }

  // Fetch client name if linked
  let clientCompany = null
  if (offer.client_id) {
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('name, company')
      .eq('id', offer.client_id)
      .single()
    clientCompany = client?.company || client?.name || null
  }

  return NextResponse.json({ ...offer, client_company: clientCompany })
}
