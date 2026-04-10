'use client'

import React from 'react'
import Hero from '../components/sections/hero'
import Problem from '../components/sections/problem'
import Guarantee from '../components/sections/guarantee'
import HowItWorks from '../components/sections/how-it-works'
import Services from '../components/sections/services'
import Benefits from '../components/sections/benefits'

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <Problem />
        <Guarantee />
        <HowItWorks />
        <Services />
        <Benefits />
      </main>
    </div>
  )
}

export default HomePage