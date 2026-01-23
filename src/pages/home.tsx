import React from 'react'
import { Helmet } from 'react-helmet-async'
import Header from '../components/layout/header'
import Footer from '../components/layout/footer'
import Hero from '../components/sections/hero'
import Problem from '../components/sections/problem'
import Guarantee from '../components/sections/guarantee'
import HowItWorks from '../components/sections/how-it-works'
import Services from '../components/sections/services'
import Benefits from '../components/sections/benefits'
import CallToAction from '../components/sections/call-to-action'

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Nardoni Digital - We Make Local Businesses More Money</title>
        <meta name="description" content="Get on page 1 of Google in 90 days. Guaranteed or your money back. Local SEO, Google Business optimization, and digital marketing for local businesses." />
        <meta property="og:title" content="Nardoni Digital - We Make Local Businesses More Money" />
        <meta property="og:description" content="Get on page 1 of Google in 90 days. Guaranteed or your money back. Local SEO and digital marketing for local businesses." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://nardonidigital.com/" />
      </Helmet>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Guarantee />
        <HowItWorks />
        <Services />
        <Benefits />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage