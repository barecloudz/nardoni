import React, { useEffect } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import Header from '../../components/layout/header'
import Footer from '../../components/layout/footer'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Target, Zap, DollarSign, Sliders, CheckCircle, ArrowRight } from 'lucide-react'

const PaidAdvertising: React.FC = () => {
  useEffect(() => {
    document.title = 'Paid Advertising - Google Ads & Meta Ads Management | Nardoni Digital'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get immediate results with paid advertising. Expert Google Ads and Meta Ads management for local businesses. Precise targeting, measurable ROI, and complete cost control.')
    }
  }, [])
  const benefits = [
    { icon: Target, title: 'Precise Targeting', description: 'Reach your ideal customers with laser-focused targeting based on location, demographics, and behavior.', gradient: 'from-orange-500 to-red-500' },
    { icon: Zap, title: 'Immediate Results', description: 'Get instant visibility and traffic while your organic marketing strategies take time to build.', gradient: 'from-yellow-500 to-orange-500' },
    { icon: DollarSign, title: 'Measurable ROI', description: 'Track every dollar spent and see exactly how much revenue your advertising generates.', gradient: 'from-green-500 to-emerald-500' },
    { icon: Sliders, title: 'Cost Control', description: 'Set your own budget and control exactly how much you spend on advertising each month.', gradient: 'from-blue-500 to-indigo-500' }
  ]

  const platforms = [
    { icon: '📘', title: 'Meta Ads', description: 'Target customers on Facebook and Instagram with highly engaging visual and video ads.' },
    { icon: '🔍', title: 'Google Ads', description: 'Appear at the top of search results when customers search for your services.' },
    { icon: '🖼️', title: 'Display Advertising', description: 'Reach potential customers across the web with banner ads and display campaigns.' }
  ]

  const features = [
    'Meta Ads (Facebook & Instagram) campaign management',
    'Google Ads (Search & Display) optimization',
    'Advanced audience targeting and segmentation',
    'A/B testing for ad creative and messaging',
    'Retargeting campaigns for better conversion',
    'Local audience targeting for geographic reach',
    'Performance tracking and analytics',
    'Budget management and optimization',
    'Ad creative design and copywriting',
    'Competitive analysis and market research'
  ]

  const strategies = [
    { icon: '🔎', title: 'Search Campaigns', description: 'Target customers actively searching for your services with keyword-based advertising.' },
    { icon: '📱', title: 'Social Media Ads', description: 'Engage with your audience on social platforms with targeted content and offers.' },
    { icon: '🔄', title: 'Retargeting', description: 'Re-engage visitors who have already shown interest in your business.' },
    { icon: '📍', title: 'Local Targeting', description: 'Focus your advertising budget on customers in your specific service area.' }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-32 pb-16 bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-lg text-orange-600 font-semibold mb-4">Paid Advertising</p>
            <h1 className="text-5xl md:text-6xl font-bold text-[#191919] mb-6">Get Instant<br />Results</h1>
            <p className="text-xl text-gray-600 mb-8">Drive immediate traffic and sales with expertly managed paid advertising campaigns on Meta Ads and Google Ads that target your ideal customers.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-a-call"><Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg">Get Started</Button></Link>
              <Button size="lg" variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg">Call Now</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Why Paid Advertising?</h2>
            <p className="text-xl text-gray-600">While organic marketing builds long-term success, paid advertising delivers immediate results.</p>
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

      <section className="py-20 bg-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Platform Expertise</h2>
            <p className="text-xl text-gray-600">We specialize in the advertising platforms that deliver the best results for local businesses.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {platforms.map((platform, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full border-0 shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="text-5xl mb-4">{platform.icon}</div>
                    <h3 className="text-2xl font-bold text-[#191919] mb-3">{platform.title}</h3>
                    <p className="text-gray-600">{platform.description}</p>
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
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Comprehensive Advertising Services</h2>
            <p className="text-xl text-gray-600">Everything you need to succeed with paid advertising, managed by experts.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div key={index} className="flex items-start space-x-3" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                <CheckCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Our Advertising Strategies</h2>
            <p className="text-xl text-gray-600">We don't just run ads—we build campaigns that convert and drive real business results.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {strategies.map((strategy, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full border-0 shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="text-5xl mb-4">{strategy.icon}</div>
                    <h3 className="text-xl font-bold text-[#191919] mb-3">{strategy.title}</h3>
                    <p className="text-gray-600">{strategy.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-orange-600 to-red-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Instant Results?</h2>
            <p className="text-xl text-orange-100 mb-8">Join hundreds of local businesses that have increased their revenue with our paid advertising expertise.</p>
            <Link href="/book-a-call"><Button size="lg" className="text-lg px-10 py-6 h-auto bg-white text-orange-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mb-6"><span>Get Started Today</span><ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <p className="text-orange-200">Call <a href="tel:8039774285" className="text-white hover:underline font-semibold">(803) 977-4285</a></p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PaidAdvertising
