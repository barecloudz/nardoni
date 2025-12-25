import React from 'react'
import { Helmet } from 'react-helmet-async'
import Header from '../components/layout/header'
import Footer from '../components/layout/footer'
import ServicesListing from '../components/sections/services-listing'
import CallToAction from '../components/sections/call-to-action'

const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Digital Marketing Services for Local Businesses | Nardoni Digital</title>
        <meta name="description" content="Explore our full range of digital marketing services: AI customer support, phone agents, social media marketing, SEO, paid advertising, and website development for local businesses." />
        <meta property="og:title" content="Digital Marketing Services for Local Businesses | Nardoni Digital" />
        <meta property="og:description" content="Explore our full range of digital marketing services: AI customer support, phone agents, social media marketing, SEO, paid advertising, and website development." />
        <link rel="canonical" href="https://nardonidigital.com/services" />
      </Helmet>
      <Header />
      <ServicesListing />
      <CallToAction />
      <Footer />
    </div>
  )
}

export default ServicesPage
