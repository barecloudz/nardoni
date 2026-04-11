-- Weekly client reports
create table if not exists client_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  week_start date not null,
  emails_sent integer default 0,
  emails_responded integer default 0,
  active_conversations text,
  opportunities text,
  closed_this_week text,
  next_week_focus text,
  notes text,
  status text default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Per-client service value items (for the "what you'd normally pay" section)
create table if not exists client_service_values (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  service_name text not null,
  description text,
  market_price numeric not null,
  our_price numeric,           -- null = included in plan
  period text default 'monthly' check (period in ('one-time', 'monthly', 'yearly')),
  display_order integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- RLS
alter table client_reports enable row level security;
alter table client_service_values enable row level security;

-- Admins can do everything
create policy "Admins full access reports" on client_reports
  for all using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "Admins full access service values" on client_service_values
  for all using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Clients can read their own published reports and service values
create policy "Clients read own reports" on client_reports
  for select using (
    status = 'published' and
    exists (
      select 1 from clients
      where clients.id = client_reports.client_id
      and clients.user_id = auth.uid()
    )
  );

create policy "Clients read own service values" on client_service_values
  for select using (
    active = true and
    exists (
      select 1 from clients
      where clients.id = client_service_values.client_id
      and clients.user_id = auth.uid()
    )
  );
