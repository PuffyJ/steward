-- ============================================================================
-- STEWARD CRM — Supabase Schema
-- Run this in your Supabase SQL Editor (Settings > SQL Editor)
-- ============================================================================

-- 1. ORGANIZATIONS
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

alter table organizations enable row level security;

create policy "Members can read their org"
  on organizations for select using (
    id in (select org_id from memberships where user_id = auth.uid())
  );

create policy "Admins can update their org"
  on organizations for update using (
    id in (
      select org_id from memberships
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- 2. MEMBERSHIPS
create table memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'steward' check (role in ('admin', 'steward', 'viewer')),
  display_name text not null,
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

alter table memberships enable row level security;

create policy "Users can read memberships for their orgs"
  on memberships for select using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );

create policy "Admins can manage memberships"
  on memberships for all using (
    org_id in (
      select org_id from memberships
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- 3. CONTACTS
create table contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  display_name text not null,
  organization text,
  category text check (category in ('Individual', 'Organization')),
  contact_type text check (contact_type in ('Donor', 'Foundation', 'Board Member', 'Church')),
  tier text check (tier in ('Tier 1', 'Tier 2', 'Tier 3')),
  capacity numeric,
  priority text check (priority in ('A - Must Cultivate', 'B - Should Cultivate', 'C - Maintain')),
  region text,
  email text,
  steward_id uuid references memberships(id),
  stage text check (stage in ('Qualification', 'Cultivation', 'Solicitation', 'Negotiation', 'Stewardship')),
  ask_amount numeric,
  probability numeric check (probability >= 0 and probability <= 1),
  next_action text,
  next_action_date date,
  given_current_year numeric default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table contacts enable row level security;

create policy "Org isolation for contacts"
  on contacts for all using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contacts_updated_at
  before update on contacts
  for each row execute function update_updated_at();

-- 4. INTERACTIONS
create table interactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete cascade not null,
  date date not null default current_date,
  type text check (type in ('Phone Call', 'Email', 'Coffee Meeting', 'Vision Briefing', 'Personal Outreach', 'Event', 'Other')),
  summary text,
  outcome text check (outcome in ('Positive', 'Neutral', 'Needs Follow-Up')),
  next_step text,
  follow_up_date date,
  logged_by uuid references memberships(id),
  created_at timestamptz default now()
);

alter table interactions enable row level security;

create policy "Org isolation for interactions"
  on interactions for all using (
    org_id in (select org_id from memberships where user_id = auth.uid())
  );

-- 5. INDEXES
create index idx_contacts_org on contacts(org_id);
create index idx_contacts_steward on contacts(steward_id);
create index idx_contacts_stage on contacts(stage);
create index idx_contacts_next_action_date on contacts(next_action_date);
create index idx_interactions_org on interactions(org_id);
create index idx_interactions_contact on interactions(contact_id);
create index idx_interactions_date on interactions(date);
create index idx_memberships_org on memberships(org_id);
create index idx_memberships_user on memberships(user_id);

-- 6. VIEW: Contacts with steward name (convenience)
create or replace view contacts_with_steward as
select
  c.*,
  m.display_name as steward_name,
  c.ask_amount * c.probability as forecast
from contacts c
left join memberships m on c.steward_id = m.id;
