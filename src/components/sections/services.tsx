'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Target, Share2, Phone, MessageCircle, Laptop, ArrowRight } from 'lucide-react'

const Services: React.FC = () => {
  const services = [
    {
      icon: Target,
      title: 'Paid Advertising',
      painPoint: "Tired of waiting months for SEO to kick in?",
      description: "Get in front of customers today with Google & Meta ads. We manage everything. You just answer the phone.",
      path: '/services/paid-advertising',
      gradient: 'from-orange-500 to-red-500',
      buttonText: "Let's go"
    },
    {
      icon: Share2,
      title: 'Social Media Marketing',
      painPoint: "You know you should be posting. But who has time?",
      description: "We handle your Instagram, Facebook & TikTok so you don't have to. Custom content, scheduled daily.",
      path: '/services/social-media-marketing',
      gradient: 'from-pink-500 to-rose-500',
      buttonText: "Get started"
    },
    {
      icon: Phone,
      title: 'AI Phone Agents',
      painPoint: "Missing calls means missing money.",
      description: "Our AI answers 24/7. Takes orders, books appointments, never drops the ball. Even at 2am.",
      path: '/services/ai-phone-agents',
      gradient: 'from-purple-500 to-pink-500',
      buttonText: "Learn more"
    },
    {
      icon: MessageCircle,
      title: 'AI Customer Support',
      painPoint: "Customers expect instant answers.",
      description: "Our chatbots handle inquiries around the clock while you sleep. Smart enough to know when to escalate.",
      path: '/services/ai-customer-support',
      gradient: 'from-blue-500 to-cyan-500',
      buttonText: "Learn more"
    },
    {
      icon: Laptop,
      title: 'Websites & Apps',
      painPoint: "Your website is either making you money or costing you customers.",
      description: "We build fast, mobile-friendly sites that actually convert visitors into paying customers.",
      path: '/services/websites-apps',
      gradient: 'from-indigo-500 to-purple-500',
      buttonText: "Learn more"
    }
  ]

  return (
    <section id="services" className="py-24 bg-[#efebe5]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191919] mb-4">
            Other ways we help{' '}
            <span className="text-[#35c677]">local businesses grow</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            SEO is the foundation. But sometimes you need more firepower.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 h-full bg-white">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    <p className="text-lg font-semibold text-[#191919] mb-2 italic">
                      "{service.painPoint}"
                    </p>

                    <h3 className="text-2xl font-bold mb-3 text-[#35c677]">{service.title}</h3>

                    <p className="text-gray-600 mb-6 flex-grow">{service.description}</p>

                    <a href={service.path}>
                      <Button
                        className="w-full bg-[#35c677] hover:bg-[#2ba866] text-white rounded-full"
                      >
                        <span>{service.buttonText}</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Services
