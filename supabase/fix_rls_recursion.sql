-- =====================================================
-- FIX RLS RECURSION FOR WORKSPACES
-- =====================================================
-- 
-- This migration fixes infinite recursion in RLS policies
-- by using SECURITY DEFINER helper functions with proper
-- parameter naming and table qualification to break
-- circular dependencies between workspaces and workspace_members.
--
-- PROBLEM 1: Parameter name collision
-- Helper functions used parameter names matching column names
-- (workspace_id, user_id) causing SQL ambiguity.
--
-- PROBLEM 2: Self-recursion in workspace_members policy
-- workspace_members policy directly queried workspace_members
-- in a subquery, triggering its own RLS policy → recursion.
--
-- SOLUTION:
-- 1. Rename all helper function parameters to p_workspace_id, p_user_id
-- 2. Explicitly qualify all tables (public.workspace_members wm)
-- 3. Use SECURITY DEFINER helpers consistently
-- 4. Never query workspace_members inside workspace_members policy
-- =====================================================

-- Enable the required extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- =====================================================
-- All functions use:
-- - SECURITY DEFINER (bypass RLS on tables they query)
-- - SET search_path = public (prevent privilege escalation)
-- - Unambiguous parameter names (p_ prefix)
-- - Explicit table qualification (public.table_name alias)
-- =====================================================

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
-- DROP EXISTING POLICIES (to recreate them properly)
-- =====================================================
-- NOTE: Only drop policies that exist for these tables
-- Do not drop policies from other tables (e.g., repository_documents)

-- Drop workspaces policies
DROP POLICY IF EXISTS "Users can view own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete workspaces" ON workspaces;

-- Drop workspace_members policies
DROP POLICY IF EXISTS "Workspace members can view membership" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can add members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove members" ON workspace_members;

-- Drop workspace_documents policies
DROP POLICY IF EXISTS "Workspace members can view documents" ON workspace_documents;
DROP POLICY IF EXISTS "Workspace members can add documents" ON workspace_documents;
DROP POLICY IF EXISTS "Workspace members can remove documents" ON workspace_documents;

-- Drop research_notes policies
DROP POLICY IF EXISTS "Workspace members can view notes" ON research_notes;
DROP POLICY IF EXISTS "Users can create notes in accessible workspaces" ON research_notes;
DROP POLICY IF EXISTS "Note authors can update own notes" ON research_notes;
DROP POLICY IF EXISTS "Note authors can delete own notes" ON research_notes;

-- Drop workspace_tasks policies
DROP POLICY IF EXISTS "Workspace members can view tasks" ON workspace_tasks;
DROP POLICY IF EXISTS "Workspace members can create tasks" ON workspace_tasks;
DROP POLICY IF EXISTS "Task assignees can update tasks" ON workspace_tasks;

-- Drop workspace_activity policies
DROP POLICY IF EXISTS "Workspace members can view activity" ON workspace_activity;
DROP POLICY IF EXISTS "Authenticated users can create activity" ON workspace_activity;

-- =====================================================
-- CREATE NEW NON-RECURSIVE POLICIES
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
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activity ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION QUERIES (for testing after execution)
-- =====================================================

-- Test that helper functions work correctly with proper parameter naming
-- SELECT public.is_workspace_owner('workspace-id'::uuid, 'user-id'::uuid);
-- SELECT public.is_workspace_member('workspace-id'::uuid, 'user-id'::uuid);
-- SELECT public.can_access_workspace('workspace-id'::uuid, 'user-id'::uuid);

-- Test that policies don't recurse (should not cause 42P17 error)
-- These should not cause recursion errors:
-- SELECT * FROM workspaces;
-- SELECT * FROM workspace_members;
-- SELECT * FROM workspace_documents;
-- SELECT * FROM research_notes;
-- SELECT * FROM workspace_tasks;
-- SELECT * FROM workspace_activity;

-- =====================================================
-- END OF MIGRATION
-- =====================================================