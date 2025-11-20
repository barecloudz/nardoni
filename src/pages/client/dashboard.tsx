import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'wouter'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { authService } from '../../lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  FileText,
  DollarSign,
  FolderOpen,
  TrendingUp,
  Calendar,
  Eye,
  Download,
  MessageSquare,
  User,
  Building,
  LogOut
} from 'lucide-react'

const ClientDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = React.useState<any>(null)

  React.useEffect(() => {
    const fetchUser = async () => {
      const { user } = await getCurrentUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [])

  // Fetch client's marketing plans
  const { data: marketingPlans = [] } = useQuery({
    queryKey: ['client-marketing-plans'],
    queryFn: async () => {
      if (!currentUser) return []
      
      const { data, error } = await supabase
        .from('marketing_plans')
        .select('*')
        .eq('client_id', currentUser.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentUser
  })

  // Fetch client's invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['client-invoices'],
    queryFn: async () => {
      if (!currentUser) return []
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', currentUser.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentUser
  })

  // Fetch client's documents
  const { data: documents = [] } = useQuery({
    queryKey: ['client-documents'],
    queryFn: async () => {
      if (!currentUser) return []
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('client_id', currentUser.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentUser
  })

  const stats = [
    {
      title: 'Active Plans',
      value: marketingPlans.filter(p => p.status === 'approved').length.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Outstanding Invoices',
      value: invoices.filter(i => i.status === 'sent').length.toString(),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Documents',
      value: documents.length.toString(),
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Spent',
      value: `$${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'pending': return 'warning'
      case 'paid': return 'success'
      case 'sent': return 'warning'
      case 'overdue': return 'destructive'
      default: return 'secondary'
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#35c677] rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#191919]">Client Portal</h1>
                <p className="text-sm text-gray-500">Welcome back!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Contact Support</span>
              </Button>
              <div className="hidden md:flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {currentUser?.email || 'Client'}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <div className={`${stat.bgColor} p-3 rounded-full`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Marketing Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-[#35c677]" />
                  <span>Marketing Plans</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {marketingPlans.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No marketing plans yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {marketingPlans.slice(0, 3).map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-[#191919]">{plan.title}</h4>
                          <p className="text-sm text-gray-500">
                            Budget: ${plan.budget.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(plan.status) as any}>
                            {plan.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {marketingPlans.length > 3 && (
                      <Link href="/client/plans">
                        <Button variant="outline" className="w-full">
                          View All Plans
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-[#35c677]" />
                  <span>Recent Invoices</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No invoices yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {invoices.slice(0, 3).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-[#191919]">{invoice.number}</h4>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-[#35c677]">
                            ${invoice.amount.toLocaleString()}
                          </span>
                          <Badge variant={getStatusColor(invoice.status) as any}>
                            {invoice.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {invoices.length > 3 && (
                      <Link href="/client/invoices">
                        <Button variant="outline" className="w-full">
                          View All Invoices
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5 text-[#35c677]" />
                <span>Recent Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No documents yet
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.slice(0, 6).map((document) => (
                    <div key={document.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-[#35c677] rounded-lg flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#191919] truncate">{document.name}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(document.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
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