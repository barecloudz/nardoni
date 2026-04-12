'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase, getClients } from '../../lib/supabase'
import CreateReportModal from '../../components/admin/create-report-modal'
import ClientServicesModal from '../../components/admin/client-services-modal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Plus, Sparkles, FileBarChart, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

const AdminReports: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedClientId, setSelectedClientId] = React.useState<string>('')
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false)
  const [isServicesModalOpen, setIsServicesModalOpen] = React.useState(false)
  const [editingReport, setEditingReport] = React.useState<any>(null)

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await getClients()
      if (error) throw error
      return data || []
    }
  })

  const selectedClient = clients.find((c: any) => c.id === selectedClientId)

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? `Bearer ${session.access_token}` : ''
  }

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['client-reports', selectedClientId],
    queryFn: async () => {
      const token = await getToken()
      const res = await fetch(`/api/admin/reports?clientId=${selectedClientId}`, {
        headers: { Authorization: token },
      })
      if (!res.ok) throw new Error('Failed to load reports')
      return res.json()
    },
    enabled: !!selectedClientId,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      const res = await fetch(`/api/admin/reports?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: token },
      })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-reports', selectedClientId] }),
  })

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = await getToken()
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('Failed to update')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-reports', selectedClientId] }),
  })

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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#191919]">Weekly Reports</h1>
            <p className="text-gray-600 mt-1 text-sm">Create and publish weekly progress reports for clients</p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedClientId && (
              <>
                <Button variant="outline" onClick={() => setIsServicesModalOpen(true)} className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Service Values</span>
                </Button>
                <Button onClick={() => { setEditingReport(null); setIsReportModalOpen(true) }} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Report</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Client selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Client:</label>
              <select
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="flex-1 p-2 border border-gray-200 rounded-md text-sm"
              >
                <option value="">Choose a client...</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Reports table */}
        {selectedClientId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileBarChart className="h-5 w-5 text-[#35c677]" />
                <span>Reports for {selectedClient?.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35c677]" />
                </div>
              )}

              {!isLoading && reports.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileBarChart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No reports yet</p>
                  <p className="text-sm mt-1">Click "New Report" to create the first weekly update for this client.</p>
                </div>
              )}

              {!isLoading && reports.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Week</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Emails</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Responses</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r: any) => (
                        <motion.tr
                          key={r.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <td className="py-4 px-4">
                            <p className="font-medium text-[#191919] text-sm">
                              Week of {new Date(r.week_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{r.emails_sent ?? '—'}</td>
                          <td className="py-4 px-4 text-sm text-gray-600">{r.emails_responded ?? '—'}</td>
                          <td className="py-4 px-4">
                            <Badge variant={r.status === 'published' ? 'success' : 'secondary'}>
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setEditingReport(r); setIsReportModalOpen(true) }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => togglePublishMutation.mutate({
                                  id: r.id,
                                  status: r.status === 'published' ? 'draft' : 'published'
                                })}
                                title={r.status === 'published' ? 'Unpublish' : 'Publish to client'}
                              >
                                {r.status === 'published' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm('Delete this report?')) deleteMutation.mutate(r.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
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
      </motion.div>

      {selectedClient && (
        <>
          <CreateReportModal
            isOpen={isReportModalOpen}
            onClose={() => { setIsReportModalOpen(false); setEditingReport(null) }}
            clientId={selectedClientId}
            clientName={selectedClient.name}
            report={editingReport}
          />
          <ClientServicesModal
            isOpen={isServicesModalOpen}
            onClose={() => setIsServicesModalOpen(false)}
            clientId={selectedClientId}
            clientName={selectedClient.name}
            weeklyRate={300}
          />
        </>
      )}
    </>
  )
}

export default AdminReports
