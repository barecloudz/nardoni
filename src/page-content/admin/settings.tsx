'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { getCompanySettings, updateCompanySettings } from '../../lib/supabase'
import ChangePasswordForm from '../../components/admin/change-password-form'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { Settings, User, Bell, Shield, Database, Users, Key, Save } from 'lucide-react'

const settingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().min(1, 'Company address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Valid email required'),
  website: z.string().url('Valid website URL required'),
  description: z.string().min(1, 'Description is required'),
  socialInstagram: z.string().url('Valid Instagram URL required').optional().or(z.literal('')),
  socialFacebook: z.string().url('Valid Facebook URL required').optional().or(z.literal('')),
  socialLinkedin: z.string().url('Valid LinkedIn URL required').optional().or(z.literal('')),
  socialYoutube: z.string().url('Valid YouTube URL required').optional().or(z.literal('')),
})

type SettingsFormData = z.infer<typeof settingsSchema>

const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = React.useState('general')

  // Fetch company settings
  const { data: companySettings, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: getCompanySettings
  })

  // Settings form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  })

  // Update form when company settings load
  React.useEffect(() => {
    if (companySettings) {
      reset({
        companyName: companySettings.company_name,
        companyAddress: companySettings.company_address,
        phone: companySettings.phone,
        email: companySettings.email,
        website: companySettings.website,
        description: companySettings.description,
        socialInstagram: companySettings.social_instagram || '',
        socialFacebook: companySettings.social_facebook || '',
        socialLinkedin: companySettings.social_linkedin || '',
        socialYoutube: companySettings.social_youtube || '',
      })
    }
  }, [companySettings, reset])

  // Update company settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: updateCompanySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] })
      alert('Company settings saved successfully!')
    },
    onError: (error) => {
      console.error('Error updating settings:', error)
      alert('Failed to save settings. Please try again.')
    }
  })

  const onSubmit = async (data: SettingsFormData) => {
    updateSettingsMutation.mutate({
      company_name: data.companyName,
      company_address: data.companyAddress,
      phone: data.phone,
      email: data.email,
      website: data.website,
      description: data.description,
      social_instagram: data.socialInstagram,
      social_facebook: data.socialFacebook,
      social_linkedin: data.socialLinkedin,
      social_youtube: data.socialYoutube,
    })
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#191919]">
              Settings
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage your account and application settings
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-[#35c677] text-[#35c677]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5 text-[#35c677]" />
                      <span>Company Settings</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      These settings control how your company information appears across the website
                    </p>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35c677]"></div>
                      </div>
                    ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name
                          </label>
                          <Input {...register('companyName')} />
                          {errors.companyName && (
                            <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <Input {...register('phone')} />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Address
                        </label>
                        <Textarea {...register('companyAddress')} />
                        {errors.companyAddress && (
                          <p className="text-red-500 text-sm mt-1">{errors.companyAddress.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Email
                          </label>
                          <Input {...register('email')} type="email" />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website URL
                          </label>
                          <Input {...register('website')} />
                          {errors.website && (
                            <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Description
                        </label>
                        <Textarea {...register('description')} rows={3} />
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instagram URL
                          </label>
                          <Input {...register('socialInstagram')} placeholder="https://instagram.com/..." />
                          {errors.socialInstagram && (
                            <p className="text-red-500 text-sm mt-1">{errors.socialInstagram.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Facebook URL
                          </label>
                          <Input {...register('socialFacebook')} placeholder="https://facebook.com/..." />
                          {errors.socialFacebook && (
                            <p className="text-red-500 text-sm mt-1">{errors.socialFacebook.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            LinkedIn URL
                          </label>
                          <Input {...register('socialLinkedin')} placeholder="https://linkedin.com/..." />
                          {errors.socialLinkedin && (
                            <p className="text-red-500 text-sm mt-1">{errors.socialLinkedin.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            YouTube URL
                          </label>
                          <Input {...register('socialYoutube')} placeholder="https://youtube.com/..." />
                          {errors.socialYoutube && (
                            <p className="text-red-500 text-sm mt-1">{errors.socialYoutube.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full flex items-center space-x-2"
                        disabled={updateSettingsMutation.isPending}
                      >
                        {updateSettingsMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                        <Save className="h-4 w-4" />
                        <span>Save Settings</span>
                          </>
                        )}
                      </Button>
                    </form>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Key className="h-5 w-5 text-[#35c677]" />
                      <span>Stripe Settings</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Payment processing configuration
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                      Stripe keys and webhook secrets are managed via environment variables on Netlify. To update them, go to your <strong>Netlify site → Environment Variables</strong> and update <code>STRIPE_SECRET_KEY</code> and <code>STRIPE_WEBHOOK_SECRET</code>.
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'users' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-[#35c677]" />
                    <span>User Access Control</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      User Management Requires Backend Implementation
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      For security reasons, user role management requires a secure backend API with proper authentication. 
                      This feature cannot be implemented directly in the frontend.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                      <h4 className="font-medium text-blue-900 mb-2">Implementation Required:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Secure backend API endpoint</li>
                        <li>• Supabase Service Role Key (server-side only)</li>
                        <li>• Admin authentication middleware</li>
                        <li>• User role management functions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChangePasswordForm />

                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Managed via your Supabase project authentication settings</p>
                      </div>
                      <Badge variant="secondary">Via Supabase</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Session Timeout</h4>
                        <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                      </div>
                      <select className="border border-gray-200 rounded px-2 py-1">
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="240">4 hours</option>
                        <option value="480">8 hours</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-[#35c677]" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive email updates</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">New Client Alerts</h4>
                        <p className="text-sm text-gray-500">Get notified of new clients</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Invoice Reminders</h4>
                        <p className="text-sm text-gray-500">Payment due reminders</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing Plan Updates</h4>
                        <p className="text-sm text-gray-500">Plan status changes</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Document Uploads</h4>
                        <p className="text-sm text-gray-500">New document notifications</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center pt-2">Notification preferences — coming soon</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
  )
}

export default AdminSettings