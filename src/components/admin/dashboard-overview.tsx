'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getClients, getMarketingPlans, getInvoices, getContacts } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Users, DollarSign, FileText, TrendingUp, Clock, MessageSquare } from 'lucide-react'

const DashboardOverview: React.FC = () => {
  const router = useRouter()

  // Fetch dashboard data
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await getClients()
      if (error) throw error
      return data || []
    }
  })

  const { data: plans = [] } = useQuery({
    queryKey: ['marketing-plans'],
    queryFn: async () => {
      const { data, error } = await getMarketingPlans()
      if (error) throw error
      return data || []
    }
  })

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await getInvoices()
      if (error) throw error
      return data || []
    }
  })

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await getContacts()
      if (error) throw error
      return data || []
    }
  })

  // Calculate stats from real data
  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  const activeProjects = plans.filter(plan => 
    plan.status === 'approved' || plan.status === 'pending'
  ).length

  const stats = [
    {
      title: 'Total Clients',
      value: clients.length.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Monthly Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+8%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      change: '+5%',
      changeType: 'positive',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'New Contacts',
      value: contacts.filter(c => c.status === 'unread').length.toString(),
      change: '+15%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'client',
      message: 'New client "Tech Startup Co" added',
      time: '2 hours ago',
      icon: Users
    },
    {
      id: 2,
      type: 'plan',
      message: 'New marketing plan created',
      time: '4 hours ago',
      icon: FileText
    },
    {
      id: 3,
      type: 'invoice',
      message: 'Invoice payment received',
      time: '6 hours ago',
      icon: DollarSign
    },
    {
      id: 4,
      type: 'contact',
      message: `${contacts.filter(c => c.status === 'unread').length} new contact submissions`,
      time: '1 day ago',
      icon: MessageSquare
    }
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-[#191919] mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your business.
        </p>
      </motion.div>

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
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-[#191919]">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} bg-gray-50 p-3 rounded-full`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'success' : 'destructive'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-sm text-gray-500 ml-2">
                      vs last month
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-[#35c677] p-2 rounded-full">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#191919]">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
                  className="p-4 bg-[#35c677] text-white rounded-lg hover:bg-[#2ba866] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/admin/clients')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Add Client</span>
                </motion.button>
                <motion.button
                  className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/admin/marketing-plans')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Create Plan</span>
                </motion.button>
                <motion.button
                  className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/admin/invoices')}
                >
                  <DollarSign className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Send Invoice</span>
                </motion.button>
                <motion.button
                  className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/admin/contacts')}
                >
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">View Contacts</span>
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