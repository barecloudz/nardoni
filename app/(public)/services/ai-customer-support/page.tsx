import type { Metadata } from 'next'
import AICustomerSupportContent from '../../../../src/page-content/services/ai-customer-support'

export const metadata: Metadata = {
  title: 'AI Customer Support - 24/7 Automated Support | Nardoni Digital',
  description: 'Never miss a customer inquiry with 24/7 AI-powered customer support. Instant responses, multi-language support, and unlimited scalability for local businesses.',
  openGraph: {
    title: 'AI Customer Support - 24/7 Automated Support | Nardoni Digital',
    description: 'Never miss a customer inquiry with 24/7 AI-powered customer support. Instant responses, multi-language support, and unlimited scalability.',
  },
  alternates: {
    canonical: 'https://nardonidigital.com/services/ai-customer-support',
  },
}

export default function AICustomerSupportPage() {
  return <AICustomerSupportContent />
}
