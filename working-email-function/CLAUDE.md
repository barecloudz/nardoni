# Marketing Email System - Integration Guide

## Overview
This is a complete marketing email system with:
- Single email sending
- Mass email to contact lists
- Email scheduling (sends automatically at scheduled time)
- Contact management with CSV import
- Attachment support (including large files via Supabase storage)

## Architecture

```
Frontend (React)          Netlify Functions           External Services
     │                          │                           │
     ├─► Send Email ──────────► send-marketing-email.js ──► Resend API
     │                          │                           │
     ├─► Schedule Email ──────► Supabase (scheduled_emails table)
     │                          │                           │
     │                   process-scheduled-emails.js ◄───── Runs every 5 min
     │                          │                           │
     └─► Upload Attachments ──► Supabase Storage (marketing bucket)
```

## Files Included

### 1. Netlify Functions (`/netlify-functions/`)
- `send-marketing-email.js` - Sends emails via Resend API
- `process-scheduled-emails.js` - Cron job that sends scheduled emails

### 2. Database Setup (`/sql/`)
- `setup-database.sql` - Creates all required tables in Supabase

### 3. Frontend Code (`/frontend/`)
- `email-functions.js` - React state and functions to copy into your admin component
- `email-ui-components.jsx` - UI components for the email system

## Setup Instructions

### Step 1: Database
1. Go to Supabase SQL Editor
2. Run the entire contents of `sql/setup-database.sql`

### Step 2: Storage Bucket
1. Go to Supabase > Storage
2. Create a new bucket called `marketing`
3. Make it a PUBLIC bucket
4. Run the storage policies from the SQL file

### Step 3: Netlify Functions
1. Copy both files from `/netlify-functions/` to your project's `netlify/functions/` folder
2. Make sure your `netlify.toml` has:
```toml
[functions]
  directory = "netlify/functions"
```

### Step 4: Environment Variables
Add these to Netlify (Site Settings > Environment Variables):
```
RESEND_API_KEY=re_xxxxxxxxxx
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

### Step 5: Resend Setup
1. Go to https://resend.com and create an account
2. Add your domain and verify it
3. Create an API key and add it to Netlify env vars
4. Update the "from" email in `send-marketing-email.js` to match your verified domain

### Step 6: Frontend Integration
1. Copy the state variables from `email-functions.js` into your React component
2. Copy the functions (loadContacts, sendMassEmail, etc.)
3. Copy the UI components from `email-ui-components.jsx`

## Key Features

### Sending Emails
```javascript
// Single email
await fetch('/.netlify/functions/send-marketing-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Hello',
    body: 'Email content here',
    attachments: [], // base64 encoded for small files
    attachmentUrls: [], // Supabase URLs for large files (>500KB)
    useHtmlTemplate: false
  })
});
```

### Scheduling Emails
```javascript
// Save to scheduled_emails table
await supabase.from('scheduled_emails').insert({
  recipient_email: 'test@example.com', // OR
  recipient_list_id: 123, // for mass emails
  subject: 'Scheduled Subject',
  body: 'Email body with [Name] placeholder',
  scheduled_at: '2026-01-20T09:00:00Z',
  status: 'pending'
});
// The process-scheduled-emails function runs every 5 min and sends due emails
```

### Placeholders
The system supports these placeholders in email body:
- `[Name]` - Replaced with contact's first name
- `[Company]` - Replaced with contact's company
- `[Role]` - Replaced with contact's role

### Large Attachments
Files over 500KB are automatically:
1. Uploaded to Supabase storage
2. URL passed to Resend (they fetch it directly)
3. Cached by filename+size to avoid duplicate uploads

## Database Schema

### contacts
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| email | TEXT | Unique email address |
| name | TEXT | Contact name |
| company | TEXT | Company name |
| role | TEXT | Job title |
| phone | TEXT | Phone number |
| notes | TEXT | Additional notes |

### contact_lists
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | TEXT | List name |
| description | TEXT | List description |
| member_count | INTEGER | Number of contacts |

### scheduled_emails
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| recipient_email | TEXT | Single recipient (or null for list) |
| recipient_list_id | INTEGER | Contact list ID (or null for single) |
| subject | TEXT | Email subject |
| body | TEXT | Email body |
| attachment_urls | JSONB | Array of {filename, url, type} |
| scheduled_at | TIMESTAMP | When to send |
| status | TEXT | pending/sending/sent/failed/cancelled |

## Customization

### Change Email Template
Edit the `buildHtmlEmail()` function in `send-marketing-email.js` to customize the HTML template.

### Change Schedule Frequency
Edit the `config.schedule` in `process-scheduled-emails.js`:
```javascript
export const config = {
  schedule: "*/5 * * * *"  // Every 5 minutes
  // schedule: "*/1 * * * *"  // Every 1 minute
  // schedule: "0 * * * *"    // Every hour
};
```

### Add More Placeholders
In the frontend sendMassEmail function, add more .replace() calls:
```javascript
body: emailForm.body
  .replace(/\[Name\]/g, contact.name?.split(' ')[0] || 'there')
  .replace(/\[Company\]/g, contact.company || '')
  .replace(/\[CustomField\]/g, contact.custom_field || '')
```
