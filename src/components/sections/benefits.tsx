import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui/card'
import {
  Clock,
  TrendingUp,
  DollarSign,
  Bot,
  Users,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react'

const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: Users,
      title: 'Custom Content',
      description: 'No generic templates - we create content specifically for your business and your customers.',
      stat: '100%',
      statLabel: 'Customized',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Full Flexibility',
      description: 'No long-term contracts required. Stay flexible and cancel anytime if you\'re not satisfied.',
      stat: '0',
      statLabel: 'Commitments',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'All Platforms',
      description: 'We handle Facebook, Instagram, Google, and YouTube - everything you need in one place.',
      stat: 'All',
      statLabel: 'Platforms',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: DollarSign,
      title: 'Money-Back Guarantee',
      description: 'If it doesn\'t work, we refund you. We\'re that confident in our ability to deliver results.',
      stat: '100%',
      statLabel: 'Guaranteed',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  const additionalBenefits = [
    {
      icon: Clock,
      title: 'Regular Check-ins',
      description: 'Regular calls to review what\'s working, not just monthly reports.'
    },
    {
      icon: Zap,
      title: 'Start Small',
      description: 'Test the waters with a paid trial - see if we\'re a good fit.'
    },
    {
      icon: TrendingUp,
      title: 'Proven Results',
      description: 'Fill your calendar with new customers in 30 days or get your money back.'
    },
    {
      icon: Bot,
      title: 'Done For You',
      description: 'We handle everything - you just turn phone calls into customers.'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-white"></div>
      <div className="absolute top-20 left-20 w-80 h-80 bg-[#35c677] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#191919] opacity-3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-[#191919] mb-6 leading-tight">
            Why we're
            <br />
            <span className="text-[#35c677]">different</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We don't just run ads - we partner with you to deliver real results
            with custom strategies, full transparency, and zero long-term commitments.
          </p>
        </motion.div>

        {/* Main Benefits Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm text-center">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} p-4 mb-6 shadow-lg mx-auto`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-4xl font-bold text-[#35c677] mb-1">
                        {benefit.stat}
                      </div>
                      <div className="text-sm text-gray-500 uppercase tracking-wide">
                        {benefit.statLabel}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#191919] mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Additional Benefits */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {additionalBenefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 bg-[#35c677] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-[#191919] mb-2">
                  {benefit.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default Benefits