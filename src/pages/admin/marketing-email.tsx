import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/layout/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import {
  Mail,
  Send,
  Users,
  Plus,
  Trash2,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  Paperclip,
  X,
  Calendar,
  FileText,
  List,
  History,
  RefreshCw,
  Inbox,
  Eye,
  Reply,
  Archive
} from 'lucide-react'

interface MarketingContact {
  id: number
  email: string
  name: string | null
  company: string | null
  role: string | null
  phone: string | null
  notes: string | null
  created_at: string
}

interface ContactList {
  id: number
  name: string
  description: string | null
  member_count: number
  created_at: string
}

interface SentEmail {
  id: number
  recipient_email: string
  subject: string
  body: string
  used_html_template: boolean
  attachment_count: number
  attachment_names: string[] | null
  status: string
  resend_id: string | null
  created_at: string
}

interface ScheduledEmail {
  id: number
  recipient_email: string | null
  recipient_list_id: number | null
  subject: string
  body: string
  use_html_template: boolean
  attachment_urls: { filename: string; url: string; type: string }[] | null
  scheduled_at: string
  status: string
  sent_at: string | null
  error_message: string | null
  created_at: string
  contact_lists?: { name: string } | null
}

interface ReceivedEmail {
  id: number
  from_email: string
  from_name: string | null
  to_email: string | null
  subject: string | null
  body_text: string | null
  body_html: string | null
  is_read: boolean
  is_archived: boolean
  received_at: string
  created_at: string
}

type TabType = 'inbox' | 'compose' | 'contacts' | 'lists' | 'scheduled' | 'history'

const AdminMarketingEmail: React.FC = () => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('inbox')

  // Inbox state
  const [selectedInboxEmail, setSelectedInboxEmail] = useState<ReceivedEmail | null>(null)

  // Email form state
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: '',
    useHtmlTemplate: false
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [emailSending, setEmailSending] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')

  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDateTime, setScheduledDateTime] = useState('')

  // Send mode state
  const [sendMode, setSendMode] = useState<'single' | 'list'>('single')
  const [selectedListForSend, setSelectedListForSend] = useState<number | null>(null)

  // Mass email progress
  const [massEmailProgress, setMassEmailProgress] = useState({ current: 0, total: 0, sending: false })

  // Modal states
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<ContactList | null>(null)
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false)

  // New contact form
  const [newContact, setNewContact] = useState({
    email: '',
    name: '',
    company: '',
    role: '',
    phone: '',
    notes: ''
  })

  // New list form
  const [newList, setNewList] = useState({
    name: '',
    description: ''
  })

  // Fetch marketing contacts
  const { data: contacts = [], isLoading: contactsLoading, refetch: refetchContacts } = useQuery({
    queryKey: ['marketing-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_contacts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as MarketingContact[]
    }
  })

  // Fetch contact lists
  const { data: contactLists = [], isLoading: listsLoading, refetch: refetchLists } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_lists')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as ContactList[]
    }
  })

  // Fetch sent emails
  const { data: sentEmails = [], isLoading: sentLoading, refetch: refetchSent } = useQuery({
    queryKey: ['sent-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sent_emails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return (data || []) as SentEmail[]
    }
  })

  // Fetch scheduled emails
  const { data: scheduledEmails = [], isLoading: scheduledLoading, refetch: refetchScheduled } = useQuery({
    queryKey: ['scheduled-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_emails')
        .select('*, contact_lists(name)')
        .in('status', ['pending', 'sending'])
        .order('scheduled_at', { ascending: true })
      if (error) throw error
      return (data || []) as ScheduledEmail[]
    }
  })

  // Fetch received emails (inbox)
  const { data: receivedEmails = [], isLoading: inboxLoading, refetch: refetchInbox } = useQuery({
    queryKey: ['received-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('received_emails')
        .select('*')
        .eq('is_archived', false)
        .order('received_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data || []) as ReceivedEmail[]
    }
  })

  // Count unread emails
  const unreadCount = receivedEmails.filter(e => !e.is_read).length

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (contactData: typeof newContact) => {
      const { data, error } = await supabase
        .from('marketing_contacts')
        .insert([contactData])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-contacts'] })
      setIsAddContactModalOpen(false)
      setNewContact({ email: '', name: '', company: '', role: '', phone: '', notes: '' })
      setEmailSuccess('Contact added successfully')
      setTimeout(() => setEmailSuccess(''), 3000)
    },
    onError: (error: any) => {
      setEmailError(error.message || 'Failed to add contact')
    }
  })

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('marketing_contacts')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-contacts'] })
    }
  })

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: async (listData: typeof newList) => {
      const { data, error } = await supabase
        .from('contact_lists')
        .insert([listData])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] })
      setIsCreateListModalOpen(false)
      setNewList({ name: '', description: '' })
      setEmailSuccess('List created successfully')
      setTimeout(() => setEmailSuccess(''), 3000)
    }
  })

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] })
      setSelectedList(null)
    }
  })

  // Cancel scheduled email mutation
  const cancelScheduledMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('scheduled_emails')
        .update({ status: 'cancelled' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-emails'] })
      setEmailSuccess('Scheduled email cancelled')
      setTimeout(() => setEmailSuccess(''), 3000)
    }
  })

  // Mark inbox email as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('received_emails')
        .update({ is_read: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-emails'] })
    }
  })

  // Archive inbox email
  const archiveEmailMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('received_emails')
        .update({ is_archived: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-emails'] })
      setSelectedInboxEmail(null)
      setEmailSuccess('Email archived')
      setTimeout(() => setEmailSuccess(''), 3000)
    }
  })

  // Delete inbox email
  const deleteInboxEmailMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('received_emails')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-emails'] })
      setSelectedInboxEmail(null)
    }
  })

  // Load contacts for a specific list
  const loadListContacts = async (listId: number): Promise<MarketingContact[]> => {
    const { data, error } = await supabase
      .from('contact_list_members')
      .select('marketing_contacts(*)')
      .eq('list_id', listId)

    if (error) {
      console.error('Error loading list contacts:', error)
      return []
    }

    return (data || []).map((item: any) => item.marketing_contacts).filter(Boolean)
  }

  // Add contact to list
  const addContactToList = async (contactId: number, listId: number) => {
    const { error } = await supabase
      .from('contact_list_members')
      .upsert({ contact_id: contactId, list_id: listId })

    if (error) {
      console.error('Error adding contact to list:', error)
      return
    }

    // Update member count
    const members = await loadListContacts(listId)
    await supabase
      .from('contact_lists')
      .update({ member_count: members.length })
      .eq('id', listId)

    queryClient.invalidateQueries({ queryKey: ['contact-lists'] })
    setEmailSuccess('Contact added to list')
    setTimeout(() => setEmailSuccess(''), 3000)
  }

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // Send single email
  const sendSingleEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      setEmailError('Please fill in recipient, subject, and message')
      return
    }

    setEmailSending(true)
    setEmailError('')
    setEmailSuccess('')

    try {
      const SIZE_THRESHOLD = 500 * 1024
      const smallFiles = attachments.filter(f => f.size <= SIZE_THRESHOLD)
      const largeFiles = attachments.filter(f => f.size > SIZE_THRESHOLD)

      // Convert small files to base64
      const attachmentsBase64 = await Promise.all(
        smallFiles.map(file => {
          return new Promise<{ filename: string; content: string; type: string }>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve({
              filename: file.name,
              content: (reader.result as string).split(',')[1],
              type: file.type
            })
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        })
      )

      // Upload large files to Supabase storage
      const attachmentUrls: { filename: string; url: string; type: string }[] = []
      for (const file of largeFiles) {
        const fileKey = `${file.name}-${file.size}`
        const fileName = `email-attachments/${fileKey}`

        const { error } = await supabase.storage
          .from('marketing')
          .upload(fileName, file, { cacheControl: '3600', upsert: true })

        if (error) {
          console.error('Error uploading:', error)
          continue
        }

        const { data: urlData } = supabase.storage.from('marketing').getPublicUrl(fileName)
        attachmentUrls.push({ filename: file.name, url: urlData.publicUrl, type: file.type })
      }

      // Check if scheduling
      if (isScheduled && scheduledDateTime) {
        const { error } = await supabase
          .from('scheduled_emails')
          .insert([{
            recipient_email: emailForm.to,
            subject: emailForm.subject,
            body: emailForm.body,
            use_html_template: emailForm.useHtmlTemplate,
            attachment_urls: attachmentUrls,
            scheduled_at: new Date(scheduledDateTime).toISOString(),
            status: 'pending'
          }])

        if (error) throw error

        setEmailSuccess('Email scheduled successfully!')
        queryClient.invalidateQueries({ queryKey: ['scheduled-emails'] })
      } else {
        const response = await fetch('/.netlify/functions/send-marketing-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: emailForm.to,
            subject: emailForm.subject,
            body: emailForm.body,
            attachments: attachmentsBase64,
            attachmentUrls: attachmentUrls,
            useHtmlTemplate: emailForm.useHtmlTemplate
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send email')
        }

        // Log to sent_emails
        await supabase.from('sent_emails').insert([{
          recipient_email: emailForm.to,
          subject: emailForm.subject,
          body: emailForm.body,
          used_html_template: emailForm.useHtmlTemplate,
          attachment_count: attachments.length,
          attachment_names: attachments.map(f => f.name),
          status: 'sent',
          resend_id: result.id
        }])

        setEmailSuccess('Email sent successfully!')
        queryClient.invalidateQueries({ queryKey: ['sent-emails'] })
      }

      // Reset form
      setEmailForm({ to: '', subject: '', body: '', useHtmlTemplate: false })
      setAttachments([])
      setIsScheduled(false)
      setScheduledDateTime('')

    } catch (error: any) {
      setEmailError(error.message || 'Failed to send email')
    } finally {
      setEmailSending(false)
    }
  }

  // Send mass email to list
  const sendMassEmail = async () => {
    if (!selectedListForSend || !emailForm.subject || !emailForm.body) {
      setEmailError('Please select a list and fill in subject and message')
      return
    }

    const listContacts = await loadListContacts(selectedListForSend)
    if (listContacts.length === 0) {
      setEmailError('No contacts in this list')
      return
    }

    setMassEmailProgress({ current: 0, total: listContacts.length, sending: true })
    setEmailError('')
    setEmailSuccess('')

    const SIZE_THRESHOLD = 500 * 1024
    const smallFiles = attachments.filter(f => f.size <= SIZE_THRESHOLD)
    const largeFiles = attachments.filter(f => f.size > SIZE_THRESHOLD)

    // Convert small files to base64
    const attachmentsBase64 = await Promise.all(
      smallFiles.map(file => {
        return new Promise<{ filename: string; content: string; type: string }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve({
            filename: file.name,
            content: (reader.result as string).split(',')[1],
            type: file.type
          })
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })
    )

    // Upload large files
    const attachmentUrls: { filename: string; url: string; type: string }[] = []
    for (const file of largeFiles) {
      const fileKey = `${file.name}-${file.size}`
      const fileName = `email-attachments/${fileKey}`

      const { error } = await supabase.storage
        .from('marketing')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (!error) {
        const { data: urlData } = supabase.storage.from('marketing').getPublicUrl(fileName)
        attachmentUrls.push({ filename: file.name, url: urlData.publicUrl, type: file.type })
      }
    }

    // Check if scheduling
    if (isScheduled && scheduledDateTime) {
      const { error } = await supabase
        .from('scheduled_emails')
        .insert([{
          recipient_list_id: selectedListForSend,
          subject: emailForm.subject,
          body: emailForm.body,
          use_html_template: emailForm.useHtmlTemplate,
          attachment_urls: attachmentUrls,
          scheduled_at: new Date(scheduledDateTime).toISOString(),
          status: 'pending'
        }])

      if (error) {
        setEmailError('Failed to schedule email')
      } else {
        setEmailSuccess(`Email scheduled for ${listContacts.length} contacts!`)
        queryClient.invalidateQueries({ queryKey: ['scheduled-emails'] })
      }

      setMassEmailProgress({ current: 0, total: 0, sending: false })
      setEmailForm({ to: '', subject: '', body: '', useHtmlTemplate: false })
      setAttachments([])
      setIsScheduled(false)
      setScheduledDateTime('')
      return
    }

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < listContacts.length; i++) {
      const contact = listContacts[i]
      setMassEmailProgress(prev => ({ ...prev, current: i + 1 }))

      try {
        const personalizedBody = emailForm.body
          .replace(/\[Name\]/g, (contact.name || 'there').split(' ')[0])
          .replace(/\[Company\]/g, contact.company || '')
          .replace(/\[Role\]/g, contact.role || '')

        const response = await fetch('/.netlify/functions/send-marketing-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: contact.email,
            subject: emailForm.subject,
            body: personalizedBody,
            attachments: attachmentsBase64,
            attachmentUrls: attachmentUrls,
            useHtmlTemplate: emailForm.useHtmlTemplate
          })
        })

        const result = await response.json()

        if (response.ok) {
          successCount++
          await supabase.from('sent_emails').insert([{
            recipient_email: contact.email,
            subject: emailForm.subject,
            body: personalizedBody,
            used_html_template: emailForm.useHtmlTemplate,
            attachment_count: attachments.length,
            attachment_names: attachments.map(f => f.name),
            status: 'sent',
            resend_id: result.id
          }])
        } else {
          failCount++
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (err) {
        failCount++
      }
    }

    setMassEmailProgress({ current: 0, total: 0, sending: false })
    queryClient.invalidateQueries({ queryKey: ['sent-emails'] })

    setEmailForm({ to: '', subject: '', body: '', useHtmlTemplate: false })
    setAttachments([])
    setSelectedListForSend(null)

    if (failCount === 0) {
      setEmailSuccess(`Successfully sent ${successCount} emails!`)
    } else {
      setEmailSuccess(`Sent ${successCount} emails. ${failCount} failed.`)
    }
    setTimeout(() => setEmailSuccess(''), 5000)
  }

  // Import CSV
  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())

    const emailIdx = headers.findIndex(h => h.includes('email'))
    const nameIdx = headers.findIndex(h => h.includes('name'))
    const companyIdx = headers.findIndex(h => h.includes('company'))
    const roleIdx = headers.findIndex(h => h.includes('role') || h.includes('title'))

    if (emailIdx === -1) {
      setEmailError('CSV must have an email column')
      return
    }

    const contactsToImport = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const email = values[emailIdx]
      if (email && email.includes('@')) {
        contactsToImport.push({
          email,
          name: nameIdx !== -1 ? values[nameIdx] || null : null,
          company: companyIdx !== -1 ? values[companyIdx] || null : null,
          role: roleIdx !== -1 ? values[roleIdx] || null : null
        })
      }
    }

    if (contactsToImport.length === 0) {
      setEmailError('No valid contacts found in CSV')
      return
    }

    const { error } = await supabase
      .from('marketing_contacts')
      .upsert(contactsToImport, { onConflict: 'email' })

    if (error) {
      setEmailError('Error importing contacts: ' + error.message)
    } else {
      setEmailSuccess(`Imported ${contactsToImport.length} contacts!`)
      queryClient.invalidateQueries({ queryKey: ['marketing-contacts'] })
      setIsImportModalOpen(false)
    }
  }

  const tabs = [
    { id: 'inbox' as TabType, label: 'Inbox', icon: Inbox },
    { id: 'compose' as TabType, label: 'Compose', icon: Mail },
    { id: 'contacts' as TabType, label: 'Contacts', icon: Users },
    { id: 'lists' as TabType, label: 'Lists', icon: List },
    { id: 'scheduled' as TabType, label: 'Scheduled', icon: Clock },
    { id: 'history' as TabType, label: 'History', icon: History }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-8 overflow-y-auto pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-[#191919]">Marketing Email</h1>
            <p className="text-gray-600 mt-1">Send emails, manage contacts, and track campaigns</p>
          </div>

          {/* Status Messages */}
          {emailError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              {emailError}
              <button onClick={() => setEmailError('')} className="ml-auto">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {emailSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {emailSuccess}
              <button onClick={() => setEmailSuccess('')} className="ml-auto">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mass Email Progress */}
          {massEmailProgress.sending && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span>Sending emails...</span>
                <span>{massEmailProgress.current} / {massEmailProgress.total}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(massEmailProgress.current / massEmailProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide pb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-3 border-b-2 transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'border-[#35c677] text-[#35c677] bg-[#35c677]/5'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#35c677]' : ''}`} />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {tab.id === 'inbox' && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 min-w-[20px] text-xs">{unreadCount}</Badge>
                    )}
                    {tab.id === 'scheduled' && scheduledEmails.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">{scheduledEmails.length}</Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Inbox Tab */}
          {activeTab === 'inbox' && (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-280px)] min-h-[500px]">
              {/* Email List - Collapsible on mobile when email selected */}
              <div className={`${selectedInboxEmail ? 'hidden lg:block' : 'block'} w-full lg:w-80 xl:w-96 flex-shrink-0`}>
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex-shrink-0 border-b bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Inbox className="h-5 w-5 text-[#35c677]" />
                        <CardTitle className="text-lg">Inbox</CardTitle>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">{unreadCount} new</Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => refetchInbox()} className="h-8 w-8 p-0">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-hidden">
                    {inboxLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : receivedEmails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <Inbox className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-sm">No emails yet</p>
                        <p className="text-xs text-gray-400 mt-1">Replies will appear here</p>
                      </div>
                    ) : (
                      <div className="divide-y overflow-y-auto h-full">
                        {receivedEmails.map((email) => (
                          <div
                            key={email.id}
                            onClick={() => {
                              setSelectedInboxEmail(email)
                              if (!email.is_read) {
                                markAsReadMutation.mutate(email.id)
                              }
                            }}
                            className={`p-4 cursor-pointer transition-all duration-150 border-l-4 ${
                              selectedInboxEmail?.id === email.id
                                ? 'bg-[#35c677]/10 border-l-[#35c677]'
                                : !email.is_read
                                  ? 'bg-blue-50/70 border-l-blue-400 hover:bg-blue-50'
                                  : 'border-l-transparent hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#35c677] to-[#2aa35f] flex items-center justify-center text-white font-semibold text-sm">
                                {(email.from_name || email.from_email).charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-sm truncate ${!email.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                    {email.from_name || email.from_email.split('@')[0]}
                                  </p>
                                  <span className="text-xs text-gray-400 flex-shrink-0">
                                    {new Date(email.received_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className={`text-sm truncate mt-0.5 ${!email.is_read ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                                  {email.subject || '(No subject)'}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-1 leading-relaxed">
                                  {email.body_text?.substring(0, 80) || 'No preview available'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Email Detail */}
              <div className={`${selectedInboxEmail ? 'block' : 'hidden lg:block'} flex-1 min-w-0`}>
                <Card className="h-full flex flex-col">
                  {selectedInboxEmail ? (
                    <>
                      {/* Mobile back button */}
                      <div className="lg:hidden p-3 border-b bg-gray-50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInboxEmail(null)}
                          className="text-gray-600"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Back to Inbox
                        </Button>
                      </div>

                      {/* Email Header */}
                      <div className="p-4 lg:p-6 border-b bg-gray-50/50 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#35c677] to-[#2aa35f] items-center justify-center text-white font-semibold text-lg">
                              {(selectedInboxEmail.from_name || selectedInboxEmail.from_email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 leading-tight">
                                {selectedInboxEmail.subject || '(No subject)'}
                              </h2>
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">{selectedInboxEmail.from_name || 'Unknown'}</span>
                                <span className="text-gray-400 ml-1">&lt;{selectedInboxEmail.from_email}&gt;</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(selectedInboxEmail.received_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              onClick={() => {
                                setEmailForm({
                                  to: selectedInboxEmail.from_email,
                                  subject: `Re: ${selectedInboxEmail.subject || ''}`,
                                  body: `\n\n---\nOn ${new Date(selectedInboxEmail.received_at).toLocaleString()}, ${selectedInboxEmail.from_name || selectedInboxEmail.from_email} wrote:\n\n${selectedInboxEmail.body_text || ''}`,
                                  useHtmlTemplate: false
                                })
                                setActiveTab('compose')
                              }}
                              className="bg-[#35c677] hover:bg-[#2aa35f]"
                            >
                              <Reply className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Reply</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => archiveEmailMutation.mutate(selectedInboxEmail.id)}
                            >
                              <Archive className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Archive</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteInboxEmailMutation.mutate(selectedInboxEmail.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                        <div className="prose prose-sm max-w-none">
                          {selectedInboxEmail.body_html ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: selectedInboxEmail.body_html }}
                              className="[&_img]:max-w-full [&_a]:text-[#35c677]"
                            />
                          ) : (
                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed bg-transparent p-0 m-0">
                              {selectedInboxEmail.body_text}
                            </pre>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <Mail className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">No email selected</h3>
                        <p className="text-sm text-gray-500">Choose an email from the inbox to read</p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* Compose Tab */}
          {activeTab === 'compose' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Compose Email</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Send Mode Toggle */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSendMode('single')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      sendMode === 'single' ? 'bg-[#35c677] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Single Email</span>
                  </button>
                  <button
                    onClick={() => setSendMode('list')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      sendMode === 'list' ? 'bg-[#35c677] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Send to List</span>
                  </button>
                </div>

                {/* Recipient */}
                {sendMode === 'single' ? (
                  <div>
                    <label className="text-sm font-medium mb-1 block">To</label>
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Select Contact List</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={selectedListForSend || ''}
                      onChange={(e) => setSelectedListForSend(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Choose a list...</option>
                      {contactLists.map(list => (
                        <option key={list.id} value={list.id}>
                          {list.name} ({list.member_count} contacts)
                        </option>
                      ))}
                    </select>
                    {sendMode === 'list' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Use placeholders: [Name], [Company], [Role]
                      </p>
                    )}
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Subject</label>
                  <Input
                    placeholder="Email subject"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Message</label>
                  <Textarea
                    placeholder="Write your message here..."
                    rows={8}
                    value={emailForm.body}
                    onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Attachments</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        <button onClick={() => removeAttachment(idx)}>
                          <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Add Attachment
                  </Button>
                </div>

                {/* Options */}
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={emailForm.useHtmlTemplate}
                      onChange={(e) => setEmailForm({ ...emailForm, useHtmlTemplate: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Use HTML template</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Schedule for later</span>
                  </label>

                  {isScheduled && (
                    <Input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="w-auto"
                    />
                  )}
                </div>

                {/* Send Button */}
                <Button
                  onClick={sendMode === 'single' ? sendSingleEmail : sendMassEmail}
                  disabled={emailSending || massEmailProgress.sending}
                  className="w-full"
                >
                  {emailSending || massEmailProgress.sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : isScheduled ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Email
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send {sendMode === 'list' ? 'to List' : 'Email'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Contacts ({contacts.length})</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                    <Button size="sm" onClick={() => setIsAddContactModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <p className="text-center py-8">Loading contacts...</p>
                ) : contacts.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No contacts yet. Add or import contacts to get started.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Email</th>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Company</th>
                          <th className="text-left py-3 px-4">Role</th>
                          <th className="text-right py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact) => (
                          <tr key={contact.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{contact.email}</td>
                            <td className="py-3 px-4">{contact.name || '-'}</td>
                            <td className="py-3 px-4">{contact.company || '-'}</td>
                            <td className="py-3 px-4">{contact.role || '-'}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEmailForm({ ...emailForm, to: contact.email })
                                    setSendMode('single')
                                    setActiveTab('compose')
                                  }}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteContactMutation.mutate(contact.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lists Tab */}
          {activeTab === 'lists' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <List className="h-5 w-5" />
                    <span>Contact Lists ({contactLists.length})</span>
                  </CardTitle>
                  <Button size="sm" onClick={() => setIsCreateListModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {listsLoading ? (
                  <p className="text-center py-8">Loading lists...</p>
                ) : contactLists.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No lists yet. Create a list to organize your contacts.</p>
                ) : (
                  <div className="space-y-4">
                    {contactLists.map((list) => (
                      <div
                        key={list.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{list.name}</h3>
                          <p className="text-sm text-gray-600">{list.description || 'No description'}</p>
                          <p className="text-xs text-gray-500 mt-1">{list.member_count} contacts</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedListForSend(list.id)
                              setSendMode('list')
                              setActiveTab('compose')
                            }}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Send Email
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteListMutation.mutate(list.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scheduled Tab */}
          {activeTab === 'scheduled' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Scheduled Emails ({scheduledEmails.length})</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => refetchScheduled()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {scheduledLoading ? (
                  <p className="text-center py-8">Loading scheduled emails...</p>
                ) : scheduledEmails.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No scheduled emails.</p>
                ) : (
                  <div className="space-y-4">
                    {scheduledEmails.map((email) => (
                      <div
                        key={email.id}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{email.subject}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            To: {email.recipient_email || `List: ${email.contact_lists?.name || 'Unknown'}`}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(email.scheduled_at).toLocaleString()}
                            </span>
                            <Badge variant={email.status === 'pending' ? 'secondary' : 'default'}>
                              {email.status}
                            </Badge>
                          </div>
                        </div>
                        {email.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelScheduledMutation.mutate(email.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>Sent Emails ({sentEmails.length})</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => refetchSent()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sentLoading ? (
                  <p className="text-center py-8">Loading sent emails...</p>
                ) : sentEmails.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No emails sent yet.</p>
                ) : (
                  <div className="space-y-4">
                    {sentEmails.map((email) => (
                      <div
                        key={email.id}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{email.subject}</h3>
                            <p className="text-sm text-gray-600">To: {email.recipient_email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {email.attachment_count > 0 && (
                              <Badge variant="secondary">
                                <Paperclip className="h-3 w-3 mr-1" />
                                {email.attachment_count}
                              </Badge>
                            )}
                            <Badge variant={email.status === 'sent' ? 'success' : 'destructive'}>
                              {email.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(email.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Add Contact Modal */}
          <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contact</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!newContact.email) return
                  addContactMutation.mutate(newContact)
                }}
                className="space-y-4 mt-4"
              >
                <div>
                  <label className="text-sm font-medium mb-1 block">Email *</label>
                  <Input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <Input
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Company</label>
                    <Input
                      value={newContact.company}
                      onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Role</label>
                    <Input
                      value={newContact.role}
                      onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone</label>
                    <Input
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notes</label>
                  <Textarea
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={addContactMutation.isPending}>
                  {addContactMutation.isPending ? 'Adding...' : 'Add Contact'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Create List Modal */}
          <Dialog open={isCreateListModalOpen} onOpenChange={setIsCreateListModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Contact List</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!newList.name) return
                  createListMutation.mutate(newList)
                }}
                className="space-y-4 mt-4"
              >
                <div>
                  <label className="text-sm font-medium mb-1 block">List Name *</label>
                  <Input
                    value={newList.name}
                    onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea
                    value={newList.description}
                    onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createListMutation.isPending}>
                  {createListMutation.isPending ? 'Creating...' : 'Create List'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Import CSV Modal */}
          <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Contacts from CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-gray-600">
                  Upload a CSV file with columns for email (required), name, company, and role.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-4">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#35c677] file:text-white hover:file:bg-[#2aa35f]"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Example CSV format: email,name,company,role
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
    </div>
  )
}

export default AdminMarketingEmail
