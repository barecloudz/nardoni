-- ============================================================
-- GENOVA'S PIZZA & PASTA — Example seed data
-- Run this AFTER the 20260411_client_reports.sql migration
-- Replace <GENOVAS_CLIENT_ID> with the actual UUID from your clients table
-- ============================================================

-- Step 1: Find Genova's client ID
-- SELECT id FROM clients WHERE company ILIKE '%genova%';

-- Step 2: Insert service values (replace CLIENT_ID below)
-- -------------------------------------------------------
-- Example: INSERT INTO client_service_values (...) VALUES ...

-- Paste CLIENT_ID here:
DO $$
DECLARE
  CLIENT_ID uuid;
BEGIN
  SELECT id INTO CLIENT_ID FROM clients WHERE company ILIKE '%genova%' LIMIT 1;

  IF CLIENT_ID IS NULL THEN
    RAISE EXCEPTION 'Genova client not found. Make sure the client exists in the clients table first.';
  END IF;

  -- Service values
  INSERT INTO client_service_values (client_id, service_name, description, market_price, our_price, period, display_order) VALUES
    (CLIENT_ID, 'Custom E-Commerce Merch Store', 'Fully custom-built online store for branded merchandise — no templates, custom design, product catalog, cart & checkout', 8000, NULL, 'one-time', 1),
    (CLIENT_ID, 'Domain Registration & Setup (4 domains)', 'Purchased and configured 4 new domains including catering.genovaspizzamyrtlebeach.com — DNS, redirects & brand protection', 400, 45, 'one-time', 2),
    (CLIENT_ID, 'Private Business Email Hosting', 'Branded email setup for 3 domains with full SPF/DKIM/DMARC configuration via Instantly — ongoing management included', 150, 7, 'monthly', 3),
    (CLIENT_ID, 'Domain Warming & Email Deliverability', 'Multi-domain warmup via Instantly — gradual volume ramp to protect sender reputation and ensure inbox placement', 600, NULL, 'monthly', 4),
    (CLIENT_ID, 'Cold Email Outreach Management', 'B2B lead gen campaign targeting Myrtle Beach corporate accounts — strategy, copy, sequences, reply handling & reporting', 3500, NULL, 'monthly', 5),
    (CLIENT_ID, 'Lead List Building (3,330+ contacts)', 'Custom-scraped and verified prospect list of businesses across the Myrtle Beach area, segmented and ready for outreach', 1200, NULL, 'one-time', 6),
    (CLIENT_ID, 'B2B Catering Sales Outreach', 'Active catering & lunch program outreach — targeting corporate offices, event planners, and hospitality accounts', 3000, NULL, 'monthly', 7),
    (CLIENT_ID, 'Local SEO — "Best Pizza in Myrtle Beach"', 'Competitive local SEO targeting high-value keywords in the Myrtle Beach market', 1500, NULL, 'monthly', 8),
    (CLIENT_ID, 'Google Business Profile Management', 'Daily GBP posts, responding to every Google review, Q&A management, and profile optimization', 600, NULL, 'monthly', 9),
    (CLIENT_ID, 'Digital Advertising (Google/Meta Ads)', 'Paid ad campaign setup, creative production, management, and ongoing optimization', 1200, NULL, 'monthly', 10),
    (CLIENT_ID, 'Merchandise Deal — Opossum Works', 'Secured partnership with Opossum Works for branded beach-themed merchandise at zero upfront cost — Genova''s only pays Opossum Works when items sell', 2500, NULL, 'one-time', 11),
    (CLIENT_ID, 'Hiring & Recruiting Support (Indeed)', 'Indeed job post management and applicant funnel to help Genova''s find new staff', 500, NULL, 'monthly', 12),
    (CLIENT_ID, 'Weekly Performance Reports', 'Detailed weekly breakdowns: outreach activity, metrics, active opportunities, deals closed, and next week''s focus', 500, NULL, 'monthly', 13),
    (CLIENT_ID, 'Dedicated Technical Support', 'Full business tech support — call us anytime and we fix it. Covers website issues, email problems, domain/DNS, software troubleshooting, and anything digital', 800, NULL, 'monthly', 14);

  RAISE NOTICE 'Service values inserted for client %', CLIENT_ID;

  -- Week 1 Report — Setup & foundations
  INSERT INTO client_reports (
    client_id, week_start, emails_sent, emails_responded,
    active_conversations, opportunities, closed_this_week, next_week_focus,
    notes, status
  ) VALUES (
    CLIENT_ID,
    '2026-03-30',
    0, 0,
    NULL,
    NULL,
    '- Launched custom e-commerce merch store (Opossum Works partnership secured — zero upfront cost to Genova''s, pay-on-sale model)
- Purchased and configured 4 new domains including catering.genovaspizzamyrtlebeach.com
- Set up private branded email hosting for 3 domains ($7/month vs $150/month market rate)
- Installed Instantly and onboarded all 4 domains into the warming sequence',
    '- Begin domain warming on all 4 email accounts (Week 1 of 6)
- Build out the Myrtle Beach prospect list — targeting corporate offices, event planners, hotels & venues
- Coordinate with Opossum Works on first merchandise designs
- Set up Google Business Profile management cadence',
    'Week 1 focused on infrastructure. No outreach yet — domains need to warm first to protect deliverability.',
    'published'
  );

  -- Week 2 Report — Warming + foundations continue
  INSERT INTO client_reports (
    client_id, week_start, emails_sent, emails_responded,
    active_conversations, opportunities, closed_this_week, next_week_focus,
    notes, status
  ) VALUES (
    CLIENT_ID,
    '2026-04-07',
    0, 0,
    '- Coordinating with Opossum Works on beach-themed merch designs for the store
- GBP: Responded to all outstanding Google reviews and published first 5 daily posts
- Indeed: Posted 2 open positions for front-of-house staff',
    '- Identified 12 hotel concierge contacts at Myrtle Beach oceanfront properties for catering outreach
- Flagged Chamber of Commerce upcoming luncheon event as a high-value catering target',
    NULL,
    '- Continue domain warming — entering Week 2 of 6 (ramp to 15 emails/day per domain)
- Complete prospect list scraping — targeting 3,330+ verified Myrtle Beach business contacts
- Finalize first merch designs with Opossum Works
- Begin keyword research for "best pizza in Myrtle Beach" SEO campaign',
    'Domains are warming well. Instantly warmup health scores looking good across all 4. Prospect list at 3,330+ and growing.',
    'published'
  );

  RAISE NOTICE 'Reports inserted for client %', CLIENT_ID;
END $$;
