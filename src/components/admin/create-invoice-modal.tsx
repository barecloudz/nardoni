'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createInvoice, getClients, supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, DollarSign, Plus, Trash2, FileText } from 'lucide-react'

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be positive'),
})

const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Please select a client'),
  due_date: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose }) => {
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
    control,
    watch,
    formState: { errors },
    reset
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, rate: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  const watchedItems = watch('items')

  // Calculate total
  const total = watchedItems.reduce((sum, item) => {
    return sum + (item.quantity * item.rate)
  }, 0)

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await createInvoice({
        number: invoiceNumber,
        client_id: data.client_id,
        amount: total,
        due_date: data.due_date,
        status: 'draft'
      })

      if (invoiceError) throw invoiceError

      // Create invoice items
      const itemsToInsert = data.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      return invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice. Please try again.')
    }
  })

  const onSubmit = async (data: InvoiceFormData) => {
    createInvoiceMutation.mutate(data)
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
                <span>Create New Invoice</span>
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
                    Due Date *
                  </label>
                  <Input
                    {...register('due_date')}
                    type="date"
                    className={errors.due_date ? 'border-red-500' : ''}
                  />
                  {errors.due_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.due_date.message}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Invoice Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: '', quantity: 1, rate: 0 })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-6">
                        <Input
                          {...register(`items.${index}.description`)}
                          placeholder="Description"
                          className={errors.items?.[index]?.description ? 'border-red-500' : ''}
                        />
                        {errors.items?.[index]?.description && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.description?.message}
                          </p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <Input
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                          type="number"
                          placeholder="Qty"
                          min="1"
                          className={errors.items?.[index]?.quantity ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          {...register(`items.${index}.rate`, { valueAsNumber: true })}
                          type="number"
                          placeholder="Rate"
                          min="0"
                          step="0.01"
                          className={errors.items?.[index]?.rate ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <span className="text-sm font-medium">
                          ${((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0)).toFixed(2)}
                        </span>
                      </div>
                      <div className="col-span-1">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        Total: ${total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createInvoiceMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  {createInvoiceMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" />
                      <span>Create Invoice</span>
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

export default CreateInvoiceModal