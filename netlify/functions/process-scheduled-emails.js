// Netlify Scheduled Function: Process and send scheduled emails
// Runs every 5 minutes to check for due emails

import { createClient } from '@supabase/supabase-js';

// Schedule configuration - runs every 5 minutes
export const config = {
  schedule: "*/5 * * * *"
};

export async function handler(event, context) {
  console.log('Processing scheduled emails at:', new Date().toISOString());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return { statusCode: 500, body: 'Missing Supabase credentials' };
  }

  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY');
    return { statusCode: 500, body: 'Missing RESEND_API_KEY' };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Find emails that are due (scheduled_at <= now and status = 'pending')
    const { data: dueEmails, error: fetchError } = await supabase
      .from('scheduled_emails')
      .select('*, contact_lists(id, name)')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .limit(10); // Process max 10 at a time to avoid timeout

    if (fetchError) {
      console.error('Error fetching scheduled emails:', fetchError);
      return { statusCode: 500, body: 'Error fetching scheduled emails' };
    }

    if (!dueEmails || dueEmails.length === 0) {
      console.log('No scheduled emails to process');
      return { statusCode: 200, body: 'No scheduled emails to process' };
    }

    console.log(`Found ${dueEmails.length} scheduled emails to process`);

    for (const email of dueEmails) {
      try {
        // Mark as sending
        await supabase
          .from('scheduled_emails')
          .update({ status: 'sending' })
          .eq('id', email.id);

        let recipients = [];

        if (email.recipient_email) {
          // Single recipient
          recipients = [{ email: email.recipient_email, name: null }];
        } else if (email.recipient_list_id) {
          // Get contacts from list
          const { data: listMembers, error: listError } = await supabase
            .from('contact_list_members')
            .select('marketing_contacts(*)')
            .eq('list_id', email.recipient_list_id);

          if (listError) {
            throw new Error(`Failed to load list contacts: ${listError.message}`);
          }

          recipients = (listMembers || []).map(m => ({
            email: m.marketing_contacts.email,
            name: m.marketing_contacts.name,
            company: m.marketing_contacts.company,
            role: m.marketing_contacts.role
          }));
        }

        if (recipients.length === 0) {
          throw new Error('No recipients found');
        }

        console.log(`Sending to ${recipients.length} recipients`);

        // Build attachments from URLs
        const attachments = (email.attachment_urls || []).map(att => ({
          filename: att.filename,
          path: att.url
        }));

        let successCount = 0;
        let failCount = 0;

        // Send to each recipient
        for (const recipient of recipients) {
          try {
            const signature = `

Kind regards,
Blake Nardoni
Nardoni Digital LLC
803-977-4285`;
            const personalizedBody = email.body
              .replace(/\[Name\]/g, (recipient.name || 'there').split(' ')[0])
              .replace(/\[Company\]/g, recipient.company || '')
              .replace(/\[Role\]/g, recipient.role || '') + signature;

            const emailPayload = {
              from: "Nardoni Digital <hey@its.nardonidigital.com>",
              to: [recipient.email],
              subject: email.subject,
              text: personalizedBody,
              attachments: attachments.length > 0 ? attachments : undefined
            };

            if (email.use_html_template) {
              emailPayload.html = buildHtmlEmail(email.subject, personalizedBody, attachments.length);
            }

            const response = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(emailPayload)
            });

            if (response.ok) {
              successCount++;
              // Log to sent_emails
              await supabase.from('sent_emails').insert([{
                recipient_email: recipient.email,
                subject: email.subject,
                body: personalizedBody,
                used_html_template: email.use_html_template,
                attachment_count: attachments.length,
                attachment_names: attachments.map(a => a.filename),
                status: 'sent'
              }]);
            } else {
              failCount++;
              const errorResult = await response.json();
              console.error(`Failed to send to ${recipient.email}:`, errorResult);
            }

            // Small delay between sends
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (sendErr) {
            failCount++;
            console.error(`Error sending to ${recipient.email}:`, sendErr.message);
          }
        }

        // Mark as sent or failed
        await supabase
          .from('scheduled_emails')
          .update({
            status: failCount === recipients.length ? 'failed' : 'sent',
            sent_at: new Date().toISOString(),
            error_message: failCount > 0 ? `${failCount}/${recipients.length} failed` : null
          })
          .eq('id', email.id);

        console.log(`Email ${email.id}: ${successCount} sent, ${failCount} failed`);

      } catch (emailErr) {
        console.error(`Error processing email ${email.id}:`, emailErr.message);
        await supabase
          .from('scheduled_emails')
          .update({
            status: 'failed',
            error_message: emailErr.message
          })
          .eq('id', email.id);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ processed: dueEmails.length })
    };

  } catch (error) {
    console.error('Error in scheduled email processor:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

function buildHtmlEmail(subject, body, attachmentCount) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #35c677 0%, #2aa35f 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Nardoni Digital</h1>
              <p style="margin: 8px 0 0 0; color: #a7f3d0; font-size: 14px;">Marketing That Delivers Results</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <div style="color: #374151; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${body.replace(/\n/g, '<br>')}</div>
            </td>
          </tr>
          ${attachmentCount > 0 ? `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">
                  📎 ${attachmentCount} file${attachmentCount > 1 ? 's' : ''} attached
                </p>
              </div>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">📍 224 Thompson St, Unit #2030, Hendersonville, NC 28792</p>
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">📞 (803) 977-4285</p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Nardoni Digital. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
