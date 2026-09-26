-- =====================================================
-- STORAGE RLS POLICIES — PRIVATE `documents` BUCKET
-- =====================================================
-- Fixes: StorageApiError "new row violates row-level security policy" (HTTP 400)
-- raised by the Repository "Contribute to Repository" upload.
--
-- Security model enforced here:
--   * bucket `documents` stays PRIVATE (never public)
--   * an authenticated user may INSERT an object only when the FIRST path segment
--     equals their own auth.uid()
--   * an authenticated user may SELECT / UPDATE / DELETE only their own objects
--   * RLS on storage.objects stays ENABLED
--   * no service-role key is used anywhere in frontend code (anon key only)
--
-- Object path produced by the frontend (frontend/src/lib/supabaseRepository.ts):
--   bucket:  documents
--   object:  {auth-user-id}/{document-id}.{extension}
--   full:    documents/{auth-user-id}/{document-id}.pdf
--
-- Apply in the Supabase SQL editor (or as a migration). Safe to re-run: it only
-- drops the four policies it creates, by name, before recreating them.
-- =====================================================

-- 0) Inspect what exists right now BEFORE changing anything:
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'storage' AND tablename = 'objects'
-- ORDER BY policyname;

-- 1) Bucket must exist and stay private. (No-op guard: the upload already fails
--    with an RLS violation rather than "Bucket not found", so the bucket exists.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- RLS must remain enabled on storage.objects.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2) Recreate the own-folder policies for this bucket.
DROP POLICY IF EXISTS "documents: insert own folder" ON storage.objects;
DROP POLICY IF EXISTS "documents: select own files" ON storage.objects;
DROP POLICY IF EXISTS "documents: update own files" ON storage.objects;
DROP POLICY IF EXISTS "documents: delete own files" ON storage.objects;

-- Upload: first folder must be the caller's user id.
CREATE POLICY "documents: insert own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Read back: only the caller's own files.
CREATE POLICY "documents: select own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Update (e.g. re-upload/overwrite) only inside the caller's own folder.
CREATE POLICY "documents: update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
)
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Delete only the caller's own files.
CREATE POLICY "documents: delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- 3) Verify after applying:
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'documents:%'
-- ORDER BY policyname;
--
-- NOTE: these policies are deliberately own-folder only, per the intended model
-- ("authenticated users may access their own uploaded files"). If contributed
-- documents should also be readable by OTHER signed-in users (a shared repository),
-- the SELECT policy above must be widened explicitly — and the frontend should use
-- createSignedUrl() for storage-backed files (a public URL does not work for a
-- private bucket).
