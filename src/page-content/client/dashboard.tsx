'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { authService } from '../../lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  ExternalLink,
  Download,
  LogOut,
  CheckCircle,
  Circle,
  TrendingUp,
  Globe,
  Search,
  Zap,
  ArrowRight,
  Star,
  Building,
  User,
  MessageSquare,
} from 'lucide-react'

const milestones = [
  { label: 'Discovery & Strategy', done: true },
  { label: 'Design & Development', done: true },
  { label: 'Review & Revisions', done: true },
  { label: 'Website Launched', done: true },
  { label: 'SEO & Google Rankings', done: false, next: true },
]

const ClientDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = React.useState<any>(null)

  React.useEffect(() => {
    const fetchUser = async () => {
      const { user } = await getCurrentUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [])

  // Fetch the client record (company name, website URL, etc.)
  const { data: clientRecord } = useQuery({
    queryKey: ['client-record', currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()
      if (error) return null
      return data
    },
    enabled: !!currentUser,
  })

  // Fetch invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['client-invoices', currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientRecord?.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!clientRecord?.id,
  })

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/auth/login'
  }

  const clientName = clientRecord?.name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'there'
  const companyName = clientRecord?.company || currentUser?.user_metadata?.company || ''
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-[#35c677] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-semibold text-[#191919]">Nardoni Digital</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>{currentUser?.email}</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:hello@nardonidigital.com" className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Support</span>
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-5xl">

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

        {/* SEO Upsell */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="rounded-2xl border-2 border-[#35c677] bg-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#35c677] opacity-5 rounded-full translate-x-16 -translate-y-16 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#35c677]/10 rounded-xl flex items-center justify-center">
                  <Search className="h-6 w-6 text-[#35c677]" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-semibold text-[#35c677] uppercase tracking-wide">Next Step</span>
                  <Star className="h-3 w-3 text-[#35c677] fill-[#35c677]" />
                </div>
                <h2 className="text-xl font-bold text-[#191919] mb-2">
                  Get to page 1 of Google and stay there.
                </h2>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Your site looks great. Now let's make sure people can find it. We rank local businesses in the top 10 Google results for their keywords. <strong>$500/month to get you there and keep you there.</strong> If we can't get you there within 90 days, we work for free until we do.
                </p>
                <div className="flex flex-wrap gap-3 mb-5">
                  {['Page 1 Google Rankings', '90-Day Guarantee', 'Local SEO', 'Monthly Reporting'].map(tag => (
                    <span key={tag} className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      <Zap className="h-3 w-3 text-[#35c677]" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
                <a href="/book-a-call?service=seo" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#35c677] hover:bg-[#2db366] text-white flex items-center space-x-2">
                    <span>Book a Free Strategy Call</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
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

      </main>
    </div>
  )
}

export default ClientDashboard
