'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Link2, Copy, CheckCircle2, ExternalLink, Trash2, Pencil, Plus, X,
  ArrowRight, LayoutGrid, Search, MapPin, BarChart2, Headphones, Loader2,
} from 'lucide-react'

const PERIOD_LABELS: Record<string, string> = {
  'one-time': 'one-time',
  'weekly': '/wk',
  'monthly': '/mo',
  'yearly': '/yr',
}

const ICON_OPTIONS = [
  { value: 'search', label: 'Search' },
  { value: 'map-pin', label: 'Map Pin' },
  { value: 'bar-chart', label: 'Bar Chart' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'globe', label: 'Globe' },
  { value: 'star', label: 'Star' },
  { value: 'zap', label: 'Zap' },
  { value: 'phone', label: 'Phone' },
  { value: 'mail', label: 'Mail' },
]

interface Addon {
  name: string
  description: string
  price: string | number
  period?: string
  stripe_payment_link_url: string
}

interface ServiceCard {
  name: string
  description: string
  icon: string
}

interface Offer {
  id: string
  token: string
  service_name: string
  description: string | null
  features: string | null
  price: number
  period: string
  stripe_payment_link_url: string | null
  addons: Addon[] | null
  service_cards: ServiceCard[] | null
  status: string
  created_at: string
  client_id: string | null
}

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : ''
}

async function fetchOffers(): Promise<Offer[]> {
  const token = await getToken()
  const res = await fetch('/api/admin/offers', { headers: { Authorization: token } })
  if (!res.ok) throw new Error('Failed to fetch offers')
  return res.json()
}

async function deleteOffer(id: string) {
  const token = await getToken()
  const res = await fetch(`/api/admin/offers?id=${id}`, {
    method: 'DELETE',
    headers: { Authorization: token },
  })
  if (!res.ok) throw new Error('Failed to delete offer')
}

async function updateOffer(id: string, payload: Partial<Offer & { addons: any; service_cards: any }>) {
  const token = await getToken()
  const res = await fetch('/api/admin/offers', {
    method: 'PATCH',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...payload }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to update offer')
  return json
}

function useOrigin() {
  const [origin, setOrigin] = React.useState('')
  React.useEffect(() => { setOrigin(window.location.origin) }, [])
  return origin
}

const OffersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const origin = useOrigin()
  const [editOffer, setEditOffer] = React.useState<Offer | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState('')

  // Edit form state
  const [editName, setEditName] = React.useState('')
  const [editDescription, setEditDescription] = React.useState('')
  const [editFeatures, setEditFeatures] = React.useState('')
  const [editStripeUrl, setEditStripeUrl] = React.useState('')
  const [editAddons, setEditAddons] = React.useState<Addon[]>([])
  const [editCards, setEditCards] = React.useState<ServiceCard[]>([])
  const [editError, setEditError] = React.useState('')

  const { data: offers = [], isLoading, error: fetchError } = useQuery({
    queryKey: ['service-offers'],
    queryFn: fetchOffers,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-offers'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateOffer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-offers'] })
      setEditOffer(null)
    },
    onError: (e: any) => setEditError(e.message),
  })

  const openEdit = (offer: Offer) => {
    setEditOffer(offer)
    setEditName(offer.service_name)
    setEditDescription(offer.description || '')
    setEditFeatures(offer.features || '')
    setEditStripeUrl(offer.stripe_payment_link_url || '')
    setEditAddons(
      Array.isArray(offer.addons)
        ? offer.addons.map(a => ({ ...a, price: String(a.price) }))
        : []
    )
    setEditCards(Array.isArray(offer.service_cards) ? offer.service_cards : [])
    setEditError('')
  }

  const handleSave = () => {
    if (!editOffer) return
    const cleanAddons = editAddons
      .filter(a => a.name.trim())
      .map(a => ({ name: a.name.trim(), description: a.description.trim(), price: Number(a.price) || 0, period: a.period || 'monthly', stripe_payment_link_url: a.stripe_payment_link_url.trim() }))
    const cleanCards = editCards
      .filter(c => c.name.trim())
      .map(c => ({ name: c.name.trim(), description: c.description.trim(), icon: c.icon }))

    updateMutation.mutate({
      id: editOffer.id,
      payload: {
        service_name: editName,
        description: editDescription,
        features: editFeatures,
        stripe_payment_link_url: editStripeUrl,
        addons: cleanAddons.length > 0 ? cleanAddons : null,
        service_cards: cleanCards.length > 0 ? cleanCards : null,
      },
    })
  }

  const copyLink = (offer: Offer) => {
    const url = `${origin}/pay/${offer.token}`
    navigator.clipboard.writeText(url)
    setCopiedId(offer.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Addon helpers
  const addAddon = () => setEditAddons(prev => [...prev, { name: '', description: '', price: '', period: 'monthly', stripe_payment_link_url: '' }])
  const removeAddon = (i: number) => setEditAddons(prev => prev.filter((_, idx) => idx !== i))
  const updateAddon = (i: number, field: keyof Addon, val: string) =>
    setEditAddons(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a))

  // Card helpers
  const addCard = () => setEditCards(prev => [...prev, { name: '', description: '', icon: 'check' }])
  const removeCard = (i: number) => setEditCards(prev => prev.filter((_, idx) => idx !== i))
  const updateCard = (i: number, field: keyof ServiceCard, val: string) =>
    setEditCards(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))

  const filtered = offers.filter(o =>
    o.service_name.toLowerCase().includes(search.toLowerCase())
  )

  const lbl = 'block text-sm font-medium text-gray-700 mb-1.5'
  const inputCls = 'w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677]'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-[#35c677]/10 rounded-xl">
              <Link2 className="h-6 w-6 text-[#35c677]" />
            </div>
            <h1 className="text-2xl font-bold text-[#191919]">Payment Offers</h1>
          </div>
          <p className="text-gray-500 text-sm ml-1">
            All service offers. Click the edit icon to update any offer.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search offers..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677]"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-[#35c677]" />
        </div>
      )}

      {fetchError && (
        <div className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl p-4">
          Failed to load offers: {(fetchError as Error).message}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-5 bg-[#35c677]/10 rounded-2xl mb-5">
            <Link2 className="h-10 w-10 text-[#35c677]" />
          </div>
          <h2 className="text-xl font-bold text-[#191919] mb-2">No offers yet</h2>
          <p className="text-gray-500 text-sm max-w-xs">
            Create a payment offer from the Dashboard and it will appear here.
          </p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map(offer => {
              const payUrl = `${origin}/pay/${offer.token}`
              const isCopied = copiedId === offer.id
              return (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-[#191919] text-base truncate">{offer.service_name}</h3>
                            {Array.isArray(offer.service_cards) && offer.service_cards.length > 0 && (
                              <span className="shrink-0 text-xs bg-[#35c677]/10 text-[#35c677] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <LayoutGrid className="h-3 w-3" />
                                Package
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                            <span className="font-bold text-[#191919]">
                              ${offer.price.toLocaleString()}{PERIOD_LABELS[offer.period] || ''}
                            </span>
                            {offer.description && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className="truncate max-w-xs">{offer.description}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100 w-fit max-w-full">
                            <span className="truncate">{payUrl}</span>
                          </div>
                          {Array.isArray(offer.addons) && offer.addons.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {offer.addons.map((a, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  +{a.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyLink(offer)}
                            className="text-xs"
                          >
                            {isCopied ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-[#35c677]" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                            {isCopied ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(payUrl, '_blank')}
                            className="text-xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(offer)}
                            className="text-xs"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (window.confirm(`Delete "${offer.service_name}"? This cannot be undone.`)) {
                                deleteMutation.mutate(offer.id)
                              }
                            }}
                            className="text-xs text-red-400 hover:text-red-600 hover:border-red-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editOffer && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Pencil className="h-5 w-5 text-[#35c677]" />
                      Edit Offer
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setEditOffer(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Price cannot be changed here — create a new offer to change pricing.
                  </p>
                </CardHeader>

                <CardContent className="space-y-4 pt-5">
                  <div>
                    <label className={lbl}>Service Name</label>
                    <Input value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>

                  <div>
                    <label className={lbl}>Description</label>
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      rows={2}
                      className={inputCls + ' resize-none'}
                    />
                  </div>

                  <div>
                    <label className={lbl}>
                      What's Included
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">one item per line</span>
                    </label>
                    <textarea
                      value={editFeatures}
                      onChange={e => setEditFeatures(e.target.value)}
                      rows={4}
                      className={inputCls + ' resize-none font-mono text-xs'}
                    />
                  </div>

                  <div>
                    <label className={lbl}>Stripe Payment Link URL</label>
                    <Input
                      value={editStripeUrl}
                      onChange={e => setEditStripeUrl(e.target.value)}
                      placeholder="https://buy.stripe.com/..."
                    />
                  </div>

                  {/* Service Cards */}
                  <div className="border-t border-dashed border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <LayoutGrid className="h-4 w-4 text-[#35c677]" />
                        Service Cards
                      </p>
                      {editCards.length < 8 && (
                        <button
                          onClick={addCard}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#35c677] hover:text-[#2db366] border border-[#35c677]/30 bg-[#35c677]/5 px-3 py-1.5 rounded-full transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add card
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {editCards.map((card, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border border-gray-200 rounded-xl p-3 mb-3 bg-gray-50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Card {i + 1}</span>
                              <button onClick={() => removeCard(i)} className="text-gray-400 hover:text-red-400">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-500 mb-1">Name</label>
                                <input value={card.name} onChange={e => updateCard(i, 'name', e.target.value)} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Icon</label>
                                <select value={card.icon} onChange={e => updateCard(i, 'icon', e.target.value)} className={inputCls}>
                                  {ICON_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Description</label>
                              <input value={card.description} onChange={e => updateCard(i, 'description', e.target.value)} className={inputCls} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add-ons */}
                  <div className="border-t border-dashed border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">Add-ons</p>
                      {editAddons.length < 5 && (
                        <button
                          onClick={addAddon}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#35c677] hover:text-[#2db366] border border-[#35c677]/30 bg-[#35c677]/5 px-3 py-1.5 rounded-full transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add add-on
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {editAddons.map((addon, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add-on {i + 1}</span>
                              <button onClick={() => removeAddon(i)} className="text-gray-400 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Name</label>
                                <input value={addon.name} onChange={e => updateAddon(i, 'name', e.target.value)} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Price (USD)</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                  <input type="number" min="0" value={addon.price} onChange={e => updateAddon(i, 'price', e.target.value)} className={inputCls + ' pl-6'} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Billing</label>
                                <select value={addon.period ?? 'monthly'} onChange={e => updateAddon(i, 'period', e.target.value)} className={inputCls}>
                                  <option value="one-time">One-time</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                  <option value="yearly">Yearly</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Description</label>
                              <input value={addon.description} onChange={e => updateAddon(i, 'description', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Stripe Payment Link URL</label>
                              <input value={addon.stripe_payment_link_url} onChange={e => updateAddon(i, 'stripe_payment_link_url', e.target.value)} placeholder="https://buy.stripe.com/..." className={inputCls} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {editError && <p className="text-red-500 text-sm">{editError}</p>}

                  <div className="flex items-center justify-end gap-3 pt-3 border-t">
                    <Button variant="outline" onClick={() => setEditOffer(null)}>Cancel</Button>
                    <Button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="bg-[#35c677] hover:bg-[#2db366] text-white"
                    >
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                      {!updateMutation.isPending && <ArrowRight className="h-4 w-4 ml-1.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OffersPage
