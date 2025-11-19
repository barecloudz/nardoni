import React, { useEffect } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import Header from '../../components/layout/header'
import Footer from '../../components/layout/footer'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import {
  Clock,
  Globe,
  Zap,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  UtensilsCrossed,
  Wrench,
  ShoppingBag,
  Heart
} from 'lucide-react'

const AICustomerSupport: React.FC = () => {
  useEffect(() => {
    document.title = 'AI Customer Support - 24/7 Automated Support | Nardoni Digital'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Never miss a customer inquiry with 24/7 AI-powered customer support. Instant responses, multi-language support, and unlimited scalability for local businesses.')
    }
  }, [])
  const benefits = [
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Never miss a customer inquiry, even outside business hours. Your AI assistant works around the clock.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Serve customers in their preferred language, expanding your reach to diverse communities.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Instant Responses',
      description: 'Customers get immediate answers to common questions, reducing wait times and improving satisfaction.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: TrendingUp,
      title: 'Scalable Support',
      description: 'Handle unlimited customer inquiries simultaneously without hiring additional staff.',
      gradient: 'from-green-500 to-emerald-500'
    }
  ]

  const features = [
    'Natural language processing for human-like conversations',
    'Integration with your existing CRM and booking systems',
    'Smart escalation to human agents when needed',
    'Customizable responses based on your business',
    'Analytics and insights on customer interactions',
    'Multi-channel support (website, social media, messaging apps)',
    'Automated appointment scheduling and reminders',
    'FAQ handling and knowledge base management'
  ]

  const businessTypes = [
    {
      icon: UtensilsCrossed,
      emoji: '🍽️',
      title: 'Restaurants',
      description: 'Handle reservations, menu questions, and order status inquiries automatically.'
    },
    {
      icon: Wrench,
      emoji: '🔧',
      title: 'Service Businesses',
      description: 'Answer service questions, schedule appointments, and provide quotes instantly.'
    },
    {
      icon: ShoppingBag,
      emoji: '🛍️',
      title: 'Retail Stores',
      description: 'Help with product information, store hours, and inventory questions.'
    },
    {
      icon: Heart,
      emoji: '🏥',
      title: 'Healthcare',
      description: 'Schedule appointments, answer basic health questions, and provide facility information.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[#191919] mb-6">
              Why AI Customer Support?
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12">
              Traditional customer service has limitations. AI-powered support eliminates them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to provide exceptional customer service, automatically.
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
                <CheckCircle className="h-6 w-6 text-[#35c677] flex-shrink-0 mt-1" />
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
              See how different types of local businesses benefit from AI customer support.
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
                    <p className="text-gray-600">
                      {business.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#191919] to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Customer Service?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join hundreds of local businesses that have already upgraded their customer support with AI.
            </p>
            <Link href="/book-a-call">
              <Button
                size="lg"
                className="text-lg px-10 py-6 h-auto bg-[#35c677] hover:bg-[#2ba866] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mb-6"
              >
                <span>Book a Call</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-gray-400">
              Call <a href="tel:8039774285" className="text-[#35c677] hover:underline">(803) 977-4285</a>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AICustomerSupport
