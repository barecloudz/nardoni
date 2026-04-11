import { NextResponse } from 'next/server'
import { getStripePayments } from '../../../../src/lib/stripe'

export async function GET() {
  try {
    const payments = await getStripePayments()
    return NextResponse.json({ payments })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
