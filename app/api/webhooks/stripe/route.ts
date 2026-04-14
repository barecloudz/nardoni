import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const name = session.customer_details?.name ?? null
    const email = session.customer_details?.email ?? null

    if (!email) {
      // No email — nothing to do
      return NextResponse.json({ received: true })
    }

    // Check if a client with this email already exists
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (lookupError) {
      console.error('Supabase lookup error:', lookupError.message)
      // Return 200 anyway so Stripe doesn't retry indefinitely
      return NextResponse.json({ received: true })
    }

    if (!existing) {
      const { error: insertError } = await supabaseAdmin
        .from('clients')
        .insert({
          name: name || email,
          email,
          status: 'active',
        })

      if (insertError) {
        console.error('Supabase insert error:', insertError.message)
      } else {
        console.log(`New client created from Stripe checkout: ${email}`)
      }
    } else {
      console.log(`Client already exists for email: ${email} — skipping`)
    }
  }

  return NextResponse.json({ received: true })
}
