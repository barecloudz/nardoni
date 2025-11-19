import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Admin client for user management (requires service role key in production)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined // Disable email confirmation for demo
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Database helpers
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const insertClient = async (clientData: {
  name: string
  email: string
  company: string
  phone?: string
  industry: string
  website?: string
  status?: string
}) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single()
  
  return { data, error }
}

export const updateClient = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const deleteClient = async (id: string) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  
  return { error }
}

export const getMarketingPlans = async () => {
  const { data, error } = await supabase
    .from('marketing_plans')
    .select(`
      *,
      clients (
        name,
        company
      )
    `)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// Default company settings type and fallback
type CompanySettings = {
  id: string
  company_name: string
  company_address: string
  phone: string
  email: string
  website: string
  description: string
  social_instagram: string | null
  social_facebook: string | null
  social_linkedin: string | null
  social_youtube: string | null
  created_at: string
  updated_at: string
}

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  id: 'default',
  company_name: 'Nardoni Digital',
  company_address: 'Hendersonville, NC',
  phone: '(803) 977-4285',
  email: 'info@NardoniDigital.com',
  website: 'https://www.barecloudz.com',
  description: 'Professional marketing for modern businesses',
  social_instagram: null,
  social_facebook: null,
  social_linkedin: null,
  social_youtube: 'https://youtube.com/@barecloudz',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Company Settings helpers
export const getCompanySettings = async (): Promise<CompanySettings> => {
  // Return default settings since table doesn't exist yet
  return DEFAULT_COMPANY_SETTINGS
}

export const updateCompanySettings = async (settings: {
  company_name: string
  company_address: string
  phone: string
  email: string
  website: string
  description: string
  social_instagram?: string
  social_facebook?: string
  social_linkedin?: string
  social_youtube?: string
}) => {
  // Return success with default settings since table doesn't exist yet
  console.warn('Company settings table not available, changes not saved')
  return { 
    data: { ...DEFAULT_COMPANY_SETTINGS, ...settings }, 
    error: null 
  }
}

export const createMarketingPlan = async (planData: {
  title: string
  description: string
  content?: string
  business_type: string
  industry: string
  target_audience: string
  budget: number
  goals: string[]
  channels: string[]
  client_id: string
}) => {
  const { data, error } = await supabase
    .from('marketing_plans')
    .insert([planData])
    .select()
    .single()
  
  return { data, error }
}

export const getInvoices = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (
        name,
        company
      ),
      invoice_items (*)
    `)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const createInvoice = async (invoiceData: {
  number: string
  client_id: string
  amount: number
  due_date: string
  status?: string
}) => {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoiceData])
    .select()
    .single()
  
  return { data, error }
}

export const getBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, content, featured_image, status, author_id, created_at, updated_at')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const getPublishedBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image, created_at, author_id')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const getBlogPostBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  
  return { data, error }
}

export const getContacts = async () => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const createContact = async (contactData: {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
}) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert([contactData])
    .select()
    .single()
  
  return { data, error }
}

export const getDocuments = async () => {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      clients (
        name,
        company
      )
    `)
    .order('created_at', { ascending: false })
  
  return { data, error }
}