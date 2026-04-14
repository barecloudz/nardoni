'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ArrowRight, ShieldCheck, Lock, AlertCircle, Loader2, Plus } from 'lucide-react'

const PERIOD_LABELS: Record<string, string> = {
  'one-time': 'one-time',
  'monthly': 'per month',
  'yearly': 'per year',
}

interface Addon {
  name: string
  description: string
  price: number
  stripe_payment_link_url: string
}

export default function PayPage({ params }: { params: { token: string } }) {
  const [offer, setOffer] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [selectedAddon, setSelectedAddon] = React.useState<number | null>(null)

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

  const addons: Addon[] = Array.isArray(offer.addons) ? offer.addons : []

  const activeAddon = selectedAddon !== null ? addons[selectedAddon] : null
  const totalPrice = offer.price + (activeAddon ? activeAddon.price : 0)
  const activePaymentUrl = activeAddon?.stripe_payment_link_url || offer.stripe_payment_link_url

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)

  const periodLabel = PERIOD_LABELS[offer.period] || offer.period

  const toggleAddon = (index: number) => {
    setSelectedAddon(prev => (prev === index ? null : index))
  }

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

            {/* Add-ons */}
            {addons.length > 0 && (
              <div className="px-8 py-6 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Optional add-ons
                </p>
                <div className="space-y-3">
                  {addons.map((addon, i) => {
                    const isSelected = selectedAddon === i
                    return (
                      <motion.button
                        key={i}
                        onClick={() => toggleAddon(i)}
                        whileTap={{ scale: 0.985 }}
                        className={`w-full text-left rounded-2xl border-2 px-4 py-4 transition-all duration-200 ${
                          isSelected
                            ? 'border-[#35c677] bg-[#35c677]/5'
                            : 'border-gray-100 bg-gray-50 hover:border-[#35c677]/40 hover:bg-[#35c677]/3'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            {/* Checkbox indicator */}
                            <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                              isSelected ? 'border-[#35c677] bg-[#35c677]' : 'border-gray-300 bg-white'
                            }`}>
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.svg
                                    key="check"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 12 12"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                                  </motion.svg>
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold leading-snug ${isSelected ? 'text-[#191919]' : 'text-gray-700'}`}>
                                {addon.name}
                              </p>
                              {addon.description && (
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                  {addon.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Price badge */}
                          <div className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full transition-colors duration-200 ${
                            isSelected
                              ? 'bg-[#35c677] text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            +{formatPrice(addon.price)}/{periodLabel === 'one-time' ? 'one-time' : periodLabel.replace('per ', '')}
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Price + CTA */}
            <div className="px-8 py-7">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Investment</p>
                  <div className="flex items-baseline space-x-1.5">
                    <motion.span
                      key={totalPrice}
                      initial={{ opacity: 0.6, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="text-4xl font-black text-[#191919]"
                    >
                      {formatPrice(totalPrice)}
                    </motion.span>
                    <span className="text-gray-400 text-sm">{periodLabel}</span>
                  </div>
                  <AnimatePresence>
                    {activeAddon && (
                      <motion.p
                        key="breakdown"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs text-gray-400 mt-1 overflow-hidden"
                      >
                        {formatPrice(offer.price)} base + {formatPrice(activeAddon.price)} add-on
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                {offer.period !== 'one-time' && (
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Cancel anytime</span>
                  </div>
                )}
              </div>

              {activePaymentUrl ? (
                <a
                  href={activePaymentUrl}
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
