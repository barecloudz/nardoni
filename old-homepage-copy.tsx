/**
 * OLD HOMEPAGE COPY - Saved for reference
 * This file contains the original homepage sections before redesign.
 * Date saved: 2026-02-20
 */

// ============================================================
// app/(public)/page.tsx - Homepage entry point
// ============================================================

/*
import type { Metadata } from 'next'
import Hero from '../../src/components/sections/hero'
import Problem from '../../src/components/sections/problem'
import Guarantee from '../../src/components/sections/guarantee'
import HowItWorks from '../../src/components/sections/how-it-works'
import Services from '../../src/components/sections/services'
import Benefits from '../../src/components/sections/benefits'

export const metadata: Metadata = {
  title: 'Nardoni Digital - We Make Local Businesses More Money',
  description: 'Get on page 1 of Google in 90 days. Guaranteed or your money back. Local SEO, Google Business optimization, and digital marketing for local businesses.',
  openGraph: {
    title: 'Nardoni Digital - We Make Local Businesses More Money',
    description: 'Get on page 1 of Google in 90 days. Guaranteed or your money back. Local SEO and digital marketing for local businesses.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://nardonidigital.com/',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Problem />
      <Guarantee />
      <HowItWorks />
      <Services />
      <Benefits />
    </div>
  )
}
*/

// ============================================================
// SECTION 1: Hero (src/components/sections/hero.tsx)
// ============================================================
/*
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { ArrowDown } from 'lucide-react'

const Hero: React.FC = () => {
  const scrollToNext = () => {
    const problemSection = document.getElementById('problem')
    if (problemSection) {
      problemSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto py-20">

          {/* Main Headline *}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold text-[#191919] leading-tight">
              We make local businesses{' '}
              <span className="text-[#35c677]">more money.</span>
            </h1>
          </motion.div>

          {/* CTA Button *}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={scrollToNext}
                size="lg"
                className="text-xl px-12 py-7 h-auto bg-[#35c677] hover:bg-[#2ba866] text-white shadow-lg hover:shadow-xl transition-colors duration-300"
              >
                <span>How?</span>
                <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
*/

// ============================================================
// SECTION 2: Problem (src/components/sections/problem.tsx)
// ============================================================
/*
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, TrendingDown } from 'lucide-react'

const Problem: React.FC = () => {
  return (
    <section id="problem" className="py-24 bg-[#efebe5]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Opening *}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191919] mb-8 leading-tight">
              Your Google listing is probably{' '}
              <span className="text-[#35c677]">costing you customers</span>{' '}
              right now.
            </h2>
          </motion.div>

          {/* The explanation *}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8 text-lg md:text-xl text-gray-700 leading-relaxed"
          >
            <p>
              More than likely, your business has a Google listing. It's what people see when they search for what you're selling.
            </p>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-[#35c677]">
              <p className="font-semibold text-[#191919] mb-4">
                Here's the thing:
              </p>
              <p>
                When someone searches "plumber near me" or "best tacos in [your city]", Google shows them <span className="font-bold text-[#191919]">3 businesses first</span>. Then maybe 7 more.
              </p>
              <p className="mt-4">
                If you're not in that <span className="font-bold text-[#191919]">top 10</span>? They're calling your competitor instead.
              </p>
            </div>

            <p>
              That's not your fault. Google's algorithm is complicated. Most business owners don't have time to figure it out.
            </p>

            <p className="font-semibold text-[#191919]">
              But it IS costing you money. Every. Single. Day.
            </p>
          </motion.div>

          {/* Visual stats *}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mt-16"
          >
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="w-14 h-14 bg-[#35c677] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-7 w-7 text-white" />
              </div>
              <div className="text-4xl font-bold text-[#191919] mb-2">46%</div>
              <p className="text-gray-600">of all Google searches are looking for local businesses</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="w-14 h-14 bg-[#35c677] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div className="text-4xl font-bold text-[#191919] mb-2">76%</div>
              <p className="text-gray-600">of people who search locally visit a business within 24 hours</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="w-14 h-14 bg-[#35c677] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-7 w-7 text-white" />
              </div>
              <div className="text-4xl font-bold text-[#191919] mb-2">92%</div>
              <p className="text-gray-600">of searchers pick a business from the first page of results</p>
            </div>
          </motion.div>

          {/* The hook *}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <p className="text-2xl md:text-3xl font-bold text-[#191919]">
              The good news? <span className="text-[#35c677]">That's fixable.</span>
            </p>
            <p className="text-xl text-gray-600 mt-4">
              That's where Local SEO comes in.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default Problem
*/

// ============================================================
// SECTION 3: Guarantee (src/components/sections/guarantee.tsx)
// ============================================================
/*
'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Shield, ArrowRight } from 'lucide-react'

const Guarantee: React.FC = () => {

  return (
    <section className="py-24 bg-[#191919] relative overflow-hidden">
      {/* Background Elements *}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-[#35c677] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#35c677] opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge *}
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

          {/* Main Headline *}
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

          {/* Guarantee statement *}
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

          {/* CTA *}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link href="/book-a-call">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 h-auto bg-[#35c677] hover:bg-[#2ba866] text-white shadow-lg hover:shadow-xl transition-colors duration-300 font-semibold rounded-full"
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

export default Guarantee
*/

// ============================================================
// SECTION 4: HowItWorks (src/components/sections/how-it-works.tsx)
// ============================================================
/*
'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { ArrowRight, CheckCircle, MapPin, Code, Globe, Star, BarChart3, Laptop } from 'lucide-react'

const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Fix Your Google Business Profile',
      description: 'Most profiles are incomplete or poorly optimized. We fix that.',
      icon: MapPin,
      features: [
        'Complete every field correctly',
        'Add professional photos',
        'Optimize your business description',
        'Set up proper categories'
      ]
    },
    {
      step: '02',
      title: 'Clean Up Your Website',
      description: 'Technical issues you can\'t see are hurting your rankings. We find and fix them.',
      icon: Code,
      features: [
        'Fix speed issues',
        'Mobile optimization',
        'Schema markup for local SEO',
        'On-page SEO fixes'
      ]
    },
    {
      step: '03',
      title: 'Build Citations Everywhere',
      description: 'Get your business listed on 50+ directories that actually matter.',
      icon: Globe,
      features: [
        'Yelp, Yellow Pages, BBB',
        'Industry-specific directories',
        'Consistent NAP (name, address, phone)',
        'Remove duplicate listings'
      ]
    },
    {
      step: '04',
      title: 'Generate More Reviews',
      description: 'Google loves reviews. We help you get more 5-star ones.',
      icon: Star,
      features: [
        'Automated review requests',
        'Review response templates',
        'Reputation monitoring',
        'Handle negative reviews'
      ]
    },
    {
      step: '05',
      title: 'Track & Improve',
      description: 'Monthly reports showing your rankings climbing. We adjust as needed.',
      icon: BarChart3,
      features: [
        'Keyword ranking reports',
        'Traffic analytics',
        'Conversion tracking',
        'Strategy adjustments'
      ]
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements *}
      <div className="absolute top-40 left-20 w-80 h-80 bg-[#35c677] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#191919] opacity-3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191919] mb-6 leading-tight">
            How we get you <span className="text-[#35c677]">ranking</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            No magic tricks. Just the proven process that gets local businesses to page 1.
          </p>
        </motion.div>

        {/* Steps Grid *}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-[#35c677] rounded-xl flex items-center justify-center shadow-md">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-[#35c677] opacity-30">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#191919] mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {step.description}
                </p>

                <div className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-[#35c677] flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}

          {/* No Website CTA Card *}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-[#efebe5] rounded-2xl p-8 shadow-lg flex flex-col justify-center"
          >
            <div className="w-14 h-14 bg-[#191919] rounded-xl flex items-center justify-center shadow-md mb-6">
              <Laptop className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#191919] mb-3">
              Don't have a website?
            </h3>
            <p className="text-gray-600 mb-6">
              No problem. We build fast, mobile-friendly websites that Google loves.
            </p>
            <Link href="/services/websites-apps">
              <Button
                className="w-full bg-[#35c677] hover:bg-[#2ba866] text-white rounded-full"
              >
                Get one now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Main CTA *}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link href="/services/seo-local-search">
            <Button
              size="lg"
              className="text-lg px-10 py-6 h-auto bg-[#35c677] hover:bg-[#2ba866] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
            >
              <span>See Our SEO Services</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
*/

// ============================================================
// SECTION 5: Services (src/components/sections/services.tsx)
// ============================================================
/*
'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Target, Share2, Phone, MessageCircle, Laptop, ArrowRight } from 'lucide-react'

const Services: React.FC = () => {
  const services = [
    {
      icon: Target,
      title: 'Paid Advertising',
      painPoint: "Tired of waiting months for SEO to kick in?",
      description: "Get in front of customers today with Google & Meta ads. We manage everything. You just answer the phone.",
      path: '/services/paid-advertising',
      gradient: 'from-orange-500 to-red-500',
      buttonText: "Let's go"
    },
    {
      icon: Share2,
      title: 'Social Media Marketing',
      painPoint: "You know you should be posting. But who has time?",
      description: "We handle your Instagram, Facebook & TikTok so you don't have to. Custom content, scheduled daily.",
      path: '/services/social-media-marketing',
      gradient: 'from-pink-500 to-rose-500',
      buttonText: "Get started"
    },
    {
      icon: Phone,
      title: 'AI Phone Agents',
      painPoint: "Missing calls means missing money.",
      description: "Our AI answers 24/7. Takes orders, books appointments, never drops the ball. Even at 2am.",
      path: '/services/ai-phone-agents',
      gradient: 'from-purple-500 to-pink-500',
      buttonText: "Learn more"
    },
    {
      icon: MessageCircle,
      title: 'AI Customer Support',
      painPoint: "Customers expect instant answers.",
      description: "Our chatbots handle inquiries around the clock while you sleep. Smart enough to know when to escalate.",
      path: '/services/ai-customer-support',
      gradient: 'from-blue-500 to-cyan-500',
      buttonText: "Learn more"
    },
    {
      icon: Laptop,
      title: 'Websites & Apps',
      painPoint: "Your website is either making you money or costing you customers.",
      description: "We build fast, mobile-friendly sites that actually convert visitors into paying customers.",
      path: '/services/websites-apps',
      gradient: 'from-indigo-500 to-purple-500',
      buttonText: "Learn more"
    }
  ]

  return (
    <section id="services" className="py-24 bg-[#efebe5]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191919] mb-4">
            Other ways we help{' '}
            <span className="text-[#35c677]">local businesses grow</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            SEO is the foundation. But sometimes you need more firepower.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 h-full bg-white">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    <p className="text-lg font-semibold text-[#191919] mb-2 italic">
                      "{service.painPoint}"
                    </p>

                    <h3 className="text-2xl font-bold mb-3 text-[#35c677]">{service.title}</h3>

                    <p className="text-gray-600 mb-6 flex-grow">{service.description}</p>

                    <Link href={service.path}>
                      <Button
                        className="w-full bg-[#35c677] hover:bg-[#2ba866] text-white rounded-full"
                      >
                        <span>{service.buttonText}</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Services
*/

// ============================================================
// SECTION 6: Benefits (src/components/sections/benefits.tsx)
// ============================================================
/*
'use client'

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
      icon: Shield,
      title: 'No Long Contracts',
      description: 'Month-to-month. No lock-ins. Cancel anytime if you\'re not happy.',
      stat: '0',
      statLabel: 'Lock-ins',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: DollarSign,
      title: '90-Day Guarantee',
      description: 'Page 1 of Google in 90 days or your money back. No excuses.',
      stat: '90',
      statLabel: 'Day Promise',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Bot,
      title: 'Done For You',
      description: 'We handle all the marketing. You just answer the phone and close deals.',
      stat: '100%',
      statLabel: 'Hands-off',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Transparent Reporting',
      description: 'See exactly what we\'re doing and how it\'s working. No black box.',
      stat: 'Full',
      statLabel: 'Visibility',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ]

  const additionalBenefits = [
    {
      icon: Clock,
      title: 'Regular Check-ins',
      description: 'We actually talk to you. Not just monthly reports in your inbox.'
    },
    {
      icon: Zap,
      title: 'Fast Results',
      description: 'Most clients see ranking improvements within the first 30 days.'
    },
    {
      icon: TrendingUp,
      title: 'Local Focus',
      description: 'We specialize in local businesses. We know what works in your market.'
    },
    {
      icon: Users,
      title: 'Real Humans',
      description: 'Your account manager is a real person who answers when you call.'
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
      {/* Background Elements *}
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

        {/* Main Benefits Grid *}
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

        {/* Additional Benefits *}
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
*/
