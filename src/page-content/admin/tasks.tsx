'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Plus, X, CheckCircle2, Circle, Clock, AlertCircle,
  ChevronRight, ChevronLeft, Trash2, User, Building,
  Calendar, Flag, Edit2,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Status   = 'todo' | 'in_progress' | 'done'
type Priority = 'low' | 'normal' | 'high'

interface Task {
  id: string
  title: string
  description?: string
  assigned_to?: string
  client_id?: string
  clients?: { name: string; company?: string }
  due_date?: string
  status: Status
  priority: Priority
  created_at: string
}

interface TaskFormData {
  title: string
  description: string
  assigned_to: string
  client_id: string
  due_date: string
  priority: Priority
  status: Status
}

const COLUMNS: { key: Status; label: string; icon: any; color: string; bg: string }[] = [
  { key: 'todo',        label: 'To Do',       icon: Circle,       color: 'text-gray-500',   bg: 'bg-gray-50'    },
  { key: 'in_progress', label: 'In Progress', icon: Clock,        color: 'text-blue-600',   bg: 'bg-blue-50'    },
  { key: 'done',        label: 'Done',        icon: CheckCircle2, color: 'text-[#35c677]',  bg: 'bg-[#35c677]/5' },
]

const PRIORITY_META: Record<Priority, { label: string; color: string; dot: string }> = {
  low:    { label: 'Low',    color: 'text-gray-400',  dot: 'bg-gray-300'  },
  normal: { label: 'Normal', color: 'text-blue-500',  dot: 'bg-blue-400'  },
  high:   { label: 'High',   color: 'text-red-500',   dot: 'bg-red-400'   },
}

const EMPTY_FORM: TaskFormData = {
  title: '', description: '', assigned_to: '', client_id: '',
  due_date: '', priority: 'normal', status: 'todo',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function authToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : ''
}

function isOverdue(due_date?: string, status?: Status) {
  if (!due_date || status === 'done') return false
  return new Date(due_date) < new Date(new Date().toDateString())
}

// ─── Task card ───────────────────────────────────────────────────────────────

const TaskCard: React.FC<{
  task: Task
  onEdit: (t: Task) => void
  onMove: (id: string, status: Status) => void
  onDelete: (id: string) => void
}> = ({ task, onEdit, onMove, onDelete }) => {
  const p = PRIORITY_META[task.priority]
  const overdue = isOverdue(task.due_date, task.status)
  const clientLabel = task.clients?.company || task.clients?.name

  const prevStatus: Record<Status, Status | null> = { todo: null, in_progress: 'todo', done: 'in_progress' }
  const nextStatus: Record<Status, Status | null> = { todo: 'in_progress', in_progress: 'done', done: null }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${
        task.priority === 'high' ? 'border-red-200' : 'border-gray-100'
      }`}
    >
      {/* Priority + actions row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${p.color}`}>{p.label}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Title */}
      <p className={`font-semibold text-sm text-[#191919] leading-snug mb-1 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* Meta */}
      <div className="space-y-1 mb-3">
        {task.assigned_to && (
          <div className="flex items-center space-x-1.5">
            <User className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">{task.assigned_to}</span>
          </div>
        )}
        {clientLabel && (
          <div className="flex items-center space-x-1.5">
            <Building className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">{clientLabel}</span>
          </div>
        )}
        {task.due_date && (
          <div className={`flex items-center space-x-1.5 ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
            {overdue ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
            <span className="text-xs font-medium">
              {overdue ? 'Overdue · ' : ''}
              {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* Move buttons */}
      <div className="flex items-center space-x-1 pt-2 border-t border-gray-50">
        {prevStatus[task.status] && (
          <button
            onClick={() => onMove(task.id, prevStatus[task.status]!)}
            className="flex items-center space-x-1 text-[10px] text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-3 w-3" />
            <span>{COLUMNS.find(c => c.key === prevStatus[task.status])?.label}</span>
          </button>
        )}
        <div className="flex-1" />
        {nextStatus[task.status] && (
          <button
            onClick={() => onMove(task.id, nextStatus[task.status]!)}
            className="flex items-center space-x-1 text-[10px] text-[#35c677] hover:text-[#2db366] px-2 py-1 rounded-lg hover:bg-[#35c677]/5 transition-colors font-medium"
          >
            <span>{COLUMNS.find(c => c.key === nextStatus[task.status])?.label}</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Task modal ───────────────────────────────────────────────────────────────

const TaskModal: React.FC<{
  isOpen: boolean
  initial: TaskFormData
  clients: { id: string; name: string; company?: string }[]
  onSave: (data: TaskFormData) => void
  onClose: () => void
  isEdit?: boolean
}> = ({ isOpen, initial, clients, onSave, onClose, isEdit }) => {
  const [form, setForm] = React.useState<TaskFormData>(initial)

  React.useEffect(() => {
    if (isOpen) setForm(initial)
  }, [isOpen, initial])

  if (!isOpen) return null

  const set = (k: keyof TaskFormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[#191919]">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task *</label>
            <Input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Build 10 citations for Genova's"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Any extra context..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Assigned to */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
              <Input
                value={form.assigned_to}
                onChange={e => set('assigned_to', e.target.value)}
                placeholder="Employee name"
              />
            </div>

            {/* Due date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
              <Input
                type="date"
                value={form.due_date}
                onChange={e => set('due_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677]"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677]"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Client (optional)</label>
            <select
              value={form.client_id}
              onChange={e => set('client_id', e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677]"
            >
              <option value="">No client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.company || c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-[#35c677] hover:bg-[#2db366] text-white"
            onClick={() => { if (form.title.trim()) onSave(form) }}
            disabled={!form.title.trim()}
          >
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminTasks: React.FC = () => {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [filterAssignee, setFilterAssignee] = React.useState('')

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const token = await authToken()
      const res = await fetch('/api/admin/tasks', { headers: { Authorization: token } })
      if (!res.ok) return []
      return res.json()
    },
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => {
      const token = await authToken()
      const res = await fetch('/api/admin/dashboard', { headers: { Authorization: token } })
      if (!res.ok) return []
      const data = await res.json()
      return data.clients || []
    },
  })

  const saveMutation = useMutation({
    mutationFn: async ({ form, id }: { form: TaskFormData; id?: string }) => {
      const token = await authToken()
      const payload = {
        ...(id ? { id } : {}),
        title:        form.title,
        description:  form.description  || null,
        assigned_to:  form.assigned_to  || null,
        client_id:    form.client_id    || null,
        due_date:     form.due_date     || null,
        priority:     form.priority,
        status:       form.status,
      }
      const res = await fetch('/api/admin/tasks', {
        method: id ? 'PATCH' : 'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save task')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
      setModalOpen(false)
      setEditingTask(null)
    },
  })

  const moveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const token = await authToken()
      await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tasks'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await authToken()
      await fetch(`/api/admin/tasks?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: token },
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tasks'] }),
  })

  const assignees = Array.from(new Set(tasks.map(t => t.assigned_to).filter(Boolean))) as string[]

  const filtered = filterAssignee
    ? tasks.filter(t => t.assigned_to === filterAssignee)
    : tasks

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleNewTask = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const initialForm: TaskFormData = editingTask ? {
    title:       editingTask.title,
    description: editingTask.description || '',
    assigned_to: editingTask.assigned_to || '',
    client_id:   editingTask.client_id   || '',
    due_date:    editingTask.due_date     || '',
    priority:    editingTask.priority,
    status:      editingTask.status,
  } : EMPTY_FORM

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191919]">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tasks.filter(t => t.status !== 'done').length} open · {tasks.filter(t => t.status === 'done').length} done</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Assignee filter */}
          {assignees.length > 0 && (
            <select
              value={filterAssignee}
              onChange={e => setFilterAssignee(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#35c677]/30 focus:border-[#35c677]"
            >
              <option value="">All team members</option>
              {assignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
          <Button
            className="bg-[#35c677] hover:bg-[#2db366] text-white flex items-center space-x-2"
            onClick={handleNewTask}
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Kanban board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(col => {
            const colTasks = filtered.filter(t => t.status === col.key)
            const Icon = col.icon
            return (
              <div key={col.key} className={`rounded-2xl p-4 ${col.bg} border border-gray-100 min-h-[400px]`}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${col.color}`} />
                    <span className={`font-semibold text-sm ${col.color}`}>{col.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold bg-white/80 ${col.color}`}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTask(null)
                      setModalOpen(true)
                    }}
                    className="p-1 text-gray-400 hover:text-[#35c677] transition-colors"
                    title="Add task"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {colTasks.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 text-gray-400 text-sm"
                      >
                        No tasks
                      </motion.div>
                    ) : (
                      colTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleEdit}
                          onMove={(id, status) => moveMutation.mutate({ id, status })}
                          onDelete={id => {
                            if (confirm('Delete this task?')) deleteMutation.mutate(id)
                          }}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <TaskModal
        isOpen={modalOpen}
        initial={initialForm}
        clients={clients}
        isEdit={!!editingTask}
        onClose={() => { setModalOpen(false); setEditingTask(null) }}
        onSave={form => saveMutation.mutate({ form, id: editingTask?.id })}
      />
    </div>
  )
}

export default AdminTasks
