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
import { X, Mail, Send, CheckCircle, Copy } from 'lucide-react'

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
  const [copied, setCopied] = React.useState(false)

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
          clientCompany: client.company,
          portalUrl: window.location.origin,
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
    setCopied(false)
    onClose()
  }

  const getMessageToCopy = (portalUrl: string) => {
    if (!inviteDetails || !client) return ''
    return `Hey ${client.name.split(' ')[0]},

Your client portal is ready! You can log in to view your project, invoices, and what's next for your business.

Portal: ${portalUrl}/auth/login
Email: ${inviteDetails.email}
Password: ${inviteDetails.password}

Recommend changing your password after logging in.

Talk soon,
Nardoni Digital`
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
                className="space-y-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#35c677] flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Account created for {client?.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Credentials emailed to {inviteDetails.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2.5 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-mono text-[#191919] text-xs">{inviteDetails.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Temp password</span>
                    <span className="font-mono text-[#191919] text-xs">{inviteDetails.password}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Portal</span>
                    <span className="font-mono text-[#191919] text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/auth/login</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-[#35c677]/10 border border-[#35c677]/20 rounded-lg p-3">
                  <Mail className="h-4 w-4 text-[#35c677] flex-shrink-0" />
                  <p className="text-sm text-[#35c677] font-medium">Welcome email sent automatically</p>
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