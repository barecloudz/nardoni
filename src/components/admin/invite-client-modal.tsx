'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, Mail, Send, CheckCircle } from 'lucide-react'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  temporaryPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    name: string
    email: string
    company: string
  } | null
}

const InviteClientModal: React.FC<InviteClientModalProps> = ({ isOpen, onClose, client }) => {
  const queryClient = useQueryClient()
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [inviteDetails, setInviteDetails] = React.useState<{ email: string; password: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      temporaryPassword: generatePassword()
    }
  })

  // Set client email when modal opens
  React.useEffect(() => {
    if (client && isOpen) {
      setValue('email', client.email)
      setValue('temporaryPassword', generatePassword())
      setIsSuccess(false)
      setInviteDetails(null)
    }
  }, [client, isOpen, setValue])

  function generatePassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const inviteClientMutation = useMutation({
    mutationFn: async (data: InviteFormData): Promise<{ email: string; password: string }> => {
      if (!client) throw new Error('No client selected')

      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Call the edge function to create the client account
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/invite-client`
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          temporaryPassword: data.temporaryPassword,
          clientId: client.id,
          clientName: client.name,
          clientCompany: client.company
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create client account')
      }

      const result = await response.json()
      return { email: data.email, password: data.temporaryPassword }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setInviteDetails(result)
      setIsSuccess(true)
    },
    onError: (error: any) => {
      console.error('Error inviting client:', error)
      if (error.message?.includes('User already registered')) {
        alert('This email is already registered. The client may already have an account.')
      } else {
        alert('Failed to create client account. Please try again.')
      }
    }
  })

  const onSubmit = async (data: InviteFormData) => {
    inviteClientMutation.mutate(data)
  }

  const handleClose = () => {
    reset()
    setIsSuccess(false)
    setInviteDetails(null)
    onClose()
  }

  if (!isOpen || !client) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-[#35c677]" />
                <span>Invite Client</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isSuccess && inviteDetails ? (
              <motion.div
                className="text-center py-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Client Account Created!
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                  <h4 className="font-medium text-gray-900 mb-2">Login Credentials:</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                        {inviteDetails.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Password:</span>
                      <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                        {inviteDetails.password}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Next Steps:</strong>
                    <br />
                    1. Share these credentials with {client.name}
                    <br />
                    2. They can login at: <span className="font-mono">{window.location.origin}/auth/login</span>
                    <br />
                    3. Recommend they change their password after first login
                  </p>
                </div>
                <Button onClick={handleClose} className="w-full">
                  Done
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-gray-600">
                    Create a client portal account for:
                  </p>
                  <p className="font-semibold text-[#191919]">
                    {client.name} ({client.company})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    className={errors.email ? 'border-red-500' : ''}
                    readOnly
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temporary Password
                  </label>
                  <Input
                    {...register('temporaryPassword')}
                    type="text"
                    className={errors.temporaryPassword ? 'border-red-500' : ''}
                  />
                  {errors.temporaryPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.temporaryPassword.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Client should change this password after first login
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> You'll need to manually share the login credentials with the client. 
                    Consider using a secure method like encrypted email or password manager.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={inviteClientMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    {inviteClientMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Create Account</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default InviteClientModal