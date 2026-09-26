-- =====================================================
-- ONE-TIME MIGRATION — ADD THE FIVE VERIFIED PDF DOCUMENTS
-- =====================================================
-- Purpose: close the only remaining Repository data gap.
--
-- The live `repository_documents` table does NOT contain these five verified
-- government PDF records, although their exact metadata and public URLs already
-- exist in supabase/seed_mvp.sql.
--
-- WHY A SEPARATE FILE: seed_mvp.sql is NOT idempotent — it uses gen_random_uuid()
-- for ids and there is no unique constraint on `title`, so re-running it would
-- insert a second batch of records (duplicates).
--
-- This file:
--   * inserts ONLY the five records listed below;
--   * uses the EXACT metadata, file names, sizes and URLs already present in
--     seed_mvp.sql — nothing is invented or modified;
--   * is idempotent: fixed ids plus NOT EXISTS guards on both `title` and `id`,
--     so re-running it never creates duplicates;
--   * adds NO schema, NO constraints, NO indexes;
--   * does NOT touch Storage, Storage RLS, buckets, signed URLs or Workspaces.
--
-- HOW TO APPLY: run once in the Supabase SQL editor (Dashboard → SQL Editor) and
-- then run the verification SELECT at the bottom of this file.
-- =====================================================

INSERT INTO public.repository_documents (
  id, title, description, summary, content_type, theme, author, institution,
  state, district, language, access_tier, file_path, file_name, file_size, mime_type,
  published_at, created_by, created_at, updated_at
)
SELECT
  v.id, v.title, v.description, v.summary, v.content_type, v.theme, v.author, v.institution,
  v.state, v.district, v.language, v.access_tier, v.file_path, v.file_name, v.file_size, v.mime_type,
  v.published_at, NULL, NOW(), NOW()
FROM (VALUES
  (
    '35ec23fd-114b-4036-a776-342097c758df'::uuid,
    'Smart Cities Mission: Urban Transformation Guidelines',
    'Official Government of India Smart Cities Mission publication on urban development and land use planning.',
    'This official government publication provides comprehensive guidelines for urban transformation under the Smart Cities Mission, focusing on land use planning, area-based development, and integrated infrastructure development.',
    'Policy Document',
    'Urbanization',
    'Ministry of Housing and Urban Affairs',
    'Government of India',
    'India',
    'National',
    'English',
    'Public',
    'http://164.100.161.224/content/innerpage/guidelines.php',
    'Smart_Cities_Mission_Guidelines_English.pdf',
    1747600,
    'application/pdf',
    '2015-06-25'::date
  ),
  (
    '141d7a85-6e4d-4503-9c0b-696012ef0498'::uuid,
    'SVAMITVA Scheme: Property Card Documentation',
    'Official Government of India documentation on the SVAMITVA scheme for rural property mapping and ownership documentation.',
    'This official government document provides comprehensive information on the SVAMITVA scheme, including the process for creating property cards using drone survey technology, implementation status, and benefits for rural property owners.',
    'Policy Document',
    'Digital Transformation',
    'Ministry of Panchayati Raj',
    'Government of India',
    'India',
    'National',
    'English',
    'Public',
    'https://svamitva.nic.in/DownloadPDF/Svamitva_Guidelines_%20(2021-2025).pdf',
    'SVAMITVA_Guidelines_2021-2025.pdf',
    2580000,
    'application/pdf',
    '2021-04-24'::date
  ),
  (
    '92024676-b65f-46b4-bca1-59d8f21f626f'::uuid,
    'National Geospatial Policy 2022',
    'Official Government of India National Geospatial Policy for geospatial data management and governance.',
    'This official government policy document establishes the framework for national geospatial data management, including standards, infrastructure, data sharing protocols, and governance mechanisms for geospatial information across all sectors.',
    'Policy Document',
    'Digital Transformation',
    'Ministry of Science and Technology',
    'Government of India',
    'India',
    'National',
    'English',
    'Public',
    'https://dst.gov.in/sites/default/files/National%20Geospatial%20Policy.pdf',
    'National_Geospatial_Policy_2022.pdf',
    1679360,
    'application/pdf',
    '2022-12-28'::date
  ),
  (
    'eb1f0863-7fc0-4785-9a62-b050ad4f1dc0'::uuid,
    'Forest Rights Act 2006: Implementation Guidelines',
    'Official Government of India implementation guidelines for the Scheduled Tribes and Other Traditional Forest Dwellers Act.',
    'This official government document provides comprehensive implementation guidelines for the Forest Rights Act 2006, including procedures for recognizing forest land rights, processing claims, and ensuring tenure security for forest-dwelling communities.',
    'Legal Document',
    'Tenure Security',
    'Ministry of Tribal Affairs',
    'Government of India',
    'India',
    'National',
    'English',
    'Public',
    'https://tribal.nic.in/FRA/data/Guidelines.pdf',
    'Forest_Rights_Act_2006_Guidelines.pdf',
    520000,
    'application/pdf',
    '2010-04-01'::date
  ),
  (
    'c75e9d3b-6576-40cf-ae6f-d67c1b150332'::uuid,
    'Right to Fair Compensation and Transparency in Land Acquisition Act 2013',
    'Official legislation text of the Right to Fair Compensation and Transparency in Land Acquisition Act.',
    'This is the official text of the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act 2013, including all amendments and rules for implementation.',
    'Legal Document',
    'Legal Framework',
    'Ministry of Rural Development',
    'Government of India',
    'India',
    'National',
    'English',
    'Public',
    'https://www.indiacode.nic.in/bitstream/123456789/2121/1/A2013-30.pdf',
    'Land_Acquisition_Act_2013.pdf',
    480000,
    'application/pdf',
    '2013-09-26'::date
  )
) AS v(
  id, title, description, summary, content_type, theme, author, institution,
  state, district, language, access_tier, file_path, file_name, file_size, mime_type, published_at
)
-- Guard 1: never insert a second copy of a title that already exists.
WHERE NOT EXISTS (
  SELECT 1 FROM public.repository_documents d WHERE d.title = v.title
)
-- Guard 2: never collide with an already-used id.
AND NOT EXISTS (
  SELECT 1 FROM public.repository_documents d2 WHERE d2.id = v.id
);

-- =====================================================
-- VERIFICATION — run after the INSERT above
-- =====================================================
SELECT id, title, file_path, file_name, file_size, mime_type, access_tier, published_at
FROM public.repository_documents
WHERE title IN (
  'Smart Cities Mission: Urban Transformation Guidelines',
  'SVAMITVA Scheme: Property Card Documentation',
  'National Geospatial Policy 2022',
  'Forest Rights Act 2006: Implementation Guidelines',
  'Right to Fair Compensation and Transparency in Land Acquisition Act 2013'
)
ORDER BY title;
