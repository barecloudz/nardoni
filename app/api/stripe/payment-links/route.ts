import { NextResponse } from 'next/server'
import { getStripePaymentLinks, createStripePaymentLink } from '../../../../src/lib/stripe'

export async function GET() {
  try {
    const links = await getStripePaymentLinks()
    return NextResponse.json({ links })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, amount, currency, recurring } = body

    if (!name || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const link = await createStripePaymentLink({
      name,
      amount: Math.round(amount * 100), // convert dollars to cents
      currency,
      recurring,
    })

    return NextResponse.json({ link })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
