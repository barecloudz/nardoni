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

    // Resend webhook format: { type: 'email.received', data: { ... } }
    const { type, data: emailData } = payload;

    // Only process email.received events
    if (type !== 'email.received') {
      console.log('Ignoring non-email event:', type);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Event ignored' })
      };
    }

    // Extract email metadata from webhook
    const {
      from,
      to,
      subject,
      email_id,
      message_id: payloadMessageId,
      in_reply_to: payloadInReplyTo,
      created_at
    } = emailData;

    // Resend webhooks don't include email body - need to fetch via API
    let text = '';
    let html = '';

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY && email_id) {
      try {
        console.log('Fetching inbound email content for email_id:', email_id);
        const emailResponse = await fetch(`https://api.resend.com/emails/receiving/${email_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        const responseText = await emailResponse.text();
        console.log('Resend API response status:', emailResponse.status);

        if (emailResponse.ok && responseText) {
          try {
            const fetchedData = JSON.parse(responseText);
            // Handle both direct and wrapped response
            if (fetchedData.data) {
              text = fetchedData.data.text || '';
              html = fetchedData.data.html || '';
            } else {
              text = fetchedData.text || '';
              html = fetchedData.html || '';
            }
            console.log('Extracted text length:', text.length);
            console.log('Extracted html length:', html.length);
          } catch (parseError) {
            console.error('Failed to parse email content response:', parseError);
          }
        } else {
          console.error('Failed to fetch email content:', emailResponse.status, responseText);
        }
      } catch (fetchError) {
        console.error('Error fetching email content:', fetchError.message);
      }
    } else {
      console.warn('Cannot fetch email body - RESEND_API_KEY:', !!RESEND_API_KEY, 'email_id:', email_id);
    }

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

    // Insert into database
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
