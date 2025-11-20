-- Create outreach_leads table for cold outreach campaigns
CREATE TABLE IF NOT EXISTS outreach_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  website text,
  industry text,
  location text,
  notes text,

  -- Outreach tracking
  email_sent boolean DEFAULT false,
  email_sent_date timestamptz,
  email_opened boolean DEFAULT false,
  email_replied boolean DEFAULT false,

  called boolean DEFAULT false,
  call_date timestamptz,
  call_outcome text, -- 'no-answer', 'voicemail', 'interested', 'not-interested', 'callback'
  call_notes text,

  -- Lead status
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'not-interested', 'converted', 'do-not-contact')),

  -- Campaign tracking
  campaign_name text,
  subdomain_used text, -- Track which Resend subdomain was used

  -- Metadata
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE outreach_leads ENABLE ROW LEVEL SECURITY;

-- Admin users can manage all leads
CREATE POLICY "Admin users can manage all outreach leads"
  ON outreach_leads
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text = 'admin', false)
  );

-- Create index for faster searches
CREATE INDEX idx_outreach_leads_email ON outreach_leads(email);
CREATE INDEX idx_outreach_leads_phone ON outreach_leads(phone);
CREATE INDEX idx_outreach_leads_status ON outreach_leads(status);
CREATE INDEX idx_outreach_leads_campaign ON outreach_leads(campaign_name);

-- Create trigger for updated_at
CREATE TRIGGER update_outreach_leads_updated_at
  BEFORE UPDATE ON outreach_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
