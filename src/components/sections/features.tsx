'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui/card'
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Zap,
  Brain,
  Rocket
} from 'lucide-react'

const Features: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Strategies',
      description: 'Leverage artificial intelligence to create data-driven marketing campaigns that adapt and optimize in real-time.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Precision Targeting',
      description: 'Reach your ideal customers with laser-focused targeting based on behavior, demographics, and interests.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Growth Analytics',
      description: 'Track every metric that matters with comprehensive analytics and actionable insights for continuous growth.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Rocket,
      title: 'Rapid Deployment',
      description: 'Launch campaigns in minutes, not weeks. Our streamlined process gets you to market faster than ever.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team and our experts through integrated collaboration tools and workflows.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Automation Engine',
      description: 'Set up powerful automation workflows that nurture leads and convert prospects while you sleep.',
      gradient: 'from-yellow-500 to-orange-500'
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
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-[#35c677] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#191919] opacity-3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 bg-[#35c677]/10 border border-[#35c677]/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-[#35c677]" />
            <span className="text-sm font-medium text-[#191919]">
              Powerful Features
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-[#191919] mb-6 leading-tight">
            Everything you need
            <br />
            <span className="text-[#35c677]">to succeed</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive suite of marketing tools and AI-powered insights 
            help you build, launch, and scale campaigns that drive real results.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-4 shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#191919] mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default Features