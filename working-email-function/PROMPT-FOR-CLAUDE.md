# COPY THIS ENTIRE MESSAGE TO CLAUDE

---

## TASK: Integrate Marketing Email System

I have a complete marketing email system that I need you to integrate into this project. The system files are located at:

```
C:\Users\Blake\Documents\merge-doni\working-email-function\
```

Please read the following files to understand the system:

1. **CLAUDE.md** - Full documentation and setup instructions
2. **netlify-functions/send-marketing-email.js** - Main email sending function
3. **netlify-functions/process-scheduled-emails.js** - Scheduled email processor (runs every 5 min)
4. **sql/setup-database.sql** - Database tables to create in Supabase
5. **frontend/email-state-and-functions.js** - React state and functions

## WHAT THE SYSTEM DOES:

- Send single emails or mass emails to contact lists
- Schedule emails to send later (automatic via cron)
- Manage contacts and contact lists
- Import contacts from CSV (company, name, role, email)
- Handle large file attachments via Supabase storage
- Support email placeholders: [Name], [Company], [Role]

## WHAT I NEED YOU TO DO:

1. Read all the files in the `working-email-function` folder
2. Set up the Supabase database tables (run the SQL)
3. Copy the Netlify functions to this project's `netlify/functions/` folder
4. Integrate the frontend React code into the admin panel
5. Make sure the environment variables are documented

## ENVIRONMENT VARIABLES NEEDED:

```
RESEND_API_KEY=re_xxxxxxxxxx
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

## IMPORTANT NOTES:

- The "from" email in send-marketing-email.js needs to match your verified Resend domain
- Create a "marketing" storage bucket in Supabase (public) for attachments
- The scheduled function runs every 5 minutes automatically via Netlify

Start by reading the CLAUDE.md file for full documentation.

---

# END OF PROMPT
