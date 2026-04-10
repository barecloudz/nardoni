'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, TrendingDown } from 'lucide-react'

const Problem: React.FC = () => {
  return (
    <section id="problem" className="py-24 bg-[#efebe5]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Opening */}
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

          {/* The explanation */}
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

          {/* Visual stats */}
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

          {/* The hook */}
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
