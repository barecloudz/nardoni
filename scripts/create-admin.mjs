import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// Load environment variables from .env file if it exists
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Error: Missing Supabase environment variables\n')
  console.error('You need to set these environment variables:')
  console.error('  VITE_SUPABASE_URL - Your Supabase project URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key\n')
  console.error('You can find these in your Supabase project settings under API.\n')
  console.error('Set them by running:')
  console.error('  Windows: set VITE_SUPABASE_URL=your_url && set SUPABASE_SERVICE_ROLE_KEY=your_key && node scripts/create-admin.mjs')
  console.error('  Mac/Linux: VITE_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/create-admin.mjs\n')
  process.exit(1)
}

// Create admin client with service role key
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

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createAdminUser() {
  console.log('\n=== Create Admin User ===\n')

  const email = await question('Enter admin email: ')
  const password = await question('Enter admin password (min 6 characters): ')
  const name = await question('Enter admin name (optional): ')

  if (!email || !password) {
    console.error('\n❌ Error: Email and password are required')
    rl.close()
    return
  }

  if (password.length < 6) {
    console.error('\n❌ Error: Password must be at least 6 characters')
    rl.close()
    return
  }

  console.log('\n⏳ Creating admin user...')

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: name || email.split('@')[0]
      }
    })

    if (error) {
      console.error('\n❌ Error creating admin user:', error.message)
      rl.close()
      return
    }

    console.log('\n✅ Admin user created successfully!\n')
    console.log('Credentials:')
    console.log('  Email:', email)
    console.log('  Role: admin\n')
    console.log('You can now login to your application.\n')

  } catch (err) {
    console.error('\n❌ Unexpected error:', err.message)
  }

  rl.close()
}

createAdminUser()
