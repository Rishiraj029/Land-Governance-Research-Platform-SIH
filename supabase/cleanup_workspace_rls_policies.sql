-- =====================================================
-- CLEANUP WORKSPACE RLS POLICIES - COMPLETE POLICY RESET
-- =====================================================
-- 
-- This migration performs a complete cleanup of workspace RLS policies
-- by dynamically removing ALL existing policies from the 6 workspace tables
-- and recreating only the intended non-recursive policies.
--
-- PROBLEM: Previous migration only dropped specific policy names,
-- but additional old policies remained installed, causing infinite recursion.
--
-- SOLUTION: Use a DO block to dynamically discover and drop ALL policies
-- from the 6 workspace tables, then recreate only the intended policies.
-- =====================================================

-- =====================================================
-- STEP 1: DYNAMICALLY DROP ALL EXISTING POLICIES
-- =====================================================
-- This DO block discovers every policy on the 6 workspace tables
-- and drops them, ensuring no old policies survive.

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies from workspaces table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'workspaces'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspaces', policy_record.policyname);
        RAISE NOTICE 'Dropped policy % on workspaces', policy_record.policyname;
    END LOOP;

    -- Drop all policies from workspace_members table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'workspace_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspace_members', policy_record.policyname);
        RAISE NOTICE 'Dropped policy % on workspace_members', policy_record.policyname;
    END LOOP;

    -- Drop all policies from workspace_documents table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'workspace_documents'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspace_documents', policy_record.policyname);
        RAISE NOTICE 'Dropped policy % on workspace_documents', policy_record.policyname;
    END LOOP;

    -- Drop all policies from research_notes table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'research_notes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.research_notes', policy_record.policyname);
        RAISE NOTICE 'Dropped policy % on research_notes', policy_record.policyname;
    END LOOP;

    -- Drop all policies from workspace_tasks table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'workspace_tasks'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspace_tasks', policy_record.policyname);
        RAISE NOTICE 'Dropped policy % on workspace_tasks', policy_record.policyname;
    END LOOP;

    -- Drop all policies from workspace_activity table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'workspace_activity'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspace_activity', policy_record.policyname);
        RAISE NOTICE 'Dropped policy % on workspace_activity', policy_record.policyname;
    END LOOP;

    RAISE NOTICE 'Successfully dropped all existing policies from workspace tables';
END $$;

-- =====================================================
-- STEP 2: VERIFY HELPER FUNCTIONS ARE CORRECT
-- =====================================================
-- Ensure the helper functions exist with proper SECURITY DEFINER settings
-- and correct parameter naming (p_workspace_id, p_user_id)

-- Helper function to check if user is workspace owner
CREATE OR REPLACE FUNCTION is_workspace_owner(p_workspace_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.workspaces w
    WHERE w.id = p_workspace_id 
      AND w.owner_id = p_user_id
  );
END;
$$;

-- Helper function to check if user is workspace member
CREATE OR REPLACE FUNCTION is_workspace_member(p_workspace_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.workspace_members wm
    WHERE wm.workspace_id = p_workspace_id 
      AND wm.user_id = p_user_id
  );
END;
$$;

-- Helper function to check if user can access workspace (owner or member)
CREATE OR REPLACE FUNCTION can_access_workspace(p_workspace_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN is_workspace_owner(p_workspace_id, p_user_id) 
         OR is_workspace_member(p_workspace_id, p_user_id);
END;
$$;

-- =====================================================
-- STEP 3: CREATE NEW NON-RECURSIVE POLICIES
-- =====================================================
-- All policies use SECURITY DEFINER helper functions
-- No policy directly queries workspace_members inside workspace_members policy
-- No circular dependencies between workspaces and workspace_members

-- WORKSPACES POLICIES

-- Users can view workspaces they own or are members of
CREATE POLICY "Users can view accessible workspaces"
ON workspaces
FOR SELECT
USING (public.can_access_workspace(id, auth.uid()));

-- Users can create workspaces (owner_id must be their own id)
CREATE POLICY "Users can create workspaces"
ON workspaces
FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Workspace owners can update their own workspaces
CREATE POLICY "Workspace owners can update workspaces"
ON workspaces
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Workspace owners can delete their own workspaces
CREATE POLICY "Workspace owners can delete workspaces"
ON workspaces
FOR DELETE
USING (owner_id = auth.uid());

-- WORKSPACE_MEMBERS POLICIES
-- Uses can_access_workspace helper - does NOT query workspace_members directly

-- Users can view membership of workspaces they can access
CREATE POLICY "Users can view workspace membership"
ON workspace_members
FOR SELECT
USING (public.can_access_workspace(workspace_id, auth.uid()));

-- Workspace owners can add members
CREATE POLICY "Workspace owners can add members"
ON workspace_members
FOR INSERT
WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

-- Workspace owners can remove members
CREATE POLICY "Workspace owners can remove members"
ON workspace_members
FOR DELETE
USING (public.is_workspace_owner(workspace_id, auth.uid()));

-- WORKSPACE_DOCUMENTS POLICIES
-- Uses can_access_workspace helper - does NOT query workspace_members

-- Users can view documents in workspaces they can access
CREATE POLICY "Users can view workspace documents"
ON workspace_documents
FOR SELECT
USING (public.can_access_workspace(workspace_id, auth.uid()));

-- Users can add documents to workspaces they can access
CREATE POLICY "Users can add documents to accessible workspaces"
ON workspace_documents
FOR INSERT
WITH CHECK (public.can_access_workspace(workspace_id, auth.uid()));

-- Workspace owners can remove documents
CREATE POLICY "Workspace owners can remove documents"
ON workspace_documents
FOR DELETE
USING (public.is_workspace_owner(workspace_id, auth.uid()));

-- RESEARCH_NOTES POLICIES
-- Uses can_access_workspace helper

-- Users can view notes in workspaces they can access
CREATE POLICY "Users can view research notes"
ON research_notes
FOR SELECT
USING (public.can_access_workspace(workspace_id, auth.uid()));

-- Users can create notes in workspaces they can access (and must be the author)
CREATE POLICY "Users can create notes in accessible workspaces"
ON research_notes
FOR INSERT
WITH CHECK (
  public.can_access_workspace(workspace_id, auth.uid())
  AND user_id = auth.uid()
);

-- Note authors can update their own notes
CREATE POLICY "Note authors can update own notes"
ON research_notes
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Note authors can delete their own notes
CREATE POLICY "Note authors can delete own notes"
ON research_notes
FOR DELETE
USING (user_id = auth.uid());

-- WORKSPACE_TASKS POLICIES
-- Uses can_access_workspace and is_workspace_owner helpers

-- Users can view tasks in workspaces they can access
CREATE POLICY "Users can view workspace tasks"
ON workspace_tasks
FOR SELECT
USING (public.can_access_workspace(workspace_id, auth.uid()));

-- Users can create tasks in workspaces they can access
CREATE POLICY "Users can create tasks in accessible workspaces"
ON workspace_tasks
FOR INSERT
WITH CHECK (public.can_access_workspace(workspace_id, auth.uid()));

-- Task assignees or workspace owners can update tasks
CREATE POLICY "Users can update tasks they can access"
ON workspace_tasks
FOR UPDATE
USING (
  assigned_to = auth.uid()
  OR public.is_workspace_owner(workspace_id, auth.uid())
)
WITH CHECK (
  assigned_to = auth.uid()
  OR public.is_workspace_owner(workspace_id, auth.uid())
);

-- WORKSPACE_ACTIVITY POLICIES
-- Uses can_access_workspace helper

-- Users can view activity in workspaces they can access
CREATE POLICY "Users can view workspace activity"
ON workspace_activity
FOR SELECT
USING (public.can_access_workspace(workspace_id, auth.uid()));

-- Users can create activity in workspaces they can access
CREATE POLICY "Users can create activity in accessible workspaces"
ON workspace_activity
FOR INSERT
WITH CHECK (public.can_access_workspace(workspace_id, auth.uid()));

-- =====================================================
-- STEP 4: ENSURE RLS IS ENABLED ON ALL TABLES
-- =====================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activity ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION QUERIES (run after migration)
-- =====================================================

-- 1. Verify only intended policies exist
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN (
--   'workspaces',
--   'workspace_members',
--   'workspace_documents',
--   'research_notes',
--   'workspace_tasks',
--   'workspace_activity'
-- )
-- ORDER BY tablename, policyname;

-- Expected result should contain ONLY these policies:
-- workspaces:
--   - Users can view accessible workspaces (SELECT)
--   - Users can create workspaces (INSERT)
--   - Workspace owners can update workspaces (UPDATE)
--   - Workspace owners can delete workspaces (DELETE)
--
-- workspace_members:
--   - Users can view workspace membership (SELECT)
--   - Workspace owners can add members (INSERT)
--   - Workspace owners can remove members (DELETE)
--
-- workspace_documents:
--   - Users can view workspace documents (SELECT)
--   - Users can add documents to accessible workspaces (INSERT)
--   - Workspace owners can remove documents (DELETE)
--
-- research_notes:
--   - Users can view research notes (SELECT)
--   - Users can create notes in accessible workspaces (INSERT)
--   - Note authors can update own notes (UPDATE)
--   - Note authors can delete own notes (DELETE)
--
-- workspace_tasks:
--   - Users can view workspace tasks (SELECT)
--   - Users can create tasks in accessible workspaces (INSERT)
--   - Users can update tasks they can access (UPDATE)
--
-- workspace_activity:
--   - Users can view workspace activity (SELECT)
--   - Users can create activity in accessible workspaces (INSERT)

-- 2. Verify helper functions are correct
-- SELECT
--   p.proname,
--   r.rolname AS function_owner,
--   p.prosecdef AS security_definer
-- FROM pg_proc p
-- JOIN pg_roles r ON r.oid = p.proowner
-- WHERE p.pronamespace = 'public'::regnamespace
--   AND p.proname IN (
--     'is_workspace_owner',
--     'is_workspace_member',
--     'can_access_workspace'
--   );

-- Expected: All 3 functions should have security_definer = true and be owned by postgres

-- 3. Test that queries don't cause recursion (42P17 error)
-- These should execute without recursion errors:
-- SELECT * FROM workspaces;
-- SELECT * FROM workspace_members;
-- SELECT * FROM workspace_documents;
-- SELECT * FROM research_notes;
-- SELECT * FROM workspace_tasks;
-- SELECT * FROM workspace_activity;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
