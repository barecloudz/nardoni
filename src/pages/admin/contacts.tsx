import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getContacts, supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/layout/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Mail, Phone, Building, MessageSquare, Trash2 } from 'lucide-react'

const AdminContacts: React.FC = () => {
  const queryClient = useQueryClient()

  // Fetch contacts from Supabase
  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await getContacts()
      if (error) throw error
      return data || []
    }
  })

  // Update contact status mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('contacts')
        .update({ status })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    }
  })

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'warning'
      case 'read':
        return 'success'
      case 'spam':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const handleStatusChange = (id: string, status: string) => {
    updateContactMutation.mutate({ id, status })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      deleteContactMutation.mutate(id)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#191919]">
                Book a Call Submissions
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage all "Book a Call" form submissions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="warning">
                {contacts.filter(c => c.status === 'unread').length} New
              </Badge>
              <Badge variant="secondary">
                {contacts.length} Total
              </Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35c677]"></div>
                </div>
              )}
              
              {error && (
                <div className="text-red-500 text-center py-8">
                  Error loading contacts: {error.message}
                </div>
              )}
              
              {!isLoading && !error && contacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No contacts found. Contact submissions will appear here.
                </div>
              )}
              
              {!isLoading && !error && contacts.length > 0 && (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-6 border rounded-lg hover:shadow-md transition-shadow ${
                        contact.status === 'unread' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-[#191919]">
                              {contact.name}
                            </h3>
                            <Badge variant={getStatusColor(contact.status) as any}>
                              {contact.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{contact.email}</span>
                            </div>
                            {contact.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{contact.phone}</span>
                              </div>
                            )}
                            {contact.company && (
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{contact.company}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Message:</span>
                            </div>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                              {contact.message}
                            </p>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Submitted {new Date(contact.created_at).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {contact.status === 'unread' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(contact.id, 'read')}
                            >
                              Mark Read
                            </Button>
                          )}
                          {contact.status !== 'spam' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(contact.id, 'spam')}
                            >
                              Mark Spam
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(contact.id)}
                            disabled={deleteContactMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
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

export default AdminContacts