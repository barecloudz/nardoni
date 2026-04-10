import type { Metadata } from 'next'
import PaidAdvertisingContent from '../../../../src/page-content/services/paid-advertising'

export const metadata: Metadata = {
  title: 'Paid Advertising - Google Ads & Meta Ads Management | Nardoni Digital',
  description: 'Get immediate results with paid advertising. Expert Google Ads and Meta Ads management for local businesses. Precise targeting, measurable ROI, and complete cost control.',
  openGraph: {
    title: 'Paid Advertising - Google Ads & Meta Ads Management | Nardoni Digital',
    description: 'Get immediate results with paid advertising. Expert Google Ads and Meta Ads management for local businesses.',
  },
  alternates: {
    canonical: 'https://nardonidigital.com/services/paid-advertising',
  },
}

export default function PaidAdvertisingPage() {
  return <PaidAdvertisingContent />
}
