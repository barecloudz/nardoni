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
  Trophy, Rocket, Lock, CheckCircle2, Circle,
} from 'lucide-react'

const schema = z.object({
  week_start: z.string().min(1, 'Required'),
  emails_sent: z.number().min(0).default(0),
  emails_responded: z.number().min(0).default(0),
  active_conversations: z.string().optional(),
  opportunities: z.string().optional(),
  closed_this_week: z.string().optional(),
  next_week_focus: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientName: string
  report?: any
}

const SECTIONS = [
  { key: 'week',          label: 'Week',              icon: Calendar,       fields: ['week_start'] },
  { key: 'metrics',       label: 'Metrics',           icon: BarChart2,      fields: ['emails_sent', 'emails_responded'] },
  { key: 'conversations', label: 'Conversations',     icon: MessageSquare,  fields: ['active_conversations'] },
  { key: 'opportunities', label: 'Opportunities',     icon: Target,         fields: ['opportunities'] },
  { key: 'wins',          label: 'Wins',              icon: Trophy,         fields: ['closed_this_week'] },
  { key: 'next',          label: 'Next Week',         icon: Rocket,         fields: ['next_week_focus'] },
  { key: 'notes',         label: 'Internal Notes',    icon: Lock,           fields: ['notes'] },
]

function isFilled(val: any) {
  if (val === undefined || val === null || val === '') return false
  if (typeof val === 'number') return true
  return String(val).trim().length > 0
}

const CreateReportModal: React.FC<Props> = ({ isOpen, onClose, clientId, clientName, report }) => {
  const queryClient = useQueryClient()
  const [showPreview, setShowPreview] = React.useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { emails_sent: 0, emails_responded: 0 },
  })

  const watched = useWatch({ control })

  // Fix: reset form with real data whenever modal opens or report changes
  React.useEffect(() => {
    if (isOpen) {
      if (report) {
        reset({
          week_start: report.week_start ?? '',
          emails_sent: report.emails_sent ?? 0,
          emails_responded: report.emails_responded ?? 0,
          active_conversations: report.active_conversations ?? '',
          opportunities: report.opportunities ?? '',
          closed_this_week: report.closed_this_week ?? '',
          next_week_focus: report.next_week_focus ?? '',
          notes: report.notes ?? '',
        })
      } else {
        reset({ emails_sent: 0, emails_responded: 0, week_start: '', active_conversations: '', opportunities: '', closed_this_week: '', next_week_focus: '', notes: '' })
      }
      setShowPreview(false)
    }
  }, [isOpen, report, reset])

  // Completion score
  const filledSections = SECTIONS.filter(s =>
    s.fields.every(f => {
      const val = (watched as any)[f]
      return isFilled(val)
    })
  ).length
  const completionPct = Math.round((filledSections / SECTIONS.length) * 100)

  const sent = Number(watched.emails_sent) || 0
  const responded = Number(watched.emails_responded) || 0
  const responseRate = sent > 0 ? Math.round((responded / sent) * 100) : 0

  const saveMutation = useMutation({
    mutationFn: async ({ data, publish }: { data: FormData; publish: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ? `Bearer ${session.access_token}` : ''

      const payload = {
        client_id: clientId,
        week_start: data.week_start,
        emails_sent: data.emails_sent,
        emails_responded: data.emails_responded,
        active_conversations: data.active_conversations || null,
        opportunities: data.opportunities || null,
        closed_this_week: data.closed_this_week || null,
        next_week_focus: data.next_week_focus || null,
        notes: data.notes || null,
        status: publish ? 'published' : 'draft',
      }

      const method = report?.id ? 'PATCH' : 'POST'
      const body = report?.id ? { id: report.id, ...payload } : payload

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

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  const ta = 'w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677] transition-colors'
  const lbl = 'block text-sm font-medium text-gray-700 mb-1.5'

  const SectionIcon = ({ section }: { section: typeof SECTIONS[0] }) => {
    const Icon = section.icon
    const filled = section.fields.every(f => isFilled((watched as any)[f]))
    return (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${filled ? 'bg-[#35c677]' : 'bg-gray-100'}`}>
        <Icon className={`h-4 w-4 ${filled ? 'text-white' : 'text-gray-400'}`} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
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

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Report completion</span>
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
            <div className="flex items-center space-x-1 mt-2">
              {SECTIONS.map(s => {
                const filled = s.fields.every(f => isFilled((watched as any)[f]))
                return (
                  <div
                    key={s.key}
                    title={s.label}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${filled ? 'bg-[#35c677]' : 'bg-gray-200'}`}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <AnimatePresence mode="wait">
            {showPreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="space-y-4 pt-2"
              >
                <div className="bg-[#191919] rounded-xl p-4 text-white">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Week of</p>
                  <p className="font-bold text-lg">
                    {watched.week_start
                      ? new Date(watched.week_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Emails Sent', value: sent },
                    { label: 'Responses', value: responded },
                    { label: 'Response Rate', value: `${responseRate}%` },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-2xl font-bold text-[#191919]">{m.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                {[
                  { label: 'Active Conversations', val: watched.active_conversations },
                  { label: 'Opportunities', val: watched.opportunities },
                  { label: 'Closed This Week', val: watched.closed_this_week },
                  { label: 'Next Week Focus', val: watched.next_week_focus },
                ].map(s => s.val ? (
                  <div key={s.label} className="border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#35c677] uppercase tracking-wide mb-2">{s.label}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{s.val}</p>
                  </div>
                ) : null)}

                {watched.notes && (
                  <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Internal Notes (not shown to client)</p>
                    <p className="text-sm text-gray-500 whitespace-pre-line">{watched.notes}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                className="space-y-5 pt-2"
              >
                {/* Week */}
                <div className="flex items-start space-x-3">
                  <SectionIcon section={SECTIONS[0]} />
                  <div className="flex-1">
                    <label className={lbl}>Week Start Date *</label>
                    <Input
                      {...register('week_start')}
                      type="date"
                      className={errors.week_start ? 'border-red-400' : ''}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-start space-x-3">
                  <SectionIcon section={SECTIONS[1]} />
                  <div className="flex-1">
                    <label className={lbl}>Outreach Metrics</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                        <input
                          {...register('emails_sent', { valueAsNumber: true })}
                          type="number"
                          min="0"
                          className="w-full bg-transparent text-3xl font-bold text-center text-[#191919] focus:outline-none"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Emails Sent</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                        <input
                          {...register('emails_responded', { valueAsNumber: true })}
                          type="number"
                          min="0"
                          className="w-full bg-transparent text-3xl font-bold text-center text-[#191919] focus:outline-none"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Responses</p>
                      </div>
                      <div className="bg-[#35c677]/10 rounded-xl p-3 border border-[#35c677]/20 text-center">
                        <p className="text-3xl font-bold text-[#35c677]">{responseRate}%</p>
                        <p className="text-xs text-[#35c677]/70 mt-1">Response Rate</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Conversations */}
                <div className="flex items-start space-x-3">
                  <SectionIcon section={SECTIONS[2]} />
                  <div className="flex-1">
                    <label className={lbl}>Active Conversations / Accounts in Progress</label>
                    <textarea
                      {...register('active_conversations')}
                      rows={3}
                      placeholder={`e.g. Follow-up with Downtown Grille re: lunch contract\nAwaiting reply from ABC Corp catering manager`}
                      className={ta}
                    />
                  </div>
                </div>

                {/* Opportunities */}
                <div className="flex items-start space-x-3">
                  <SectionIcon section={SECTIONS[3]} />
                  <div className="flex-1">
                    <label className={lbl}>Catering / Lunch Opportunities Being Worked</label>
                    <textarea
                      {...register('opportunities')}
                      rows={3}
                      placeholder={`e.g. Chamber luncheon — 80 pax, quoted $1,800\nMyrtle Beach Convention Center pitch`}
                      className={ta}
                    />
                  </div>
                </div>

                {/* Wins */}
                <div className="flex items-start space-x-3">
                  <SectionIcon section={SECTIONS[4]} />
                  <div className="flex-1">
                    <label className={lbl}>Closed / Locked In This Week 🏆</label>
                    <textarea
                      {...register('closed_this_week')}
                      rows={3}
                      placeholder={`e.g. Confirmed: Smith & Wesson office lunch — 4/18, 45 pax ($1,200)\nRepeat booking: TechFirm bi-weekly catering starting 4/22`}
                      className={ta}
                    />
                  </div>
                </div>

                {/* Next week */}
                <div className="flex items-start space-x-3">
                  <SectionIcon section={SECTIONS[5]} />
                  <div className="flex-1">
                    <label className={lbl}>Focus for Next Week</label>
                    <textarea
                      {...register('next_week_focus')}
                      rows={3}
                      placeholder={`e.g. Reach out to 30 new hotel concierge contacts\nFollow up on 5 pending catering quotes`}
                      className={ta}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="flex items-start space-x-3">
                  <SectionIcon section={SECTIONS[6]} />
                  <div className="flex-1">
                    <label className={lbl}>
                      Internal Notes
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">(not shown to client)</span>
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={2}
                      placeholder="Any context or caveats..."
                      className={ta}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            {SECTIONS.map(s => {
              const filled = s.fields.every(f => isFilled((watched as any)[f]))
              const Icon = s.icon
              return (
                <div key={s.key} title={s.label} className={`transition-colors ${filled ? 'text-[#35c677]' : 'text-gray-200'}`}>
                  {filled ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
              )
            })}
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
              {saveMutation.isPending ? 'Publishing...' : 'Publish to Client'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CreateReportModal
