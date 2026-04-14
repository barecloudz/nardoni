-- Add service_cards JSONB column to service_offers for card-style service display
ALTER TABLE service_offers
ADD COLUMN IF NOT EXISTS service_cards JSONB;

-- Extend period check constraints to allow 'weekly'
ALTER TABLE service_catalog
DROP CONSTRAINT IF EXISTS service_catalog_period_check;

ALTER TABLE service_catalog
ADD CONSTRAINT service_catalog_period_check
CHECK (period IN ('one-time', 'weekly', 'monthly', 'yearly'));

-- Also extend service_offers period check if it exists
ALTER TABLE service_offers
DROP CONSTRAINT IF EXISTS service_offers_period_check;

ALTER TABLE service_offers
ADD CONSTRAINT service_offers_period_check
CHECK (period IN ('one-time', 'weekly', 'monthly', 'yearly'));

-- Insert Technical Support into service_catalog
INSERT INTO service_catalog (name, description, features, price, period, is_active, display_order)
VALUES (
  'Technical Support',
  'Prompt resolution of POS, software, and technical issues. We answer and fix problems fast so your business never misses a beat.',
  'POS troubleshooting & fixes
Software and hardware support
Same-day response guarantee
Remote and on-site assistance',
  600,
  'monthly',
  true,
  10
);

-- Insert Custom Marketing Package into service_catalog
INSERT INTO service_catalog (name, description, features, price, period, is_active, display_order)
VALUES (
  'Custom Marketing Package',
  'A complete local marketing solution bundling Local SEO, Google Business Profile management, weekly reporting, and dedicated technical support.',
  'Local SEO optimization
Google Business Profile management
Weekly performance reports
Dedicated technical support',
  250,
  'weekly',
  true,
  1
);
