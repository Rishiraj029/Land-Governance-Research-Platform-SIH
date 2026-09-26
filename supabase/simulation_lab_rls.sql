-- Policy Simulation Lab: minimum access for saved simulation runs.
-- This migration changes grants and policies only; it does not alter table data or columns.

begin;

alter table public.simulation_runs enable row level security;

revoke all on table public.simulation_runs from public, anon, authenticated;
grant select, insert on table public.simulation_runs to authenticated;

-- Remove existing policies on this table so no permissive policy can broaden access.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'simulation_runs'
  loop
    execute format(
      'drop policy %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

create policy "simulation_runs_read_own" on public.simulation_runs
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

create policy "simulation_runs_insert_own" on public.simulation_runs
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and coalesce((select auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

commit;
