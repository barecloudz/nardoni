import React, { useEffect } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import Header from '../../components/layout/header'
import Footer from '../../components/layout/footer'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import {
  Phone,
  Clock,
  Users,
  Calendar,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  UtensilsCrossed,
  Wrench,
  Heart,
  ShoppingBag
} from 'lucide-react'

const AIPhoneAgents: React.FC = () => {
  useEffect(() => {
    document.title = 'AI Phone Agents - Automated Call Handling & Booking | Nardoni Digital'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Transform your phone system with AI phone agents. Handle calls 24/7, book appointments automatically, and never miss a customer call again.')
    }
  }, [])
  const benefits = [
    {
      icon: Clock,
      title: '24/7 Phone Support',
      description: 'Never miss a call again. Your AI phone agent handles calls around the clock, even when you\'re closed.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Handle Multiple Calls',
      description: 'Process unlimited calls simultaneously without hiring additional staff or expanding your phone system.',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Calendar,
      title: 'Automated Scheduling',
      description: 'Book appointments, reservations, and consultations automatically without human intervention.',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: MessageSquare,
      title: 'Natural Conversations',
      description: 'Advanced voice recognition and natural language processing for human-like phone conversations.',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  const features = [
    'Advanced voice recognition and natural language processing',
    'Integration with your existing phone system and CRM',
    'Automated appointment booking and scheduling',
    'Order taking and processing for restaurants',
    'FAQ handling and information requests',
    'Call routing to human agents when needed',
    'Multi-language phone support',
    'Call analytics and performance insights',
    'Customizable voice and personality',
    'Integration with payment processing systems'
  ]

  const businessTypes = [
    {
      emoji: '🍽️',
      title: 'Restaurants',
      description: 'Take orders, handle reservations, answer menu questions, and process payments over the phone.',
      demoText: 'Demo Coming Soon'
    },
    {
      emoji: '🔧',
      title: 'Service Businesses',
      description: 'Schedule appointments, provide quotes, answer service questions, and handle customer inquiries.',
      demoText: 'Demo Coming Soon'
    },
    {
      emoji: '🏥',
      title: 'Healthcare',
      description: 'Schedule appointments, answer basic health questions, provide facility information, and handle reminders.',
      demoText: 'Demo Coming Soon'
    },
    {
      emoji: '🛍️',
      title: 'Retail Stores',
      description: 'Check inventory, provide store hours, answer product questions, and process orders.',
      demoText: 'Demo Coming Soon'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-lg text-purple-600 font-semibold mb-4">AI-Powered Phone Agents</p>
            <h1 className="text-5xl md:text-6xl font-bold text-[#191919] mb-6">
              Never Miss a<br />Phone Call Again
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Transform your phone system with intelligent AI agents that answer calls 24/7, handle orders, schedule appointments, and provide customer support automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-a-call">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg">
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">
              Why AI Phone Agents?
            </h2>
            <p className="text-xl text-gray-600">
              Traditional phone systems can't keep up with modern customer expectations. AI phone agents can.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} p-4 mb-6 shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#191919] mb-3">
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">
              Advanced Phone Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to handle phone calls professionally, automatically.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <CheckCircle className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">
              Perfect for Any Business
            </h2>
            <p className="text-xl text-gray-600">
              See how different types of local businesses benefit from AI phone agents.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {businessTypes.map((business, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                  <CardContent className="p-6">
                    <div className="text-5xl mb-4">{business.emoji}</div>
                    <h3 className="text-xl font-bold text-[#191919] mb-3">
                      {business.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {business.description}
                    </p>
                    <p className="text-sm text-purple-600 font-medium">{business.demoText}</p>
                    <p className="text-xs text-gray-500 mt-1">Demo agent will be available soon</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Upgrade Your Phone System?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join hundreds of local businesses that have already automated their phone systems with AI.
            </p>
            <Link href="/book-a-call">
              <Button
                size="lg"
                className="text-lg px-10 py-6 h-auto bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mb-6"
              >
                <span>Get Started Today</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-purple-200">
              Call <a href="tel:8039774285" className="text-white hover:underline font-semibold">(803) 977-4285</a>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AIPhoneAgents
