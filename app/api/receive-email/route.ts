import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function verifyWebhookSignature(payload: string, headers: Headers, secret: string): boolean {
  const svixId = headers.get('svix-id')
  const svixTimestamp = headers.get('svix-timestamp')
  const svixSignature = headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing Svix headers')
    return false
  }

  const timestamp = parseInt(svixTimestamp, 10)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > 300) {
    console.error('Webhook timestamp too old')
    return false
  }

  const signedPayload = `${svixId}.${svixTimestamp}.${payload}`
  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64')

  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedPayload)
    .digest('base64')

  const signatures = svixSignature.split(' ')

  for (const sig of signatures) {
    const [version, signature] = sig.split(',')
    if (version === 'v1' && signature === expectedSignature) {
      return true
    }
  }

  console.error('Signature mismatch')
  return false
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  const rawBody = await request.text()

  if (webhookSecret) {
    const isValid = verifyWebhookSignature(rawBody, request.headers, webhookSecret)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } else {
    console.warn('RESEND_WEBHOOK_SECRET not set - skipping signature verification')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const payload = JSON.parse(rawBody)
    console.log('Received inbound email webhook:', JSON.stringify(payload, null, 2))

    const { type, data: emailData } = payload

    if (type !== 'email.received') {
      console.log('Ignoring non-email event:', type)
      return NextResponse.json({ success: true, message: 'Event ignored' })
    }

    const {
      from,
      to,
      subject,
      email_id,
      message_id: payloadMessageId,
      in_reply_to: payloadInReplyTo,
      created_at
    } = emailData

    let text = ''
    let html = ''

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (RESEND_API_KEY && email_id) {
      try {
        console.log('Fetching inbound email content for email_id:', email_id)
        const emailResponse = await fetch(`https://api.resend.com/emails/receiving/${email_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          }
        })

        const responseText = await emailResponse.text()
        console.log('Resend API response status:', emailResponse.status)

        if (emailResponse.ok && responseText) {
          try {
            const fetchedData = JSON.parse(responseText)
            if (fetchedData.data) {
              text = fetchedData.data.text || ''
              html = fetchedData.data.html || ''
            } else {
              text = fetchedData.text || ''
              html = fetchedData.html || ''
            }
          } catch (parseError) {
            console.error('Failed to parse email content response:', parseError)
          }
        } else {
          console.error('Failed to fetch email content:', emailResponse.status, responseText)
        }
      } catch (fetchError: unknown) {
        console.error('Error fetching email content:', fetchError instanceof Error ? fetchError.message : fetchError)
      }
    }

    let fromEmail = from
    let fromName = null

    if (from && from.includes('<')) {
      const match = from.match(/^(.+?)\s*<(.+)>$/)
      if (match) {
        fromName = match[1].trim().replace(/^"|"$/g, '')
        fromEmail = match[2].trim()
      }
    }

    const toEmail = Array.isArray(to) ? to[0] : to

    const { data, error } = await supabase
      .from('received_emails')
      .insert([{
        from_email: fromEmail,
        from_name: fromName,
        to_email: toEmail,
        subject: subject || '(No subject)',
        body_text: text,
        body_html: html,
        message_id: payloadMessageId,
        in_reply_to: payloadInReplyTo,
        is_read: false,
        is_archived: false,
        received_at: created_at || new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error saving email:', error)
      return NextResponse.json({ error: 'Failed to save email' }, { status: 500 })
    }

    console.log('Email saved successfully:', data.id)
    return NextResponse.json({ success: true, id: data.id })
  } catch (error: unknown) {
    console.error('Error processing inbound email:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
