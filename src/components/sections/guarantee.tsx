import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Shield, ArrowDown } from 'lucide-react'

const Guarantee: React.FC = () => {
  const scrollToHowItWorks = () => {
    const section = document.getElementById('how-it-works')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-24 bg-[#191919] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-[#35c677] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#35c677] opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-[#35c677]/20 border border-[#35c677]/30 rounded-full px-6 py-3">
              <Shield className="h-5 w-5 text-[#35c677]" />
              <span className="text-sm font-medium text-white">
                Our Promise
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              We'll get you on{' '}
              <span className="text-[#35c677]">page 1 of Google</span>{' '}
              in 90 days
            </h2>
          </motion.div>

          {/* Guarantee statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <p className="text-xl md:text-2xl text-gray-300 mb-6">
              Guaranteed. If we don't deliver, you get your money back.
            </p>
            <p className="text-lg text-gray-400">
              No questions asked. No fine print. No excuses.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={scrollToHowItWorks}
                size="lg"
                className="text-lg px-10 py-6 h-auto bg-white hover:bg-gray-100 text-[#191919] shadow-lg hover:shadow-xl transition-colors duration-300 font-semibold"
              >
                <span>See How It Works</span>
                <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default Guarantee
