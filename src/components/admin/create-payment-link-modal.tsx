'use client'

import React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, getClients } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, Link2, Copy, CheckCircle2, ExternalLink, Sparkles, ArrowRight, Plus, Trash2, Package } from 'lucide-react'

interface CatalogItem {
  id: string
  name: string
  description: string | null
  features: string | null
  price: number
  period: string
  is_active: boolean
}

interface Addon {
  name: string
  description: string
  price: string
  stripe_payment_link_url: string
}

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
  const [stripeLink, setStripeLink] = React.useState('')
  const [addons, setAddons] = React.useState<Addon[]>([])

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

  const { data: catalog = [], isLoading: catalogLoading } = useQuery<CatalogItem[]>({
    queryKey: ['service-catalog'],
    queryFn: async () => {
      const token = await getToken()
      const res = await fetch('/api/admin/service-catalog', {
        headers: { Authorization: token },
      })
      if (!res.ok) return []
      const items: CatalogItem[] = await res.json()
      return items.filter(i => i.is_active)
    },
    enabled: isOpen,
  })

  const applyPreset = (preset: CatalogItem) => {
    setServiceName(preset.name)
    setDescription(preset.description || '')
    setFeatures(preset.features || '')
    setPrice(String(preset.price))
    setPeriod(preset.period)
  }

  // Add-on helpers
  const addAddon = () => {
    if (addons.length >= 3) return
    setAddons(prev => [...prev, { name: '', description: '', price: '', stripe_payment_link_url: '' }])
  }

  const removeAddon = (index: number) => {
    setAddons(prev => prev.filter((_, i) => i !== index))
  }

  const updateAddon = (index: number, field: keyof Addon, value: string) => {
    setAddons(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  // Progress tracking
  const hasServiceName = serviceName.trim().length > 0
  const hasPrice = price.trim().length > 0
  const hasAddons = addons.some(a => a.name.trim().length > 0)
  const completedCount = [hasServiceName, hasPrice].filter(Boolean).length
  const progressPct = Math.round((completedCount / 2) * 100)

  const handleSubmit = async () => {
    if (!serviceName || !price) {
      setError('Service name and price are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const token = await getToken()

      // Clean up addons — only include rows with a name
      const cleanAddons = addons
        .filter(a => a.name.trim())
        .map(a => ({
          name: a.name.trim(),
          description: a.description.trim(),
          price: Number(a.price) || 0,
          stripe_payment_link_url: a.stripe_payment_link_url.trim(),
        }))

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
          stripe_payment_link_url: stripeLink || undefined,
          addons: cleanAddons.length > 0 ? cleanAddons : null,
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
    setStripeLink('')
    setAddons([])
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
          <CardHeader className="pb-0">
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

            {/* Progress bar */}
            {step === 'form' && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400 font-medium">Offer completeness</span>
                  <span className="text-xs font-bold text-[#35c677]">{progressPct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#35c677] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-5 pt-5">

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
                  {catalogLoading ? (
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-7 w-24 bg-gray-100 rounded-full animate-pulse" />
                      ))}
                    </div>
                  ) : catalog.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400 py-1">
                      <Package className="h-4 w-4 shrink-0" />
                      <span>
                        No services in catalog.{' '}
                        <Link href="/admin/service-catalog" className="text-[#35c677] underline underline-offset-2 hover:text-[#2db366]">
                          Add services here
                        </Link>
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {catalog.map(preset => (
                        <button
                          key={preset.id}
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
                  )}
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 space-y-4">

                  {/* Section checklist */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className={`flex items-center gap-1.5 transition-colors ${hasServiceName ? 'text-[#35c677]' : 'text-gray-300'}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="font-medium">Service name</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${hasPrice ? 'text-[#35c677]' : 'text-gray-300'}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="font-medium">Price</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${hasAddons ? 'text-[#35c677]' : 'text-gray-300'}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="font-medium">Add-ons (optional)</span>
                    </div>
                  </div>

                  <div>
                    <label className={lbl}>
                      Service Name *
                    </label>
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

                  <div>
                    <label className={lbl}>Stripe Payment Link URL</label>
                    <Input
                      value={stripeLink}
                      onChange={e => setStripeLink(e.target.value)}
                      placeholder="https://buy.stripe.com/..."
                    />
                  </div>
                </div>

                {/* Add-ons section */}
                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Add-ons</p>
                      <p className="text-xs text-gray-400 mt-0.5">Optional upgrades shown on the payment page</p>
                    </div>
                    {addons.length < 3 && (
                      <button
                        onClick={addAddon}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#35c677] hover:text-[#2db366] border border-[#35c677]/30 hover:border-[#35c677] bg-[#35c677]/5 hover:bg-[#35c677]/10 px-3 py-1.5 rounded-full transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add optional add-on
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {addons.map((addon, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add-on {i + 1}</span>
                            <button
                              onClick={() => removeAddon(i)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Name</label>
                              <input
                                value={addon.name}
                                onChange={e => updateAddon(i, 'name', e.target.value)}
                                placeholder="e.g. Priority Support"
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Price (USD)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={addon.price}
                                  onChange={e => updateAddon(i, 'price', e.target.value)}
                                  placeholder="100"
                                  className={inputCls + ' pl-6'}
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Description</label>
                            <input
                              value={addon.description}
                              onChange={e => updateAddon(i, 'description', e.target.value)}
                              placeholder="Short description of what this add-on includes"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Stripe Payment Link URL</label>
                            <input
                              value={addon.stripe_payment_link_url}
                              onChange={e => updateAddon(i, 'stripe_payment_link_url', e.target.value)}
                              placeholder="https://buy.stripe.com/..."
                              className={inputCls}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {addons.length === 3 && (
                    <p className="text-xs text-gray-400 text-center py-1">Maximum 3 add-ons reached</p>
                  )}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {/* Footer with progress checklist + actions */}
                <div className="flex items-center justify-between pt-3 border-t gap-3">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className={hasServiceName ? 'text-[#35c677] font-medium' : ''}>
                      {hasServiceName ? '✓' : '○'} Name
                    </span>
                    <span className={hasPrice ? 'text-[#35c677] font-medium' : ''}>
                      {hasPrice ? '✓' : '○'} Price
                    </span>
                    {hasAddons && (
                      <span className="text-[#35c677] font-medium">✓ Add-ons</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
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
