-- Church Growth Intelligence: Neon staging schema.
-- Requires provisioned Neon Auth and Neon Data API with authenticated role.
-- No secrets or real member data. Apply only to fresh, empty staging database.
-- Provision churches/memberships with trusted database owner, never public client.
-- Definer functions rely on the trusted owner bypassing membership-table RLS.

create table public.churches (id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name)) between 3 and 120), created_at timestamptz not null default now());

create table public.church_memberships (church_id uuid not null references public.churches(id) on delete cascade, user_id text not null check(length(user_id)>0), role text not null check (role in ('owner','admin','editor','viewer')), created_at timestamptz not null default now(), primary key(church_id,user_id));

create index idx_memberships_user on public.church_memberships(user_id,church_id);

create table public.outreach_campaigns (id uuid primary key default gen_random_uuid(), church_id uuid not null references public.churches(id) on delete cascade, name text not null check (length(trim(name)) between 3 and 120), channel text not null check(channel in ('Community','Campus','Event','Digital','Partnership','Other')), start_date date not null, estimated_reach integer not null default 0 check(estimated_reach>=0), estimated_spend numeric(12,2) not null default 0 check(estimated_spend>=0), created_at timestamptz not null default now(), unique(id,church_id));

create table public.first_visits (id uuid primary key default gen_random_uuid(), church_id uuid not null references public.churches(id) on delete cascade, visitor_code text not null check(length(trim(visitor_code)) between 3 and 60), campaign_id uuid not null, first_visit_date date not null, returned_on date, created_at timestamptz not null default now(), unique(id,church_id), unique(church_id,visitor_code), foreign key(campaign_id,church_id) references public.outreach_campaigns(id,church_id), check(returned_on is null or returned_on>=first_visit_date));

create table public.follow_up_tasks (id uuid primary key default gen_random_uuid(), church_id uuid not null references public.churches(id) on delete cascade, first_visit_id uuid not null, task_type text not null check(task_type in ('Welcome call','Invite to gathering','Personal check-in','Volunteer team introduction','Pastoral follow-up')), assigned_team text not null check(assigned_team in ('Welcome team','Connect team','Care team','Outreach team')), due_on date not null, completed_on date, created_at timestamptz not null default now(), unique(id,church_id), foreign key(first_visit_id,church_id) references public.first_visits(id,church_id));

create index idx_campaigns_church_date on public.outreach_campaigns(church_id,start_date desc);

create index idx_visits_church_date on public.first_visits(church_id,first_visit_date desc);

create index idx_visits_church_campaign on public.first_visits(church_id,campaign_id);

create index idx_tasks_church_due on public.follow_up_tasks(church_id,due_on);

create schema if not exists app_private;

revoke all on schema app_private from public;

grant usage on schema app_private to authenticated;

create function app_private.can_read(target_church uuid) returns boolean language sql stable security definer set search_path='' as $$ select (select auth.user_id()) is not null and exists(select 1 from public.church_memberships m where m.church_id=target_church and m.user_id=(select auth.user_id())) $$;

create function app_private.can_write(target_church uuid) returns boolean language sql stable security definer set search_path='' as $$ select (select auth.user_id()) is not null and exists(select 1 from public.church_memberships m where m.church_id=target_church and m.user_id=(select auth.user_id()) and m.role in ('owner','admin','editor')) $$;

create function app_private.is_current_user(member_user_id text) returns boolean language sql stable security definer set search_path='' as $ select (select auth.user_id()) is not null and member_user_id=(select auth.user_id()) $;

revoke all on function app_private.can_read(uuid),app_private.can_write(uuid) from public;

revoke all on function app_private.is_current_user(text) from public;

grant execute on function app_private.can_read(uuid),app_private.can_write(uuid) to authenticated;

grant execute on function app_private.is_current_user(text) to authenticated;

create function app_private.guard_record_identity() returns trigger language plpgsql set search_path='' as $$ begin if new.id is distinct from old.id or new.church_id is distinct from old.church_id then raise exception 'record ID and church are immutable' using errcode='42501'; end if; return new; end $$;

create trigger guard_campaign before update on public.outreach_campaigns for each row execute function app_private.guard_record_identity();

create trigger guard_visit before update on public.first_visits for each row execute function app_private.guard_record_identity();

create trigger guard_task before update on public.follow_up_tasks for each row execute function app_private.guard_record_identity();

revoke all on public.churches,public.church_memberships,public.outreach_campaigns,public.first_visits,public.follow_up_tasks from public,anonymous,authenticated;

grant select on public.churches,public.church_memberships to authenticated;

grant select,insert,update on public.outreach_campaigns,public.first_visits,public.follow_up_tasks to authenticated;

alter table public.churches enable row level security;

alter table public.church_memberships enable row level security;

alter table public.outreach_campaigns enable row level security;

alter table public.first_visits enable row level security;

alter table public.follow_up_tasks enable row level security;

create policy churches_select on public.churches for select to authenticated using ((select app_private.can_read(id)));

create policy memberships_self on public.church_memberships for select to authenticated using ((select app_private.is_current_user(user_id)));

create policy campaigns_select on public.outreach_campaigns for select to authenticated using ((select app_private.can_read(church_id)));

create policy campaigns_insert on public.outreach_campaigns for insert to authenticated with check ((select app_private.can_write(church_id)));

create policy campaigns_update on public.outreach_campaigns for update to authenticated using ((select app_private.can_write(church_id))) with check ((select app_private.can_write(church_id)));

create policy visits_select on public.first_visits for select to authenticated using ((select app_private.can_read(church_id)));

create policy visits_insert on public.first_visits for insert to authenticated with check ((select app_private.can_write(church_id)));

create policy visits_update on public.first_visits for update to authenticated using ((select app_private.can_write(church_id))) with check ((select app_private.can_write(church_id)));

create policy tasks_select on public.follow_up_tasks for select to authenticated using ((select app_private.can_read(church_id)));

create policy tasks_insert on public.follow_up_tasks for insert to authenticated with check ((select app_private.can_write(church_id)));

create policy tasks_update on public.follow_up_tasks for update to authenticated using ((select app_private.can_write(church_id))) with check ((select app_private.can_write(church_id)));
