-- =====================================================
-- MARKETING EMAIL SYSTEM - DATABASE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. MARKETING CONTACTS TABLE (separate from site inquiry contacts)
CREATE TABLE IF NOT EXISTS marketing_contacts (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  role TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CONTACT LISTS TABLE
CREATE TABLE IF NOT EXISTS contact_lists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CONTACT LIST MEMBERS (junction table)
CREATE TABLE IF NOT EXISTS contact_list_members (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES marketing_contacts(id) ON DELETE CASCADE,
  list_id INTEGER REFERENCES contact_lists(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contact_id, list_id)
);

-- 4. SENT EMAILS LOG
CREATE TABLE IF NOT EXISTS sent_emails (
  id SERIAL PRIMARY KEY,
  recipient_email TEXT,
  subject TEXT,
  body TEXT,
  used_html_template BOOLEAN DEFAULT false,
  attachment_count INTEGER DEFAULT 0,
  attachment_names TEXT[],
  status TEXT DEFAULT 'sent',
  resend_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SCHEDULED EMAILS
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id SERIAL PRIMARY KEY,
  recipient_email TEXT,
  recipient_list_id INTEGER REFERENCES contact_lists(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  use_html_template BOOLEAN DEFAULT false,
  attachment_urls JSONB DEFAULT '[]',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE marketing_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all on marketing_contacts" ON marketing_contacts FOR ALL USING (true);
CREATE POLICY "Allow all on contact_lists" ON contact_lists FOR ALL USING (true);
CREATE POLICY "Allow all on contact_list_members" ON contact_list_members FOR ALL USING (true);
CREATE POLICY "Allow all on sent_emails" ON sent_emails FOR ALL USING (true);
CREATE POLICY "Allow all on scheduled_emails" ON scheduled_emails FOR ALL USING (true);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_pending
ON scheduled_emails(scheduled_at)
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_marketing_contacts_email ON marketing_contacts(email);
CREATE INDEX IF NOT EXISTS idx_sent_emails_created ON sent_emails(created_at DESC);

-- =====================================================
-- STORAGE BUCKET POLICIES
-- Run this separately after creating a "marketing" bucket
-- =====================================================

-- CREATE POLICY "Allow public uploads to marketing"
-- ON storage.objects FOR INSERT TO public
-- WITH CHECK (bucket_id = 'marketing');

-- CREATE POLICY "Allow public read from marketing"
-- ON storage.objects FOR SELECT TO public
-- USING (bucket_id = 'marketing');
