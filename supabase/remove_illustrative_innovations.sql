-- Innovation Portal cleanup migration.
-- Removes only the known fabricated seed rows and their associated supports.
-- It intentionally does not add catalogue records or create replacement data.

delete from public.innovation_support
where innovation_id in (
  select id
  from public.innovations
  where title like 'Illustrative Innovation:%'
);

delete from public.innovations
where title like 'Illustrative Innovation:%';
