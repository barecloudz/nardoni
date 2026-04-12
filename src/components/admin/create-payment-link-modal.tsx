'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, getClients } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, Link2, Copy, CheckCircle2, ExternalLink, Sparkles, ArrowRight } from 'lucide-react'

const CATALOG = [
  {
    name: 'Local SEO (Google Rankings)',
    description: 'We rank your business in the top 10 Google results for your target keywords. 90-day guarantee — if we can\'t get you there, we work for free until we do.',
    features: 'Page 1 Google Rankings\n90-Day Guarantee\nLocal SEO Strategy\nMonthly Reporting\nKeyword Research',
    price: 500,
    period: 'monthly',
  },
  {
    name: 'Google Business Profile Management',
    description: 'Daily posts, custom graphics, responding to every Google review within 24hrs, Q&A management and monthly analytics.',
    features: 'Daily GBP Posts\nCustom Graphics\nReview Responses (24hr)\nQ&A Management\nMonthly Analytics',
    price: 400,
    period: 'monthly',
  },
  {
    name: 'Cold Email Outreach',
    description: 'B2B lead generation via cold email — ICP targeting, sequence copywriting, A/B testing, reply handling and weekly reporting.',
    features: 'ICP Targeting\nSequence Copywriting\nA/B Testing\nReply Management\nWeekly Reporting',
    price: 3500,
    period: 'monthly',
  },
  {
    name: 'Google + Meta Ads Management',
    description: 'Paid ad campaign setup, creative, audience targeting, management and optimization across Google and Meta.',
    features: 'Campaign Setup\nAd Creative\nAudience Targeting\nBid Optimization\nMonthly Reporting',
    price: 1200,
    period: 'monthly',
  },
  {
    name: 'Custom Website',
    description: 'Fully custom-built website — no templates, clean React build, mobile-first design, fast and optimized.',
    features: 'Custom Design\nMobile-First\nSEO Optimized\nFast Load Times\nHosting Setup',
    price: 3500,
    period: 'one-time',
  },
  {
    name: 'Weekly Performance Reports',
    description: 'Detailed weekly breakdowns of outreach metrics, active opportunities, deals closed and next week focus.',
    features: 'Weekly Delivery\nOutreach Metrics\nOpportunity Tracking\nWins Summary\nNext Week Plan',
    price: 500,
    period: 'monthly',
  },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

const CreatePaymentLinkModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient()
  const [step, setStep] = React.useState<'form' | 'done'>('form')
  const [result, setResult] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [copiedBranded, setCopiedBranded] = React.useState(false)
  const [copiedStripe, setCopiedStripe] = React.useState(false)

  const [clientId, setClientId] = React.useState('')
  const [serviceName, setServiceName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [features, setFeatures] = React.useState('')
  const [price, setPrice] = React.useState('')
  const [period, setPeriod] = React.useState('one-time')

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await getClients()
      return data || []
    },
  })

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? `Bearer ${session.access_token}` : ''
  }

  const applyPreset = (preset: typeof CATALOG[0]) => {
    setServiceName(preset.name)
    setDescription(preset.description)
    setFeatures(preset.features)
    setPrice(String(preset.price))
    setPeriod(preset.period)
  }

  const handleSubmit = async () => {
    if (!serviceName || !price) {
      setError('Service name and price are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId || null,
          service_name: serviceName,
          description,
          features,
          price: Number(price),
          period,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResult(json)
      setStep('done')
      queryClient.invalidateQueries({ queryKey: ['service-offers'] })
    } catch (e: any) {
      setError(e.message || 'Failed to create offer')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, type: 'branded' | 'stripe') => {
    navigator.clipboard.writeText(text)
    if (type === 'branded') {
      setCopiedBranded(true)
      setTimeout(() => setCopiedBranded(false), 2000)
    } else {
      setCopiedStripe(true)
      setTimeout(() => setCopiedStripe(false), 2000)
    }
  }

  const handleClose = () => {
    setStep('form')
    setResult(null)
    setError('')
    setClientId('')
    setServiceName('')
    setDescription('')
    setFeatures('')
    setPrice('')
    setPeriod('one-time')
    onClose()
  }

  const brandedUrl = result ? `${typeof window !== 'undefined' ? window.location.origin : 'https://nardonidigital.com'}/pay/${result.token}` : ''

  if (!isOpen) return null

  const lbl = 'block text-sm font-medium text-gray-700 mb-1.5'
  const inputCls = 'w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677]'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Link2 className="h-5 w-5 text-[#35c677]" />
                <span>{step === 'done' ? 'Offer Created' : 'Create Service Offer'}</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {step === 'form' && (
              <p className="text-sm text-gray-500 mt-1">
                Creates a branded payment page at <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">/pay/[token]</span> + a Stripe checkout link.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-5">

            {step === 'form' ? (
              <>
                {/* Client selector */}
                <div>
                  <label className={lbl}>Client (optional)</label>
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">No specific client (generic offer)</option>
                    {clients.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                    ))}
                  </select>
                </div>

                {/* Quick-pick catalog */}
                <div>
                  <label className={lbl}>Quick-pick a service</label>
                  <div className="flex flex-wrap gap-2">
                    {CATALOG.map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          serviceName === preset.name
                            ? 'border-[#35c677] bg-[#35c677]/10 text-[#35c677] font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-[#35c677]/50 hover:text-[#35c677]'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 space-y-4">
                  <div>
                    <label className={lbl}>Service Name *</label>
                    <Input
                      value={serviceName}
                      onChange={e => setServiceName(e.target.value)}
                      placeholder="e.g. Local SEO"
                    />
                  </div>

                  <div>
                    <label className={lbl}>Description</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={2}
                      placeholder="One paragraph describing the service and its value..."
                      className={inputCls + ' resize-none'}
                    />
                  </div>

                  <div>
                    <label className={lbl}>
                      What's Included
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">one item per line</span>
                    </label>
                    <textarea
                      value={features}
                      onChange={e => setFeatures(e.target.value)}
                      rows={4}
                      placeholder={`Page 1 Google Rankings\n90-Day Guarantee\nLocal SEO Strategy\nMonthly Reporting`}
                      className={inputCls + ' resize-none font-mono text-xs'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Price (USD) *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <Input
                          type="number"
                          min="1"
                          value={price}
                          onChange={e => setPrice(e.target.value)}
                          placeholder="500"
                          className="pl-7"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Billing</label>
                      <select
                        value={period}
                        onChange={e => setPeriod(e.target.value)}
                        className={inputCls}
                      >
                        <option value="one-time">One-time</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex items-center justify-end space-x-3 pt-2 border-t">
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !serviceName || !price}
                    className="bg-[#35c677] hover:bg-[#2db366] text-white"
                  >
                    {loading ? 'Creating...' : 'Create Offer'}
                    {!loading && <ArrowRight className="h-4 w-4 ml-1.5" />}
                  </Button>
                </div>
              </>
            ) : (
              /* Done state */
              <div className="space-y-5">
                <div className="flex items-center space-x-2 text-[#35c677]">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Offer created successfully</span>
                </div>

                {/* Branded URL — primary */}
                <div className="rounded-xl border-2 border-[#35c677] bg-[#35c677]/5 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-4 w-4 text-[#35c677]" />
                    <p className="text-sm font-semibold text-[#191919]">Branded Payment Page</p>
                    <span className="text-xs bg-[#35c677]/20 text-[#35c677] px-2 py-0.5 rounded-full font-medium">Send this one</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Premium Nardoni Digital branded page. This is what your client sees.</p>
                  <div className="bg-white rounded-lg px-3 py-2 border border-[#35c677]/20 font-mono text-xs text-gray-700 break-all mb-3">
                    {brandedUrl}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-[#35c677] hover:bg-[#2db366] text-white flex-1"
                      onClick={() => copy(brandedUrl, 'branded')}
                    >
                      {copiedBranded ? <CheckCircle2 className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                      {copiedBranded ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(brandedUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      Preview
                    </Button>
                  </div>
                </div>

                {/* Stripe URL — secondary */}
                {result?.stripe_payment_link_url && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-600 mb-1.5">Direct Stripe Link</p>
                    <p className="text-xs text-gray-400 mb-3">Fallback — raw Stripe checkout. No branding.</p>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200 font-mono text-xs text-gray-500 break-all mb-3">
                      {result.stripe_payment_link_url}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => copy(result.stripe_payment_link_url, 'stripe')}
                    >
                      {copiedStripe ? <CheckCircle2 className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                      {copiedStripe ? 'Copied!' : 'Copy Stripe Link'}
                    </Button>
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t">
                  <Button onClick={handleClose}>Done</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default CreatePaymentLinkModal
