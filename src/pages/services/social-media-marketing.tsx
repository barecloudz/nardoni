import React, { useEffect } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import Header from '../../components/layout/header'
import Footer from '../../components/layout/footer'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { TrendingUp, Users, Calendar, BarChart, CheckCircle, ArrowRight } from 'lucide-react'

const SocialMediaMarketing: React.FC = () => {
  useEffect(() => {
    document.title = 'Social Media Marketing - Instagram, Facebook & TikTok | Nardoni Digital'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Grow your local business with strategic social media marketing. Expert management of Instagram, Facebook, and TikTok to build your brand and engage customers.')
    }
  }, [])
  const benefits = [
    { icon: TrendingUp, title: 'Increased Brand Awareness', description: 'Build a strong online presence and reach more potential customers in your local area.', gradient: 'from-pink-500 to-rose-500' },
    { icon: Users, title: 'Engaged Community', description: 'Create meaningful connections with your audience through strategic content and engagement.', gradient: 'from-purple-500 to-pink-500' },
    { icon: Calendar, title: 'Consistent Posting', description: 'Maintain a regular posting schedule that keeps your audience engaged and informed.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: BarChart, title: 'Measurable Results', description: 'Track your social media performance with detailed analytics and insights.', gradient: 'from-green-500 to-emerald-500' }
  ]

  const platforms = [
    { name: 'Instagram', description: 'Visual storytelling, Stories, Reels, and shopping features to showcase your products and services.' },
    { name: 'Facebook', description: 'Community building, local business pages, and targeted advertising to reach your ideal customers.' },
    { name: 'TikTok', description: 'Viral content creation, trending challenges, and reaching younger demographics with engaging videos.' }
  ]

  const features = [
    'Strategic content planning and creation',
    'Multi-platform management (Instagram, Facebook, TikTok)',
    'Community engagement and customer service',
    'Hashtag research and optimization',
    'Influencer collaboration opportunities',
    'Paid social media advertising',
    'Analytics and performance tracking',
    'Brand voice and visual identity development',
    'Crisis management and reputation monitoring',
    'Local SEO integration with social media'
  ]

  const approach = [
    { icon: '📝', title: 'Content Strategy', description: 'Develop a cohesive content plan that aligns with your brand and resonates with your local audience.' },
    { icon: '💬', title: 'Community Management', description: 'Engage with followers, respond to comments, and build relationships with your local community.' },
    { icon: '💰', title: 'Paid Advertising', description: 'Targeted ads to reach specific demographics and drive traffic to your business.' },
    { icon: '📊', title: 'Analytics & Reporting', description: 'Track performance, measure ROI, and optimize your social media strategy based on data.' }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-32 pb-16 bg-gradient-to-b from-pink-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-lg text-pink-600 font-semibold mb-4">Social Media Marketing</p>
            <h1 className="text-5xl md:text-6xl font-bold text-[#191919] mb-6">Build Your Brand<br />on Social Media</h1>
            <p className="text-xl text-gray-600 mb-8">Connect with your local community through strategic social media marketing that builds brand awareness, drives engagement, and converts followers into loyal customers.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-a-call"><Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg">Get Started</Button></Link>
              <Button size="lg" variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50 px-8 py-6 text-lg">Call Now</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Why Social Media Marketing?</h2>
            <p className="text-xl text-gray-600">Social media is where your customers are. Be there to connect, engage, and grow your business.</p>
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

      <section className="py-20 bg-pink-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Platform Expertise</h2>
            <p className="text-xl text-gray-600">We specialize in the platforms that matter most for local businesses.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {platforms.map((platform, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-[#191919] mb-3">{platform.name}</h3>
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
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Comprehensive Services</h2>
            <p className="text-xl text-gray-600">Everything you need to succeed on social media, managed by experts.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div key={index} className="flex items-start space-x-3" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                <CheckCircle className="h-6 w-6 text-pink-600 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-pink-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Our Strategic Approach</h2>
            <p className="text-xl text-gray-600">We don't just post content—we build strategies that drive results.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {approach.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full border-0 shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-[#191919] mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-pink-600 to-rose-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Grow Your Social Media Presence?</h2>
            <p className="text-xl text-pink-100 mb-8">Join hundreds of local businesses that have transformed their online presence with our social media expertise.</p>
            <Link href="/book-a-call"><Button size="lg" className="text-lg px-10 py-6 h-auto bg-white text-pink-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mb-6"><span>Get Started Today</span><ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <p className="text-pink-200">Call <a href="tel:8039774285" className="text-white hover:underline font-semibold">(803) 977-4285</a></p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default SocialMediaMarketing
