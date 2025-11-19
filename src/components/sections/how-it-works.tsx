import React from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { ArrowRight, CheckCircle, MessageSquare, Settings, Rocket } from 'lucide-react'

const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Plan Your Success',
      description: 'We figure out who your customers are and what they want to hear before we start',
      icon: MessageSquare,
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
      features: [
        'Target audience research',
        'Competitor analysis',
        'Message development',
        'Strategic planning'
      ]
    },
    {
      step: '02',
      title: 'Handle Everything Daily',
      description: 'We create ads, schedule them, and manage all your campaigns so you don\'t have to',
      icon: Settings,
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600',
      features: [
        'Ad creation & design',
        'Campaign scheduling',
        'Platform management',
        'Content optimization'
      ]
    },
    {
      step: '03',
      title: 'Track What Works',
      description: 'We see which posts bring in customers and do more of what\'s working',
      icon: Rocket,
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
      features: [
        'Performance tracking',
        'Data-driven decisions',
        'Continuous improvement',
        'ROI optimization'
      ]
    }
  ]

  return (
    <section className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-40 left-20 w-80 h-80 bg-[#35c677] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#191919] opacity-3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-[#191919] mb-6 leading-tight">
            It's <span className="text-[#35c677]">Straightforward</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our simple three-step process gets your business in front of local customers
            quickly and efficiently - no complicated tech required.
          </p>
        </motion.div>

        <div className="space-y-32">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isEven = index % 2 === 0

            return (
              <motion.div
                key={index}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                {/* Content */}
                <div className="flex-1 space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-[#35c677] rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-6xl font-bold text-[#35c677] opacity-20">
                      {step.step}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-4xl font-bold text-[#191919] mb-4">
                      {step.title}
                    </h3>
                    <p className="text-xl text-gray-600 leading-relaxed mb-8">
                      {step.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {step.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                      >
                        <CheckCircle className="h-6 w-6 text-[#35c677] flex-shrink-0" />
                        <span className="text-gray-700 text-lg">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {index === steps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <Link href="/book-a-call">
                        <Button
                          size="lg"
                          className="text-lg px-8 py-4 h-auto bg-[#35c677] hover:bg-[#2ba866] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <span>Book a Call</span>
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </div>

                {/* Image */}
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#35c677]/20 to-[#191919]/20 rounded-3xl transform rotate-3"></div>
                    <img
                      src={step.image}
                      alt={step.title}
                      className="relative w-full h-96 object-cover rounded-3xl shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks