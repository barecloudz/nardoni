'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, FileBarChart, Send, Save } from 'lucide-react'

const schema = z.object({
  week_start: z.string().min(1, 'Week start date is required'),
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
  report?: any // if editing existing
}

const CreateReportModal: React.FC<Props> = ({ isOpen, onClose, clientId, clientName, report }) => {
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: report ? {
      week_start: report.week_start,
      emails_sent: report.emails_sent ?? 0,
      emails_responded: report.emails_responded ?? 0,
      active_conversations: report.active_conversations ?? '',
      opportunities: report.opportunities ?? '',
      closed_this_week: report.closed_this_week ?? '',
      next_week_focus: report.next_week_focus ?? '',
      notes: report.notes ?? '',
    } : {
      emails_sent: 0,
      emails_responded: 0,
    }
  })

  const saveMutation = useMutation({
    mutationFn: async ({ data, publish }: { data: FormData; publish: boolean }) => {
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
        updated_at: new Date().toISOString(),
      }

      if (report?.id) {
        const { error } = await supabase
          .from('client_reports')
          .update(payload)
          .eq('id', report.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('client_reports')
          .insert(payload)
        if (error) throw error
      }
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

  const textareaClass = 'w-full p-3 border border-gray-200 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677]'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileBarChart className="h-5 w-5 text-[#35c677]" />
                <span>{report ? 'Edit' : 'New'} Weekly Report</span>
                <span className="text-sm font-normal text-gray-500">— {clientName}</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5">
              <div>
                <label className={labelClass}>Week of *</label>
                <Input
                  {...register('week_start')}
                  type="date"
                  className={errors.week_start ? 'border-red-500' : ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Emails Sent</label>
                  <Input
                    {...register('emails_sent', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>Responses Received</label>
                  <Input
                    {...register('emails_responded', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Active Conversations / Accounts in Progress</label>
                <textarea
                  {...register('active_conversations')}
                  rows={3}
                  placeholder="e.g. Follow-up with Downtown Grille re: lunch contract&#10;Awaiting reply from ABC Corp catering manager"
                  className={textareaClass}
                />
              </div>

              <div>
                <label className={labelClass}>Catering / Lunch Opportunities Being Worked</label>
                <textarea
                  {...register('opportunities')}
                  rows={3}
                  placeholder="e.g. Chamber of Commerce luncheon — 80 pax, quoted $1,800&#10;Corporate Friday lunch program pitch to Myrtle Beach Convention Center"
                  className={textareaClass}
                />
              </div>

              <div>
                <label className={labelClass}>Closed / Locked In This Week</label>
                <textarea
                  {...register('closed_this_week')}
                  rows={3}
                  placeholder="e.g. Confirmed: Smith & Wesson office lunch — 4/18, 45 pax ($1,200)&#10;Repeat booking: TechFirm bi-weekly catering starting 4/22"
                  className={textareaClass}
                />
              </div>

              <div>
                <label className={labelClass}>Focus for Next Week</label>
                <textarea
                  {...register('next_week_focus')}
                  rows={3}
                  placeholder="e.g. Reach out to 30 new hotel concierge contacts&#10;Follow up on 5 pending catering quotes"
                  className={textareaClass}
                />
              </div>

              <div>
                <label className={labelClass}>Additional Notes (internal)</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Any context the client doesn't need to see..."
                  className={textareaClass}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saveMutation.isPending}
                  onClick={handleSubmit(data => saveMutation.mutate({ data, publish: false }))}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  type="button"
                  disabled={saveMutation.isPending}
                  onClick={handleSubmit(data => saveMutation.mutate({ data, publish: true }))}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? 'Publishing...' : 'Publish to Client'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default CreateReportModal
