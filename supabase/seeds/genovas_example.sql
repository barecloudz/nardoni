-- ============================================================
-- GENOVA'S PIZZA & PASTA — Client service values + weekly reports
-- Run AFTER: supabase/migrations/20260411_client_reports.sql
--
-- Market rates sourced from:
--   Clutch.co, Reachoutly, Outbound Sales Pro, Merchynt,
--   AgencyAnalytics, WebFX, Boulder SEO Marketing (2025-2026)
-- ============================================================

DO $$
DECLARE
  CLIENT_ID uuid;
BEGIN
  SELECT id INTO CLIENT_ID FROM clients WHERE company ILIKE '%genova%' LIMIT 1;

  IF CLIENT_ID IS NULL THEN
    RAISE EXCEPTION 'Genova client not found. Add them in the Clients page first.';
  END IF;

  -- -------------------------------------------------------
  -- SERVICE VALUES
  -- market_price = what a US agency charges (researched)
  -- our_price    = what Genova's actually pays (NULL = included in plan)
  -- -------------------------------------------------------
  INSERT INTO client_service_values
    (client_id, service_name, description, market_price, our_price, period, display_order)
  VALUES

    -- ONE-TIME WORK COMPLETED
    (CLIENT_ID,
     'Custom E-Commerce Merch Store',
     'Fully custom-built online store for branded merchandise — no templates, custom design & development, product catalog, cart, and checkout. Built specifically for Genova''s beachfront brand.',
     12000, NULL, 'one-time', 1),

    (CLIENT_ID,
     'Domain Registration & Setup (4 domains)',
     'Purchased and configured 4 new business domains including catering.genovaspizzamyrtlebeach.com — DNS records, SPF/DKIM/DMARC, URL redirects, and brand protection across all domains.',
     500, 45, 'one-time', 2),

    (CLIENT_ID,
     'Email Deliverability Infrastructure Setup',
     'Full Instantly.ai onboarding — provisioned 4 sending domains, configured all deliverability records, set up warmup sequences, and established sending reputation baseline before any outreach.',
     1000, NULL, 'one-time', 3),

    (CLIENT_ID,
     'Lead List Build (3,330+ contacts, 19 industries)',
     'Custom-scraped and verified prospect database covering 19 Myrtle Beach industries: hotels & hospitality, real estate, construction & HVAC, dental, healthcare, law firms, car dealers, insurance & financial, schools, property management, corporate offices, and more. Continuously updated.',
     1200, NULL, 'one-time', 4),

    (CLIENT_ID,
     'Merchandise Partnership — Opossum Works',
     'Negotiated and secured a zero-upfront-cost merchandise deal with Opossum Works — branded beach-themed products manufactured and fulfilled at no charge to Genova''s. They only pay the supplier when items actually sell.',
     2500, NULL, 'one-time', 5),

    -- MONTHLY SERVICES
    (CLIENT_ID,
     'Private Business Email Hosting (3 accounts)',
     'Branded email addresses managed and maintained across 3 domains — SPF/DKIM/DMARC kept current, account support, and full inbox deliverability management included.',
     125, 7, 'monthly', 6),

    (CLIENT_ID,
     'Domain Warming & Deliverability Management',
     'Ongoing Instantly.ai warmup management — graduated send volume ramp across 4 domains, daily deliverability score monitoring, inbox placement tracking, and sequence adjustments to build and protect sender reputation.',
     500, NULL, 'monthly', 7),

    (CLIENT_ID,
     'Cold Email Outreach Campaign Management',
     'Full B2B cold email program across 19 industry segments — ICP targeting, sequence copywriting, A/B testing, reply handling, and weekly performance reporting. 3,330+ verified contacts ready for deployment.',
     3500, NULL, 'monthly', 8),

    (CLIENT_ID,
     'B2B Catering & Lunch Sales Outreach',
     'Dedicated outreach campaign targeting corporate offices, law firms, hotels, healthcare facilities, and event planners for Genova''s catering and lunch delivery program — active conversations, pipeline management, and deal closing.',
     5000, NULL, 'monthly', 9),

    (CLIENT_ID,
     'Local SEO — "Best Pizza in Myrtle Beach"',
     'Competitive local SEO targeting high-value restaurant keywords in the Myrtle Beach market — on-page optimization, content strategy, citation building, and monthly ranking reports.',
     1500, NULL, 'monthly', 10),

    (CLIENT_ID,
     'Google Business Profile Management',
     'Daily GBP posts, responding to every Google review within 24 hours, Q&A management, photo uploads, and monthly profile analytics — full reputation and visibility management.',
     400, NULL, 'monthly', 11),

    (CLIENT_ID,
     'Digital Advertising (Google + Meta Ads)',
     'Paid ad campaign setup, ad creative production, audience targeting, ongoing management and optimization across Google Search and Meta (Facebook/Instagram).',
     1200, NULL, 'monthly', 12),

    (CLIENT_ID,
     'Hiring & Recruiting Support (Indeed)',
     'Job post writing, publishing, and listing management on Indeed — applicant screening, filtering by criteria, and weekly candidate shortlists delivered to Genova''s management.',
     500, NULL, 'monthly', 13),

    (CLIENT_ID,
     'Weekly Performance Reports',
     'Every week: a clean breakdown of emails sent, responses, active catering conversations, opportunities in the pipeline, deals closed, and what we''re focused on next.',
     500, NULL, 'monthly', 14),

    (CLIENT_ID,
     'Dedicated Technical Support',
     'On-call technical support for the entire business — website, email, domains, software, point-of-sale, anything digital. Call us, we answer and fix it. Same-day response guaranteed.',
     600, NULL, 'monthly', 15);

  RAISE NOTICE 'Service values inserted for Genova''s (client %)' , CLIENT_ID;

  -- -------------------------------------------------------
  -- WEEK 1 REPORT — Infrastructure & foundations
  -- Week of March 30, 2026
  -- -------------------------------------------------------
  INSERT INTO client_reports (
    client_id, week_start,
    emails_sent, emails_responded,
    active_conversations, opportunities,
    closed_this_week, next_week_focus,
    notes, status
  ) VALUES (
    CLIENT_ID, '2026-03-30',
    0, 0,
    NULL,
    NULL,
    E'- Built and launched custom e-commerce merch store for Genova''s branded merchandise (Opossum Works partnership secured — zero upfront cost, pay-on-sale model)\n- Purchased 4 new business domains including catering.genovaspizzamyrtlebeach.com ($45/year vs $500 agency rate)\n- Set up private branded email hosting across 3 domains — full SPF/DKIM/DMARC configuration ($7/month vs $125/month agency rate)\n- Installed Instantly and onboarded all 4 domains into professional email warming sequences\n- Began daily Google Business Profile posting and responding to all outstanding Google reviews',
    E'- Begin domain warming (Week 1 of 6) — Instantly sending initial warmup volume across all 4 domains\n- Build out the full Myrtle Beach prospect list — scraping hotels, corporate offices, law firms, healthcare, and more\n- Coordinate first merchandise designs with Opossum Works\n- Kick off keyword research for "best pizza in Myrtle Beach" SEO campaign',
    'Week 1 was all foundations. No prospect outreach yet — domains must warm first or we risk burning them permanently. Everything is set up correctly.',
    'published'
  );

  -- -------------------------------------------------------
  -- WEEK 2 REPORT — Warming + list building in progress
  -- Week of April 7, 2026
  -- -------------------------------------------------------
  INSERT INTO client_reports (
    client_id, week_start,
    emails_sent, emails_responded,
    active_conversations, opportunities,
    closed_this_week, next_week_focus,
    notes, status
  ) VALUES (
    CLIENT_ID, '2026-04-07',
    20, 0,
    E'- Coordinating with Opossum Works on beach-themed merch designs for the store (first concepts in review)\n- GBP: Responded to all Google reviews, published daily posts all 7 days\n- Indeed: Live job postings for front-of-house and kitchen staff\n- Instantly warmup running smoothly — 20 warmup emails/day going out across all 4 domains (this is controlled warmup traffic, not prospect outreach)',
    E'- Identified 12 oceanfront hotel concierge contacts as prime catering targets\n- Flagged the Myrtle Beach Chamber of Commerce luncheon event as a high-value catering lead\n- Real estate sector (32KB list) flagged as highest-volume segment for first outreach wave\n- Construction & HVAC sector (29KB list) identified as strong lunch delivery target',
    NULL,
    E'- Continue warming — entering Week 2 of 6 (ramping to 30 emails/day per domain by end of week)\n- Complete final verification pass on the full 3,330+ contact database across all 19 industries\n- Finalize merch designs with Opossum Works\n- Begin on-page SEO work for "best pizza in Myrtle Beach" and related keywords',
    'Instantly warmup health scores looking strong on all 4 domains. 20 warmup emails/day is controlled infrastructure traffic — not actual prospect outreach yet. List is at 3,330+ contacts across 19 industry segments and growing (healthcare additions made this week).',
    'published'
  );

  RAISE NOTICE 'Weekly reports inserted for Genova''s (client %)', CLIENT_ID;
END $$;
