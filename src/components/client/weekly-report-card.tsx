'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import {
  Mail, MessageSquare, Target, CheckCircle2,
  Flame, ShieldCheck, TrendingUp, Clock, Package,
  ChevronDown, Trophy, Rocket, BarChart2, Sparkles,
  MapPin, Search, Zap, Star, ArrowUp, Globe,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type ServiceType = 'cold_email' | 'gbp' | 'seo' | 'ads'

interface Report {
  id: string
  week_start: string
  service_type?: ServiceType
  emails_sent: number
  emails_responded: number
  active_conversations?: string
  opportunities?: string
  closed_this_week?: string
  next_week_focus?: string
  status: string
  metrics?: Record<string, number>
}

interface Props {
  report: Report
  clientId: string
  isExpanded?: boolean
  onToggle?: () => void
}

// ─── Section labels per service type ────────────────────────────────────────

const SECTION_LABELS: Record<ServiceType, {
  active_conversations?: string
  opportunities?: string
  closed_this_week?: string
  next_week_focus?: string
}> = {
  cold_email: {
    active_conversations: 'Active Conversations',
    opportunities:        'Opportunities in Progress',
    closed_this_week:     'Wins This Week',
    next_week_focus:      'Focus for Next Week',
  },
  gbp: {
    closed_this_week: 'Highlights This Week',
    opportunities:    'Reputation Notes',
    next_week_focus:  'Focus for Next Week',
  },
  seo: {
    active_conversations: 'Ranking Wins',
    opportunities:        'Keywords Being Targeted',
    closed_this_week:     'Work Completed',
    next_week_focus:      'Focus for Next Week',
  },
  ads: {
    closed_this_week: 'Best Performing Ads',
    opportunities:    'Audience & Targeting',
    next_week_focus:  'Focus for Next Week',
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function WinsBlock({ text, label = 'Wins This Week' }: { text: string; label?: string }) {
  const lines = text.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
  return (
    <div className="rounded-2xl bg-[#191919] overflow-hidden">
      <div className="px-5 py-3 bg-[#35c677] flex items-center space-x-2">
        <Trophy className="h-4 w-4 text-white" />
        <h4 className="font-bold text-white text-sm">{label}</h4>
      </div>
      <div className="p-5">
        <ul className="space-y-2.5">
          {lines.map((line, i) => (
            <li key={i} className="flex items-start space-x-3">
              <CheckCircle2 className="h-4 w-4 text-[#35c677] flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-200 leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Domain warming explainer (cold email only) ─────────────────────────────

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

// ─── Service-specific expanded bodies ───────────────────────────────────────

function ColdEmailBody({ report }: { report: Report }) {
  const responseRate = report.emails_sent > 0
    ? Math.round((report.emails_responded / report.emails_sent) * 100) : 0
  const labels = SECTION_LABELS.cold_email

  return (
    <div className="p-6 space-y-6 bg-white">
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

      {report.active_conversations && (
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <h4 className="font-semibold text-[#191919] text-sm">{labels.active_conversations}</h4>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
            <BulletList text={report.active_conversations} />
          </div>
        </div>
      )}

      {report.opportunities && (
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
              <Target className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <h4 className="font-semibold text-[#191919] text-sm">{labels.opportunities}</h4>
          </div>
          <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4">
            <BulletList text={report.opportunities} />
          </div>
        </div>
      )}

      {report.closed_this_week && <WinsBlock text={report.closed_this_week} label={labels.closed_this_week} />}

      {report.next_week_focus && (
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#35c677]/10 border border-[#35c677]/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="h-3.5 w-3.5 text-[#35c677]" />
            </div>
            <h4 className="font-semibold text-[#191919] text-sm">{labels.next_week_focus}</h4>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <BulletList text={report.next_week_focus} accent />
          </div>
        </div>
      )}
    </div>
  )
}

function GBPBody({ report }: { report: Report }) {
  const m = report.metrics || {}
  const labels = SECTION_LABELS.gbp
  return (
    <div className="p-6 space-y-6 bg-white">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Google Business Profile Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Posts Published',    value: m.posts_published   ?? '—', icon: Globe,   color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Reviews Responded',  value: m.reviews_responded ?? '—', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { label: 'New 5★ Reviews',     value: m.new_5_star        ?? '—', icon: Star,    color: 'text-amber-500',   bg: 'bg-amber-50 border-amber-100'     },
            { label: 'Profile Views',      value: m.profile_views     ?? '—', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className={`rounded-2xl p-4 text-center border ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color} mx-auto mb-2`} />
                <p className="text-3xl font-black text-[#191919]">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {report.closed_this_week && <WinsBlock text={report.closed_this_week} label={labels.closed_this_week} />}

      {report.opportunities && (
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <h4 className="font-semibold text-[#191919] text-sm">{labels.opportunities}</h4>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
            <BulletList text={report.opportunities} />
          </div>
        </div>
      )}

      {report.next_week_focus && (
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#35c677]/10 border border-[#35c677]/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="h-3.5 w-3.5 text-[#35c677]" />
            </div>
            <h4 className="font-semibold text-[#191919] text-sm">{labels.next_week_focus}</h4>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <BulletList text={report.next_week_focus} accent />
          </div>
        </div>
      )}
    </div>
  )
}

function SEOBody({ report }: { report: Report }) {
  const m = report.metrics || {}
  const labels = SECTION_LABELS.seo
  const trafficChange = m.traffic_change
  return (
    <div className="p-6 space-y-6 bg-white">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">SEO Performance</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Keywords Top 10',  value: m.keywords_top10  ?? '—', icon: Search,     color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
            { label: 'New Rankings',     value: m.new_rankings    ?? '—', icon: ArrowUp,    color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Backlinks Built',  value: m.backlinks_built ?? '—', icon: Globe,      color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100'       },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className={`rounded-2xl p-4 text-center border ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color} mx-auto mb-2`} />
                <p className="text-3xl font-black text-[#191919]">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            )
          })}
          {trafficChange !== undefined && (
            <div className={`rounded-2xl p-4 text-center border ${trafficChange >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <TrendingUp className={`h-4 w-4 mx-auto mb-2 ${trafficChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`} />
              <p className={`text-3xl font-black ${trafficChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {trafficChange > 0 ? '+' : ''}{trafficChange}%
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Traffic Change</p>
            </div>
          )}
        </div>
      </div>

      {report.active_conversations && (
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-[#191919] text-sm">{labels.active_conversations}</h4>
          </div>
          <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4">
            <BulletList text={report.active_conversations} />
          </div>
        </div>
      )}

      {report.opportunities && (
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <Target className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <h4 className="font-semibold text-[#191919] text-sm">{labels.opportunities}</h4>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
            <BulletList text={report.opportunities} />
          </div>
        </div>
      )}

      {report.closed_this_week && <WinsBlock text={report.closed_this_week} label={labels.closed_this_week} />}

      {report.next_week_focus && (
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#35c677]/10 border border-[#35c677]/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="h-3.5 w-3.5 text-[#35c677]" />
            </div>
            <h4 className="font-semibold text-[#191919] text-sm">{labels.next_week_focus}</h4>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <BulletList text={report.next_week_focus} accent />
          </div>
        </div>
      )}
    </div>
  )
}

function AdsBody({ report }: { report: Report }) {
  const m = report.metrics || {}
  const labels = SECTION_LABELS.ads
  const costPerLead = m.leads && m.leads > 0 && m.ad_spend
    ? `$${(m.ad_spend / m.leads).toFixed(0)}` : null

  return (
    <div className="p-6 space-y-6 bg-white">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Ad Performance</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Ad Spend',    value: m.ad_spend    ? `$${m.ad_spend.toLocaleString()}` : '—', icon: Zap,           color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100'     },
            { label: 'Impressions', value: m.impressions ? m.impressions.toLocaleString()    : '—', icon: Globe,         color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-100'       },
            { label: 'Clicks',      value: m.clicks      ?? '—',                                    icon: TrendingUp,    color: 'text-purple-600',  bg: 'bg-purple-50 border-purple-100'   },
            { label: 'Leads',       value: m.leads       ?? '—',                                    icon: Target,        color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className={`rounded-2xl p-4 text-center border ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color} mx-auto mb-2`} />
                <p className="text-2xl font-black text-[#191919]">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            )
          })}
        </div>
        {costPerLead && (
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-amber-800 font-medium">Cost Per Lead</span>
            <span className="text-xl font-black text-amber-600">{costPerLead}</span>
          </div>
        )}
      </div>

      {report.closed_this_week && <WinsBlock text={report.closed_this_week} label={labels.closed_this_week} />}

      {report.opportunities && (
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <Target className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <h4 className="font-semibold text-[#191919] text-sm">{labels.opportunities}</h4>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
            <BulletList text={report.opportunities} />
          </div>
        </div>
      )}

      {report.next_week_focus && (
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#35c677]/10 border border-[#35c677]/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="h-3.5 w-3.5 text-[#35c677]" />
            </div>
            <h4 className="font-semibold text-[#191919] text-sm">{labels.next_week_focus}</h4>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <BulletList text={report.next_week_focus} accent />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Collapsed header quick stats ───────────────────────────────────────────

function CollapsedStats({ report }: { report: Report }) {
  const type = report.service_type || 'cold_email'
  const m = report.metrics || {}

  if (type === 'cold_email') {
    const rr = report.emails_sent > 0 ? Math.round((report.emails_responded / report.emails_sent) * 100) : 0
    if (report.emails_sent === 0 || report.emails_sent < 20) {
      return (
        <span className="text-xs text-orange-500 flex items-center space-x-1.5">
          <Flame className="h-3 w-3" />
          <span>Domain warming phase</span>
        </span>
      )
    }
    return (
      <div className="flex items-center space-x-2.5">
        <span className="text-xs text-gray-500">{report.emails_sent.toLocaleString()} emails</span>
        <span className="text-gray-300 text-xs">·</span>
        <span className="text-xs text-gray-500">{report.emails_responded} replies</span>
        {rr > 0 && <><span className="text-gray-300 text-xs">·</span><span className="text-xs font-semibold text-[#35c677]">{rr}% reply rate</span></>}
      </div>
    )
  }

  if (type === 'gbp') {
    return (
      <div className="flex items-center space-x-2.5">
        {m.posts_published   !== undefined && <span className="text-xs text-gray-500">{m.posts_published} posts</span>}
        {m.reviews_responded !== undefined && <><span className="text-gray-300 text-xs">·</span><span className="text-xs text-gray-500">{m.reviews_responded} reviews responded</span></>}
        {m.new_5_star        !== undefined && m.new_5_star > 0 && <><span className="text-gray-300 text-xs">·</span><span className="text-xs font-semibold text-amber-500">{m.new_5_star} new 5★</span></>}
      </div>
    )
  }

  if (type === 'seo') {
    return (
      <div className="flex items-center space-x-2.5">
        {m.keywords_top10  !== undefined && <span className="text-xs text-gray-500">{m.keywords_top10} keywords top 10</span>}
        {m.new_rankings    !== undefined && <><span className="text-gray-300 text-xs">·</span><span className="text-xs font-semibold text-purple-600">+{m.new_rankings} new rankings</span></>}
        {m.traffic_change  !== undefined && <><span className="text-gray-300 text-xs">·</span><span className={`text-xs font-semibold ${m.traffic_change >= 0 ? 'text-[#35c677]' : 'text-red-500'}`}>{m.traffic_change > 0 ? '+' : ''}{m.traffic_change}% traffic</span></>}
      </div>
    )
  }

  // ads
  return (
    <div className="flex items-center space-x-2.5">
      {m.ad_spend    !== undefined && <span className="text-xs text-gray-500">${m.ad_spend.toLocaleString()} spend</span>}
      {m.leads       !== undefined && <><span className="text-gray-300 text-xs">·</span><span className="text-xs font-semibold text-[#35c677]">{m.leads} leads</span></>}
      {m.leads && m.ad_spend && m.leads > 0 && <><span className="text-gray-300 text-xs">·</span><span className="text-xs text-gray-500">${(m.ad_spend / m.leads).toFixed(0)} CPL</span></>}
    </div>
  )
}

// ─── Service type badge ──────────────────────────────────────────────────────

const TYPE_META: Record<ServiceType, { label: string; icon: any; cls: string }> = {
  cold_email: { label: 'Cold Email',  icon: Mail,   cls: 'bg-blue-50   text-blue-700   border-blue-200'   },
  gbp:        { label: 'GBP',         icon: MapPin,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  seo:        { label: 'SEO',         icon: Search,  cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  ads:        { label: 'Ads',         icon: Zap,     cls: 'bg-amber-50  text-amber-700  border-amber-200'  },
}

// ─── Main card ───────────────────────────────────────────────────────────────

export const WeeklyReportCard: React.FC<Props> = ({ report, clientId, isExpanded = false, onToggle }) => {
  const type = (report.service_type || 'cold_email') as ServiceType
  const typeMeta = TYPE_META[type]
  const TypeIcon = typeMeta.icon
  const hasWins = !!report.closed_this_week?.trim()

  const weekLabel = new Date(report.week_start + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const weekEnd = new Date(report.week_start + 'T00:00:00')
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndLabel = weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

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
            <div className="flex items-center space-x-2 mb-0.5">
              <p className="font-semibold text-[#191919]">Week of {weekLabel}</p>
              <span className={`hidden sm:inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeMeta.cls}`}>
                <TypeIcon className="h-2.5 w-2.5" />
                <span>{typeMeta.label}</span>
              </span>
            </div>
            <CollapsedStats report={report} />
            {hasWins && (
              <div className="flex items-center space-x-1 mt-0.5">
                <Trophy className="h-3 w-3 text-[#35c677]" />
                <span className="text-xs font-semibold text-[#35c677]">Wins this week</span>
              </div>
            )}
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

      {/* Expanded report */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100">
              {/* Branded header */}
              <div className="bg-[#191919] px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-7 h-7 bg-[#35c677] rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-sm">N</span>
                      </div>
                      <span className="text-white font-semibold text-sm tracking-wide">Nardoni Digital</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-bold text-xl leading-tight">Weekly Performance Report</h3>
                      <span className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeMeta.cls}`}>
                        <TypeIcon className="h-2.5 w-2.5" />
                        <span>{typeMeta.label}</span>
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{weekLabel} — {weekEndLabel}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#35c677] bg-[#35c677]/15 px-3 py-1.5 rounded-full border border-[#35c677]/25">
                      <span className="w-1.5 h-1.5 bg-[#35c677] rounded-full animate-pulse" />
                      <span>Live Report</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Service-specific body */}
              {type === 'cold_email' && <ColdEmailBody report={report} />}
              {type === 'gbp'        && <GBPBody       report={report} />}
              {type === 'seo'        && <SEOBody        report={report} />}
              {type === 'ads'        && <AdsBody        report={report} />}

              {/* Footer */}
              <div className="px-6 pb-6">
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
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

// ─── Value breakdown (unchanged) ─────────────────────────────────────────────

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
  const monthlyRate = weeklyRate * 4.33
  const savings = totalMonthlyMarket - monthlyRate

  return (
    <div className="rounded-2xl bg-[#191919] overflow-hidden border border-white/5 shadow-xl">
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
        {onetimeServices.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
              <span className="h-px flex-1 bg-white/5" /><span>One-Time Work Completed</span><span className="h-px flex-1 bg-white/5" />
            </p>
            <div className="space-y-3">
              {onetimeServices.map((s: any) => (
                <div key={s.id} className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-white text-sm font-medium leading-snug">{s.service_name}</p>
                    {s.description && <p className="text-gray-300 text-xs mt-0.5 leading-snug">{s.description}</p>}
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
        {monthlyServices.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
              <span className="h-px flex-1 bg-white/5" /><span>Monthly Services</span><span className="h-px flex-1 bg-white/5" />
            </p>
            <div className="space-y-3">
              {monthlyServices.map((s: any) => (
                <div key={s.id} className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-white text-sm font-medium leading-snug">{s.service_name}</p>
                    {s.description && <p className="text-gray-300 text-xs mt-0.5 leading-snug">{s.description}</p>}
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
                <p className="text-[#35c677] font-bold text-sm">You save ${savings.toLocaleString()}/month</p>
              </div>
              <p className="text-gray-400 text-xs">That's ${(savings * 12).toLocaleString()} saved per year on your custom plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WeeklyReportCard
