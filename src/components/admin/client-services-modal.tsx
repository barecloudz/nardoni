'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { X, Plus, Trash2, Sparkles, GripVertical } from 'lucide-react'

interface ServiceItem {
  id?: string
  service_name: string
  description: string
  market_price: number
  our_price: number | null
  period: 'one-time' | 'monthly' | 'yearly'
  active: boolean
  display_order: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientName: string
  weeklyRate?: number // what they actually pay per week
}

const PERIOD_LABELS: Record<string, string> = {
  'one-time': 'one-time',
  'monthly': '/mo',
  'yearly': '/yr',
}

const PRESET_SERVICES = [
  { service_name: 'Custom E-Commerce Website', description: 'Fully custom-built online merch store — no templates, custom design, product catalog, cart & checkout', market_price: 8000, our_price: null, period: 'one-time' as const },
  { service_name: 'Domain Registration & Setup', description: 'Purchase, configure DNS, redirects & brand protection across multiple domains', market_price: 400, our_price: null, period: 'one-time' as const },
  { service_name: 'Domain Management (ongoing)', description: 'Ongoing renewals, DNS management, and domain portfolio maintenance', market_price: 100, our_price: null, period: 'monthly' as const },
  { service_name: 'Private Business Email Hosting', description: 'Branded email setup with SPF/DKIM/DMARC configuration and ongoing management', market_price: 150, our_price: 7, period: 'monthly' as const },
  { service_name: 'Cold Email Outreach Management', description: 'B2B lead gen via cold email — targeting, copywriting, sequences, reply handling & reporting', market_price: 3500, our_price: null, period: 'monthly' as const },
  { service_name: 'Lead List Building & Prospecting', description: '3,000+ scraped & verified local business contacts, enriched and segmented by industry', market_price: 1200, our_price: null, period: 'one-time' as const },
  { service_name: 'Monthly Prospecting (fresh lists)', description: 'Ongoing monthly list building and prospect enrichment', market_price: 1500, our_price: null, period: 'monthly' as const },
  { service_name: 'Domain Warming & Deliverability', description: 'Multi-domain warmup via Instantly — gradual send volume ramp to protect inbox placement', market_price: 600, our_price: null, period: 'monthly' as const },
  { service_name: 'B2B Catering Sales Outreach', description: 'Outsourced SDR function targeting corporate accounts, event planners & office managers', market_price: 3000, our_price: null, period: 'monthly' as const },
  { service_name: 'Merchandise Deal Coordination', description: 'Secured Opossum Works partnership — branded beach merch at zero upfront cost, pay only on sales', market_price: 2500, our_price: null, period: 'one-time' as const },
  { service_name: 'Weekly Performance Reports', description: 'Detailed weekly breakdowns: activity, metrics, opportunities, and next steps', market_price: 500, our_price: null, period: 'monthly' as const },
  { service_name: 'Social Media Management', description: 'Content creation, posting, and community management across platforms', market_price: 1500, our_price: null, period: 'monthly' as const },
  { service_name: 'Local SEO (Google Rankings)', description: 'Ranking for competitive local keywords — e.g. "best pizza in Myrtle Beach"', market_price: 1500, our_price: null, period: 'monthly' as const },
  { service_name: 'Google Business Profile Management', description: 'Daily GBP posts, review responses, Q&A, and profile optimization', market_price: 600, our_price: null, period: 'monthly' as const },
  { service_name: 'Digital Advertising (Google/Meta Ads)', description: 'Paid ad campaign setup, creative, management, and optimization', market_price: 1200, our_price: null, period: 'monthly' as const },
  { service_name: 'Hiring & Recruiting Support', description: 'Indeed job post management and applicant funnel support', market_price: 500, our_price: null, period: 'monthly' as const },
  { service_name: 'Dedicated Technical Support', description: 'Call us anytime — website, email, DNS, software, anything digital. We answer and fix it.', market_price: 800, our_price: null, period: 'monthly' as const },
]

const ClientServicesModal: React.FC<Props> = ({ isOpen, onClose, clientId, clientName, weeklyRate }) => {
  const queryClient = useQueryClient()
  const [newService, setNewService] = React.useState<Partial<ServiceItem>>({
    period: 'monthly',
    active: true,
    our_price: undefined,
  })
  const [showAddForm, setShowAddForm] = React.useState(false)

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['client-service-values', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_service_values')
        .select('*')
        .eq('client_id', clientId)
        .order('display_order')
      if (error) throw error
      return data || []
    },
    enabled: isOpen && !!clientId,
  })

  const addMutation = useMutation({
    mutationFn: async (item: Partial<ServiceItem>) => {
      const { error } = await supabase.from('client_service_values').insert({
        client_id: clientId,
        service_name: item.service_name,
        description: item.description || null,
        market_price: item.market_price,
        our_price: item.our_price ?? null,
        period: item.period || 'monthly',
        display_order: services.length,
        active: true,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-service-values', clientId] })
      setNewService({ period: 'monthly', active: true })
      setShowAddForm(false)
    },
    onError: (e: any) => alert(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_service_values').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-service-values', clientId] }),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('client_service_values').update({ active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-service-values', clientId] }),
  })

  const totalMarketValue = services
    .filter(s => s.active && s.period === 'monthly')
    .reduce((sum: number, s: any) => sum + (s.market_price || 0), 0)

  const monthlyRate = weeklyRate ? weeklyRate * 4.33 : null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-[#35c677]" />
                <span>Service Value Setup</span>
                <span className="text-sm font-normal text-gray-500">— {clientName}</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Configure what services you provide and what a normal agency would charge. Clients see these with market prices struck through.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Value summary */}
            {services.length > 0 && (
              <div className="bg-[#191919] rounded-xl p-4 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Market value of services</p>
                  <p className="text-2xl font-bold text-[#35c677]">${totalMarketValue.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                </div>
                {monthlyRate && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Client pays</p>
                    <p className="text-2xl font-bold text-white">${monthlyRate.toFixed(0)}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                    <p className="text-xs text-[#35c677] mt-0.5">
                      Saves ${(totalMarketValue - monthlyRate).toLocaleString()}/mo
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Preset quick-add */}
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Quick Add Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_SERVICES.map(preset => {
                  const alreadyAdded = services.some((s: any) => s.service_name === preset.service_name)
                  return (
                    <button
                      key={preset.service_name}
                      disabled={alreadyAdded}
                      onClick={() => addMutation.mutate(preset)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        alreadyAdded
                          ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                          : 'border-[#35c677]/40 text-[#35c677] hover:bg-[#35c677]/10 cursor-pointer'
                      }`}
                    >
                      {alreadyAdded ? '✓ ' : '+ '}{preset.service_name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Services list */}
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#35c677]" />
              </div>
            ) : services.length > 0 ? (
              <div className="space-y-2">
                {services.map((s: any) => (
                  <div key={s.id} className={`flex items-start justify-between p-3 rounded-lg border transition-opacity ${s.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <GripVertical className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#191919] truncate">{s.service_name}</p>
                        {s.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{s.description}</p>}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-400 line-through">
                            ${Number(s.market_price).toLocaleString()}{PERIOD_LABELS[s.period]}
                          </span>
                          <span className="text-xs text-[#35c677] font-medium">
                            {s.our_price ? `$${s.our_price}${PERIOD_LABELS[s.period]}` : 'Included'}
                          </span>
                          <Badge variant="secondary" className="text-xs py-0">{s.period}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => toggleMutation.mutate({ id: s.id, active: !s.active })}
                        className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                      >
                        {s.active ? 'Hide' : 'Show'}
                      </button>
                      <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(s.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm py-4">No services added yet. Use presets above or add manually.</p>
            )}

            {/* Manual add form */}
            {showAddForm ? (
              <div className="border border-dashed border-[#35c677] rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Add Custom Service</p>
                <Input
                  placeholder="Service name *"
                  value={newService.service_name || ''}
                  onChange={e => setNewService(p => ({ ...p, service_name: e.target.value }))}
                />
                <Input
                  placeholder="Short description"
                  value={newService.description || ''}
                  onChange={e => setNewService(p => ({ ...p, description: e.target.value }))}
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Market price *</label>
                    <Input
                      type="number"
                      placeholder="1200"
                      value={newService.market_price || ''}
                      onChange={e => setNewService(p => ({ ...p, market_price: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Our price (blank = included)</label>
                    <Input
                      type="number"
                      placeholder="Included"
                      value={newService.our_price ?? ''}
                      onChange={e => setNewService(p => ({ ...p, our_price: e.target.value ? Number(e.target.value) : null }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Period</label>
                    <select
                      value={newService.period || 'monthly'}
                      onChange={e => setNewService(p => ({ ...p, period: e.target.value as any }))}
                      className="w-full p-2 border border-gray-200 rounded-md text-sm"
                    >
                      <option value="one-time">One-time</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => addMutation.mutate(newService)} disabled={!newService.service_name || !newService.market_price}>
                    Add Service
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Service
              </Button>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button onClick={onClose}>Done</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ClientServicesModal
