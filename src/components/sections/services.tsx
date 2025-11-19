import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui/card'
import { Target, Users, TrendingUp } from 'lucide-react'

const Services: React.FC = () => {
  const services = [
    {
      icon: Target,
      title: 'Ads To Get To The Top Of Google',
      description: 'Show up when locals search for what you offer'
    },
    {
      icon: Users,
      title: 'FB/IG Ads To Reach EVERY Local Client',
      description: 'Be everywhere. Google, Instagram, Facebook, YouTube…'
    },
    {
      icon: TrendingUp,
      title: 'Reach Number 1 On Google For Free',
      description: 'Be the #1 on Google Maps organically.'
    }
  ]

  return (
    <section id="services" className="py-24 bg-[#efebe5]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#191919]">
            How we can help you <span className="text-[#35c677] italic">grooow</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 h-full">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#35c677] to-[#2ba866] flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-[#191919]">{service.title}</h3>
                    <p className="text-gray-600 text-lg">{service.description}</p>
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
