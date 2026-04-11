'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getClients, insertClient, updateClient, deleteClient } from '../../lib/supabase'
import AddClientModal from '../../components/admin/add-client-modal'
import EditClientModal from '../../components/admin/edit-client-modal'
import InviteClientModal from '../../components/admin/invite-client-modal'
import ClientPortalPreview from '../../components/admin/client-portal-preview-modal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Plus, Search, Edit, Trash2, Mail, Phone, Globe, UserPlus, Monitor } from 'lucide-react'

const AdminClients: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isAddClientModalOpen, setIsAddClientModalOpen] = React.useState(false)
  const [isEditClientModalOpen, setIsEditClientModalOpen] = React.useState(false)
  const [isInviteClientModalOpen, setIsInviteClientModalOpen] = React.useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [selectedClient, setSelectedClient] = React.useState<any>(null)
  const queryClient = useQueryClient()

  // Fetch clients from Supabase
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await getClients()
      if (error) throw error
      return data || []
    }
  })

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    }
  })

  const handleDeleteClient = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(id)
    }
  }

  const handleEditClient = (client: any) => {
    setSelectedClient(client)
    setIsEditClientModalOpen(true)
  }

  const handleInviteClient = (client: any) => {
    setSelectedClient(client)
    setIsInviteClientModalOpen(true)
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'pending':
        return 'warning'
      case 'inactive':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#191919]">
                Client Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage your clients and their projects
              </p>
            </div>
            <Button 
              className="flex items-center space-x-2"
              onClick={() => setIsAddClientModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add Client</span>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Clients</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35c677]"></div>
                </div>
              )}
              
              {error && (
                <div className="text-red-500 text-center py-8">
                  Error loading clients: {error.message}
                </div>
              )}
              
              {!isLoading && !error && clients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No clients found. Add your first client to get started.
                </div>
              )}
              
              {!isLoading && !error && clients.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Client
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Industry
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <motion.tr
                        key={client.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-[#191919]">
                              {client.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {client.company}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {client.email}
                              </span>
                            </div>
                            {client.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {client.phone}
                              </span>
                            </div>
                            )}
                            {client.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {client.website}
                              </span>
                            </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {client.industry}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={getStatusColor(client.status) as any}>
                            {client.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditClient(client)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleInviteClient(client)}
                              title="Invite to Client Portal"
                            >
                              <UserPlus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setSelectedClient(client); setIsPreviewOpen(true) }}
                              title="Preview client portal"
                            >
                              <Monitor className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClient(client.id)}
                              disabled={deleteClientMutation.isPending}
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

          <AddClientModal 
            isOpen={isAddClientModalOpen}
            onClose={() => setIsAddClientModalOpen(false)}
          />
          
          <EditClientModal 
            isOpen={isEditClientModalOpen}
            onClose={() => {
              setIsEditClientModalOpen(false)
              setSelectedClient(null)
            }}
            client={selectedClient}
          />
          
          <InviteClientModal
            isOpen={isInviteClientModalOpen}
            onClose={() => {
              setIsInviteClientModalOpen(false)
              setSelectedClient(null)
            }}
            client={selectedClient}
          />

          <ClientPortalPreview
            isOpen={isPreviewOpen}
            onClose={() => { setIsPreviewOpen(false); setSelectedClient(null) }}
            client={selectedClient}
          />
        </motion.div>
  )
}

export default AdminClients