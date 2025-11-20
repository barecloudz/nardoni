# Resend Email Notification Setup

This guide explains how to set up email notifications for new call bookings using Resend.

## What's Been Done

1. **Book-a-Call Form Updated**: Now saves all booking data to the `contacts` table in Supabase
2. **Edge Function Created**: `supabase/functions/send-booking-notification/index.ts` handles sending emails via Resend
3. **Frontend Integration**: Form automatically calls the Edge Function after saving to database

## Setup Instructions

### 1. Get Your Resend API Key

1. Go to https://resend.com and sign up/login
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Copy your API key (starts with `re_`)

### 2. Verify Your Domain in Resend

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter `nardonidigital.com`
4. Follow the DNS configuration instructions (add TXT, MX, and CNAME records)
5. Wait for verification (usually takes a few minutes)

### 3. Deploy the Edge Function to Supabase

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref gbbhuqihjadbrkfnydhc

# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Deploy the function
supabase functions deploy send-booking-notification
```

### 4. Test the Setup

1. Go to http://localhost:5175/book-a-call
2. Fill out the form and submit
3. Check:
   - **Supabase Dashboard** → **Table Editor** → **contacts** (should see new entry)
   - **Admin Dashboard** → **Contacts** (should see booking there)
   - **Your Email** → You should receive an email notification

## How It Works

1. User fills out "Book a Call" form
2. Form data is saved to `contacts` table in Supabase
3. Frontend calls the Edge Function with booking details
4. Edge Function sends email to `admin@nardonidigital.com` via Resend API
5. Admin receives email notification with all booking details
6. Booking appears in Admin Dashboard → Contacts page

## Customization

### Change Notification Email

Edit `supabase/functions/send-booking-notification/index.ts`:

```typescript
to: ['your-email@domain.com'],  // Change this line
```

### Change From Email

After verifying your domain, update:

```typescript
from: 'Nardoni Digital <bookings@nardonidigital.com>',
```

### Customize Email Template

Edit the `html` content in the Edge Function to change the email design.

## Troubleshooting

- **Email not received**: Check Resend dashboard logs
- **Edge Function errors**: Check Supabase logs: `supabase functions logs send-booking-notification`
- **Domain not verified**: Check DNS records in your domain provider

## Cost

- **Resend**: 3,000 emails/month free, then $0.01 per email
- **Supabase Edge Functions**: Free tier includes 500K invocations/month
