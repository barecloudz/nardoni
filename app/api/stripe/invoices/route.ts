import { NextResponse } from 'next/server'
import { getStripeInvoices, createStripeInvoice } from '../../../../src/lib/stripe'

export async function GET() {
  try {
    const invoices = await getStripeInvoices()
    return NextResponse.json({ invoices })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerEmail, customerName, description, amount, currency, dueInDays } = body

    if (!customerEmail || !customerName || !description || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const invoice = await createStripeInvoice({
      customerEmail,
      customerName,
      description,
      amount: Math.round(amount * 100), // convert dollars to cents
      currency,
      dueInDays,
    })

    return NextResponse.json({ invoice })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
