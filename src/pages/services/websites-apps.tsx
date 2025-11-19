import React, { useEffect } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import Header from '../../components/layout/header'
import Footer from '../../components/layout/footer'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Laptop, Smartphone, TrendingUp, BarChart, CheckCircle, ArrowRight } from 'lucide-react'

const WebsitesApps: React.FC = () => {
  useEffect(() => {
    document.title = 'Website & App Development - Custom Digital Solutions | Nardoni Digital'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional website and mobile app development for local businesses. Modern, responsive designs that convert visitors into customers. E-commerce, custom apps, and ongoing maintenance.')
    }
  }, [])
  const benefits = [
    { icon: Laptop, title: 'Professional Websites', description: 'Modern, responsive websites that convert visitors into customers and reflect your brand perfectly.', gradient: 'from-indigo-500 to-blue-500' },
    { icon: Smartphone, title: 'Mobile Apps', description: 'Native mobile applications that keep your customers engaged and provide seamless experiences.', gradient: 'from-purple-500 to-indigo-500' },
    { icon: TrendingUp, title: 'Increased Conversions', description: 'Optimized user experience and design that drives more sales and customer engagement.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: BarChart, title: 'Performance Analytics', description: 'Track user behavior, conversions, and performance to continuously improve your digital presence.', gradient: 'from-green-500 to-emerald-500' }
  ]

  const services = [
    { icon: '🌐', title: 'Website Development', description: 'Custom websites built with modern technologies that convert visitors into customers.' },
    { icon: '📱', title: 'Mobile Apps', description: 'Native iOS and Android applications that provide seamless mobile experiences.' },
    { icon: '🛒', title: 'E-commerce Solutions', description: 'Online stores with secure payment processing and inventory management.' },
    { icon: '🔧', title: 'Web Maintenance', description: 'Ongoing updates, security patches, and performance optimization for your digital assets.' }
  ]

  const features = [
    'Responsive web design for all devices',
    'E-commerce integration and payment processing',
    'Custom mobile app development',
    'Content management systems (CMS)',
    'SEO-optimized website structure',
    'Performance optimization and speed',
    'Security implementation and SSL certificates',
    'Analytics and conversion tracking',
    'Ongoing maintenance and updates',
    'User experience (UX) optimization'
  ]

  const businessTypes = [
    { emoji: '🍽️', title: 'Restaurants', description: 'Online ordering systems, menu management, and reservation platforms for food businesses.' },
    { emoji: '🔧', title: 'Service Businesses', description: 'Booking systems, quote calculators, and service showcase websites for local services.' },
    { emoji: '🏥', title: 'Healthcare', description: 'Patient portals, appointment scheduling, and medical information websites.' },
    { emoji: '🛍️', title: 'Retail Stores', description: 'E-commerce platforms, inventory management, and customer loyalty programs.' }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-32 pb-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-lg text-indigo-600 font-semibold mb-4">Websites & Apps</p>
            <h1 className="text-5xl md:text-6xl font-bold text-[#191919] mb-6">Build Your Digital<br />Presence</h1>
            <p className="text-xl text-gray-600 mb-8">Professional websites and mobile apps that convert visitors into customers, drive business growth, and provide seamless digital experiences.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-a-call"><Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg">Get Started</Button></Link>
              <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg">Call Now</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Why Professional Websites & Apps?</h2>
            <p className="text-xl text-gray-600">In today's digital world, your online presence is often the first impression customers have of your business.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} p-4 mb-6 shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#191919] mb-3">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Our Development Services</h2>
            <p className="text-xl text-gray-600">Comprehensive digital solutions to build your online presence and drive business growth.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full border-0 shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="text-5xl mb-4">{service.icon}</div>
                    <h3 className="text-xl font-bold text-[#191919] mb-3">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Comprehensive Development</h2>
            <p className="text-xl text-gray-600">Everything you need to build a professional online presence that converts visitors into customers.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div key={index} className="flex items-start space-x-3" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                <CheckCircle className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Perfect for Any Business</h2>
            <p className="text-xl text-gray-600">See how different types of local businesses benefit from our development services.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {businessTypes.map((business, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full border-0 shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="text-5xl mb-4">{business.emoji}</div>
                    <h3 className="text-xl font-bold text-[#191919] mb-3">{business.title}</h3>
                    <p className="text-gray-600">{business.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Build Your Digital Presence?</h2>
            <p className="text-xl text-indigo-100 mb-8">Join hundreds of local businesses that have transformed their online presence with our development expertise.</p>
            <Link href="/book-a-call"><Button size="lg" className="text-lg px-10 py-6 h-auto bg-white text-indigo-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mb-6"><span>Get Started Today</span><ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <p className="text-indigo-200">Call <a href="tel:8039774285" className="text-white hover:underline font-semibold">(803) 977-4285</a></p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default WebsitesApps
