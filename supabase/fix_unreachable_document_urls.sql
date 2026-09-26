-- =====================================================
-- FIX: two repository documents whose file URLs do not answer
-- =====================================================
-- Supersedes fix_smart_cities_dead_url.sql (same change for Smart Cities, plus
-- the RFCTLARR record). Both statements are idempotent: they match the OLD
-- value, so re-running them (or running the older file) changes nothing.
--
-- Every replacement below was measured from this machine and confirmed to
-- render inside an <iframe> (the app's preview), not only at top level.
--
-- MEASURED BEFORE
--   1. Smart Cities  http://164.100.161.224/content/innerpage/guidelines.php
--        -> connection timed out (15 s, http and https). Browser iframe: blank,
--           load event after 21 s. Dead raw-IP host.
--   2. RFCTLARR 2013 https://www.indiacode.nic.in/bitstream/123456789/2121/1/A2013-30.pdf
--        -> timed out with 0 bytes after 30 s and again after 60 s. Browser
--           iframe: never fires load. (The indiacode.nic.in root page does answer.)
--
-- VERIFIED REPLACEMENTS
--   1. https://sscm.uphq.in/NewDesign/assets/Document/SmartCityGuidelines.pdf
--        HTTP 200, application/pdf, 1,667,468 bytes, "%PDF-1.7"
--        Host: sscm.uphq.in — Government of Uttar Pradesh, State Smart Cities
--        Mission, republishing the central "Smart City Mission Statement &
--        Guidelines" (MoUD, June 2015). No X-Frame-Options / CSP -> renders in
--        the app's iframe (visually confirmed: cover page renders).
--   2. https://bhoomirashi.gov.in/auth/revamp/la_act.pdf
--        HTTP 200, application/pdf (~2.6 MB)
--        Host: bhoomirashi.gov.in — Government of Maharashtra land records.
--        Content confirmed in the browser: "The Gazette of India", Ministry of
--        Law and Justice (Legislative Department), New Delhi 26 September 2013,
--        "THE RIGHT TO FAIR COMPENSATION AND TRANSPARENCY IN LAND ACQUISITION,
--        REHABILITATION AND RESETTLEMENT ACT, 2013". No X-Frame-Options ->
--        renders in the app's iframe.
--
-- NOT CHANGED (no working government mirror found)
--   National Geospatial Policy 2022 -> https://dst.gov.in/sites/default/files/National%20Geospatial%20Policy.pdf
--     The URL is alive (HTTP 200, application/pdf, 1,675,799 bytes) but the host
--     sends `X-Frame-Options: SAMEORIGIN`, so Chrome refuses to show it inside an
--     iframe ("refused to connect"). It opens and downloads normally in a new tab.
--     No alternative government-hosted copy was found, so the URL is left as-is.
--
-- SCOPE: only `file_path` (and `updated_at`) for the two rows that still point at
-- the unreachable URLs. No schema, no constraints, no Storage/RLS, no Workspace.
-- APPLY: run in the Supabase SQL editor.
-- =====================================================

-- 1) Smart Cities Mission — dead raw-IP host
UPDATE public.repository_documents
SET file_path  = 'https://sscm.uphq.in/NewDesign/assets/Document/SmartCityGuidelines.pdf',
    updated_at = NOW()
WHERE title = 'Smart Cities Mission: Urban Transformation Guidelines'
  AND file_path = 'http://164.100.161.224/content/innerpage/guidelines.php';

-- 2) RFCTLARR 2013 — India Code bitstream does not answer
UPDATE public.repository_documents
SET file_path  = 'https://bhoomirashi.gov.in/auth/revamp/la_act.pdf',
    updated_at = NOW()
WHERE title = 'Right to Fair Compensation and Transparency in Land Acquisition Act 2013'
  AND file_path = 'https://www.indiacode.nic.in/bitstream/123456789/2121/1/A2013-30.pdf';

-- =====================================================
-- VERIFY — all five file URLs after applying
-- =====================================================
SELECT title, file_path, mime_type, access_tier
FROM public.repository_documents
WHERE title IN (
  'Smart Cities Mission: Urban Transformation Guidelines',
  'SVAMITVA Scheme: Property Card Documentation',
  'National Geospatial Policy 2022',
  'Forest Rights Act 2006: Implementation Guidelines',
  'Right to Fair Compensation and Transparency in Land Acquisition Act 2013'
)
ORDER BY title;
