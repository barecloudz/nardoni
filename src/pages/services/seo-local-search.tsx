import React, { useEffect } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import Header from '../../components/layout/header'
import Footer from '../../components/layout/footer'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Search, MapPin, Star, FileText, TrendingUp, Eye, CheckCircle, ArrowRight, BarChart3, Handshake, Rocket, Target } from 'lucide-react'

const SEOLocalSearch: React.FC = () => {
  useEffect(() => {
    document.title = 'SEO & Local Search - Top Page of Google in 90 Days | Nardoni Digital'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get your company on the top page of Google in 90 days or your money back. Expert local SEO services for local businesses. Proven results with our 90-day guarantee.')
    }
  }, [])
  const faqs = [
    {
      question: "Can you show me examples of other businesses like mine that you've helped?",
      answer: "Yes, feel free to take a look at our case studies."
    },
    {
      question: "What exactly are you going to do for my business?",
      answer: "We are going to build a website that converts, get visitors to see it and make sure that the people that actually reach out to you are being screened first before they reach your inbox."
    },
    {
      question: "How long does it take to start seeing results?",
      answer: "The paid trial is designed to give you enough results to make an informed decision whether you want to continue after the initial 30-day period."
    },
    {
      question: "How much is this going to cost me upfront?",
      answer: "The paid trial costs $950 one-time upfront. No commitment, no retainers, no 12 month contract. You actively have to tell us that you want to continue a week before the trial ends so that we can offer you a retainer model, which you can still cancel on a monthly basis."
    },
    {
      question: "How do I know I'll get my money back if it doesn't work?",
      answer: "This is a registered company. You are working with professionals that are committed to delivering results. When you need or want a refund, just reach out and we'll process it promptly."
    },
    {
      question: "How much of my time is this going to require?",
      answer: "Barely anything. You just do what you do best: turn phone calls into customers."
    },
    {
      question: "Do I need to learn how to do any of this technical stuff?",
      answer: "No you absolutely don't have to do ANY of the technical. This is why we have a team of trained professionals so you don't need to lift a finger."
    },
    {
      question: "What if this doesn't work for my type of business?",
      answer: "We make sure that we can deliver these results for your exact business because we have zero interest in refunding clients and making a bad name for ourselves. So you're in good hands as soon as we offer you the paid trial."
    },
    {
      question: "How long am I locked into this contract?",
      answer: "There is absolutely zero commitment with our offer. The paid trial doesn't renew, meaning you only pay one time upfront to get 30 days of service and results. Then, a week prior to the end of the trial, you'll be offered to renew and jump on the retainer. The retainer itself is also cancellable on a monthly basis."
    },
    {
      question: "What happens if I want to cancel?",
      answer: "Just contact us directly and we'll make sure to handle it the same day."
    }
  ]

  const benefits = [
    { icon: TrendingUp, title: 'Local Search Dominance', description: 'Rank at the top of local search results and get found by customers in your area.', gradient: 'from-green-500 to-emerald-500' },
    { icon: MapPin, title: 'Google My Business', description: 'Optimize your business listing to appear in local searches and Google Maps.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Search, title: 'Target Local Customers', description: 'Attract customers who are actively searching for your services in your area.', gradient: 'from-purple-500 to-pink-500' },
    { icon: Eye, title: 'Increased Visibility', description: 'Improve your online presence and get more organic traffic from search engines.', gradient: 'from-orange-500 to-red-500' }
  ]

  const services = [
    { icon: '🔍', title: 'Local SEO', description: 'Optimize your website and online presence to rank higher in local search results.' },
    { icon: '📍', title: 'Google My Business', description: 'Manage and optimize your business listing to appear in local searches and Google Maps.' },
    { icon: '⭐', title: 'Review Management', description: 'Monitor and respond to customer reviews to build trust and improve your local ranking.' },
    { icon: '📋', title: 'Citation Building', description: 'Build consistent business listings across directories to improve local search visibility.' }
  ]

  const features = [
    'Local SEO optimization and keyword research',
    'Google My Business profile optimization',
    'Review management and reputation monitoring',
    'Local citation building and consistency',
    'On-page SEO optimization',
    'Local link building strategies',
    'Mobile optimization for local searches',
    'Local content creation and optimization',
    'Competitive analysis and monitoring',
    'Local search analytics and reporting'
  ]

  const businessTypes = [
    { emoji: '🍽️', title: 'Restaurants & Food', description: 'Dominate local searches for dining options, delivery, and takeout in your area.' },
    { emoji: '🏥', title: 'Healthcare', description: 'Help patients find your practice when searching for medical services nearby.' },
    { emoji: '🔧', title: 'Service Businesses', description: 'Get found by customers searching for plumbers, electricians, and other local services.' },
    { emoji: '🛍️', title: 'Retail Stores', description: 'Attract local shoppers searching for products and services in your area.' }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-32 pb-16 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-5xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <span className="inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-full text-xl mb-6">
                90-Day Money-Back Guarantee
              </span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold text-[#191919] mb-8 leading-tight">
              We'll Get Your Company on the<br />
              <span className="text-green-600">Top Page of Google</span><br />
              in 90 Days
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-[#191919] mb-6">
              Or You Get Your Money Back
            </p>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Stop losing customers to your competitors. We guarantee first-page rankings for your local business in 90 days, or we'll refund 100% of your investment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/book-a-call">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-10 py-7 text-xl font-semibold shadow-xl">
                    Claim Your Free SEO Audit
                  </Button>
                </motion.div>
              </Link>
            </div>
            <p className="text-sm text-gray-500">Get a response within 48 hours to see if we're a good fit</p>
          </motion.div>
        </div>
      </section>

      {/* How This Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">How This Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our simple 4-step process to get you ranking on the first page of Google</p>
          </motion.div>

          <div className="max-w-5xl mx-auto space-y-8">
            {[
              {
                number: '1',
                icon: BarChart3,
                title: 'Performance Analysis',
                description: "We look at how your business is already performing in the ranks"
              },
              {
                number: '2',
                icon: Handshake,
                title: 'Paid Trial Offer',
                description: "If we're a good fit we'll offer you our paid trial for $950"
              },
              {
                number: '3',
                icon: Rocket,
                title: '90-Day Guarantee',
                description: "Most businesses that we work with start climbing after two weeks but if we can't get you to the top page of Google within 90 days we'll give you your money back. Because if you're not happy and we're not happy then it doesn't make sense."
              },
              {
                number: '4',
                icon: Target,
                title: 'Continued Growth',
                description: "We're confident that this will work. So after you are ranking in your area on the top page of Google we will likely offer you another one of our services"
              }
            ].map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                            {step.number}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <Icon className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#191919]">{step.title}</h3>
                          </div>
                          <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* What We Need Section */}
      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">If We're a Good Fit, This is What We Need From You</h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  number: '1',
                  title: 'Access to your Google Business profile',
                  subtitle: 'We will show you how to do this'
                },
                {
                  number: '2',
                  title: 'Access to your website',
                  subtitle: 'We will not make any sweeping changes without consulting you prior'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 border-green-200 bg-white hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xl">
                            {item.number}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[#191919] mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-lg">{item.subtitle}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/book-a-call">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-10 py-6 text-xl font-semibold shadow-xl">
                    Book a Call
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Why Local SEO Matters?</h2>
            <p className="text-xl text-gray-600">When customers search for your services, you need to be at the top of the results.</p>
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

      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Our Local SEO Services</h2>
            <p className="text-xl text-gray-600">Comprehensive local search optimization to get your business found by local customers.</p>
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
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Comprehensive Local SEO</h2>
            <p className="text-xl text-gray-600">Everything you need to dominate local search results and get found by customers in your area.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div key={index} className="flex items-start space-x-3" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919] mb-4">Perfect for Any Local Business</h2>
            <p className="text-xl text-gray-600">See how different types of local businesses benefit from our SEO services.</p>
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

      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-full px-6 py-3 mb-6">
              <span className="text-white font-bold text-lg">Zero Risk • 100% Money-Back Guarantee</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Top Page of Google in 90 Days<br />
              or Your Money Back
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're so confident in our SEO system that we guarantee results. If we don't get you on the first page of Google within 90 days, you get a full refund. No questions asked.
            </p>
            <Link href="/book-a-call">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button size="lg" className="text-xl px-12 py-7 h-auto bg-white text-green-600 hover:bg-gray-100 shadow-2xl font-bold mb-6">
                  <span>Claim Your Free SEO Audit</span>
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </motion.div>
            </Link>
            <p className="text-white/80 text-lg">Call <a href="tel:8039774285" className="text-white hover:underline font-semibold">(803) 977-4285</a></p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold text-green-600 mb-4 uppercase tracking-wider">Questions</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#191919]">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem value={`item-${index}`} className="border-2 border-gray-200 rounded-lg px-6 bg-white hover:border-green-300 transition-colors">
                    <AccordionTrigger className="text-left hover:no-underline py-6">
                      <span className="font-semibold text-lg pr-4 text-[#191919]">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default SEOLocalSearch
