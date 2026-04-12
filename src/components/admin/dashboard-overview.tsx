'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Users, DollarSign, FileText, TrendingUp, Clock, MessageSquare, FileBarChart } from 'lucide-react'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  client: Users,
  invoice: DollarSign,
  contact: MessageSquare,
  report: FileBarChart,
}

const DashboardOverview: React.FC = () => {
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ? `Bearer ${session.access_token}` : ''
      const res = await fetch('/api/admin/dashboard', { headers: { Authorization: token } })
      if (!res.ok) return null
      return res.json()
    },
  })

  const clientCount = data?.clientCount ?? 0
  const totalRevenuePaid = data?.totalRevenuePaid ?? 0
  const unreadContacts = data?.unreadContacts ?? 0
  const publishedReports = data?.publishedReports ?? 0
  const recentActivity = data?.recentActivity ?? []

  const stats = [
    {
      title: 'Total Clients',
      value: isLoading ? '—' : clientCount.toString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      action: () => router.push('/admin/clients'),
    },
    {
      title: 'Revenue Collected',
      value: isLoading ? '—' : `$${totalRevenuePaid.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      action: () => router.push('/admin/invoices'),
    },
    {
      title: 'Published Reports',
      value: isLoading ? '—' : publishedReports.toString(),
      icon: FileBarChart,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      action: () => router.push('/admin/reports'),
    },
    {
      title: 'Unread Contacts',
      value: isLoading ? '—' : unreadContacts.toString(),
      icon: MessageSquare,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      action: () => router.push('/admin/contacts'),
    },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-[#191919] mb-2">Dashboard</h1>
        <p className="text-gray-600">Here's what's happening with your business.</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={stat.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-3xl font-bold text-[#191919] mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} ${stat.bg} p-3 rounded-xl`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-[#35c677]" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#35c677]" />
                </div>
              )}
              {!isLoading && recentActivity.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">No activity yet.</p>
              )}
              <div className="space-y-3">
                {recentActivity.map((item: any, i: number) => {
                  const Icon = ACTIVITY_ICONS[item.type] || FileText
                  return (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-[#35c677] p-2 rounded-full flex-shrink-0">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#191919] truncate">{item.message}</p>
                        <p className="text-xs text-gray-400">{timeAgo(item.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-[#35c677]" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  className="p-4 bg-[#35c677] text-white rounded-xl hover:bg-[#2ba866] transition-colors text-left"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/admin/clients')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm font-semibold block">Add Client</span>
                  <span className="text-xs opacity-75">Onboard a new client</span>
                </motion.button>
                <motion.button
                  className="p-4 bg-[#191919] text-white rounded-xl hover:bg-gray-800 transition-colors text-left"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/admin/reports')}
                >
                  <FileBarChart className="h-6 w-6 mb-2" />
                  <span className="text-sm font-semibold block">Write Report</span>
                  <span className="text-xs opacity-75">Weekly update</span>
                </motion.button>
                <motion.button
                  className="p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-left"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/admin/invoices')}
                >
                  <DollarSign className="h-6 w-6 mb-2" />
                  <span className="text-sm font-semibold block">Send Invoice</span>
                  <span className="text-xs opacity-75">Create & send</span>
                </motion.button>
                <motion.button
                  className="p-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-left"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/admin/contacts')}
                >
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm font-semibold block">Contacts</span>
                  <span className="text-xs opacity-75">
                    {unreadContacts > 0 ? `${unreadContacts} unread` : 'View all'}
                  </span>
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardOverview
