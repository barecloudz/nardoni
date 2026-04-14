'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatalogItem {
  id: string
  name: string
  description: string | null
  features: string | null
  price: number
  period: 'one-time' | 'monthly' | 'yearly'
  is_active: boolean
  display_order: number
  created_at: string
}

type FormState = {
  name: string
  description: string
  features: string
  price: string
  period: string
  is_active: boolean
  display_order: string
}

const defaultForm: FormState = {
  name: '',
  description: '',
  features: '',
  price: '',
  period: 'monthly',
  is_active: true,
  display_order: '0',
}

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : ''
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchCatalog(): Promise<CatalogItem[]> {
  const token = await getToken()
  const res = await fetch('/api/admin/service-catalog', {
    headers: { Authorization: token },
  })
  if (!res.ok) throw new Error('Failed to fetch catalog')
  return res.json()
}

async function createItem(form: FormState): Promise<CatalogItem> {
  const token = await getToken()
  const res = await fetch('/api/admin/service-catalog', {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: form.name.trim(),
      description: form.description.trim() || null,
      features: form.features.trim() || null,
      price: Number(form.price),
      period: form.period,
      is_active: form.is_active,
      display_order: Number(form.display_order) || 0,
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to create item')
  return json
}

async function updateItem(id: string, form: FormState): Promise<CatalogItem> {
  const token = await getToken()
  const res = await fetch('/api/admin/service-catalog', {
    method: 'PATCH',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      features: form.features.trim() || null,
      price: Number(form.price),
      period: form.period,
      is_active: form.is_active,
      display_order: Number(form.display_order) || 0,
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to update item')
  return json
}

async function deleteItem(id: string): Promise<void> {
  const token = await getToken()
  const res = await fetch(`/api/admin/service-catalog?id=${id}`, {
    method: 'DELETE',
    headers: { Authorization: token },
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error || 'Failed to delete item')
  }
}

// ─── Period label ─────────────────────────────────────────────────────────────

function periodLabel(period: string) {
  if (period === 'weekly') return '/wk'
  if (period === 'monthly') return '/mo'
  if (period === 'yearly') return '/yr'
  return ''
}

// ─── ServiceCatalog page ──────────────────────────────────────────────────────

const ServiceCatalog: React.FC = () => {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<CatalogItem | null>(null)
  const [form, setForm] = React.useState<FormState>(defaultForm)
  const [formError, setFormError] = React.useState('')
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const { data: catalog = [], isLoading, error: fetchError } = useQuery({
    queryKey: ['service-catalog'],
    queryFn: fetchCatalog,
  })

  const createMutation = useMutation({
    mutationFn: () => createItem(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] })
      closeModal()
    },
    onError: (e: any) => setFormError(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: () => updateItem(editingItem!.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] })
      closeModal()
    },
    onError: (e: any) => setFormError(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] })
      setDeletingId(null)
    },
    onError: (e: any) => {
      console.error(e.message)
      setDeletingId(null)
    },
  })

  const openCreate = () => {
    setEditingItem(null)
    setForm(defaultForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (item: CatalogItem) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      description: item.description || '',
      features: item.features || '',
      price: String(item.price),
      period: item.period,
      is_active: item.is_active,
      display_order: String(item.display_order),
    })
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setForm(defaultForm)
    setFormError('')
  }

  const handleSubmit = () => {
    if (!form.name.trim()) { setFormError('Service name is required.'); return }
    if (!form.price || isNaN(Number(form.price))) { setFormError('A valid price is required.'); return }
    setFormError('')
    if (editingItem) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  const lbl = 'block text-sm font-medium text-gray-700 mb-1.5'
  const inputCls = 'w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677]'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-[#35c677]/10 rounded-xl">
              <Package className="h-6 w-6 text-[#35c677]" />
            </div>
            <h1 className="text-2xl font-bold text-[#191919]">Service Catalog</h1>
          </div>
          <p className="text-gray-500 text-sm ml-1">
            Manage your service packages. These appear as quick-pick presets when creating payment links.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#35c677] hover:bg-[#2db366] text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <div className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl p-4">
          Failed to load catalog: {(fetchError as Error).message}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !fetchError && catalog.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="p-5 bg-[#35c677]/10 rounded-2xl mb-5">
            <Package className="h-10 w-10 text-[#35c677]" />
          </div>
          <h2 className="text-xl font-bold text-[#191919] mb-2">No services yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Add your first service package and it will appear as a quick-pick preset when creating payment links.
          </p>
          <Button
            onClick={openCreate}
            className="bg-[#35c677] hover:bg-[#2db366] text-white flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Add your first service
          </Button>
        </motion.div>
      )}

      {/* Grid */}
      {!isLoading && catalog.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {catalog.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`h-full flex flex-col transition-shadow hover:shadow-md ${!item.is_active ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug text-[#191919]">
                        {item.name}
                      </CardTitle>
                      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        item.is_active
                          ? 'bg-[#35c677]/15 text-[#35c677]'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-[#191919]">
                        ${item.price.toLocaleString()}
                      </span>
                      {item.period !== 'one-time' && (
                        <span className="text-sm text-gray-400 font-medium">
                          {periodLabel(item.period)}
                        </span>
                      )}
                      {item.period === 'one-time' && (
                        <span className="text-sm text-gray-400 font-medium">one-time</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 pt-0">
                    {item.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                        {item.description}
                      </p>
                    )}
                    {item.features && (
                      <ul className="space-y-1 mb-4">
                        {item.features.split('\n').filter(Boolean).slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#35c677] shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                        {item.features.split('\n').filter(Boolean).length > 4 && (
                          <li className="text-xs text-gray-400 pl-5.5">
                            +{item.features.split('\n').filter(Boolean).length - 4} more
                          </li>
                        )}
                      </ul>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deleteMutation.isPending && deletingId === item.id}
                        onClick={() => {
                          if (window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
                            setDeletingId(item.id)
                            deleteMutation.mutate(item.id)
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-600 hover:border-red-200 border-gray-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deleteMutation.isPending && deletingId === item.id ? '...' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#35c677]" />
                      {editingItem ? 'Edit Service' : 'Add Service'}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={closeModal}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-5">
                  {/* Name */}
                  <div>
                    <label className={lbl}>Service Name *</label>
                    <Input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Local SEO"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className={lbl}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      placeholder="One paragraph describing the service and its value..."
                      className={inputCls + ' resize-none'}
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <label className={lbl}>
                      What's Included
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">one item per line</span>
                    </label>
                    <textarea
                      value={form.features}
                      onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                      rows={5}
                      placeholder={`Page 1 Google Rankings\n90-Day Guarantee\nLocal SEO Strategy\nMonthly Reporting`}
                      className={inputCls + ' resize-none font-mono text-xs'}
                    />
                  </div>

                  {/* Price + Period */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Price (USD) *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <Input
                          type="number"
                          min="0"
                          value={form.price}
                          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                          placeholder="500"
                          className="pl-7"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Billing Period</label>
                      <select
                        value={form.period}
                        onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="one-time">One-time</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className={lbl}>
                      Display Order
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">lower = first</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={form.display_order}
                      onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
                      placeholder="0"
                    />
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Active</p>
                      <p className="text-xs text-gray-400">Show in quick-pick presets</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                      className={`transition-colors ${form.is_active ? 'text-[#35c677]' : 'text-gray-300'}`}
                    >
                      {form.is_active
                        ? <ToggleRight className="h-8 w-8" />
                        : <ToggleLeft className="h-8 w-8" />
                      }
                    </button>
                  </div>

                  {formError && (
                    <p className="text-red-500 text-sm">{formError}</p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t">
                    <Button variant="outline" onClick={closeModal}>Cancel</Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="bg-[#35c677] hover:bg-[#2db366] text-white"
                    >
                      {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Service'}
                      {!isSaving && <ArrowRight className="h-4 w-4 ml-1.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ServiceCatalog
