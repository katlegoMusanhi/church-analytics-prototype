-- Church Growth Intelligence: private-by-default backend foundation.
-- Run only in a dedicated STAGING Supabase project first.
-- No real visitor names, contact details, or religious information is stored in this MVP.
-- Requires Supabase Auth (auth.users) and PostgreSQL 15+.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 3 and 120),
  created_at timestamptz not null default now()
);

create table if not exists public.church_memberships (
  church_id uuid not null references public.churches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (church_id,user_id)
);
create index if not exists idx_membership_user_church on public.church_memberships (user_id,church_id);

-- Security definer avoids recursive RLS policies against church_memberships.
-- Function owner must be a trusted administrative role such as postgres.
-- Explicit schema qualifications and empty search_path prevent shadowing.
create or replace function private.can_view_church(target_church uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.church_memberships m
    where m.church_id = target_church and m.user_id = (select auth.uid())
  )
$$;

create or replace function private.can_edit_church(target_church uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.church_memberships m
    where m.church_id = target_church and m.user_id = (select auth.uid())
      and m.role in ('owner','admin','editor')
  )
$$;

revoke all on function private.can_view_church(uuid) from public, anon;
revoke all on function private.can_edit_church(uuid) from public, anon;
grant execute on function private.can_view_church(uuid) to authenticated;
grant execute on function private.can_edit_church(uuid) to authenticated;

-- Campaign: estimated reach counts encounters, NOT unique persons.
create table if not exists public.outreach_campaigns (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 3 and 120),
  channel text not null check (channel in ('Community','Campus','Event','Digital','Partnership','Other')),
  start_date date not null,
  estimated_reach integer not null default 0 check (estimated_reach >= 0),
  estimated_spend numeric(12,2) not null default 0 check (estimated_spend >= 0),
  created_at timestamptz not null default now(),
  unique (id,church_id)
);

-- The MVP stores pseudonymous visitor identifiers, not names/contact/religion.
-- The composite foreign key guarantees campaign attribution stays in one church.
create table if not exists public.first_visits (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  visitor_code text not null check (char_length(trim(visitor_code)) between 3 and 60),
  campaign_id uuid not null,
  first_visit_date date not null,
  returned_on date null,
  created_at timestamptz not null default now(),
  unique (id,church_id),
  unique (church_id,visitor_code),
  foreign key (campaign_id,church_id)
    references public.outreach_campaigns(id,church_id) on delete restrict,
  constraint return_not_before_first_visit
    check (returned_on is null or returned_on >= first_visit_date)
);

create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  first_visit_id uuid not null,
  task_type text not null check (task_type in
    ('Welcome call','Invite to gathering','Personal check-in',
     'Volunteer team introduction','Pastoral follow-up')),
  assigned_team text not null check (assigned_team in
    ('Welcome team','Connect team','Care team','Outreach team')),
  due_on date not null,
  completed_on date null,
  created_at timestamptz not null default now(),
  unique (id,church_id),
  foreign key (first_visit_id,church_id)
    references public.first_visits(id,church_id) on delete cascade
);

-- Stop row updates from transferring an object to another church.
-- A user with access to two churches must never reassign one record to the other.
create or replace function private.prevent_church_reassignment()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  if new.church_id is distinct from old.church_id then
    raise exception 'church_id cannot be changed after creation'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger campaigns_immutable_church
before update on public.outreach_campaigns
for each row execute function private.prevent_church_reassignment();

create trigger first_visits_immutable_church
before update on public.first_visits
for each row execute function private.prevent_church_reassignment();

create trigger tasks_immutable_church
before update on public.follow_up_tasks
for each row execute function private.prevent_church_reassignment();

create index if not exists idx_campaigns_church_date on public.outreach_campaigns(church_id,start_date desc);
create index if not exists idx_visits_church_date on public.first_visits(church_id,first_visit_date desc);
create index if not exists idx_visits_church_campaign on public.first_visits(church_id,campaign_id);
create index if not exists idx_tasks_church_due on public.follow_up_tasks(church_id,due_on);
create index if not exists idx_tasks_church_visit on public.follow_up_tasks(church_id,first_visit_id);

-- Grant nothing to anonymous clients; server-only church provisioning.
revoke all on table public.churches,public.church_memberships,
  public.outreach_campaigns,public.first_visits,public.follow_up_tasks
  from anon,authenticated;
grant select on public.churches,public.church_memberships to authenticated;
grant select,insert,update on public.outreach_campaigns,
  public.first_visits,public.follow_up_tasks to authenticated;

alter table public.churches enable row level security;
alter table public.church_memberships enable row level security;
alter table public.outreach_campaigns enable row level security;
alter table public.first_visits enable row level security;
alter table public.follow_up_tasks enable row level security;

-- Church and membership creation/role changes must be performed by trusted server
-- provisioning code. No authenticated-user INSERT/UPDATE policies here.
create policy "Members see their own churches"
on public.churches for select to authenticated
using ((select private.can_view_church(id)));

create policy "Users see their own memberships"
on public.church_memberships for select to authenticated
using (user_id = (select auth.uid()));

create policy "Members read outreach campaigns"
on public.outreach_campaigns for select to authenticated
using ((select private.can_view_church(church_id)));
create policy "Editors create outreach campaigns"
on public.outreach_campaigns for insert to authenticated
with check ((select private.can_edit_church(church_id)));
create policy "Editors update outreach campaigns"
on public.outreach_campaigns for update to authenticated
using ((select private.can_edit_church(church_id)))
with check ((select private.can_edit_church(church_id)));

create policy "Members read first visits"
on public.first_visits for select to authenticated
using ((select private.can_view_church(church_id)));
create policy "Editors record first visits"
on public.first_visits for insert to authenticated
with check ((select private.can_edit_church(church_id)));
create policy "Editors update first visits"
on public.first_visits for update to authenticated
using ((select private.can_edit_church(church_id)))
with check ((select private.can_edit_church(church_id)));

create policy "Members read follow up tasks"
on public.follow_up_tasks for select to authenticated
using ((select private.can_view_church(church_id)));
create policy "Editors create follow up tasks"
on public.follow_up_tasks for insert to authenticated
with check ((select private.can_edit_church(church_id)));
create policy "Editors update follow up tasks"
on public.follow_up_tasks for update to authenticated
using ((select private.can_edit_church(church_id)))
with check ((select private.can_edit_church(church_id)));

-- No client-side delete privileges or RLS delete policies in this first phase.
-- Policies only take effect when the DB is accessed using a real signed-in JWT.
