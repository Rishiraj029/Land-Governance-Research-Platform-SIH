-- Dashboard / Profile / Admin support migration.
--
-- Review and run this in the Supabase SQL Editor. It is additive and idempotent: it creates
-- no tables, deletes no data, disables no RLS, and revokes nothing from an existing grant.
--
-- It covers the two gaps the dashboard work exposed:
--   1. public.saved_searches had no API grants or policies for the `authenticated` role, so the
--      "Saved Searches" dashboard page could never read or write the user's own rows.
--   2. public.profiles had no API grants at all, so neither the Settings page nor the Admin
--      Panel could read a profile (the dashboard logged 403s from PostgREST). It also had no
--      restriction on the `role` column, which would let any signed-in user promote themselves
--      to `admin`. The Admin Panel trusts that column, so it must be trustworthy.
--
-- Verified column sets (live schema):
--   public.saved_searches : id, user_id, name, query, filters, created_at
--   public.profiles       : id, full_name, role, institution, created_at, updated_at

begin;

-- ---------------------------------------------------------------------------
-- 1. saved_searches — let a user manage only their own rows
-- ---------------------------------------------------------------------------

-- The client inserts without an `id`. If the column has no default the insert would fail with
-- 23502, so add one, but only when `id` really is a uuid without a default.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'saved_searches'
      and column_name = 'id'
      and data_type = 'uuid'
      and column_default is null
  ) then
    alter table public.saved_searches alter column id set default gen_random_uuid();
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'saved_searches'
      and column_name = 'created_at'
      and data_type in ('timestamp with time zone', 'timestamp without time zone')
      and column_default is null
  ) then
    alter table public.saved_searches alter column created_at set default now();
  end if;
end
$$;

alter table public.saved_searches enable row level security;

-- Additive grants only: nothing already granted is revoked.
grant select, insert, delete on table public.saved_searches to authenticated;

drop policy if exists "saved_searches_select_own" on public.saved_searches;
create policy "saved_searches_select_own" on public.saved_searches
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists "saved_searches_insert_own" on public.saved_searches;
create policy "saved_searches_insert_own" on public.saved_searches
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists "saved_searches_delete_own" on public.saved_searches;
create policy "saved_searches_delete_own" on public.saved_searches
  for delete to authenticated
  using (
    (select auth.uid()) = user_id
    and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

-- ---------------------------------------------------------------------------
-- 2. profiles — allow editing your own row, but never your own role
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

grant select, update on table public.profiles to authenticated;

-- Reads are deliberately narrow: you may always read your own row, and an administrator may
-- read every row. Nothing else is exposed, so names, roles and institutions are not published
-- to every signed-in account.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

-- Helper for the admin-only policy below. It must be SECURITY DEFINER: a policy on
-- public.profiles that selected from public.profiles would otherwise recurse infinitely.
-- Because the function runs as its owner (the table owner), it is not subject to the very
-- policy it is used by.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using (public.is_admin());

-- The Settings page saves full_name and institution for the caller's own row.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (
    (select auth.uid()) = id
    and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  )
  with check (
    (select auth.uid()) = id
    and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

-- A row-level policy cannot compare the old and new value of `role`, so a trigger enforces the
-- rule that only an existing administrator may change a role. Trigger functions do not need
-- EXECUTE privilege for the invoking role, so it is revoked from the API roles.
create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller uuid := (select auth.uid());
  caller_is_admin boolean := false;
begin
  -- Nothing to police when the role is untouched, or when the change comes from a trusted
  -- context with no end-user JWT (the SQL editor, migrations, service_role).
  if new.role is not distinct from old.role then
    return new;
  end if;

  if caller is null then
    return new;
  end if;

  select exists (
    select 1 from public.profiles
    where id = caller and role = 'admin'
  ) into caller_is_admin;

  if caller = old.id then
    if not caller_is_admin then
      raise exception 'You are not allowed to change your own role.'
        using errcode = '42501';
    end if;
  elsif not caller_is_admin then
    raise exception 'Only administrators can change another account''s role.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.guard_profile_role_change() from public, anon, authenticated;

drop trigger if exists profiles_guard_role_change on public.profiles;
create trigger profiles_guard_role_change
before update on public.profiles
for each row execute function public.guard_profile_role_change();

commit;

-- ---------------------------------------------------------------------------
-- 3. Grant yourself the admin role (run separately, after the block above).
--    Replace the email, then verify the row it reports.
-- ---------------------------------------------------------------------------
--
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
--
-- select p.id, p.full_name, p.role, p.institution, u.email
-- from public.profiles p
-- join auth.users u on u.id = p.id
-- order by p.created_at desc;
