import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface InviteClientRequest {
  email: string
  temporaryPassword: string
  clientId: string
  clientName: string
  clientCompany: string
  portalUrl: string
}

async function sendInviteEmail({
  email,
  clientName,
  clientCompany,
  temporaryPassword,
  portalUrl,
}: {
  email: string
  clientName: string
  clientCompany: string
  temporaryPassword: string
  portalUrl: string
}) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return
  }

  const firstName = clientName.split(' ')[0]
  const loginUrl = `${portalUrl}/auth/login`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#191919;padding:32px;text-align:center;">
              <div style="display:inline-block;background-color:#35c677;border-radius:10px;width:40px;height:40px;line-height:40px;text-align:center;margin-bottom:12px;">
                <span style="color:#ffffff;font-weight:900;font-size:20px;">N</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">Nardoni Digital</h1>
              <p style="margin:6px 0 0 0;color:#6b7280;font-size:13px;">Your client portal is ready</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 24px 36px;">
              <p style="margin:0 0 16px 0;color:#111827;font-size:18px;font-weight:700;">Hey ${firstName} 👋</p>
              <p style="margin:0 0 24px 0;color:#374151;font-size:15px;line-height:1.6;">
                Your client portal is live. Log in to view your weekly reports, invoices, and everything we're doing for ${clientCompany || 'your business'}.
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px 0;color:#6b7280;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Your Login Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:13px;width:80px;">Portal</td>
                        <td style="padding:6px 0;">
                          <a href="${loginUrl}" style="color:#35c677;font-size:13px;font-weight:600;text-decoration:none;">${loginUrl}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:13px;">Email</td>
                        <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:13px;">Password</td>
                        <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;font-family:monospace;">${temporaryPassword}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display:inline-block;background-color:#35c677;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">
                      Log In to Your Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                We recommend changing your password after your first login.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 36px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 4px 0;color:#374151;font-size:13px;font-weight:600;">Nardoni Digital</p>
              <p style="margin:0 0 4px 0;color:#9ca3af;font-size:12px;">(803) 977-4285 · nardonidigital@gmail.com</p>
              <p style="margin:0;color:#d1d5db;font-size:11px;">© ${new Date().getFullYear()} Nardoni Digital LLC</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Nardoni Digital <hey@its.nardonidigital.com>',
      to: [email],
      subject: `Your Nardoni Digital client portal is ready`,
      html,
      text: `Hey ${firstName},\n\nYour client portal is ready.\n\nPortal: ${loginUrl}\nEmail: ${email}\nPassword: ${temporaryPassword}\n\nWe recommend changing your password after your first login.\n\n— Nardoni Digital`,
    }),
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'blake@nardonidigital.com'
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, temporaryPassword, clientId, clientName, clientCompany, portalUrl }: InviteClientRequest = await req.json()

    if (!email || !temporaryPassword || !clientId || !clientName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create the auth user (auto-confirmed so they can log in immediately)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name: clientName,
        company: clientCompany,
        role: 'client',
      },
    })

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Link the auth user to the client record
    const { error: updateError } = await supabaseAdmin
      .from('clients')
      .update({ user_id: authUser.user.id })
      .eq('id', clientId)

    if (updateError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return new Response(JSON.stringify({ error: 'Failed to link client account' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send the welcome email with credentials
    await sendInviteEmail({
      email,
      clientName,
      clientCompany,
      temporaryPassword,
      portalUrl: portalUrl || 'https://nardonidigital.com',
    })

    return new Response(
      JSON.stringify({ success: true, email, userId: authUser.user.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
