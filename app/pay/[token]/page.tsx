'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react'

const PERIOD_LABELS: Record<string, string> = {
  'one-time': 'one-time',
  'monthly': 'per month',
  'yearly': 'per year',
}

export default function PayPage({ params }: { params: { token: string } }) {
  const [offer, setOffer] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)

  React.useEffect(() => {
    fetch(`/api/offers/${params.token}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setOffer(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#35c677]" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Offer not found</h1>
          <p className="text-gray-500 text-sm">This link may have expired or been removed. Contact us for a new one.</p>
          <a
            href="mailto:nardonidigital@gmail.com"
            className="inline-block mt-4 text-sm text-[#35c677] font-medium hover:underline"
          >
            nardonidigital@gmail.com
          </a>
        </div>
      </div>
    )
  }

  const features = offer.features
    ? offer.features.split('\n').map((f: string) => f.replace(/^[-•✓]\s*/, '').trim()).filter(Boolean)
    : []

  const priceDisplay = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(offer.price)

  const periodLabel = PERIOD_LABELS[offer.period] || offer.period

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">

      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src="/images/drawing.svg" alt="Nardoni Digital" className="h-8 w-auto" />
          </div>
          <a
            href="mailto:nardonidigital@gmail.com"
            className="text-sm text-gray-500 hover:text-[#35c677] transition-colors"
          >
            Questions? Get in touch
          </a>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-xl">

          {offer.client_company && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-gray-500 mb-4"
            >
              Prepared for <span className="font-semibold text-gray-700">{offer.client_company}</span>
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Card header */}
            <div className="bg-[#191919] px-8 py-7">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-5 h-5 bg-[#35c677] rounded flex items-center justify-center">
                  <span className="text-white font-black text-xs">N</span>
                </div>
                <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">Service Offer</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-2 leading-snug">
                {offer.service_name}
              </h1>
              {offer.description && (
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                  {offer.description}
                </p>
              )}
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="px-8 py-6 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  What's included
                </p>
                <ul className="space-y-3">
                  {features.map((f: string, i: number) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start space-x-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-[#35c677] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm leading-relaxed">{f}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Price + CTA */}
            <div className="px-8 py-7">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Investment</p>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-4xl font-black text-[#191919]">{priceDisplay}</span>
                    <span className="text-gray-400 text-sm">{periodLabel}</span>
                  </div>
                </div>
                {offer.period !== 'one-time' && (
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Cancel anytime</span>
                  </div>
                )}
              </div>

              {offer.stripe_payment_link_url ? (
                <a
                  href={offer.stripe_payment_link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-[#35c677] hover:bg-[#2db366] text-white font-bold py-4 px-6 rounded-2xl transition-colors text-base"
                >
                  <span>Pay Now</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              ) : (
                <a
                  href="mailto:nardonidigital@gmail.com"
                  className="w-full flex items-center justify-center space-x-2 bg-[#191919] hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-2xl transition-colors text-base"
                >
                  <span>Contact Us to Get Started</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              )}

              {/* Trust badges */}
              <div className="flex items-center justify-center space-x-4 mt-5">
                <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Secure checkout</span>
                </div>
                <span className="text-gray-200">·</span>
                <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Powered by Stripe</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-6 space-y-1"
          >
            <p className="text-xs text-gray-400">
              Questions?{' '}
              <a href="mailto:nardonidigital@gmail.com" className="text-[#35c677] hover:underline font-medium">
                nardonidigital@gmail.com
              </a>
            </p>
            <p className="text-xs text-gray-300">© {new Date().getFullYear()} Nardoni Digital</p>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
