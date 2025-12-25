import React from 'react'
import { Helmet } from 'react-helmet-async'
import Header from '../components/layout/header'
import Footer from '../components/layout/footer'
import Hero from '../components/sections/hero'
import Services from '../components/sections/services'
import HowItWorks from '../components/sections/how-it-works'
import Benefits from '../components/sections/benefits'
import Testimonials from '../components/sections/testimonials'
import CallToAction from '../components/sections/call-to-action'

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Nardoni Digital - Fill Your Calendar with New Customers</title>
        <meta name="description" content="Transform your local business with AI-powered marketing solutions. Get more customers with SEO, social media, paid ads, and 24/7 AI customer support. Book a free consultation today." />
        <meta property="og:title" content="Nardoni Digital - Fill Your Calendar with New Customers" />
        <meta property="og:description" content="Transform your local business with AI-powered marketing solutions. Get more customers with SEO, social media, paid ads, and 24/7 AI customer support." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://nardonidigital.com/" />
      </Helmet>
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage