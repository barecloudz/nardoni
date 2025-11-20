import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/layout/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import {
  PhoneCall,
  Mail,
  Plus,
  Check,
  X,
  MessageSquare,
  Building,
  Globe,
  MapPin,
  Calendar,
  Filter,
  Download,
  Upload
} from 'lucide-react'

interface OutreachLead {
  id: string
  business_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  industry: string | null
  location: string | null
  notes: string | null
  email_sent: boolean
  email_sent_date: string | null
  called: boolean
  call_date: string | null
  call_outcome: string | null
  call_notes: string | null
  status: string
  campaign_name: string | null
  subdomain_used: string | null
  created_at: string
}

const AdminOutreach: React.FC = () => {
  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<OutreachLead | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [newLead, setNewLead] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    location: '',
    notes: '',
    campaign_name: ''
  })

  // Fetch outreach leads
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['outreach-leads', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('outreach_leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as OutreachLead[]
    }
  })

  // Add lead mutation
  const addLeadMutation = useMutation({
    mutationFn: async (leadData: typeof newLead) => {
      const { data, error } = await supabase
        .from('outreach_leads')
        .insert([leadData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-leads'] })
      setIsAddModalOpen(false)
      setNewLead({
        business_name: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        industry: '',
        location: '',
        notes: '',
        campaign_name: ''
      })
      alert('Lead added successfully!')
    }
  })

  // Mark as called mutation
  const markCalledMutation = useMutation({
    mutationFn: async ({ id, outcome, notes }: { id: string; outcome: string; notes: string }) => {
      const { error } = await supabase
        .from('outreach_leads')
        .update({
          called: true,
          call_date: new Date().toISOString(),
          call_outcome: outcome,
          call_notes: notes,
          status: outcome === 'interested' ? 'interested' : outcome === 'not-interested' ? 'not-interested' : 'contacted'
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-leads'] })
      setSelectedLead(null)
    }
  })

  // Mark email sent mutation
  const markEmailSentMutation = useMutation({
    mutationFn: async ({ id, subdomain }: { id: string; subdomain: string }) => {
      const { error } = await supabase
        .from('outreach_leads')
        .update({
          email_sent: true,
          email_sent_date: new Date().toISOString(),
          subdomain_used: subdomain,
          status: 'contacted'
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-leads'] })
    }
  })

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLead.business_name) {
      alert('Business name is required')
      return
    }
    addLeadMutation.mutate(newLead)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'secondary'
      case 'contacted': return 'default'
      case 'interested': return 'success'
      case 'converted': return 'success'
      case 'not-interested': return 'destructive'
      case 'do-not-contact': return 'destructive'
      default: return 'secondary'
    }
  }

  const stats = [
    { label: 'Total Leads', value: leads.length, color: 'text-blue-600' },
    { label: 'Emails Sent', value: leads.filter(l => l.email_sent).length, color: 'text-purple-600' },
    { label: 'Called', value: leads.filter(l => l.called).length, color: 'text-green-600' },
    { label: 'Interested', value: leads.filter(l => l.status === 'interested').length, color: 'text-orange-600' }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-8 overflow-y-auto pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#191919]">
                Outreach Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage cold outreach campaigns and track calls & emails
              </p>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Lead</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddLead} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-medium mb-1 block">Business Name *</label>
                      <Input
                        value={newLead.business_name}
                        onChange={(e) => setNewLead({ ...newLead, business_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Contact Name</label>
                      <Input
                        value={newLead.contact_name}
                        onChange={(e) => setNewLead({ ...newLead, contact_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Industry</label>
                      <Input
                        value={newLead.industry}
                        onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={newLead.email}
                        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone</label>
                      <Input
                        value={newLead.phone}
                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Website</label>
                      <Input
                        value={newLead.website}
                        onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Location</label>
                      <Input
                        value={newLead.location}
                        onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium mb-1 block">Campaign Name</label>
                      <Input
                        value={newLead.campaign_name}
                        onChange={(e) => setNewLead({ ...newLead, campaign_name: e.target.value })}
                        placeholder="e.g., January 2025 Restaurants"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium mb-1 block">Notes</label>
                      <Textarea
                        value={newLead.notes}
                        onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={addLeadMutation.isPending}>
                    {addLeadMutation.isPending ? 'Adding...' : 'Add Lead'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filter Leads</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['all', 'new', 'contacted', 'interested', 'not-interested', 'converted'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === 'all' ? 'All Leads' : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leads ({leads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8">Loading...</p>
              ) : leads.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No leads yet. Add your first lead to get started!</p>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#191919]">{lead.business_name}</h3>
                            <Badge variant={getStatusColor(lead.status) as any}>
                              {lead.status}
                            </Badge>
                            {lead.campaign_name && (
                              <Badge variant="secondary">{lead.campaign_name}</Badge>
                            )}
                          </div>
                          {lead.contact_name && (
                            <p className="text-sm text-gray-600 mb-1">Contact: {lead.contact_name}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {lead.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{lead.email}</span>
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center space-x-1">
                                <PhoneCall className="h-3 w-3" />
                                <span>{lead.phone}</span>
                              </div>
                            )}
                            {lead.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{lead.location}</span>
                              </div>
                            )}
                            {lead.industry && (
                              <div className="flex items-center space-x-1">
                                <Building className="h-3 w-3" />
                                <span>{lead.industry}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {lead.email && !lead.email_sent && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const subdomain = prompt('Enter subdomain used (optional):')
                                markEmailSentMutation.mutate({ id: lead.id, subdomain: subdomain || '' })
                              }}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Mark Emailed
                            </Button>
                          )}
                          {lead.email_sent && (
                            <Badge variant="success" className="flex items-center space-x-1">
                              <Check className="h-3 w-3" />
                              <span>Emailed</span>
                            </Badge>
                          )}
                          {lead.phone && !lead.called && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedLead(lead)}
                            >
                              <PhoneCall className="h-4 w-4 mr-1" />
                              Mark Called
                            </Button>
                          )}
                          {lead.called && (
                            <Badge variant="success" className="flex items-center space-x-1">
                              <Check className="h-3 w-3" />
                              <span>Called</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      {lead.notes && (
                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-gray-600">{lead.notes}</p>
                        </div>
                      )}
                      {lead.call_notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs font-medium text-blue-900 mb-1">Call Notes:</p>
                          <p className="text-sm text-gray-700">{lead.call_notes}</p>
                          {lead.call_outcome && (
                            <p className="text-xs text-gray-500 mt-1">Outcome: {lead.call_outcome}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call Log Modal */}
          {selectedLead && (
            <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Call - {selectedLead.business_name}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    markCalledMutation.mutate({
                      id: selectedLead.id,
                      outcome: formData.get('outcome') as string,
                      notes: formData.get('notes') as string
                    })
                  }}
                  className="space-y-4 mt-4"
                >
                  <div>
                    <label className="text-sm font-medium mb-1 block">Call Outcome</label>
                    <select
                      name="outcome"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select outcome...</option>
                      <option value="no-answer">No Answer</option>
                      <option value="voicemail">Voicemail</option>
                      <option value="interested">Interested</option>
                      <option value="not-interested">Not Interested</option>
                      <option value="callback">Callback Requested</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Call Notes</label>
                    <Textarea
                      name="notes"
                      rows={4}
                      placeholder="Notes about the call..."
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={markCalledMutation.isPending}>
                    {markCalledMutation.isPending ? 'Saving...' : 'Save Call Log'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default AdminOutreach
