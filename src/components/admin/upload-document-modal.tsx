'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { getClients, supabase, getCurrentUser } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, Upload, File, User } from 'lucide-react'

const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  client_id: z.string().min(1, 'Please select a client'),
  url: z.string().url('Please enter a valid URL'),
  type: z.string().min(1, 'Document type is required'),
  size: z.number().min(0, 'Size must be positive').default(0),
})

type DocumentFormData = z.input<typeof documentSchema>

interface UploadDocumentModalProps {
  isOpen: boolean
  onClose: () => void
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient()

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await getClients()
      if (error) throw error
      return data || []
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      size: 0
    }
  })

  const watchUrl = watch('url')

  // Auto-detect file type and name from URL
  React.useEffect(() => {
    if (watchUrl) {
      try {
        const url = new URL(watchUrl)
        const pathname = url.pathname
        const filename = pathname.split('/').pop() || 'document'
        const extension = filename.split('.').pop()?.toLowerCase() || ''
        
        // Set document name if not already set
        if (!watch('name')) {
          setValue('name', filename)
        }
        
        // Set document type based on extension
        let type = 'document'
        if (['pdf'].includes(extension)) type = 'application/pdf'
        else if (['doc', 'docx'].includes(extension)) type = 'application/msword'
        else if (['xls', 'xlsx'].includes(extension)) type = 'application/excel'
        else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) type = 'image'
        else if (['txt'].includes(extension)) type = 'text/plain'
        
        setValue('type', type)
        
        // Estimate file size (this is just for demo - in real app you'd get actual size)
        setValue('size', Math.floor(Math.random() * 5000000) + 100000) // Random size between 100KB-5MB
      } catch (e) {
        // Invalid URL, ignore
      }
    }
  }, [watchUrl, setValue, watch])

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      const { user } = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data: document, error } = await supabase
        .from('documents')
        .insert([{
          ...data,
          uploaded_by: user.id
        }])
        .select()
        .single()

      if (error) throw error
      return document
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error uploading document:', error)
      alert('Failed to upload document. Please try again.')
    }
  })

  const onSubmit = async (data: DocumentFormData) => {
    uploadDocumentMutation.mutate(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-[#35c677]" />
                <span>Upload Document</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Client *
                </label>
                <select
                  {...register('client_id')}
                  className={`w-full p-2 border rounded-md ${errors.client_id ? 'border-red-500' : 'border-gray-200'}`}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.company}
                    </option>
                  ))}
                </select>
                {errors.client_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.client_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document URL *
                </label>
                <Input
                  {...register('url')}
                  placeholder="https://drive.google.com/file/d/... or https://dropbox.com/..."
                  className={errors.url ? 'border-red-500' : ''}
                />
                {errors.url && (
                  <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Paste a shareable link from Google Drive, Dropbox, or any file hosting service
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <File className="h-4 w-4 inline mr-1" />
                    Document Name *
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="Marketing Strategy.pdf"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    {...register('type')}
                    className={`w-full p-2 border rounded-md ${errors.type ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <option value="">Select type</option>
                    <option value="application/pdf">PDF Document</option>
                    <option value="application/msword">Word Document</option>
                    <option value="application/excel">Excel Spreadsheet</option>
                    <option value="image">Image</option>
                    <option value="text/plain">Text File</option>
                    <option value="presentation">Presentation</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">📋 How to share documents:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Google Drive:</strong> Right-click file → Share → Copy link</li>
                  <li>• <strong>Dropbox:</strong> Right-click file → Share → Copy link</li>
                  <li>• <strong>OneDrive:</strong> Right-click file → Share → Copy link</li>
                  <li>• Make sure the link allows "Anyone with the link" to view</li>
                </ul>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploadDocumentMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  {uploadDocumentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload Document</span>
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

export default UploadDocumentModal