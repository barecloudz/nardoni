import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// You'll need to provide your Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables')
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client with service role key (has elevated permissions)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createAdminUser() {
  console.log('=== Create Admin User ===\n')

  const email = await question('Enter admin email: ')
  const password = await question('Enter admin password (min 6 characters): ')
  const name = await question('Enter admin name (optional): ')

  if (!email || !password) {
    console.error('\nError: Email and password are required')
    rl.close()
    return
  }

  if (password.length < 6) {
    console.error('\nError: Password must be at least 6 characters')
    rl.close()
    return
  }

  console.log('\nCreating admin user...')

  try {
    // Create the user with admin role in metadata
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'admin',
        name: name || email.split('@')[0]
      }
    })

    if (error) {
      console.error('\nError creating admin user:', error.message)
      rl.close()
      return
    }

    console.log('\n✓ Admin user created successfully!')
    console.log('\nCredentials:')
    console.log('Email:', email)
    console.log('Password:', '********')
    console.log('Role: admin')
    console.log('\nYou can now login at your application.')

  } catch (err) {
    console.error('\nUnexpected error:', err)
  }

  rl.close()
}

createAdminUser()
