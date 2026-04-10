import type { Metadata } from 'next'
import ServicesListing from '../../../src/components/sections/services-listing'
import CallToAction from '../../../src/components/sections/call-to-action'

export const metadata: Metadata = {
  title: 'Digital Marketing Services for Local Businesses | Nardoni Digital',
  description: 'Explore our full range of digital marketing services: AI customer support, phone agents, social media marketing, SEO, paid advertising, and website development for local businesses.',
  openGraph: {
    title: 'Digital Marketing Services for Local Businesses | Nardoni Digital',
    description: 'Explore our full range of digital marketing services: AI customer support, phone agents, social media marketing, SEO, paid advertising, and website development.',
  },
  alternates: {
    canonical: 'https://nardonidigital.com/services',
  },
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <ServicesListing />
      <CallToAction />
    </div>
  )
}
