'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import {
  Mail, MessageSquare, Target, CheckCircle2, ArrowRight,
  Flame, ShieldCheck, TrendingUp, Clock, Package,
  ChevronDown, Trophy, Rocket, BarChart2, Sparkles,
} from 'lucide-react'

interface Report {
  id: string
  week_start: string
  emails_sent: number
  emails_responded: number
  active_conversations?: string
  opportunities?: string
  closed_this_week?: string
  next_week_focus?: string
  status: string
}

interface Props {
  report: Report
  clientId: string
  isExpanded?: boolean
  onToggle?: () => void
}

const PERIOD_LABELS: Record<string, string> = {
  'one-time': 'one-time',
  'monthly': '/mo',
  'yearly': '/yr',
}

function BulletList({ text, accent = false }: { text: string; accent?: boolean }) {
  const lines = text.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
  return (
    <ul className="space-y-2.5">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start space-x-3">
          <span className={`mt-[7px] h-1.5 w-1.5 rounded-full flex-shrink-0 ${accent ? 'bg-[#35c677]' : 'bg-gray-300'}`} />
          <span className="text-sm leading-relaxed text-gray-700">{line}</span>
        </li>
      ))}
    </ul>
  )
}

const DomainWarmingCard: React.FC = () => (
  <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5">
    <div className="flex items-start space-x-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0">
        <Flame className="h-5 w-5 text-orange-500" />
      </div>
      <div>
        <h4 className="font-bold text-orange-900">Domain Warming in Progress</h4>
        <p className="text-xs text-orange-700 mt-0.5">We can't send your campaigns yet — here's exactly why and what we're doing about it.</p>
      </div>
    </div>
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4 border border-orange-100">
        <div className="flex items-center space-x-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-semibold text-gray-800">What is domain warming?</p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          When a brand-new domain starts sending emails, inbox providers like Gmail and Outlook are suspicious. If we sent thousands of emails right away, they'd land in spam and your domain could get permanently blacklisted. Domain warming fixes this by starting small and building trust over time.
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-orange-100">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-semibold text-gray-800">Warmup timeline</p>
        </div>
        <div className="space-y-2">
          {[
            { week: 'Week 1–2', desc: "5–10 emails/day. Instantly's network of real inboxes replies back, building trust.", active: true },
            { week: 'Week 3–4', desc: 'Ramp to 30–50 emails/day. Open rates build your sender reputation score.', active: false },
            { week: 'Week 5–6', desc: 'Full volume: 100–500 emails/day reaching your prospect list in the primary inbox.', active: false },
          ].map((step, i) => (
            <div key={i} className={`flex items-start space-x-3 p-2.5 rounded-lg ${step.active ? 'bg-orange-50' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${step.active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i + 1}
              </div>
              <div>
                <p className={`text-xs font-semibold ${step.active ? 'text-orange-700' : 'text-gray-400'}`}>
                  {step.week} {step.active && <span className="ml-1.5 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">← We are here</span>}
                </p>
                <p className={`text-xs mt-0.5 leading-relaxed ${step.active ? 'text-gray-600' : 'text-gray-400'}`}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-orange-100">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-semibold text-gray-800">Why this matters for you</p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your 3,330+ contacts are ready and waiting. Skipping this step and blasting them now would flag your domain as spam — meaning <em>zero</em> emails would ever be seen. Doing it right means when we launch, your outreach actually reaches decision-makers in their primary inbox.
        </p>
      </div>
    </div>
  </div>
)

export const WeeklyReportCard: React.FC<Props> = ({ report, clientId, isExpanded = false, onToggle }) => {
  const responseRate = report.emails_sent > 0
    ? Math.round((report.emails_responded / report.emails_sent) * 100)
    : 0

  const weekLabel = new Date(report.week_start + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  const weekEnd = new Date(report.week_start + 'T00:00:00')
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndLabel = weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const showWarming = report.emails_sent === 0 || report.emails_sent < 20
  const hasWins = !!report.closed_this_week?.trim()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Collapsed header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/80 transition-colors text-left"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 bg-[#191919] rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart2 className="h-5 w-5 text-[#35c677]" />
          </div>
          <div>
            <p className="font-semibold text-[#191919]">Week of {weekLabel}</p>
            <div className="flex items-center space-x-2.5 mt-0.5">
              {report.emails_sent > 0 ? (
                <>
                  <span className="text-xs text-gray-500">{report.emails_sent.toLocaleString()} emails</span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-500">{report.emails_responded} responses</span>
                  {responseRate > 0 && (
                    <>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-xs font-semibold text-[#35c677]">{responseRate}% reply rate</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-xs text-orange-500 flex items-center space-x-1.5">
                  <Flame className="h-3 w-3" />
                  <span>Domain warming phase</span>
                </span>
              )}
              {hasWins && (
                <>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs font-semibold text-[#35c677] flex items-center space-x-1">
                    <Trophy className="h-3 w-3" />
                    <span>Wins this week</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-[#35c677] bg-[#35c677]/10 px-2.5 py-1 rounded-full border border-[#35c677]/20">
            <span className="w-1.5 h-1.5 bg-[#35c677] rounded-full" />
            <span>Published</span>
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded — premium report view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Report document */}
            <div className="border-t border-gray-100">

              {/* Branded report header */}
              <div className="bg-[#191919] px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-7 h-7 bg-[#35c677] rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-sm">N</span>
                      </div>
                      <span className="text-white font-semibold text-sm tracking-wide">Nardoni Digital</span>
                    </div>
                    <h3 className="text-white font-bold text-xl leading-tight">Weekly Performance Report</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {weekLabel} — {weekEndLabel}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#35c677] bg-[#35c677]/15 px-3 py-1.5 rounded-full border border-[#35c677]/25">
                      <span className="w-1.5 h-1.5 bg-[#35c677] rounded-full animate-pulse" />
                      <span>Live Report</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 bg-white">

                {/* Metrics */}
                {report.emails_sent > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Outreach Metrics</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                        <Mail className="h-4 w-4 text-blue-500 mx-auto mb-2" />
                        <p className="text-3xl font-black text-[#191919]">{report.emails_sent.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Emails Sent</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                        <MessageSquare className="h-4 w-4 text-[#35c677] mx-auto mb-2" />
                        <p className="text-3xl font-black text-[#191919]">{report.emails_responded}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Replies</p>
                      </div>
                      <div className="bg-[#35c677]/8 rounded-2xl p-4 text-center border border-[#35c677]/20">
                        <TrendingUp className="h-4 w-4 text-[#35c677] mx-auto mb-2" />
                        <p className="text-3xl font-black text-[#35c677]">{responseRate}%</p>
                        <p className="text-xs text-[#35c677]/70 mt-1 font-medium">Reply Rate</p>
                      </div>
                    </div>
                    {/* Response rate bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Reply rate</span>
                        <span className="text-xs font-semibold text-[#35c677]">{responseRate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <motion.div
                          className="bg-[#35c677] h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(responseRate, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <DomainWarmingCard />
                )}

                {/* Active conversations */}
                {report.active_conversations && (
                  <div>
                    <div className="flex items-center space-x-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <h4 className="font-semibold text-[#191919] text-sm">Active Conversations</h4>
                    </div>
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                      <BulletList text={report.active_conversations} />
                    </div>
                  </div>
                )}

                {/* Opportunities */}
                {report.opportunities && (
                  <div>
                    <div className="flex items-center space-x-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
                        <Target className="h-3.5 w-3.5 text-purple-500" />
                      </div>
                      <h4 className="font-semibold text-[#191919] text-sm">Opportunities in Progress</h4>
                    </div>
                    <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4">
                      <BulletList text={report.opportunities} />
                    </div>
                  </div>
                )}

                {/* Wins — most prominent section */}
                {report.closed_this_week && (
                  <div className="rounded-2xl bg-[#191919] overflow-hidden">
                    <div className="px-5 py-3 bg-[#35c677] flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-white" />
                      <h4 className="font-bold text-white text-sm">Wins This Week</h4>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2.5">
                        {report.closed_this_week.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean).map((line, i) => (
                          <li key={i} className="flex items-start space-x-3">
                            <CheckCircle2 className="h-4 w-4 text-[#35c677] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-200 leading-relaxed">{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Next week */}
                {report.next_week_focus && (
                  <div>
                    <div className="flex items-center space-x-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-[#35c677]/10 border border-[#35c677]/20 flex items-center justify-center flex-shrink-0">
                        <Rocket className="h-3.5 w-3.5 text-[#35c677]" />
                      </div>
                      <h4 className="font-semibold text-[#191919] text-sm">Focus for Next Week</h4>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                      <BulletList text={report.next_week_focus} accent />
                    </div>
                  </div>
                )}

                {/* Report footer */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-[#35c677] rounded flex items-center justify-center">
                      <span className="text-white font-black text-xs">N</span>
                    </div>
                    <span className="text-xs text-gray-400">Prepared by <span className="font-medium text-gray-600">Nardoni Digital</span></span>
                  </div>
                  <span className="text-xs text-gray-300">{weekLabel}</span>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// The full value breakdown shown below all reports
export const ClientValueBreakdown: React.FC<{ clientId: string; weeklyRate?: number; prefetchedServices?: any[] }> = ({ clientId, weeklyRate = 300, prefetchedServices }) => {
  const { data: fetchedServices = [] } = useQuery({
    queryKey: ['client-service-values', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_service_values')
        .select('*')
        .eq('client_id', clientId)
        .eq('active', true)
        .order('display_order')
      if (error) return []
      return data || []
    },
    enabled: !!clientId && !prefetchedServices,
  })

  const services = prefetchedServices ?? fetchedServices

  if (services.length === 0) return null

  const monthlyServices = services.filter((s: any) => s.period === 'monthly')
  const onetimeServices = services.filter((s: any) => s.period === 'one-time')

  const totalMonthlyMarket = monthlyServices.reduce((sum: number, s: any) => sum + Number(s.market_price), 0)
  const totalOnetimeMarket = onetimeServices.reduce((sum: number, s: any) => sum + Number(s.market_price), 0)
  const monthlyRate = weeklyRate * 4.33
  const savings = totalMonthlyMarket - monthlyRate

  return (
    <div className="rounded-2xl bg-[#191919] overflow-hidden border border-white/5 shadow-xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#35c677]/20 rounded-xl border border-[#35c677]/30 flex items-center justify-center">
            <Package className="h-5 w-5 text-[#35c677]" />
          </div>
          <div>
            <h3 className="text-white font-bold">What You're Getting</h3>
            <p className="text-gray-500 text-xs mt-0.5">Market value vs. your custom plan</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-500 uppercase tracking-wide">You save</p>
          <p className="text-xl font-black text-[#35c677]">${savings > 0 ? savings.toLocaleString() : 0}<span className="text-sm font-normal text-gray-400">/mo</span></p>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* One-time */}
        {onetimeServices.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
              <span className="h-px flex-1 bg-white/5" />
              <span>One-Time Work Completed</span>
              <span className="h-px flex-1 bg-white/5" />
            </p>
            <div className="space-y-3">
              {onetimeServices.map((s: any) => (
                <div key={s.id} className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-white text-sm font-medium leading-snug">{s.service_name}</p>
                    {s.description && <p className="text-gray-500 text-xs mt-0.5 leading-snug">{s.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-600 text-xs line-through">${Number(s.market_price).toLocaleString()}</p>
                    <p className="text-[#35c677] text-xs font-bold">{s.our_price ? `$${s.our_price}` : 'Included'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly */}
        {monthlyServices.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
              <span className="h-px flex-1 bg-white/5" />
              <span>Monthly Services</span>
              <span className="h-px flex-1 bg-white/5" />
            </p>
            <div className="space-y-3">
              {monthlyServices.map((s: any) => (
                <div key={s.id} className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-white text-sm font-medium leading-snug">{s.service_name}</p>
                    {s.description && <p className="text-gray-500 text-xs mt-0.5 leading-snug">{s.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-600 text-xs line-through">${Number(s.market_price).toLocaleString()}/mo</p>
                    <p className="text-[#35c677] text-xs font-bold">{s.our_price ? `$${Number(s.our_price).toLocaleString()}/mo` : 'Included'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value comparison */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Normal Agency Rate</p>
              <p className="text-2xl font-black text-gray-500 line-through">${totalMonthlyMarket.toLocaleString()}<span className="text-sm">/mo</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Your Plan</p>
              <p className="text-2xl font-black text-white">${monthlyRate.toFixed(0)}<span className="text-sm text-gray-400">/mo</span></p>
            </div>
          </div>
          {savings > 0 && (
            <div className="bg-[#35c677]/10 border border-[#35c677]/20 rounded-xl p-3.5 text-center">
              <div className="flex items-center justify-center space-x-2 mb-0.5">
                <Sparkles className="h-4 w-4 text-[#35c677]" />
                <p className="text-[#35c677] font-bold text-sm">
                  You save ${savings.toLocaleString()}/month
                </p>
              </div>
              <p className="text-gray-400 text-xs">
                That's ${(savings * 12).toLocaleString()} saved per year on your custom plan
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default WeeklyReportCard
