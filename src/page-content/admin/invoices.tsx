'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getInvoices } from '../../lib/supabase'
import CreateInvoiceModal from '../../components/admin/create-invoice-modal'
import CreatePaymentLinkModal from '../../components/admin/create-payment-link-modal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Plus, Eye, Download, Send, Link, ExternalLink, RefreshCw } from 'lucide-react'

type Tab = 'supabase' | 'stripe' | 'links'

const AdminInvoices: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<Tab>('supabase')

  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await getInvoices()
      if (error) throw error
      return data || []
    }
  })

  const { data: stripeInvoices = [], isLoading: stripeLoading, error: stripeError, refetch: refetchStripe } = useQuery({
    queryKey: ['stripe-invoices'],
    queryFn: async () => {
      const res = await fetch('/api/stripe/invoices')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.invoices || []
    }
  })

  const { data: paymentLinks = [], isLoading: linksLoading, error: linksError, refetch: refetchLinks } = useQuery({
    queryKey: ['stripe-payment-links'],
    queryFn: async () => {
      const res = await fetch('/api/stripe/payment-links')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.links || []
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'sent': return 'warning'
      case 'overdue': return 'destructive'
      case 'draft': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStripeStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'open': return 'warning'
      case 'void': return 'destructive'
      case 'draft': return 'secondary'
      default: return 'secondary'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'supabase', label: 'Invoices' },
    { key: 'stripe', label: 'Stripe Invoices' },
    { key: 'links', label: 'Payment Links' },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#191919]">Invoice Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage client invoices</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setIsPaymentLinkModalOpen(true)} className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>Payment Link</span>
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#35c677] text-[#35c677]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Supabase Invoices */}
        {activeTab === 'supabase' && (
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
                <div className="text-red-500 text-center py-8">Error loading invoices: {(error as any).message}</div>
              )}
              {!isLoading && !error && invoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">No invoices found. Create your first invoice to get started.</div>
              )}
              {!isLoading && !error && invoices.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Invoice #</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
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
                          <td className="py-4 px-4 font-medium text-[#191919]">{invoice.number}</td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-[#191919]">{invoice.clients?.name || 'Unknown Client'}</div>
                            <div className="text-sm text-gray-500">{invoice.clients?.company}</div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-[#35c677]">{formatCurrency(invoice.amount)}</td>
                          <td className="py-4 px-4">
                            <Badge variant={getStatusColor(invoice.status) as any}>{invoice.status}</Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline"><Eye className="h-3 w-3" /></Button>
                              <Button size="sm" variant="outline"><Download className="h-3 w-3" /></Button>
                              <Button size="sm" variant="outline"><Send className="h-3 w-3" /></Button>
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
        )}

        {/* Stripe Invoices */}
        {activeTab === 'stripe' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stripe Invoices</CardTitle>
                <Button variant="outline" size="sm" onClick={() => refetchStripe()} className="flex items-center space-x-1">
                  <RefreshCw className="h-3 w-3" />
                  <span>Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {stripeLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35c677]"></div>
                </div>
              )}
              {stripeError && (
                <div className="text-red-500 text-center py-8">Error loading Stripe invoices: {(stripeError as any).message}</div>
              )}
              {!stripeLoading && !stripeError && stripeInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">No Stripe invoices found.</div>
              )}
              {!stripeLoading && !stripeError && stripeInvoices.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Invoice #</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stripeInvoices.map((inv: any) => (
                        <motion.tr
                          key={inv.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="py-4 px-4 font-medium text-[#191919]">{inv.number || inv.id.slice(-8)}</td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-[#191919]">{inv.customer_name || inv.customer_email || 'Unknown'}</div>
                            {inv.customer_email && inv.customer_name && (
                              <div className="text-sm text-gray-500">{inv.customer_email}</div>
                            )}
                          </td>
                          <td className="py-4 px-4 font-semibold text-[#35c677]">
                            {formatCurrency((inv.amount_due || 0) / 100)}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={getStripeStatusColor(inv.status) as any}>{inv.status}</Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {inv.due_date ? new Date(inv.due_date * 1000).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 px-4">
                            {inv.hosted_invoice_url && (
                              <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Links */}
        {activeTab === 'links' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Links</CardTitle>
                <Button variant="outline" size="sm" onClick={() => refetchLinks()} className="flex items-center space-x-1">
                  <RefreshCw className="h-3 w-3" />
                  <span>Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {linksLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35c677]"></div>
                </div>
              )}
              {linksError && (
                <div className="text-red-500 text-center py-8">Error loading payment links: {(linksError as any).message}</div>
              )}
              {!linksLoading && !linksError && paymentLinks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No payment links yet. Click "Payment Link" above to create one.
                </div>
              )}
              {!linksLoading && !linksError && paymentLinks.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentLinks.map((link: any) => (
                        <motion.tr
                          key={link.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="py-4 px-4 font-medium text-[#191919] text-sm font-mono">{link.id}</td>
                          <td className="py-4 px-4">
                            <Badge variant={link.active ? 'success' : 'secondary'}>
                              {link.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 truncate max-w-xs">{link.url}</span>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
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
        )}

        <CreateInvoiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
        <CreatePaymentLinkModal
          isOpen={isPaymentLinkModalOpen}
          onClose={() => {
            setIsPaymentLinkModalOpen(false)
            refetchLinks()
          }}
        />
      </motion.div>
    </>
  )
}

export default AdminInvoices
