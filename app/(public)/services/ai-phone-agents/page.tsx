import type { Metadata } from 'next'
import AIPhoneAgentsContent from '../../../../src/page-content/services/ai-phone-agents'

export const metadata: Metadata = {
  title: 'AI Phone Agents - Automated Call Handling & Booking | Nardoni Digital',
  description: 'Transform your phone system with AI phone agents. Handle calls 24/7, book appointments automatically, and never miss a customer call again.',
  openGraph: {
    title: 'AI Phone Agents - Automated Call Handling & Booking | Nardoni Digital',
    description: 'Transform your phone system with AI phone agents. Handle calls 24/7, book appointments automatically, and never miss a customer call again.',
  },
  alternates: {
    canonical: 'https://nardonidigital.com/services/ai-phone-agents',
  },
}

export default function AIPhoneAgentsPage() {
  return <AIPhoneAgentsContent />
}
