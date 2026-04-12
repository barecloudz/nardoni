'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Badge } from '../ui/badge'
import {
  Mail,
  MessageSquare,
  Target,
  CheckCircle2,
  ArrowRight,
  Flame,
  ShieldCheck,
  TrendingUp,
  Clock,
  Package,
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

function BulletList({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#35c677] flex-shrink-0" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  )
}

const DomainWarmingCard: React.FC = () => (
  <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
    <div className="flex items-start space-x-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
        <Flame className="h-5 w-5 text-orange-500" />
      </div>
      <div>
        <h4 className="font-semibold text-orange-900 text-sm">Domain Warming in Progress</h4>
        <p className="text-xs text-orange-700 mt-0.5">We can't send your campaigns yet — here's exactly why and what we're doing about it.</p>
      </div>
    </div>

    <div className="space-y-3">
      <div className="bg-white rounded-lg p-4 border border-orange-100">
        <div className="flex items-center space-x-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-semibold text-gray-800">What is domain warming?</p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          When a brand-new domain starts sending emails, inbox providers like Gmail and Outlook are suspicious — they don't recognize it yet. If we sent thousands of emails right away, they'd land in spam and your domain could get permanently blacklisted. Domain warming fixes this by starting small and building trust over time.
        </p>
      </div>

      <div className="bg-white rounded-lg p-4 border border-orange-100">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-semibold text-gray-800">What we're doing right now</p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          We've set up your domains inside <strong>Instantly</strong> — a professional email deliverability platform used by top agencies. Here's how the warming process works:
        </p>
        <div className="space-y-2">
          {[
            { week: 'Week 1–2', desc: 'Send 5–10 emails/day. Instantly\'s network of real inboxes replies back, signaling to Gmail that your domain is trusted.', active: true },
            { week: 'Week 3–4', desc: 'Ramp to 30–50 emails/day. Open rates and positive signals build your sender reputation score.', active: false },
            { week: 'Week 5–6', desc: 'Full volume: 100–500 emails/day to your Myrtle Beach prospect list, landing in the primary inbox.', active: false },
          ].map((step, i) => (
            <div key={i} className={`flex items-start space-x-3 p-2 rounded-lg ${step.active ? 'bg-orange-50' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${step.active ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1}
              </div>
              <div>
                <p className={`text-xs font-semibold ${step.active ? 'text-orange-700' : 'text-gray-500'}`}>
                  {step.week} {step.active && <span className="ml-1 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">← We are here</span>}
                </p>
                <p className={`text-xs mt-0.5 ${step.active ? 'text-gray-700' : 'text-gray-400'}`}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-orange-100">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-semibold text-gray-800">Why this matters for you</p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your 3,330+ Myrtle Beach contacts are ready and waiting. Skipping this step and blasting them now would get your domain flagged as spam — meaning <em>zero</em> of those emails would ever be seen. Doing it right means when we launch, your outreach actually reaches decision-makers in their primary inbox.
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
    month: 'long', day: 'numeric', year: 'numeric'
  })

  const showWarming = report.emails_sent === 0 || (report.emails_sent < 20)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-xl overflow-hidden bg-white"
    >
      {/* Header — always visible */}
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#191919] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">W{new Date(report.week_start + 'T00:00:00').getDate()}</span>
          </div>
          <div>
            <p className="font-semibold text-[#191919] text-sm">Week of {weekLabel}</p>
            <div className="flex items-center space-x-3 mt-0.5">
              {report.emails_sent > 0 ? (
                <>
                  <span className="text-xs text-gray-500">{report.emails_sent} emails sent</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-500">{report.emails_responded} responses</span>
                  {responseRate > 0 && (
                    <>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-[#35c677] font-medium">{responseRate}% response rate</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-xs text-orange-500 flex items-center space-x-1">
                  <Flame className="h-3 w-3" />
                  <span>Domain warming</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="success" className="text-xs">Published</Badge>
          <ArrowRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-100"
        >
          <div className="p-5 space-y-6">

            {/* Metrics */}
            {report.emails_sent > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Emails Sent', value: report.emails_sent.toLocaleString(), icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Responses', value: report.emails_responded.toString(), icon: MessageSquare, color: 'text-[#35c677]', bg: 'bg-[#35c677]/10' },
                  { label: 'Response Rate', value: `${responseRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className={`w-8 h-8 ${m.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <m.icon className={`h-4 w-4 ${m.color}`} />
                    </div>
                    <p className="text-xl font-bold text-[#191919]">{m.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Domain warming explanation */}
            {showWarming && <DomainWarmingCard />}

            {/* Active conversations */}
            {report.active_conversations && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-[#35c677]" />
                  <h4 className="text-sm font-semibold text-[#191919]">Active Conversations & Accounts in Progress</h4>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <BulletList text={report.active_conversations} />
                </div>
              </div>
            )}

            {/* Opportunities */}
            {report.opportunities && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="h-4 w-4 text-[#35c677]" />
                  <h4 className="text-sm font-semibold text-[#191919]">Catering & Lunch Opportunities Being Worked</h4>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <BulletList text={report.opportunities} />
                </div>
              </div>
            )}

            {/* Closed */}
            {report.closed_this_week && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-[#35c677]" />
                  <h4 className="text-sm font-semibold text-[#191919]">Closed / Locked In This Week</h4>
                </div>
                <div className="bg-[#35c677]/5 border border-[#35c677]/20 rounded-xl p-4">
                  <BulletList text={report.closed_this_week} />
                </div>
              </div>
            )}

            {/* Next week */}
            {report.next_week_focus && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <ArrowRight className="h-4 w-4 text-[#35c677]" />
                  <h4 className="text-sm font-semibold text-[#191919]">Focus for Next Week</h4>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <BulletList text={report.next_week_focus} />
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}
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
  const yearlyServices = services.filter((s: any) => s.period === 'yearly')

  const totalMonthlyMarket = monthlyServices.reduce((sum: number, s: any) => sum + Number(s.market_price), 0)
  const totalOnetimeMarket = onetimeServices.reduce((sum: number, s: any) => sum + Number(s.market_price), 0)
  const monthlyRate = weeklyRate * 4.33

  return (
    <div className="rounded-2xl bg-[#191919] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-2 mb-1">
          <Package className="h-5 w-5 text-[#35c677]" />
          <h3 className="text-white font-bold text-lg">What You're Getting</h3>
        </div>
        <p className="text-gray-400 text-sm">Everything on your custom plan, and what the market would charge for each service.</p>
      </div>

      <div className="p-6 space-y-6">

        {/* One-time services */}
        {onetimeServices.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">One-Time Work Completed</p>
            <div className="space-y-2">
              {onetimeServices.map((s: any) => (
                <div key={s.id} className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-white text-sm font-medium">{s.service_name}</p>
                    {s.description && <p className="text-gray-500 text-xs mt-0.5 leading-snug">{s.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-500 text-xs line-through">${Number(s.market_price).toLocaleString()}</p>
                    <p className="text-[#35c677] text-xs font-semibold">
                      {s.our_price ? `$${s.our_price}` : 'Included'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-gray-500 text-xs">One-time market value</span>
              <div className="text-right">
                <span className="text-gray-500 text-xs line-through">${totalOnetimeMarket.toLocaleString()}</span>
                <span className="text-[#35c677] text-xs font-bold ml-2">Included in your plan</span>
              </div>
            </div>
          </div>
        )}

        {/* Monthly services */}
        {monthlyServices.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Monthly Services</p>
            <div className="space-y-2">
              {monthlyServices.map((s: any) => (
                <div key={s.id} className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-white text-sm font-medium">{s.service_name}</p>
                    {s.description && <p className="text-gray-500 text-xs mt-0.5 leading-snug">{s.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-500 text-xs line-through">${Number(s.market_price).toLocaleString()}/mo</p>
                    <p className="text-[#35c677] text-xs font-semibold">
                      {s.our_price ? `$${s.our_price}/mo` : 'Included'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total comparison */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Normal agency rate</p>
              <p className="text-2xl font-bold text-gray-400 line-through mt-1">${totalMonthlyMarket.toLocaleString()}<span className="text-sm">/mo</span></p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Your custom plan</p>
              <p className="text-2xl font-bold text-[#35c677] mt-1">${monthlyRate.toFixed(0)}<span className="text-sm text-gray-400">/mo</span></p>
            </div>
          </div>
          <div className="bg-[#35c677]/10 border border-[#35c677]/20 rounded-lg p-3 text-center">
            <p className="text-[#35c677] font-bold text-sm">
              You save ${(totalMonthlyMarket - monthlyRate).toLocaleString()}/month on your custom plan
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              That's ${((totalMonthlyMarket - monthlyRate) * 12).toLocaleString()} saved per year
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default WeeklyReportCard
