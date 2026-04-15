'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getInvoices, updateInvoice } from '../../lib/supabase'
import CreateInvoiceModal from '../../components/admin/create-invoice-modal'
import CreatePaymentLinkModal from '../../components/admin/create-payment-link-modal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Plus, Eye, Download, Send, Link, ExternalLink, RefreshCw, X } from 'lucide-react'

type Tab = 'supabase' | 'stripe' | 'links'

const AdminInvoices: React.FC = () => {
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<Tab>('supabase')
  const [viewInvoice, setViewInvoice] = React.useState<any>(null)
  const [sendingId, setSendingId] = React.useState<string | null>(null)

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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await updateInvoice(id, { status })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  })

  const handleSend = async (invoice: any) => {
    if (!invoice.clients?.email) {
      alert('No client email found for this invoice.')
      return
    }
    setSendingId(invoice.id)
    try {
      const items = (invoice.invoice_items || [])
        .map((item: any) => `• ${item.description} (x${item.quantity}) — $${Number(item.amount ?? item.rate * item.quantity).toFixed(2)}`)
        .join('\n')

      const res = await fetch('/api/send-marketing-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: invoice.clients.email,
          subject: `Invoice ${invoice.number} — $${Number(invoice.amount).toFixed(2)} due ${new Date(invoice.due_date).toLocaleDateString()}`,
          body: `Hi ${invoice.clients.name},\n\nPlease find your invoice details below.\n\nInvoice #: ${invoice.number}\nAmount Due: $${Number(invoice.amount).toFixed(2)}\nDue Date: ${new Date(invoice.due_date).toLocaleDateString()}\n\nItems:\n${items || '(No line items)'}\n\nPlease reach out if you have any questions.`,
        }),
      })
      if (!res.ok) throw new Error('Email send failed')
      await updateInvoice(invoice.id, { status: 'sent' })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      alert('Invoice sent to ' + invoice.clients.email)
    } catch (e: any) {
      alert('Failed to send: ' + e.message)
    } finally {
      setSendingId(null)
    }
  }

  const handleDownload = (invoice: any) => {
    const items = invoice.invoice_items || []
    const itemsHtml = items.map((item: any) =>
      `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">${item.description}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">$${Number(item.rate).toFixed(2)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">$${Number(item.amount ?? item.rate * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('')

    const html = `<!DOCTYPE html><html><head><title>Invoice ${invoice.number}</title>
      <style>
        body{font-family:sans-serif;max-width:680px;margin:40px auto;color:#191919;font-size:14px;}
        table{width:100%;border-collapse:collapse;margin-top:16px;}
        th{background:#f5f5f5;padding:10px 8px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.05em;}
        .total{text-align:right;margin-top:16px;font-size:18px;font-weight:bold;color:#35c677;}
        @media print{.no-print{display:none;}}
      </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
        <div><h2 style="margin:0;font-size:24px;">Nardoni Digital LLC</h2>
        <p style="margin:4px 0;color:#666;">224 Thompson St, Unit #2030<br/>Hendersonville, NC 28792<br/>803-977-4285</p></div>
        <div style="text-align:right;"><h1 style="margin:0;font-size:32px;color:#35c677;">INVOICE</h1>
        <p style="margin:4px 0;color:#666;">${invoice.number}</p></div>
      </div>
      <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:24px;">
        <p style="margin:0 0 4px;"><strong>Bill To:</strong></p>
        <p style="margin:0;">${invoice.clients?.name || 'Unknown'}</p>
        ${invoice.clients?.company ? `<p style="margin:0;color:#666;">${invoice.clients.company}</p>` : ''}
        ${invoice.clients?.email ? `<p style="margin:0;color:#666;">${invoice.clients.email}</p>` : ''}
      </div>
      <div style="display:flex;gap:32px;margin-bottom:24px;">
        <div><p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;">Due Date</p>
        <p style="margin:4px 0;font-weight:600;">${new Date(invoice.due_date).toLocaleDateString()}</p></div>
        <div><p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;">Status</p>
        <p style="margin:4px 0;font-weight:600;text-transform:capitalize;">${invoice.status}</p></div>
      </div>
      <table><thead><tr><th>Description</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Amount</th></tr></thead>
      <tbody>${itemsHtml || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#999;">No line items</td></tr>'}</tbody></table>
      <div class="total">Total: $${Number(invoice.amount).toFixed(2)}</div>
      <div class="no-print" style="margin-top:32px;">
        <button onclick="window.print()" style="padding:10px 24px;background:#35c677;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">Print / Save as PDF</button>
      </div>
      </body></html>`

    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close() }
  }

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
                            <select
                              value={invoice.status}
                              onChange={e => updateStatusMutation.mutate({ id: invoice.id, status: e.target.value })}
                              disabled={updateStatusMutation.isPending}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer appearance-none pr-5 ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                invoice.status === 'sent' ? 'bg-yellow-100 text-yellow-700' :
                                invoice.status === 'overdue' ? 'bg-red-100 text-red-600' :
                                'bg-gray-100 text-gray-600'
                              }`}
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '8px' }}
                            >
                              <option value="draft">draft</option>
                              <option value="sent">sent</option>
                              <option value="paid">paid</option>
                              <option value="overdue">overdue</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                title="View invoice"
                                onClick={() => setViewInvoice(invoice)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Download / Print invoice"
                                onClick={() => handleDownload(invoice)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Send invoice to client"
                                disabled={sendingId === invoice.id}
                                onClick={() => handleSend(invoice)}
                              >
                                <Send className={`h-3 w-3 ${sendingId === invoice.id ? 'animate-pulse' : ''}`} />
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

      {/* Invoice Detail Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#191919]">Invoice {viewInvoice.number}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {viewInvoice.clients?.name} · {viewInvoice.clients?.company}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" onClick={() => handleDownload(viewInvoice)}>
                    <Download className="h-3 w-3 mr-1.5" />
                    Print/Download
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setViewInvoice(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Amount</p>
                  <p className="font-bold text-[#35c677] text-lg">{formatCurrency(viewInvoice.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Due Date</p>
                  <p className="font-semibold">{new Date(viewInvoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Status</p>
                  <select
                    value={viewInvoice.status}
                    onChange={e => {
                      updateStatusMutation.mutate({ id: viewInvoice.id, status: e.target.value })
                      setViewInvoice({ ...viewInvoice, status: e.target.value })
                    }}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer appearance-none pr-5 ${
                      viewInvoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                      viewInvoice.status === 'sent' ? 'bg-yellow-100 text-yellow-700' :
                      viewInvoice.status === 'overdue' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '8px' }}
                  >
                    <option value="draft">draft</option>
                    <option value="sent">sent</option>
                    <option value="paid">paid</option>
                    <option value="overdue">overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Line Items</h3>
                {(viewInvoice.invoice_items || []).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No line items on this invoice.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Description</th>
                        <th className="text-center py-2 px-3 font-medium text-gray-600">Qty</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">Rate</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewInvoice.invoice_items || []).map((item: any, i: number) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-3 px-3">{item.description}</td>
                          <td className="py-3 px-3 text-center">{item.quantity}</td>
                          <td className="py-3 px-3 text-right">{formatCurrency(item.rate)}</td>
                          <td className="py-3 px-3 text-right font-medium">{formatCurrency(item.amount ?? item.rate * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="py-3 px-3 text-right font-semibold">Total</td>
                        <td className="py-3 px-3 text-right font-bold text-[#35c677]">{formatCurrency(viewInvoice.amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default AdminInvoices
