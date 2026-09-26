-- Innovation Portal MVP: explicit API grants, RLS policies, and an atomic
-- server-side support counter. Review and run in the Supabase SQL Editor.
-- This file references only the existing public.innovations and
-- public.innovation_support columns.

alter table public.innovations enable row level security;
alter table public.innovation_support enable row level security;

revoke all on table public.innovations from anon, authenticated;
revoke all on table public.innovation_support from anon, authenticated;

grant select on table public.innovations to anon, authenticated;
grant insert on table public.innovations to authenticated;
grant select, insert, delete on table public.innovation_support to authenticated;

drop policy if exists "innovation_public_read" on public.innovations;
create policy "innovation_public_read" on public.innovations
  for select to anon, authenticated using (true);

drop policy if exists "innovation_submit_own" on public.innovations;
create policy "innovation_submit_own" on public.innovations
  for insert to authenticated
  with check ((select auth.uid()) = submitted_by and status = 'Submitted');

drop policy if exists "innovation_support_read_own" on public.innovation_support;
create policy "innovation_support_read_own" on public.innovation_support
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "innovation_support_insert_own" on public.innovation_support;
create policy "innovation_support_insert_own" on public.innovation_support
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "innovation_support_delete_own" on public.innovation_support;
create policy "innovation_support_delete_own" on public.innovation_support
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Clients never receive UPDATE permission on innovations, so they cannot forge
-- support_count. The trigger recomputes it from the source-of-truth support rows.
create or replace function public.sync_innovation_support_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    update public.innovations
    set support_count = (select count(*) from public.innovation_support where innovation_id = old.innovation_id)
    where id = old.innovation_id;
    return old;
  end if;

  update public.innovations
  set support_count = (select count(*) from public.innovation_support where innovation_id = new.innovation_id)
  where id = new.innovation_id;
  return new;
end;
$$;

revoke all on function public.sync_innovation_support_count() from public, anon, authenticated;

drop trigger if exists innovation_support_count_after_change on public.innovation_support;
create trigger innovation_support_count_after_change
after insert or delete on public.innovation_support
for each row execute function public.sync_innovation_support_count();
