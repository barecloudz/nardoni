-- Add pass_fee flag to service_offers
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS pass_fee BOOLEAN NOT NULL DEFAULT false;
