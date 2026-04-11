'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updateClient } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, User, Building, Mail, Phone, Globe, Tag } from 'lucide-react'

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().min(2, 'Company name is required'),
  phone: z.string().optional(),
  industry: z.string().min(2, 'Industry is required'),
  website: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
})

type ClientFormData = z.infer<typeof clientSchema>

interface EditClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    name: string
    email: string
    company: string
    phone?: string
    industry: string
    website?: string
    status: string
  } | null
}

const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, onClose, client }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      company: client?.company || '',
      phone: client?.phone || '',
      industry: client?.industry || '',
      website: client?.website || '',
      status: (client?.status as 'active' | 'inactive' | 'pending') || 'active'
    }
  })

  // Reset form when client changes
  React.useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        company: client.company,
        phone: client.phone || '',
        industry: client.industry,
        website: client.website || '',
        status: client.status as 'active' | 'inactive' | 'pending'
      })
    }
  }, [client, reset])

  const updateClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      if (!client) throw new Error('No client selected')
      const { data: updatedClient, error } = await updateClient(client.id, data)
      if (error) throw error
      return updatedClient
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      onClose()
    },
    onError: (error) => {
      console.error('Error updating client:', error)
      alert('Failed to update client. Please try again.')
    }
  })

  const onSubmit = async (data: ClientFormData) => {
    updateClientMutation.mutate(data)
  }

  if (!isOpen || !client) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-[#35c677]" />
                <span>Edit Client</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Full Name *
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="John Doe"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address *
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="john@company.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-1" />
                    Company Name *
                  </label>
                  <Input
                    {...register('company')}
                    placeholder="Acme Corporation"
                    className={errors.company ? 'border-red-500' : ''}
                  />
                  {errors.company && (
                    <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number
                  </label>
                  <Input
                    {...register('phone')}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="h-4 w-4 inline mr-1" />
                    Industry *
                  </label>
                  <select
                    {...register('industry')}
                    className={`w-full p-2 border rounded-md ${errors.industry ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <option value="">Select Industry</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Retail">Retail</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Beauty & Spa">Beauty & Spa</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Legal">Legal</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Website
                  </label>
                  <Input
                    {...register('website')}
                    placeholder="https://company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full p-2 border border-gray-200 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateClientMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  {updateClientMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span>Update Client</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default EditClientModal