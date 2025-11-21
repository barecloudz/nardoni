-- Fix contacts table policies to allow public form submissions
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can submit contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can read contacts" ON contacts;
DROP POLICY IF EXISTS "Admin users can manage all contacts" ON contacts;

-- Allow anyone (including anonymous users) to insert contacts
CREATE POLICY "Public can submit contact forms"
  ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin users can read all contacts (using user_metadata role check)
CREATE POLICY "Admin users can read all contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text = 'admin', false)
  );

-- Admin users can update contacts (mark as read, spam, etc.)
CREATE POLICY "Admin users can update contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text = 'admin', false)
  )
  WITH CHECK (
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text = 'admin', false)
  );

-- Admin users can delete contacts
CREATE POLICY "Admin users can delete contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text = 'admin', false)
  );
