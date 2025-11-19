import React from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { ArrowRight } from 'lucide-react'

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto py-20">

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#191919] leading-tight">
              We'll Fill Your{' '}
              <span className="text-[#35c677]">Calendar</span>
              <br />
              with New Customers in 30 Days
            </h1>
          </motion.div>

          {/* Guarantee Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <span className="inline-block bg-[#35c677] text-white font-semibold px-6 py-2 rounded-full text-lg">
              Guaranteed
            </span>
          </motion.div>

          {/* Supporting Text */}
          <motion.div
            className="mb-12 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
              Stop waiting for customers to find you.
            </p>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              We put your business in front of locals actively searching for your services - starting this month.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/book-a-call">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 h-auto bg-[#35c677] hover:bg-[#2ba866] text-white shadow-lg hover:shadow-xl transition-colors duration-300"
                >
                  <span>Book a Call</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero