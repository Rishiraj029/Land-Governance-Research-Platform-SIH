-- =====================================================
-- FIX: Dashboards Hub cannot read public.dashboard_indicators
-- =====================================================
-- DISCOVERED PROBLEM (measured, not assumed)
--   Reading the table with the frontend's public key fails:
--     GET /rest/v1/dashboard_indicators  ->  HTTP 401
--     {"code":"42501","message":"permission denied for table dashboard_indicators",
--      "hint":"Grant the required privileges to the current role with:
--              GRANT SELECT ON public.dashboard_indicators TO anon;"}
--   The same key already reads public.repository_documents and (after the GIS grant)
--   public.gis_features, so the key itself is fine: this table is simply missing the
--   table-level SELECT grant for the API roles.
--
--   PostgREST reports a missing table privilege (42501), which is separate from Row
--   Level Security. Depending on how the table was created, either the grant, the
--   RLS SELECT policy, or both may be missing, so this file handles both.
--
-- WHAT THIS DOES
--   * grants SELECT on public.dashboard_indicators to anon and authenticated
--     (matching how public.repository_documents is already readable);
--   * adds a SELECT policy for those roles, so reads still work when RLS is enabled;
--   * touches ONLY public.dashboard_indicators — no other table, no schema change,
--     no column change, no RLS disabled, nothing in Storage or Workspace.
--
-- APPLY: run in the Supabase SQL editor, then reload /dashboards.
-- =====================================================

-- 0) Inspect the current state BEFORE changing anything
SELECT relrowsecurity AS rls_enabled
FROM pg_class
WHERE oid = 'public.dashboard_indicators'::regclass;

SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'dashboard_indicators'
ORDER BY policyname;

-- 1) Table-level read privilege for the API roles
GRANT SELECT ON TABLE public.dashboard_indicators TO anon;
GRANT SELECT ON TABLE public.dashboard_indicators TO authenticated;

-- 2) RLS read policy (harmless if RLS is disabled; required if it is enabled)
DROP POLICY IF EXISTS "dashboard indicators are readable" ON public.dashboard_indicators;

CREATE POLICY "dashboard indicators are readable"
ON public.dashboard_indicators
FOR SELECT
TO anon, authenticated
USING (true);

-- =====================================================
-- 3) VERIFY — run after applying; the API request should now return rows
-- =====================================================
SELECT count(*) AS dashboard_indicator_count FROM public.dashboard_indicators;

SELECT indicator_name, category, state, district, year, value, unit, source
FROM public.dashboard_indicators
ORDER BY category, state, year
LIMIT 10;

-- If the dashboard data should NOT be publicly readable, restrict steps 1-2 to
-- `authenticated` only and put the /dashboards route behind login instead of
-- granting anon.
