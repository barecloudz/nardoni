'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { WeeklyReportCard, ClientValueBreakdown } from '../client/weekly-report-card'

import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  X, Monitor, Globe, CheckCircle, Circle, TrendingUp,
  ExternalLink, FileBarChart, ArrowRight, Search, Zap,
  Star, Building, Download,
} from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    name: string
    company: string
    email: string
    website?: string
  } | null
}

type Tab = 'dashboard' | 'reports'

const milestones = [
  { label: 'Discovery & Strategy', done: true },
  { label: 'Design & Development', done: true },
  { label: 'Review & Revisions', done: true },
  { label: 'Website Launched', done: true },
  { label: 'SEO & Google Rankings', done: false, next: true },
]

const ClientPortalPreview: React.FC<Props> = ({ isOpen, onClose, client }) => {
  const [activeTab, setActiveTab] = React.useState<Tab>('dashboard')
  const [expandedReportId, setExpandedReportId] = React.useState<string | null>(null)

  const { data: previewData, isLoading: reportsLoading } = useQuery({
    queryKey: ['preview-data', client?.id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`/api/admin/client-preview?clientId=${client!.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Failed to load preview data')
      return res.json()
    },
    enabled: !!client?.id && isOpen,
  })

  const reports = previewData?.reports || []
  const invoices = previewData?.invoices || []

  React.useEffect(() => {
    if (reports.length > 0 && expandedReportId === null) {
      setExpandedReportId(reports[0].id)
    }
  }, [reports])

  const firstName = client?.name?.split(' ')[0] || 'Client'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'sent': return 'warning'
      case 'overdue': return 'destructive'
      default: return 'secondary'
    }
  }

  if (!isOpen || !client) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Admin preview bar */}
        <div className="bg-[#191919] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Monitor className="h-4 w-4 text-[#35c677]" />
            <span className="text-white text-sm font-medium">Admin Preview</span>
            <span className="text-gray-500 text-sm">—</span>
            <span className="text-gray-300 text-sm">{client.name} / {client.company}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded">
              What {firstName} sees
            </span>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Simulated portal header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-[#35c677] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="font-semibold text-[#191919] text-sm">Nardoni Digital</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{client.email}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 px-6 flex space-x-1 flex-shrink-0">
          {(['dashboard', 'reports'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 capitalize transition-colors ${
                activeTab === tab
                  ? 'border-[#35c677] text-[#35c677]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'reports' ? 'Weekly Reports' : 'Dashboard'}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="p-5 space-y-5">

              {/* Welcome hero */}
              <div className="bg-[#191919] rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#35c677] opacity-10 rounded-full translate-x-16 -translate-y-16 pointer-events-none" />
                <div className="relative">
                  <span className="inline-flex items-center space-x-1.5 bg-[#35c677]/20 text-[#35c677] text-xs font-semibold px-3 py-1 rounded-full border border-[#35c677]/30 mb-2">
                    <span className="w-1.5 h-1.5 bg-[#35c677] rounded-full animate-pulse" />
                    <span>Your site is live</span>
                  </span>
                  <h2 className="text-xl font-bold mb-1">Hey {firstName}, welcome to your portal.</h2>
                  {client.company && <p className="text-gray-400 text-xs mb-4">{client.company}</p>}
                  {client.website ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1.5 flex-1 min-w-0">
                        <Globe className="h-3.5 w-3.5 text-[#35c677] flex-shrink-0" />
                        <span className="text-xs font-mono truncate">{client.website}</span>
                      </div>
                      <a href={client.website} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-[#35c677] hover:bg-[#2db366] text-white text-xs">
                          Visit Site <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">Website URL will appear here once deployed.</p>
                  )}
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-[#35c677]" />
                  <h3 className="font-semibold text-[#191919] text-sm">Your Project Journey</h3>
                </div>
                <div className="space-y-0">
                  {milestones.map((m, i) => (
                    <div key={m.label} className="flex items-start space-x-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        {m.done ? (
                          <CheckCircle className="h-5 w-5 text-[#35c677] flex-shrink-0" />
                        ) : m.next ? (
                          <div className="h-5 w-5 rounded-full border-2 border-[#35c677] flex items-center justify-center flex-shrink-0">
                            <div className="h-1.5 w-1.5 bg-[#35c677] rounded-full animate-pulse" />
                          </div>
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                        )}
                        {i < milestones.length - 1 && (
                          <div className={`w-0.5 h-4 mt-1 ${m.done ? 'bg-[#35c677]' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <p className={`text-sm pt-0.5 ${m.done ? 'text-[#191919]' : m.next ? 'text-[#35c677] font-semibold' : 'text-gray-400'}`}>
                        {m.label}
                        {m.next && <span className="ml-2 text-xs bg-[#35c677]/10 text-[#35c677] px-1.5 py-0.5 rounded-full">Up next</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO upsell */}
              <div className="rounded-xl border-2 border-[#35c677] bg-white p-5">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-semibold text-[#35c677] uppercase tracking-wide">Next Step</span>
                  <Star className="h-3 w-3 text-[#35c677] fill-[#35c677]" />
                </div>
                <h3 className="font-bold text-[#191919] mb-1">Get to page 1 of Google and stay there.</h3>
                <p className="text-gray-600 text-xs mb-3 leading-relaxed">
                  Your site looks great. Now let's make sure people find it. <strong>$500/month to get you there and keep you there.</strong> If we can't within 90 days, we work for free until we do.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Page 1 Rankings', '90-Day Guarantee', 'Local SEO', 'Monthly Reports'].map(tag => (
                    <span key={tag} className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      <Zap className="h-2.5 w-2.5 text-[#35c677]" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
                <Button size="sm" className="bg-[#35c677] hover:bg-[#2db366] text-white text-xs">
                  Book a Free Strategy Call <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {/* Reports shortcut */}
              <button onClick={() => setActiveTab('reports')} className="w-full group">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-[#35c677] transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-[#191919] rounded-xl flex items-center justify-center">
                      <FileBarChart className="h-4 w-4 text-[#35c677]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#191919] text-sm">Weekly Reports</p>
                      <p className="text-xs text-gray-500">See exactly what we're doing for you each week</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#35c677] transition-colors" />
                </div>
              </button>

              {/* Invoices */}
              {invoices.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <Building className="h-4 w-4 text-[#35c677]" />
                    <h3 className="font-semibold text-[#191919] text-sm">Billing History</h3>
                  </div>
                  <div className="space-y-2">
                    {invoices.map((inv: any) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-[#191919] text-xs">{inv.number}</p>
                          <p className="text-xs text-gray-500">Due {new Date(inv.due_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-[#35c677] text-sm">${inv.amount.toLocaleString()}</span>
                          <Badge variant={getStatusColor(inv.status) as any} className="text-xs">{inv.status}</Badge>
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0"><Download className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#191919]">Weekly Reports</h2>
                <p className="text-gray-500 text-xs mt-0.5">Your weekly breakdown of everything we're doing for you.</p>
              </div>

              {reportsLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#35c677]" />
                </div>
              )}

              {!reportsLoading && reports.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <FileBarChart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600">No published reports yet</p>
                  <p className="text-xs mt-1">Go to Admin → Reports to create and publish the first one.</p>
                </div>
              )}

              {!reportsLoading && reports.length > 0 && (
                <div className="space-y-2">
                  {reports.map((report: any) => (
                    <WeeklyReportCard
                      key={report.id}
                      report={report}
                      clientId={client.id}
                      isExpanded={expandedReportId === report.id}
                      onToggle={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                    />
                  ))}
                </div>
              )}

              <ClientValueBreakdown clientId={client.id} weeklyRate={300} prefetchedServices={previewData?.services} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ClientPortalPreview
