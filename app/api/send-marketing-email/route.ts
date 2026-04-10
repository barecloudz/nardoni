import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const {
      to,
      subject,
      body: rawBody,
      attachments = [],
      attachmentUrls = [],
      useHtmlTemplate = false,
      replyToMessageId = null,
      references = null
    } = await request.json()

    // Add automatic signature
    const signature = `

Kind regards,
Blake Nardoni
Nardoni Digital LLC
803-977-4285`
    const body = rawBody + signature

    // Validate required fields
    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and body are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json(
        { error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.' },
        { status: 500 }
      )
    }

    // Build attachments array for Resend
    const allAttachments = [
      ...attachments.map((att: { filename: string; content: string }) => ({
        filename: att.filename,
        content: att.content
      })),
      ...attachmentUrls.map((urlAtt: { filename: string; url: string }) => ({
        filename: urlAtt.filename,
        path: urlAtt.url
      }))
    ]

    // Build the HTML email with professional styling
    const emailHtml = `
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

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #35c677 0%, #2aa35f 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Nardoni Digital</h1>
              <p style="margin: 8px 0 0 0; color: #a7f3d0; font-size: 14px;">Marketing That Delivers Results</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <div style="color: #374151; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${body.replace(/\n/g, '<br>')}</div>
            </td>
          </tr>

          ${allAttachments.length > 0 ? `
          <!-- Attachments Notice -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">
                  <span style="margin-right: 8px;">📎</span>
                  ${allAttachments.length} file${allAttachments.length > 1 ? 's' : ''} attached to this email
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                      <strong style="color: #374151;">Nardoni Digital</strong>
                    </p>
                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                      📍 224 Thompson St, Unit #2030, Hendersonville, NC 28792
                    </p>
                    <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                      📞 (803) 977-4285
                    </p>
                    <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} Nardoni Digital. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    // Build email payload
    const emailPayload: Record<string, unknown> = {
      from: 'Nardoni Digital <hey@its.nardonidigital.com>',
      to: [to],
      subject: subject,
      text: body,
      attachments: allAttachments.length > 0 ? allAttachments : undefined
    }

    // Add threading headers for replies
    if (replyToMessageId) {
      emailPayload.headers = {
        'In-Reply-To': replyToMessageId,
        'References': references || replyToMessageId
      }
    }

    // Only add HTML template if explicitly requested
    if (useHtmlTemplate) {
      emailPayload.html = emailHtml
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', result)
      return NextResponse.json(
        { error: result.message || 'Failed to send email', details: result },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      id: result.id
    })
  } catch (error: unknown) {
    console.error('Error sending marketing email:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
