-- =====================================================
-- FIX: GIS Explorer cannot read public.gis_features
-- =====================================================
-- DISCOVERED PROBLEM (measured, not assumed)
--   Reading the table with the frontend's public key fails:
--     GET /rest/v1/gis_features  ->  HTTP 401
--     {"code":"42501","message":"permission denied for table gis_features",
--      "hint":"Grant the required privileges to the current role with:
--              GRANT SELECT ON public.gis_features TO anon;"}
--   The same request against public.repository_documents succeeds for the same
--   key, so the key itself is fine: the `gis_features` table is simply missing the
--   table-level SELECT grant for the API roles.
--
--   PostgREST reports a missing table privilege (42501), which is separate from Row
--   Level Security. Depending on how the table was created, either the grant, the
--   RLS SELECT policy, or both may be missing, so this file handles both.
--
-- WHAT THIS DOES
--   * grants SELECT on public.gis_features to anon and authenticated
--     (matching how public.repository_documents is already readable);
--   * adds a SELECT policy for those roles, so reads still work if RLS is enabled;
--   * touches ONLY public.gis_features — no other table, no schema change,
--     no column change, no RLS disabled, nothing in Storage or Workspace.
--
-- APPLY: run in the Supabase SQL editor, then reload /gis-explorer.
-- =====================================================

-- 0) Inspect the current state BEFORE changing anything
SELECT relrowsecurity AS rls_enabled
FROM pg_class
WHERE oid = 'public.gis_features'::regclass;

SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'gis_features'
ORDER BY policyname;

-- 1) Table-level read privilege for the API roles
GRANT SELECT ON TABLE public.gis_features TO anon;
GRANT SELECT ON TABLE public.gis_features TO authenticated;

-- 2) RLS read policy (harmless if RLS is disabled; required if it is enabled)
DROP POLICY IF EXISTS "gis features are readable" ON public.gis_features;

CREATE POLICY "gis features are readable"
ON public.gis_features
FOR SELECT
TO anon, authenticated
USING (true);

-- =====================================================
-- 3) VERIFY — run these after applying; the API request should now return rows
-- =====================================================
SELECT count(*) AS gis_feature_count FROM public.gis_features;

SELECT id, name, state, district, category, theme, latitude, longitude, dataset_name
FROM public.gis_features
ORDER BY state, name
LIMIT 10;

-- If the platform should NOT be publicly readable, restrict step 1-2 to
-- `authenticated` only and put the GIS route behind login instead of granting anon.
