'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  X, FileBarChart, Send, Save, Eye, EyeOff,
  Calendar, BarChart2, MessageSquare, Target,
  Trophy, Rocket, Lock, CheckCircle2,
  Mail, MapPin, Search, Zap,
} from 'lucide-react'

// ─── Service type config ────────────────────────────────────────────────────

type ServiceType = 'cold_email' | 'gbp' | 'seo' | 'ads'

const SERVICE_TYPES = [
  { key: 'cold_email' as ServiceType, label: 'Cold Email Outreach', shortLabel: 'Cold Email', icon: Mail,    activeCls: 'border-blue-300   bg-blue-50   text-blue-700'   },
  { key: 'gbp'        as ServiceType, label: 'Google Business Profile', shortLabel: 'GBP',    icon: MapPin,  activeCls: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  { key: 'seo'        as ServiceType, label: 'Local SEO',           shortLabel: 'SEO',        icon: Search,  activeCls: 'border-purple-300  bg-purple-50  text-purple-700'  },
  { key: 'ads'        as ServiceType, label: 'Google + Meta Ads',   shortLabel: 'Ads',        icon: Zap,     activeCls: 'border-amber-300   bg-amber-50   text-amber-700'   },
]

// Numeric KPI fields per type (stored in metrics JSONB — except cold_email which uses dedicated columns)
const SERVICE_METRICS: Record<ServiceType, { key: string; label: string; prefix?: string; suffix?: string }[]> = {
  cold_email: [],
  gbp: [
    { key: 'posts_published',   label: 'Posts Published'    },
    { key: 'reviews_responded', label: 'Reviews Responded'  },
    { key: 'new_5_star',        label: 'New 5★ Reviews'     },
    { key: 'profile_views',     label: 'Profile Views'      },
  ],
  seo: [
    { key: 'keywords_top10',   label: 'Keywords Top 10'    },
    { key: 'new_rankings',     label: 'New Rankings'       },
    { key: 'traffic_change',   label: 'Traffic Change', suffix: '%' },
    { key: 'backlinks_built',  label: 'Backlinks Built'    },
  ],
  ads: [
    { key: 'ad_spend',    label: 'Ad Spend',    prefix: '$' },
    { key: 'impressions', label: 'Impressions'              },
    { key: 'clicks',      label: 'Clicks'                   },
    { key: 'leads',       label: 'Leads'                    },
  ],
}

// Text narrative sections per type (reuses existing DB columns with different labels)
const SERVICE_SECTIONS: Record<ServiceType, { field: string; label: string; icon: any; placeholder: string }[]> = {
  cold_email: [
    { field: 'active_conversations', label: 'Active Conversations',    icon: MessageSquare, placeholder: 'Follow-up with Downtown Grille re: lunch contract\nAwaiting reply from ABC Corp catering manager'      },
    { field: 'opportunities',        label: 'Opportunities in Pipeline', icon: Target,       placeholder: 'Chamber luncheon — 80 pax, quoted $1,800\nMyrtle Beach Convention Center pitch'                     },
    { field: 'closed_this_week',     label: 'Wins This Week 🏆',        icon: Trophy,        placeholder: 'Confirmed: Smith & Wesson office lunch — 45 pax ($1,200)\nRepeat booking: TechFirm bi-weekly catering' },
    { field: 'next_week_focus',      label: 'Focus Next Week',          icon: Rocket,        placeholder: 'Reach out to 30 new hotel concierge contacts\nFollow up on 5 pending quotes'                         },
  ],
  gbp: [
    { field: 'closed_this_week', label: 'Highlights This Week',   icon: Trophy,        placeholder: 'Responded to 2-star review, owner turned it around\nMonday Madness post got 47 views, 6 calls' },
    { field: 'opportunities',    label: 'Reputation Notes',       icon: Target,        placeholder: "Competitor sitting at 4.2★ — we're at 4.8★\nSpotted 3 unanswered reviews from last month"   },
    { field: 'next_week_focus',  label: 'Focus Next Week',        icon: Rocket,        placeholder: "Mother's Day promo post scheduled\nRespond to any new reviews within 24hrs"                  },
  ],
  seo: [
    { field: 'active_conversations', label: 'Ranking Wins',              icon: Trophy,   placeholder: '"pizza delivery myrtle beach" moved #12 → #4\n"best catering myrtle beach" hit page 1'           },
    { field: 'opportunities',        label: 'Keywords Being Targeted',   icon: Target,   placeholder: 'catering near me — currently #18, targeting top 5\nbest pizza delivery — climbing page 2'       },
    { field: 'closed_this_week',     label: 'Work Completed This Week',  icon: CheckCircle2, placeholder: 'Updated homepage meta title & description\nBuilt 8 new citations (Yelp, YellowPages...)'    },
    { field: 'next_week_focus',      label: 'Focus Next Week',           icon: Rocket,   placeholder: 'Citation building — 10 new directories\nUpdate menu page for local keywords'                    },
  ],
  ads: [
    { field: 'closed_this_week', label: 'Best Performing Ads',         icon: Trophy,   placeholder: 'Pizza special: 45 clicks, 8 calls, $12 CPL\nCatering Facebook ad: 3.2% CTR, 6 leads'      },
    { field: 'opportunities',    label: 'Audience & Targeting Notes',  icon: Target,   placeholder: 'Expanded to 25-45 age bracket in 10mi radius\nNegative keywords added: "free", "recipe"'    },
    { field: 'next_week_focus',  label: 'Focus Next Week',             icon: Rocket,   placeholder: "New creative for Mother's Day weekend\nTest video ad vs. static image"                      },
  ],
}

// ─── Form schema ────────────────────────────────────────────────────────────

const schema = z.object({
  week_start:           z.string().min(1, 'Required'),
  emails_sent:          z.number().min(0).default(0),
  emails_responded:     z.number().min(0).default(0),
  active_conversations: z.string().optional(),
  opportunities:        z.string().optional(),
  closed_this_week:     z.string().optional(),
  next_week_focus:      z.string().optional(),
  notes:                z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientName: string
  report?: any
}

function isFilled(val: any) {
  if (val === undefined || val === null || val === '') return false
  if (typeof val === 'number') return true
  return String(val).trim().length > 0
}

// ─── Component ──────────────────────────────────────────────────────────────

const CreateReportModal: React.FC<Props> = ({ isOpen, onClose, clientId, clientName, report }) => {
  const queryClient = useQueryClient()
  const [showPreview, setShowPreview] = React.useState(false)
  const [serviceType, setServiceType] = React.useState<ServiceType>('cold_email')
  const [metrics, setMetrics] = React.useState<Record<string, string>>({})

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { emails_sent: 0, emails_responded: 0 },
  })

  const watched = useWatch({ control })

  React.useEffect(() => {
    if (isOpen) {
      const type = (report?.service_type as ServiceType) || 'cold_email'
      setServiceType(type)
      setMetrics(
        report?.metrics
          ? Object.fromEntries(Object.entries(report.metrics).map(([k, v]) => [k, String(v)]))
          : {}
      )
      if (report) {
        reset({
          week_start:           report.week_start            ?? '',
          emails_sent:          report.emails_sent           ?? 0,
          emails_responded:     report.emails_responded      ?? 0,
          active_conversations: report.active_conversations  ?? '',
          opportunities:        report.opportunities         ?? '',
          closed_this_week:     report.closed_this_week      ?? '',
          next_week_focus:      report.next_week_focus       ?? '',
          notes:                report.notes                 ?? '',
        })
      } else {
        reset({ emails_sent: 0, emails_responded: 0, week_start: '', active_conversations: '', opportunities: '', closed_this_week: '', next_week_focus: '', notes: '' })
      }
      setShowPreview(false)
    }
  }, [isOpen, report, reset])

  // Derived stats
  const sent        = Number(watched.emails_sent)      || 0
  const responded   = Number(watched.emails_responded) || 0
  const responseRate = sent > 0 ? Math.round((responded / sent) * 100) : 0
  const adSpend     = Number(metrics['ad_spend'])       || 0
  const leads       = Number(metrics['leads'])          || 0
  const costPerLead = leads > 0 ? (adSpend / leads).toFixed(0) : null

  // Completion
  const currentSections = SERVICE_SECTIONS[serviceType]
  const metricsFields   = SERVICE_METRICS[serviceType]
  const weekFilled      = isFilled(watched.week_start) ? 1 : 0
  const metricsFilled   = serviceType === 'cold_email'
    ? (isFilled(watched.emails_sent) ? 1 : 0)
    : (metricsFields.some(f => isFilled(metrics[f.key])) ? 1 : 0)
  const sectionsFilled  = currentSections.filter(s => isFilled((watched as any)[s.field])).length
  const totalSections   = 1 + 1 + currentSections.length
  const completionPct   = Math.round(((weekFilled + metricsFilled + sectionsFilled) / totalSections) * 100)

  const saveMutation = useMutation({
    mutationFn: async ({ data, publish }: { data: FormData; publish: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ? `Bearer ${session.access_token}` : ''

      const metricsPayload = metricsFields.length > 0
        ? Object.fromEntries(
            metricsFields
              .filter(f => isFilled(metrics[f.key]))
              .map(f => [f.key, Number(metrics[f.key])])
          )
        : null

      const payload = {
        client_id:            clientId,
        service_type:         serviceType,
        week_start:           data.week_start,
        emails_sent:          serviceType === 'cold_email' ? data.emails_sent : 0,
        emails_responded:     serviceType === 'cold_email' ? data.emails_responded : 0,
        active_conversations: data.active_conversations || null,
        opportunities:        data.opportunities        || null,
        closed_this_week:     data.closed_this_week     || null,
        next_week_focus:      data.next_week_focus      || null,
        notes:                data.notes                || null,
        metrics:              metricsPayload,
        status:               publish ? 'published' : 'draft',
      }

      const method = report?.id ? 'PATCH' : 'POST'
      const body   = report?.id ? { id: report.id, ...payload } : payload

      const res = await fetch('/api/admin/reports', {
        method,
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save report')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-reports', clientId] })
      reset()
      onClose()
    },
    onError: (err: any) => alert(err.message || 'Failed to save report'),
  })

  const handleClose = () => { reset(); onClose() }

  if (!isOpen) return null

  const ta  = 'w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677] transition-colors'
  const lbl = 'block text-sm font-medium text-gray-700 mb-1.5'
  const activeTypeDef = SERVICE_TYPES.find(t => t.key === serviceType)!

  // ── Metric grid for non-cold-email types
  const MetricGrid = () => (
    <div className={`grid gap-3 ${metricsFields.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
      {metricsFields.map(f => (
        <div key={f.key} className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
          {f.prefix && <p className="text-[10px] text-gray-400 -mb-1">{f.prefix}</p>}
          <input
            type="number"
            value={metrics[f.key] ?? ''}
            onChange={e => setMetrics(m => ({ ...m, [f.key]: e.target.value }))}
            className="w-full bg-transparent text-3xl font-bold text-center text-[#191919] focus:outline-none"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">{f.label}</p>
        </div>
      ))}
      {/* Calculated field */}
      {serviceType === 'ads' && (
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
          <p className="text-3xl font-bold text-amber-600">{costPerLead ? `$${costPerLead}` : '—'}</p>
          <p className="text-xs text-amber-600/70 mt-1">Cost / Lead</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-[#191919] rounded-lg flex items-center justify-center">
                <FileBarChart className="h-4 w-4 text-[#35c677]" />
              </div>
              <div>
                <h2 className="font-bold text-[#191919] leading-tight">
                  {report ? 'Edit Report' : 'New Weekly Report'}
                </h2>
                <p className="text-xs text-gray-400">{clientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPreview(p => !p)}
                className="flex items-center space-x-1.5 text-xs text-gray-500 hover:text-[#35c677] border border-gray-200 hover:border-[#35c677] rounded-lg px-3 py-1.5 transition-colors"
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showPreview ? 'Edit' : 'Preview'}</span>
              </button>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Service type tabs */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {SERVICE_TYPES.map(type => {
              const Icon = type.icon
              const active = serviceType === type.key
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setServiceType(type.key)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border-2 transition-all ${
                    active ? type.activeCls : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-[10px] font-semibold leading-tight">{type.shortLabel}</span>
                </button>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">{activeTypeDef.label} · completion</span>
              <span className={`text-xs font-bold ${completionPct === 100 ? 'text-[#35c677]' : 'text-gray-600'}`}>
                {completionPct}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <motion.div
                className="bg-[#35c677] h-2 rounded-full"
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <AnimatePresence mode="wait">

            {/* ── Preview mode ── */}
            {showPreview ? (
              <motion.div
                key={`preview-${serviceType}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="space-y-4 pt-2"
              >
                <div className="bg-[#191919] rounded-xl p-4 text-white">
                  {(() => { const Icon = activeTypeDef.icon; return <Icon className="h-4 w-4 text-[#35c677] mb-1" /> })()}
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{activeTypeDef.label} · Weekly Report</p>
                  <p className="font-bold text-lg">
                    {watched.week_start
                      ? new Date(watched.week_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </p>
                </div>

                {serviceType === 'cold_email' ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Emails Sent', value: sent.toLocaleString() },
                      { label: 'Responses',   value: responded             },
                      { label: 'Reply Rate',  value: `${responseRate}%`    },
                    ].map(m => (
                      <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <p className="text-2xl font-bold text-[#191919]">{m.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-3 ${metricsFields.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
                    {metricsFields.map(f => (
                      <div key={f.key} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <p className="text-2xl font-bold text-[#191919]">
                          {f.prefix}{metrics[f.key] || '0'}{f.suffix}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{f.label}</p>
                      </div>
                    ))}
                    {serviceType === 'ads' && costPerLead && (
                      <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                        <p className="text-2xl font-bold text-amber-600">${costPerLead}</p>
                        <p className="text-xs text-amber-600/70 mt-0.5">Cost / Lead</p>
                      </div>
                    )}
                  </div>
                )}

                {currentSections.map(s => {
                  const val = (watched as any)[s.field]
                  if (!val) return null
                  const Icon = s.icon
                  return (
                    <div key={s.field} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="h-3.5 w-3.5 text-[#35c677]" />
                        <p className="text-xs font-semibold text-[#35c677] uppercase tracking-wide">{s.label}</p>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{val}</p>
                    </div>
                  )
                })}

                {watched.notes && (
                  <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Internal Notes (not shown to client)</p>
                    <p className="text-sm text-gray-500 whitespace-pre-line">{watched.notes}</p>
                  </div>
                )}
              </motion.div>

            ) : (
              /* ── Edit mode ── */
              <motion.div
                key={`form-${serviceType}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                className="space-y-5 pt-2"
              >
                {/* Week */}
                <div>
                  <label className={lbl}>
                    <Calendar className="inline h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Week Start Date *
                  </label>
                  <Input
                    {...register('week_start')}
                    type="date"
                    className={errors.week_start ? 'border-red-400' : ''}
                  />
                </div>

                {/* Metrics */}
                <div>
                  <label className={lbl}>
                    <BarChart2 className="inline h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    {activeTypeDef.label} — Numbers This Week
                  </label>

                  {serviceType === 'cold_email' ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                        <input
                          {...register('emails_sent', { valueAsNumber: true })}
                          type="number" min="0"
                          className="w-full bg-transparent text-3xl font-bold text-center text-[#191919] focus:outline-none"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Emails Sent</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                        <input
                          {...register('emails_responded', { valueAsNumber: true })}
                          type="number" min="0"
                          className="w-full bg-transparent text-3xl font-bold text-center text-[#191919] focus:outline-none"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Responses</p>
                      </div>
                      <div className="bg-[#35c677]/10 rounded-xl p-3 border border-[#35c677]/20 text-center">
                        <p className="text-3xl font-bold text-[#35c677]">{responseRate}%</p>
                        <p className="text-xs text-[#35c677]/70 mt-1">Reply Rate</p>
                      </div>
                    </div>
                  ) : (
                    <MetricGrid />
                  )}
                </div>

                {/* Dynamic text sections */}
                {currentSections.map(section => {
                  const Icon = section.icon
                  return (
                    <div key={section.field}>
                      <label className={lbl}>
                        <Icon className="inline h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        {section.label}
                      </label>
                      <textarea
                        {...register(section.field as any)}
                        rows={3}
                        placeholder={section.placeholder}
                        className={ta}
                      />
                    </div>
                  )
                })}

                {/* Internal notes */}
                <div>
                  <label className={lbl}>
                    <Lock className="inline h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Internal Notes
                    <span className="ml-1.5 text-xs text-gray-400 font-normal">(not shown to client)</span>
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={2}
                    placeholder="Any context, blockers, or caveats for the team..."
                    className={ta}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="text-xs text-gray-400">
            {completionPct === 100 ? (
              <span className="text-[#35c677] font-semibold flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Report complete</span>
              </span>
            ) : (
              `${completionPct}% complete`
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              type="button"
              variant="outline"
              disabled={saveMutation.isPending}
              onClick={handleSubmit(data => saveMutation.mutate({ data, publish: false }))}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save Draft
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending}
              className="bg-[#35c677] hover:bg-[#2db366] text-white"
              onClick={handleSubmit(data => saveMutation.mutate({ data, publish: true }))}
            >
              <Send className="h-4 w-4 mr-1.5" />
              {saveMutation.isPending ? 'Publishing…' : 'Publish to Client'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CreateReportModal
