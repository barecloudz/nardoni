'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, Link, Copy, CheckCircle } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Service name is required'),
  amount: z.number().min(1, 'Amount must be at least $1'),
  recurring: z.enum(['one-time', 'month', 'year']),
})

type FormData = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
}

const CreatePaymentLinkModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [createdLink, setCreatedLink] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { recurring: 'month' }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/payment-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          amount: data.amount,
          recurring: data.recurring === 'one-time' ? undefined : data.recurring,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setCreatedLink(json.link.url)
    } catch (err: any) {
      setError(err.message || 'Failed to create payment link')
    } finally {
      setIsLoading(false)
    }
  }

  const copyLink = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    reset()
    setCreatedLink(null)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Link className="h-5 w-5 text-[#35c677]" />
                <span>Create Payment Link</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!createdLink ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                  <Input
                    {...register('name')}
                    placeholder="e.g. SEO - Local Search, Website Build"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD) *</label>
                  <Input
                    {...register('amount', { valueAsNumber: true })}
                    type="number"
                    placeholder="500"
                    min="1"
                    step="0.01"
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Billing *</label>
                  <select
                    {...register('recurring')}
                    className="w-full p-2 border border-gray-200 rounded-md"
                  >
                    <option value="one-time">One-time payment</option>
                    <option value="month">Monthly recurring</option>
                    <option value="year">Yearly recurring</option>
                  </select>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Link'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#35c677]">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Payment link created!</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Share this link with your client:</p>
                  <p className="text-sm font-mono break-all text-[#191919]">{createdLink}</p>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={copyLink} className="flex-1">
                    {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>Done</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default CreatePaymentLinkModal
