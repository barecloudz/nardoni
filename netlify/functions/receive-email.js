// Netlify Function: Receive inbound emails from Resend webhook
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Verify Resend webhook signature (uses Svix)
function verifyWebhookSignature(payload, headers, secret) {
  const svixId = headers['svix-id'];
  const svixTimestamp = headers['svix-timestamp'];
  const svixSignature = headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing Svix headers');
    return false;
  }

  // Check timestamp is within 5 minutes to prevent replay attacks
  const timestamp = parseInt(svixTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    console.error('Webhook timestamp too old');
    return false;
  }

  // Create the signed payload
  const signedPayload = `${svixId}.${svixTimestamp}.${payload}`;

  // The secret from Resend starts with "whsec_", we need to decode the base64 part
  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64');

  // Compute expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedPayload)
    .digest('base64');

  // Svix signature header contains multiple signatures separated by space
  // Format: "v1,signature1 v1,signature2"
  const signatures = svixSignature.split(' ');

  for (const sig of signatures) {
    const [version, signature] = sig.split(',');
    if (version === 'v1' && signature === expectedSignature) {
      return true;
    }
  }

  console.error('Signature mismatch');
  return false;
}

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Verify webhook signature
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (webhookSecret) {
    const isValid = verifyWebhookSignature(
      event.body,
      event.headers,
      webhookSecret
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid signature' }) };
    }
  } else {
    console.warn('RESEND_WEBHOOK_SECRET not set - skipping signature verification');
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const payload = JSON.parse(event.body);

    console.log('Received inbound email webhook:', JSON.stringify(payload, null, 2));

    // Resend webhook wraps email data inside payload.data
    const emailData = payload.data || payload;

    // Resend inbound email format
    // https://resend.com/docs/dashboard/webhooks/event-types#email-received
    const {
      from,
      to,
      subject,
      text,
      html,
      headers: emailHeaders,
      attachments,
      message_id: payloadMessageId
    } = emailData;

    // Parse from field (could be "Name <email>" or just "email")
    let fromEmail = from;
    let fromName = null;

    if (from && from.includes('<')) {
      const match = from.match(/^(.+?)\s*<(.+)>$/);
      if (match) {
        fromName = match[1].trim().replace(/^"|"$/g, '');
        fromEmail = match[2].trim();
      }
    }

    // Get the first "to" address
    const toEmail = Array.isArray(to) ? to[0] : to;

    // Extract Message-ID for threading support (check both payload and headers)
    const messageId = payloadMessageId || emailHeaders?.['message-id'] || emailHeaders?.['Message-ID'] || null;
    const inReplyTo = emailHeaders?.['in-reply-to'] || emailHeaders?.['In-Reply-To'] || null;
    const referencesHeader = emailHeaders?.['references'] || emailHeaders?.['References'] || null;

    // Insert into database
    const { data, error } = await supabase
      .from('received_emails')
      .insert([{
        from_email: fromEmail,
        from_name: fromName,
        to_email: toEmail,
        subject: subject || '(No subject)',
        body_text: text || '',
        body_html: html || '',
        message_id: messageId,
        in_reply_to: inReplyTo,
        is_read: false,
        is_archived: false,
        received_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving email:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to save email' }) };
    }

    console.log('Email saved successfully:', data.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, id: data.id })
    };

  } catch (error) {
    console.error('Error processing inbound email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
}
