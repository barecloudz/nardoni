import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/layout/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
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
  List,
  History,
  RefreshCw,
  Inbox,
  Reply,
  Archive,
  ChevronLeft,
  Eye,
  MoreVertical,
  Search
} from 'lucide-react'

interface MarketingContact {
  id: number
  email: string
  name: string | null
  company: string | null
  role: string | null
  phone: string | null
  city: string | null
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
  message_id: string | null
  in_reply_to: string | null
  references: string | null
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
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [replySending, setReplySending] = useState(false)

  // History state
  const [selectedSentEmail, setSelectedSentEmail] = useState<SentEmail | null>(null)

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
  const [importTargetListId, setImportTargetListId] = useState<number | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [viewingList, setViewingList] = useState<ContactList | null>(null)
  const [listMembers, setListMembers] = useState<MarketingContact[]>([])
  const [listMembersLoading, setListMembersLoading] = useState(false)

  // New contact form
  const [newContact, setNewContact] = useState({
    email: '',
    name: '',
    company: '',
    role: '',
    phone: '',
    city: '',
    notes: ''
  })

  // New list form
  const [newList, setNewList] = useState({
    name: '',
    description: ''
  })

  // Fetch marketing contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
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
  const { data: contactLists = [], isLoading: listsLoading } = useQuery({
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
        .limit(100)
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
      setNewContact({ email: '', name: '', company: '', role: '', phone: '', city: '', notes: '' })
      showSuccess('Contact added successfully')
    },
    onError: (error: any) => {
      setEmailError(error.message || 'Failed to add contact')
    }
  })

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('marketing_contacts').delete().eq('id', id)
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
      showSuccess('List created successfully')
    }
  })

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('contact_lists').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] })
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
      showSuccess('Scheduled email cancelled')
    }
  })

  // Mark inbox email as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('received_emails').update({ is_read: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-emails'] })
    }
  })

  // Archive inbox email
  const archiveEmailMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('received_emails').update({ is_archived: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-emails'] })
      setSelectedInboxEmail(null)
      showSuccess('Email archived')
    }
  })

  // Delete inbox email
  const deleteInboxEmailMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('received_emails').delete().eq('id', id)
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

  // View list details
  const viewList = async (list: ContactList) => {
    setViewingList(list)
    setListMembersLoading(true)
    const members = await loadListContacts(list.id)
    setListMembers(members)
    setListMembersLoading(false)
  }

  // Remove contact from list
  const removeFromList = async (contactId: number) => {
    if (!viewingList) return
    await supabase
      .from('contact_list_members')
      .delete()
      .eq('list_id', viewingList.id)
      .eq('contact_id', contactId)

    setListMembers(prev => prev.filter(c => c.id !== contactId))

    // Update list count
    await supabase
      .from('contact_lists')
      .update({ member_count: listMembers.length - 1 })
      .eq('id', viewingList.id)

    queryClient.invalidateQueries({ queryKey: ['contact-lists'] })
  }

  const showSuccess = (msg: string) => {
    setEmailSuccess(msg)
    setTimeout(() => setEmailSuccess(''), 3000)
  }

  // Replace placeholders in text (case-insensitive)
  const replacePlaceholders = (text: string, contact: MarketingContact): string => {
    return text
      .replace(/\[name\]/gi, (contact.name || 'there').split(' ')[0])
      .replace(/\[fullname\]/gi, contact.name || '')
      .replace(/\[company\]/gi, contact.company || '')
      .replace(/\[role\]/gi, contact.role || '')
      .replace(/\[city\]/gi, contact.city || '')
      .replace(/\[email\]/gi, contact.email || '')
      .replace(/\[phone\]/gi, contact.phone || '')
  }

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // Send reply to email
  const sendReply = async () => {
    if (!selectedInboxEmail || !replyBody.trim()) return

    setReplySending(true)
    setEmailError('')

    try {
      const response = await fetch('/.netlify/functions/send-marketing-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedInboxEmail.from_email,
          subject: selectedInboxEmail.subject?.startsWith('Re:')
            ? selectedInboxEmail.subject
            : `Re: ${selectedInboxEmail.subject || ''}`,
          body: replyBody,
          useHtmlTemplate: false,
          replyToMessageId: selectedInboxEmail.message_id,
          references: selectedInboxEmail.references
            ? `${selectedInboxEmail.references} ${selectedInboxEmail.message_id}`
            : selectedInboxEmail.message_id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reply')
      }

      // Log to sent_emails
      await supabase.from('sent_emails').insert([{
        recipient_email: selectedInboxEmail.from_email,
        subject: selectedInboxEmail.subject?.startsWith('Re:')
          ? selectedInboxEmail.subject
          : `Re: ${selectedInboxEmail.subject || ''}`,
        body: replyBody,
        used_html_template: false,
        attachment_count: 0,
        attachment_names: [],
        status: 'sent',
        resend_id: result.id
      }])

      queryClient.invalidateQueries({ queryKey: ['sent-emails'] })
      setReplyBody('')
      setShowReplyBox(false)
      showSuccess('Reply sent successfully!')
    } catch (error: any) {
      setEmailError(error.message || 'Failed to send reply')
    } finally {
      setReplySending(false)
    }
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
            recipient_email: emailForm.to,
            subject: emailForm.subject,
            body: emailForm.body,
            use_html_template: emailForm.useHtmlTemplate,
            attachment_urls: attachmentUrls,
            scheduled_at: new Date(scheduledDateTime).toISOString(),
            status: 'pending'
          }])

        if (error) throw error

        showSuccess('Email scheduled successfully!')
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

        showSuccess('Email sent successfully!')
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
        showSuccess(`Email scheduled for ${listContacts.length} contacts!`)
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
        const personalizedSubject = replacePlaceholders(emailForm.subject, contact)
        const personalizedBody = replacePlaceholders(emailForm.body, contact)

        const response = await fetch('/.netlify/functions/send-marketing-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: contact.email,
            subject: personalizedSubject,
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
            subject: personalizedSubject,
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
      showSuccess(`Successfully sent ${successCount} emails!`)
    } else {
      showSuccess(`Sent ${successCount} emails. ${failCount} failed.`)
    }
  }

  // Import CSV
  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportLoading(true)
    setEmailError('')

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim())

      const emailIdx = headers.findIndex(h => h.includes('email'))
      const nameIdx = headers.findIndex(h => h.includes('name') && !h.includes('company'))
      const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('organization') || h.includes('business'))
      const roleIdx = headers.findIndex(h => h.includes('role') || h.includes('title') || h.includes('position') || h.includes('job'))
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('tel'))
      const cityIdx = headers.findIndex(h => h.includes('city') || h.includes('location') || h.includes('town'))

      if (emailIdx === -1) {
        setEmailError('CSV must have an email column')
        setImportLoading(false)
        return
      }

      const contactsToImport = []
      for (let i = 1; i < lines.length; i++) {
        // Handle CSV values with commas inside quotes
        const values: string[] = []
        let current = ''
        let inQuotes = false
        for (const char of lines[i]) {
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''))
            current = ''
          } else {
            current += char
          }
        }
        values.push(current.trim().replace(/^"|"$/g, ''))

        const email = values[emailIdx]?.toLowerCase().trim()
        if (email && email.includes('@')) {
          contactsToImport.push({
            email,
            name: nameIdx !== -1 ? values[nameIdx] || null : null,
            company: companyIdx !== -1 ? values[companyIdx] || null : null,
            role: roleIdx !== -1 ? values[roleIdx] || null : null,
            phone: phoneIdx !== -1 ? values[phoneIdx] || null : null,
            city: cityIdx !== -1 ? values[cityIdx] || null : null
          })
        }
      }

      if (contactsToImport.length === 0) {
        setEmailError('No valid contacts found in CSV')
        setImportLoading(false)
        return
      }

      // Insert contacts
      const { data: insertedContacts, error } = await supabase
        .from('marketing_contacts')
        .upsert(contactsToImport, { onConflict: 'email' })
        .select()

      if (error) {
        setEmailError('Error importing contacts: ' + error.message)
        setImportLoading(false)
        return
      }

      // If a list is selected, add contacts to the list
      if (importTargetListId) {
        // Get all contact IDs (need to fetch them since upsert might not return all)
        const emails = contactsToImport.map(c => c.email)
        const { data: contactsData } = await supabase
          .from('marketing_contacts')
          .select('id, email')
          .in('email', emails)

        if (contactsData && contactsData.length > 0) {
          // Add to list members
          const listMembers = contactsData.map(contact => ({
            list_id: importTargetListId,
            contact_id: contact.id
          }))

          await supabase
            .from('contact_list_members')
            .upsert(listMembers, { onConflict: 'list_id,contact_id', ignoreDuplicates: true })

          // Update list member count
          await supabase
            .from('contact_lists')
            .update({ member_count: contactsData.length })
            .eq('id', importTargetListId)

          queryClient.invalidateQueries({ queryKey: ['contact-lists'] })
          showSuccess(`Imported ${contactsToImport.length} contacts to list!`)
        }
      } else {
        showSuccess(`Imported ${contactsToImport.length} contacts!`)
      }

      queryClient.invalidateQueries({ queryKey: ['marketing-contacts'] })
      setIsImportModalOpen(false)
      setImportTargetListId(null)

      // Reset file input
      e.target.value = ''
    } catch (err: any) {
      setEmailError('Error processing file: ' + err.message)
    } finally {
      setImportLoading(false)
    }
  }

  const tabs = [
    { id: 'inbox' as TabType, label: 'Inbox', icon: Inbox, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'compose' as TabType, label: 'Compose', icon: Mail },
    { id: 'history' as TabType, label: 'Sent', icon: History, badge: null },
    { id: 'scheduled' as TabType, label: 'Scheduled', icon: Clock, badge: scheduledEmails.length > 0 ? scheduledEmails.length : null },
    { id: 'contacts' as TabType, label: 'Contacts', icon: Users },
    { id: 'lists' as TabType, label: 'Lists', icon: List }
  ]

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 flex flex-col overflow-hidden pt-16 lg:pt-0">
        {/* Header */}
        <div className="bg-white border-b px-4 lg:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Email</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Manage your marketing emails</p>
            </div>
            {emailSuccess && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                <CheckCircle className="h-4 w-4" />
                {emailSuccess}
              </div>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {emailError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 text-sm">
              <XCircle className="h-4 w-4" />
              {emailError}
            </div>
            <button onClick={() => setEmailError('')}>
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}

        {/* Mass Email Progress */}
        {massEmailProgress.sending && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
            <div className="flex items-center justify-between mb-2 text-sm text-blue-700">
              <span>Sending emails...</span>
              <span>{massEmailProgress.current} / {massEmailProgress.total}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${(massEmailProgress.current / massEmailProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white border-b px-2 lg:px-4 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSelectedInboxEmail(null)
                    setSelectedSentEmail(null)
                  }}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#35c677] text-[#35c677]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && (
                    <Badge variant={tab.id === 'inbox' ? 'destructive' : 'secondary'} className="h-5 min-w-[20px] text-xs">
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* INBOX TAB */}
          {activeTab === 'inbox' && (
            <div className="h-full flex">
              {/* Email List */}
              <div className={`${selectedInboxEmail ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 xl:w-96 border-r bg-white`}>
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {receivedEmails.length} messages
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => refetchInbox()} className="h-8 w-8 p-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {inboxLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : receivedEmails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500 p-4">
                      <Inbox className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-sm">No emails yet</p>
                    </div>
                  ) : (
                    receivedEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => {
                          setSelectedInboxEmail(email)
                          setShowReplyBox(false)
                          setReplyBody('')
                          if (!email.is_read) markAsReadMutation.mutate(email.id)
                        }}
                        className={`p-4 border-b cursor-pointer transition-colors ${
                          selectedInboxEmail?.id === email.id
                            ? 'bg-[#35c677]/10'
                            : !email.is_read
                              ? 'bg-blue-50 hover:bg-blue-100'
                              : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#35c677] to-[#2aa35f] flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                            {(email.from_name || email.from_email).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm truncate ${!email.is_read ? 'font-semibold' : ''}`}>
                                {email.from_name || email.from_email.split('@')[0]}
                              </span>
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {formatDate(email.received_at)}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${!email.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                              {email.subject || '(No subject)'}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {email.body_text?.substring(0, 60) || 'No preview'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Email Detail / Reply */}
              <div className={`${selectedInboxEmail ? 'flex' : 'hidden lg:flex'} flex-col flex-1 bg-white`}>
                {selectedInboxEmail ? (
                  <>
                    {/* Back button (mobile) */}
                    <div className="lg:hidden p-3 border-b">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedInboxEmail(null)}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                    </div>

                    {/* Email Header */}
                    <div className="p-4 lg:p-6 border-b">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="hidden sm:flex w-12 h-12 rounded-full bg-gradient-to-br from-[#35c677] to-[#2aa35f] items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            {(selectedInboxEmail.from_name || selectedInboxEmail.from_email).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-gray-900 break-words">
                              {selectedInboxEmail.subject || '(No subject)'}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-600 mt-1">
                              <span className="font-medium">{selectedInboxEmail.from_name || 'Unknown'}</span>
                              <span className="text-gray-400">&lt;{selectedInboxEmail.from_email}&gt;</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(selectedInboxEmail.received_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() => setShowReplyBox(!showReplyBox)}
                            className="bg-[#35c677] hover:bg-[#2aa35f]"
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Reply</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => archiveEmailMutation.mutate(selectedInboxEmail.id)}>
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteInboxEmailMutation.mutate(selectedInboxEmail.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                      {selectedInboxEmail.body_html ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: selectedInboxEmail.body_html }}
                          className="prose prose-sm max-w-none [&_img]:max-w-full"
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                          {selectedInboxEmail.body_text}
                        </pre>
                      )}
                    </div>

                    {/* Reply Box */}
                    <AnimatePresence>
                      {showReplyBox && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t bg-gray-50"
                        >
                          <div className="p-4">
                            <div className="mb-3 text-sm text-gray-600">
                              Replying to <span className="font-medium">{selectedInboxEmail.from_email}</span>
                            </div>
                            <Textarea
                              placeholder="Write your reply..."
                              rows={4}
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              className="mb-3"
                            />
                            <div className="flex items-center justify-between">
                              <Button variant="ghost" size="sm" onClick={() => setShowReplyBox(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={sendReply}
                                disabled={replySending || !replyBody.trim()}
                                className="bg-[#35c677] hover:bg-[#2aa35f]"
                              >
                                {replySending ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Reply
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Select an email to read</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COMPOSE TAB */}
          {activeTab === 'compose' && (
            <div className="h-full overflow-y-auto p-4 lg:p-6">
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      New Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Send Mode */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={sendMode === 'single' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSendMode('single')}
                        className={sendMode === 'single' ? 'bg-[#35c677] hover:bg-[#2aa35f]' : ''}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Single
                      </Button>
                      <Button
                        type="button"
                        variant={sendMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSendMode('list')}
                        className={sendMode === 'list' ? 'bg-[#35c677] hover:bg-[#2aa35f]' : ''}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        List
                      </Button>
                    </div>

                    {/* Recipient */}
                    {sendMode === 'single' ? (
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">To</label>
                        <Input
                          type="email"
                          placeholder="recipient@example.com"
                          value={emailForm.to}
                          onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Select List</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                        <p className="text-xs text-gray-500 mt-1">Placeholders available: [name], [company], [city], [role]</p>
                      </div>
                    )}

                    {/* Subject */}
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Subject</label>
                      <Input
                        placeholder={sendMode === 'list' ? "Problem with [company]'s ranking in [city]" : "Email subject"}
                        value={emailForm.subject}
                        onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                      />
                      {sendMode === 'list' && (
                        <p className="text-xs text-gray-500 mt-1">Use placeholders: [name], [company], [city], [role]</p>
                      )}
                    </div>

                    {/* Body */}
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Message</label>
                      <Textarea
                        placeholder={sendMode === 'list' ? "Hi [name],\n\nI was looking at [company] and noticed..." : "Write your message..."}
                        rows={10}
                        value={emailForm.body}
                        onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                      />
                      {sendMode === 'list' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Placeholders: [name] (first name), [fullname], [company], [city], [role], [email], [phone]
                        </p>
                      )}
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Attachments</label>
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded text-sm">
                              <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                              <span className="truncate max-w-[150px]">{file.name}</span>
                              <button onClick={() => removeAttachment(idx)}>
                                <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-4 w-4 mr-2" />
                        Add Attachment
                      </Button>
                    </div>

                    {/* Options */}
                    <div className="flex flex-wrap gap-4 items-center pt-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={emailForm.useHtmlTemplate}
                          onChange={(e) => setEmailForm({ ...emailForm, useHtmlTemplate: e.target.checked })}
                          className="rounded"
                        />
                        HTML template
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isScheduled}
                          onChange={(e) => setIsScheduled(e.target.checked)}
                          className="rounded"
                        />
                        Schedule
                      </label>
                      {isScheduled && (
                        <Input
                          type="datetime-local"
                          value={scheduledDateTime}
                          onChange={(e) => setScheduledDateTime(e.target.value)}
                          className="w-auto text-sm"
                        />
                      )}
                    </div>

                    {/* Send */}
                    <Button
                      onClick={sendMode === 'single' ? sendSingleEmail : sendMassEmail}
                      disabled={emailSending || massEmailProgress.sending}
                      className="w-full bg-[#35c677] hover:bg-[#2aa35f]"
                    >
                      {emailSending || massEmailProgress.sending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : isScheduled ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Schedule
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send {sendMode === 'list' ? 'to List' : ''}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* HISTORY (SENT) TAB */}
          {activeTab === 'history' && (
            <div className="h-full flex">
              {/* Sent List */}
              <div className={`${selectedSentEmail ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 xl:w-96 border-r bg-white`}>
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{sentEmails.length} sent</span>
                  <Button variant="ghost" size="sm" onClick={() => refetchSent()} className="h-8 w-8 p-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {sentLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : sentEmails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500 p-4">
                      <Send className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-sm">No sent emails</p>
                    </div>
                  ) : (
                    sentEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => setSelectedSentEmail(email)}
                        className={`p-4 border-b cursor-pointer transition-colors ${
                          selectedSentEmail?.id === email.id ? 'bg-[#35c677]/10' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
                            {email.recipient_email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium truncate">
                                To: {email.recipient_email.split('@')[0]}
                              </span>
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {formatDate(email.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{email.subject}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {email.attachment_count > 0 && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  {email.attachment_count}
                                </span>
                              )}
                              <Badge variant={email.status === 'sent' ? 'default' : 'destructive'} className="text-xs h-5">
                                {email.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sent Detail */}
              <div className={`${selectedSentEmail ? 'flex' : 'hidden lg:flex'} flex-col flex-1 bg-white`}>
                {selectedSentEmail ? (
                  <>
                    <div className="lg:hidden p-3 border-b">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedSentEmail(null)}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                    </div>
                    <div className="p-4 lg:p-6 border-b">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">{selectedSentEmail.subject}</h2>
                          <p className="text-sm text-gray-600 mt-1">To: {selectedSentEmail.recipient_email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Sent {new Date(selectedSentEmail.created_at).toLocaleString()}
                          </p>
                          {selectedSentEmail.attachment_count > 0 && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <Paperclip className="h-3.5 w-3.5" />
                              {selectedSentEmail.attachment_names?.join(', ')}
                            </div>
                          )}
                        </div>
                        <Badge variant={selectedSentEmail.status === 'sent' ? 'default' : 'destructive'}>
                          {selectedSentEmail.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                          {selectedSentEmail.body}
                        </pre>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Send className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Select an email to view</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCHEDULED TAB */}
          {activeTab === 'scheduled' && (
            <div className="h-full overflow-y-auto p-4 lg:p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Scheduled Emails</h2>
                  <Button variant="outline" size="sm" onClick={() => refetchScheduled()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                {scheduledLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : scheduledEmails.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      <Clock className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p>No scheduled emails</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {scheduledEmails.map((email) => (
                      <Card key={email.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="font-medium truncate">{email.subject}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                To: {email.recipient_email || `List: ${email.contact_lists?.name}`}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(email.scheduled_at).toLocaleString()}
                                </span>
                                <Badge variant="secondary">{email.status}</Badge>
                              </div>
                            </div>
                            {email.status === 'pending' && (
                              <Button variant="outline" size="sm" onClick={() => cancelScheduledMutation.mutate(email.id)}>
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTACTS TAB */}
          {activeTab === 'contacts' && (
            <div className="h-full overflow-y-auto p-4 lg:p-6">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold">{contacts.length} Contacts</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button size="sm" onClick={() => setIsAddContactModalOpen(true)} className="bg-[#35c677] hover:bg-[#2aa35f]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                {contactsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : contacts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p>No contacts yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium">Email</th>
                            <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Name</th>
                            <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Company</th>
                            <th className="text-right py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contacts.map((contact) => (
                            <tr key={contact.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>{contact.email}</div>
                                <div className="sm:hidden text-xs text-gray-500">{contact.name || '-'}</div>
                              </td>
                              <td className="py-3 px-4 hidden sm:table-cell">{contact.name || '-'}</td>
                              <td className="py-3 px-4 hidden md:table-cell">{contact.company || '-'}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
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
                                  <Button variant="outline" size="sm" onClick={() => deleteContactMutation.mutate(contact.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* LISTS TAB */}
          {activeTab === 'lists' && (
            <div className="h-full overflow-y-auto p-4 lg:p-6">
              <div className="max-w-4xl mx-auto">
                {viewingList ? (
                  // List Detail View
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setViewingList(null)}>
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Back
                        </Button>
                        <div>
                          <h2 className="text-lg font-semibold">{viewingList.name}</h2>
                          <p className="text-sm text-gray-500">{listMembers.length} contacts</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImportTargetListId(viewingList.id)
                            setIsImportModalOpen(true)
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Import CSV
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedListForSend(viewingList.id)
                            setSendMode('list')
                            setActiveTab('compose')
                          }}
                          className="bg-[#35c677] hover:bg-[#2aa35f]"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email List
                        </Button>
                      </div>
                    </div>

                    {listMembersLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    ) : listMembers.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center text-gray-500">
                          <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                          <p className="mb-4">No contacts in this list yet</p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setImportTargetListId(viewingList.id)
                              setIsImportModalOpen(true)
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Import from CSV
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="text-left py-3 px-4 font-medium">Email</th>
                                <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Name</th>
                                <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Company</th>
                                <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">City</th>
                                <th className="text-right py-3 px-4 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {listMembers.map((contact) => (
                                <tr key={contact.id} className="border-b hover:bg-gray-50">
                                  <td className="py-3 px-4">
                                    <div>{contact.email}</div>
                                    <div className="sm:hidden text-xs text-gray-500">{contact.name || '-'}</div>
                                  </td>
                                  <td className="py-3 px-4 hidden sm:table-cell">{contact.name || '-'}</td>
                                  <td className="py-3 px-4 hidden md:table-cell">{contact.company || '-'}</td>
                                  <td className="py-3 px-4 hidden lg:table-cell">{contact.city || '-'}</td>
                                  <td className="py-3 px-4 text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeFromList(contact.id)}
                                      className="text-red-500 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}
                  </>
                ) : (
                  // Lists Overview
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">{contactLists.length} Lists</h2>
                      <Button size="sm" onClick={() => setIsCreateListModalOpen(true)} className="bg-[#35c677] hover:bg-[#2aa35f]">
                        <Plus className="h-4 w-4 mr-2" />
                        Create
                      </Button>
                    </div>
                    {listsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    ) : contactLists.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center text-gray-500">
                          <List className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                          <p>No lists yet</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {contactLists.map((list) => (
                          <Card key={list.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => viewList(list)}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <h3 className="font-medium">{list.name}</h3>
                                  <p className="text-sm text-gray-500">{list.description || 'No description'}</p>
                                  <p className="text-xs text-gray-400 mt-1">{list.member_count} contacts</p>
                                </div>
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                                    <span className="hidden sm:inline">Email</span>
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => deleteListMutation.mutate(list.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODALS */}
        {/* Add Contact Modal */}
        <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
          <DialogContent className="max-w-md">
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
                <label className="text-sm font-medium mb-1.5 block">Email *</label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Name</label>
                  <Input
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Company</label>
                  <Input
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Role</label>
                  <Input
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">City</label>
                  <Input
                    value={newContact.city}
                    onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone</label>
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-[#35c677] hover:bg-[#2aa35f]" disabled={addContactMutation.isPending}>
                {addContactMutation.isPending ? 'Adding...' : 'Add Contact'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create List Modal */}
        <Dialog open={isCreateListModalOpen} onOpenChange={setIsCreateListModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create List</DialogTitle>
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
                <label className="text-sm font-medium mb-1.5 block">Name *</label>
                <Input
                  value={newList.name}
                  onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea
                  value={newList.description}
                  onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                  rows={2}
                />
              </div>
              <Button type="submit" className="w-full bg-[#35c677] hover:bg-[#2aa35f]" disabled={createListMutation.isPending}>
                {createListMutation.isPending ? 'Creating...' : 'Create List'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Import Modal */}
        <Dialog open={isImportModalOpen} onOpenChange={(open) => {
          setIsImportModalOpen(open)
          if (!open) setImportTargetListId(null)
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import Contacts from Spreadsheet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-600">
                Upload a CSV or Excel export. We'll automatically detect columns for email, name, company, role, and phone.
              </p>

              {/* List selector */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Add to List (optional)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={importTargetListId || ''}
                  onChange={(e) => setImportTargetListId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Just add to contacts</option>
                  {contactLists.map(list => (
                    <option key={list.id} value={list.id}>
                      {list.name} ({list.member_count} contacts)
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                {importLoading ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Importing...
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleCSVImport}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#35c677] file:text-white hover:file:bg-[#2aa35f] cursor-pointer"
                  />
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Supported columns:</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                  <span>email (required)</span>
                  <span>name</span>
                  <span>company / organization</span>
                  <span>role / title / position</span>
                  <span>city / location</span>
                  <span>phone</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default AdminMarketingEmail
