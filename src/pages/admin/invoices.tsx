import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getInvoices } from '../../lib/supabase'
import AdminSidebar from '../../components/layout/admin-sidebar'
import CreateInvoiceModal from '../../components/admin/create-invoice-modal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Plus, Eye, Download, Send } from 'lucide-react'

const AdminInvoices: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)

  // Fetch invoices from Supabase
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await getInvoices()
      if (error) throw error
      return data || []
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'sent':
        return 'warning'
      case 'overdue':
        return 'destructive'
      case 'draft':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 overflow-y-auto pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#191919]">
                Invoice Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Create and manage client invoices
              </p>
            </div>
            <Button 
              className="flex items-center space-x-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35c677]"></div>
                </div>
              )}
              
              {error && (
                <div className="text-red-500 text-center py-8">
                  Error loading invoices: {error.message}
                </div>
              )}
              
              {!isLoading && !error && invoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No invoices found. Create your first invoice to get started.
                </div>
              )}
              
              {!isLoading && !error && invoices.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Invoice #
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Client
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Due Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <motion.tr
                          key={invoice.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="py-4 px-4">
                            <span className="font-medium text-[#191919]">
                              {invoice.number}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-[#191919]">
                                {invoice.clients?.name || 'Unknown Client'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invoice.clients?.company}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-[#35c677]">
                              {formatCurrency(invoice.amount)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={getStatusColor(invoice.status) as any}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">
                              {new Date(invoice.due_date).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Send className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <CreateInvoiceModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </motion.div>
      </main>
    </div>
  )
}

export default AdminInvoices