'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { ArrowRight, CheckCircle, MapPin, Code, Globe, Star, BarChart3, Laptop } from 'lucide-react'

const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Fix Your Google Business Profile',
      description: 'Most profiles are incomplete or poorly optimized. We fix that.',
      icon: MapPin,
      features: [
        'Complete every field correctly',
        'Add professional photos',
        'Optimize your business description',
        'Set up proper categories'
      ]
    },
    {
      step: '02',
      title: 'Clean Up Your Website',
      description: 'Technical issues you can\'t see are hurting your rankings. We find and fix them.',
      icon: Code,
      features: [
        'Fix speed issues',
        'Mobile optimization',
        'Schema markup for local SEO',
        'On-page SEO fixes'
      ]
    },
    {
      step: '03',
      title: 'Build Citations Everywhere',
      description: 'Get your business listed on 50+ directories that actually matter.',
      icon: Globe,
      features: [
        'Yelp, Yellow Pages, BBB',
        'Industry-specific directories',
        'Consistent NAP (name, address, phone)',
        'Remove duplicate listings'
      ]
    },
    {
      step: '04',
      title: 'Generate More Reviews',
      description: 'Google loves reviews. We help you get more 5-star ones.',
      icon: Star,
      features: [
        'Automated review requests',
        'Review response templates',
        'Reputation monitoring',
        'Handle negative reviews'
      ]
    },
    {
      step: '05',
      title: 'Track & Improve',
      description: 'Monthly reports showing your rankings climbing. We adjust as needed.',
      icon: BarChart3,
      features: [
        'Keyword ranking reports',
        'Traffic analytics',
        'Conversion tracking',
        'Strategy adjustments'
      ]
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-40 left-20 w-80 h-80 bg-[#35c677] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#191919] opacity-3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191919] mb-6 leading-tight">
            How we get you <span className="text-[#35c677]">ranking</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            No magic tricks. Just the proven process that gets local businesses to page 1.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-[#35c677] rounded-xl flex items-center justify-center shadow-md">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-[#35c677] opacity-30">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#191919] mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {step.description}
                </p>

                <div className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-[#35c677] flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}

          {/* No Website CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-[#efebe5] rounded-2xl p-8 shadow-lg flex flex-col justify-center"
          >
            <div className="w-14 h-14 bg-[#191919] rounded-xl flex items-center justify-center shadow-md mb-6">
              <Laptop className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#191919] mb-3">
              Don't have a website?
            </h3>
            <p className="text-gray-600 mb-6">
              No problem. We build fast, mobile-friendly websites that Google loves.
            </p>
            <a href="/services/websites-apps">
              <Button
                className="w-full bg-[#35c677] hover:bg-[#2ba866] text-white rounded-full"
              >
                Get one now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Main CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a href="/services/seo-local-search">
            <Button
              size="lg"
              className="text-lg px-10 py-6 h-auto bg-[#35c677] hover:bg-[#2ba866] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
            >
              <span>See Our SEO Services</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks