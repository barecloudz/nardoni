import React from 'react'
import Header from '../components/layout/header'
import Footer from '../components/layout/footer'
import ServicesListing from '../components/sections/services-listing'
import CallToAction from '../components/sections/call-to-action'

const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ServicesListing />
      <CallToAction />
      <Footer />
    </div>
  )
}

export default ServicesPage
