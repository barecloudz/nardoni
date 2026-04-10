import type { Metadata } from 'next'
import Hero from '../../src/components/sections/hero'
import Problem from '../../src/components/sections/problem'
import Guarantee from '../../src/components/sections/guarantee'
import HowItWorks from '../../src/components/sections/how-it-works'
import Services from '../../src/components/sections/services'
import Benefits from '../../src/components/sections/benefits'

export const metadata: Metadata = {
  title: 'Nardoni Digital - We Make Local Businesses More Money',
  description: '$500/month to get your business on page 1 of Google in 90 days or we keep working for free. Local SEO, Google Business optimization, and digital marketing for local businesses.',
  openGraph: {
    title: 'Nardoni Digital - We Make Local Businesses More Money',
    description: '$500/month to get your business on page 1 of Google in 90 days or we keep working for free.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://nardonidigital.com/',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Problem />
      <Guarantee />
      <HowItWorks />
      <Services />
      <Benefits />
    </div>
  )
}
