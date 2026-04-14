import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Fetch all invoices
export const getStripeInvoices = async () => {
  const invoices = await stripe.invoices.list({ limit: 100 })
  return invoices.data
}

// Fetch all payment intents
export const getStripePayments = async () => {
  const payments = await stripe.paymentIntents.list({ limit: 100 })
  return payments.data
}

// Fetch all payment links
export const getStripePaymentLinks = async () => {
  const links = await stripe.paymentLinks.list({ limit: 100 })
  return links.data
}

const CHECKOUT_CUSTOM_FIELDS = [
  { key: 'first_name', label: { type: 'custom' as const, custom: 'First Name' }, type: 'text' as const },
  { key: 'company_name', label: { type: 'custom' as const, custom: 'Company Name' }, type: 'text' as const },
]

// Create a payment link for a service (single line item)
export const createStripePaymentLink = async ({
  name,
  amount,
  currency = 'usd',
  recurring,
}: {
  name: string
  amount: number // in cents
  currency?: string
  recurring?: 'week' | 'month' | 'year'
}) => {
  const product = await stripe.products.create({ name })
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency,
    ...(recurring && { recurring: { interval: recurring } }),
  })
  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    custom_fields: CHECKOUT_CUSTOM_FIELDS,
  })
  return link
}

// Create a payment link with multiple line items (e.g. recurring base + one-time add-on)
export const createStripePaymentLinkMulti = async ({
  items,
  currency = 'usd',
}: {
  items: Array<{ name: string; amount: number; recurring?: 'week' | 'month' | 'year' }>
  currency?: string
}) => {
  const lineItems = await Promise.all(
    items.map(async item => {
      const product = await stripe.products.create({ name: item.name })
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: item.amount,
        currency,
        ...(item.recurring && { recurring: { interval: item.recurring } }),
      })
      return { price: price.id, quantity: 1 }
    })
  )
  const link = await stripe.paymentLinks.create({
    line_items: lineItems,
    custom_fields: CHECKOUT_CUSTOM_FIELDS,
  })
  return link
}

// Create and send an invoice to a client
export const createStripeInvoice = async ({
  customerEmail,
  customerName,
  description,
  amount,
  currency = 'usd',
  dueInDays = 14,
}: {
  customerEmail: string
  customerName: string
  description: string
  amount: number // in cents
  currency?: string
  dueInDays?: number
}) => {
  // Find or create customer
  const existingCustomers = await stripe.customers.list({ email: customerEmail, limit: 1 })
  const customer = existingCustomers.data.length > 0
    ? existingCustomers.data[0]
    : await stripe.customers.create({ email: customerEmail, name: customerName })

  // Create invoice item
  await stripe.invoiceItems.create({
    customer: customer.id,
    amount,
    currency,
    description,
  })

  // Create and finalize invoice
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: 'send_invoice',
    days_until_due: dueInDays,
  })

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)
  await stripe.invoices.sendInvoice(finalizedInvoice.id)

  return finalizedInvoice
}
