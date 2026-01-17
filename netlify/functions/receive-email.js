// Netlify Function: Receive inbound emails from Resend webhook
import { createClient } from '@supabase/supabase-js';

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

    // Resend inbound email format
    // https://resend.com/docs/dashboard/webhooks/event-types#email-received
    const {
      from,
      to,
      subject,
      text,
      html,
      headers: emailHeaders,
      attachments
    } = payload;

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
        body_text: text || '',
        body_html: html || '',
        headers: emailHeaders || {},
        attachments: attachments || [],
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
