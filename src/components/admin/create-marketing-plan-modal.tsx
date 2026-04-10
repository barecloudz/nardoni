'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createMarketingPlan, getClients } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, FileText, Target, DollarSign } from 'lucide-react'

const marketingPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  client_id: z.string().min(1, 'Please select a client'),
  business_type: z.string().min(1, 'Business type is required'),
  industry: z.string().min(1, 'Industry is required'),
  target_audience: z.string().min(1, 'Target audience is required'),
  budget: z.number().min(0, 'Budget must be positive'),
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
  channels: z.array(z.string()).min(1, 'At least one channel is required'),
})

type MarketingPlanFormData = z.infer<typeof marketingPlanSchema>

interface CreateMarketingPlanModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreateMarketingPlanModal: React.FC<CreateMarketingPlanModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient()
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = React.useState<string[]>([])

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
    setValue
  } = useForm<MarketingPlanFormData>({
    resolver: zodResolver(marketingPlanSchema),
    defaultValues: {
      budget: 0,
      goals: [],
      channels: []
    }
  })

  const availableGoals = [
    'Increase Brand Awareness',
    'Generate More Leads',
    'Boost Online Sales',
    'Improve Customer Retention',
    'Expand Market Reach',
    'Enhance Social Media Presence',
    'Increase Website Traffic',
    'Improve SEO Rankings'
  ]

  const availableChannels = [
    'Social Media Marketing',
    'Google Ads',
    'Facebook Ads',
    'Email Marketing',
    'Content Marketing',
    'SEO',
    'Influencer Marketing',
    'Video Marketing'
  ]

  const handleGoalToggle = (goal: string) => {
    const updated = selectedGoals.includes(goal)
      ? selectedGoals.filter(g => g !== goal)
      : [...selectedGoals, goal]
    
    setSelectedGoals(updated)
    setValue('goals', updated)
  }

  const handleChannelToggle = (channel: string) => {
    const updated = selectedChannels.includes(channel)
      ? selectedChannels.filter(c => c !== channel)
      : [...selectedChannels, channel]
    
    setSelectedChannels(updated)
    setValue('channels', updated)
  }

  const createPlanMutation = useMutation({
    mutationFn: createMarketingPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-plans'] })
      reset()
      setSelectedGoals([])
      setSelectedChannels([])
      onClose()
    },
    onError: (error) => {
      console.error('Error creating marketing plan:', error)
      alert('Failed to create marketing plan. Please try again.')
    }
  })

  const onSubmit = async (data: MarketingPlanFormData) => {
    const planData = {
      ...data,
      goals: selectedGoals,
      channels: selectedChannels,
      content: `# ${data.title}\n\n${data.description}\n\n## Target Audience\n${data.target_audience}\n\n## Goals\n${selectedGoals.map(g => `- ${g}`).join('\n')}\n\n## Marketing Channels\n${selectedChannels.map(c => `- ${c}`).join('\n')}`
    }
    
    createPlanMutation.mutate(planData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-[#35c677]" />
                <span>Create Marketing Plan</span>
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
                    Plan Title *
                  </label>
                  <Input
                    {...register('title')}
                    placeholder="Q1 2025 Marketing Strategy"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe the marketing plan objectives and overview..."
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    {...register('business_type')}
                    className={`w-full p-2 border rounded-md ${errors.business_type ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <option value="">Select type</option>
                    <option value="B2B">B2B</option>
                    <option value="B2C">B2C</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Service">Service</option>
                    <option value="Local Business">Local Business</option>
                  </select>
                  {errors.business_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    {...register('industry')}
                    className={`w-full p-2 border rounded-md ${errors.industry ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <option value="">Select industry</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Retail">Retail</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Beauty & Spa">Beauty & Spa</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Budget *
                  </label>
                  <Input
                    {...register('budget', { valueAsNumber: true })}
                    type="number"
                    placeholder="5000"
                    min="0"
                    step="100"
                    className={errors.budget ? 'border-red-500' : ''}
                  />
                  {errors.budget && (
                    <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience *
                </label>
                <Textarea
                  {...register('target_audience')}
                  placeholder="Describe your target audience demographics, interests, and behaviors..."
                  rows={2}
                  className={errors.target_audience ? 'border-red-500' : ''}
                />
                {errors.target_audience && (
                  <p className="text-red-500 text-sm mt-1">{errors.target_audience.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Target className="h-4 w-4 inline mr-1" />
                  Marketing Goals * (Select at least one)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableGoals.map((goal) => (
                    <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGoals.includes(goal)}
                        onChange={() => handleGoalToggle(goal)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{goal}</span>
                    </label>
                  ))}
                </div>
                {errors.goals && (
                  <p className="text-red-500 text-sm mt-1">{errors.goals.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Marketing Channels * (Select at least one)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableChannels.map((channel) => (
                    <label key={channel} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes(channel)}
                        onChange={() => handleChannelToggle(channel)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{channel}</span>
                    </label>
                  ))}
                </div>
                {errors.channels && (
                  <p className="text-red-500 text-sm mt-1">{errors.channels.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPlanMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  {createPlanMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>Create Plan</span>
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

export default CreateMarketingPlanModal