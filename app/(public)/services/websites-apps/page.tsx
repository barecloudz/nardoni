import type { Metadata } from 'next'
import WebsitesAppsContent from '../../../../src/page-content/services/websites-apps'

export const metadata: Metadata = {
  title: 'Website & App Development - Custom Digital Solutions | Nardoni Digital',
  description: 'Professional website and mobile app development for local businesses. Modern, responsive designs that convert visitors into customers. E-commerce, custom apps, and ongoing maintenance.',
  openGraph: {
    title: 'Website & App Development - Custom Digital Solutions | Nardoni Digital',
    description: 'Professional website and mobile app development for local businesses. Modern, responsive designs that convert visitors into customers.',
  },
  alternates: {
    canonical: 'https://nardonidigital.com/services/websites-apps',
  },
}

export default function WebsitesAppsPage() {
  return <WebsitesAppsContent />
}
