'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  ExternalLink,
  Download,
  CheckCircle,
  Circle,
  TrendingUp,
  Globe,
  Search,
  Zap,
  ArrowRight,
  Star,
  Building,
  FileBarChart,
  Sparkles,
} from 'lucide-react'

// Services we can upsell — matched against what the client already has
const UPSELL_CATALOG = [
  {
    id: 'seo',
    name: 'Local SEO',
    matchKey: 'seo', // substring match against service_name
    headline: 'Get to page 1 of Google and stay there.',
    body: 'We rank local businesses in the top 10 Google results for their keywords. $500/month — 90-day guarantee.',
    tags: ['Page 1 Rankings', '90-Day Guarantee', 'Local SEO', 'Monthly Reports'],
    href: '/book-a-call?service=seo',
  },
  {
    id: 'gbp',
    name: 'Google Business Profile',
    matchKey: 'google business',
    headline: 'Own your Google Business listing.',
    body: 'Daily posts, review responses within 24hrs, custom graphics and monthly analytics. $400/month.',
    tags: ['Daily Posts', 'Review Management', 'Q&A', 'Analytics'],
    href: '/book-a-call?service=gbp',
  },
  {
    id: 'ads',
    name: 'Google + Meta Ads',
    matchKey: 'ads',
    headline: 'Turn ad spend into booked customers.',
    body: 'Full paid ad management across Google and Meta — setup, creative, targeting and optimization. $1,200/month.',
    tags: ['Google Ads', 'Meta Ads', 'Ad Creative', 'Optimization'],
    href: '/book-a-call?service=ads',
  },
  {
    id: 'cold-email',
    name: 'Cold Email Outreach',
    matchKey: 'cold email',
    headline: 'Reach 3,300+ B2B prospects on autopilot.',
    body: 'We manage your entire outreach — targeting, copy, follow-ups and reply handling. $3,500/month.',
    tags: ['B2B Lead Gen', 'Copywriting', 'Reply Handling', 'Weekly Reports'],
    href: '/book-a-call?service=outreach',
  },
]

const milestones = [
  { label: 'Discovery & Strategy', done: true },
  { label: 'Design & Development', done: true },
  { label: 'Review & Revisions', done: true },
  { label: 'Website Launched', done: true },
  { label: 'SEO & Google Rankings', done: false, next: true },
]

const ClientDashboard: React.FC = () => {
  const { data: portalData } = useQuery({
    queryKey: ['client-portal-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ? `Bearer ${session.access_token}` : ''
      const res = await fetch('/api/client/portal-data', {
        headers: { Authorization: token },
      })
      if (!res.ok) return null
      return res.json()
    },
  })

  const clientRecord = portalData?.client || null
  const invoices = portalData?.invoices || []

  const clientName = clientRecord?.name || 'there'
  const companyName = clientRecord?.company || ''
  const websiteUrl = clientRecord?.website || ''
  const firstName = clientName.split(' ')[0]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'sent': return 'warning'
      case 'overdue': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-5xl">

        {/* Welcome + Website Live */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-[#191919] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#35c677] opacity-10 rounded-full translate-x-20 -translate-y-20 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-flex items-center space-x-1.5 bg-[#35c677]/20 text-[#35c677] text-xs font-semibold px-3 py-1 rounded-full border border-[#35c677]/30">
                  <span className="w-1.5 h-1.5 bg-[#35c677] rounded-full animate-pulse" />
                  <span>Your site is live</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                Hey {firstName}, welcome to your portal.
              </h1>
              {companyName && (
                <p className="text-gray-400 text-sm mb-5">{companyName}</p>
              )}
              {websiteUrl ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 flex-1 min-w-0">
                    <Globe className="h-4 w-4 text-[#35c677] flex-shrink-0" />
                    <span className="text-sm font-mono truncate">{websiteUrl}</span>
                  </div>
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#35c677] hover:bg-[#2db366] text-white flex items-center space-x-2 whitespace-nowrap">
                      <span>Visit Your Site</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Your website URL will appear here once your site is deployed.</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Project Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <TrendingUp className="h-5 w-5 text-[#35c677]" />
                <span>Your Project Journey</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {milestones.map((m, i) => (
                  <div key={m.label} className="flex items-start space-x-4 pb-6 last:pb-0">
                    {/* Line connector */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                      >
                        {m.done ? (
                          <CheckCircle className="h-6 w-6 text-[#35c677] flex-shrink-0" />
                        ) : m.next ? (
                          <div className="h-6 w-6 rounded-full border-2 border-[#35c677] flex items-center justify-center flex-shrink-0">
                            <div className="h-2 w-2 bg-[#35c677] rounded-full animate-pulse" />
                          </div>
                        ) : (
                          <Circle className="h-6 w-6 text-gray-300 flex-shrink-0" />
                        )}
                      </motion.div>
                      {i < milestones.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1 ${m.done ? 'bg-[#35c677]' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <p className={`font-medium text-sm ${m.done ? 'text-[#191919]' : m.next ? 'text-[#35c677] font-semibold' : 'text-gray-400'}`}>
                        {m.label}
                        {m.next && <span className="ml-2 text-xs bg-[#35c677]/10 text-[#35c677] px-2 py-0.5 rounded-full">Up next</span>}
                      </p>
                      {m.done && <p className="text-xs text-gray-400 mt-0.5">Complete</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dynamic upsell — shows services the client doesn't already have */}
        {(() => {
          const services = portalData?.services || []
          const serviceNames = services.map((s: any) => s.service_name?.toLowerCase() || '')
          const upsells = UPSELL_CATALOG.filter(u =>
            !serviceNames.some((name: string) => name.includes(u.matchKey))
          ).slice(0, 2)

          if (upsells.length === 0) return null

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-[#35c677]" />
                <h3 className="text-sm font-semibold text-gray-700">Recommended for You</h3>
              </div>
              {upsells.map((u, i) => (
                <div
                  key={u.id}
                  className="rounded-2xl border-2 border-[#35c677] bg-white p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#35c677] opacity-5 rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
                  <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
                    <div className="w-11 h-11 bg-[#35c677]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Search className="h-5 w-5 text-[#35c677]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-semibold text-[#35c677] uppercase tracking-wide">Add-on Service</span>
                        <Star className="h-3 w-3 text-[#35c677] fill-[#35c677]" />
                      </div>
                      <h2 className="text-lg font-bold text-[#191919] mb-1.5">{u.headline}</h2>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{u.body}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {u.tags.map(tag => (
                          <span key={tag} className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <Zap className="h-3 w-3 text-[#35c677]" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                      <a href={u.href} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-[#35c677] hover:bg-[#2db366] text-white flex items-center space-x-2">
                          <span>Book a Free Strategy Call</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )
        })()}

        {/* Reports shortcut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <a href="/client/reports" className="block group">
            <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-200 hover:border-[#35c677] hover:shadow-md transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#191919] rounded-xl flex items-center justify-center">
                  <FileBarChart className="h-5 w-5 text-[#35c677]" />
                </div>
                <div>
                  <p className="font-semibold text-[#191919]">Weekly Reports</p>
                  <p className="text-sm text-gray-500">See exactly what we're doing for you each week</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#35c677] transition-colors" />
            </div>
          </a>
        </motion.div>

        {/* Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Building className="h-5 w-5 text-[#35c677]" />
                <span>Billing History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">No invoices yet.</p>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-[#191919] text-sm">{invoice.number}</p>
                        <p className="text-xs text-gray-500">Due {new Date(invoice.due_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-[#35c677]">${invoice.amount.toLocaleString()}</span>
                        <Badge variant={getStatusColor(invoice.status) as any}>{invoice.status}</Badge>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}

export default ClientDashboard
