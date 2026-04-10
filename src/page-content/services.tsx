'use client'

import React from 'react'
import ServicesListing from '../components/sections/services-listing'
import CallToAction from '../components/sections/call-to-action'

const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <ServicesListing />
      <CallToAction />
    </div>
  )
}

export default ServicesPage
