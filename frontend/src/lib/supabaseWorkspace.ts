import { supabase } from './supabase';
import type { 
  Workspace, 
  WorkspaceMember, 
  WorkspaceDocument, 
  ResearchNote, 
  WorkspaceTask,
  WorkspaceActivity 
} from '../types/workspace';

// Database row interfaces
interface WorkspaceRow {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceMemberRow {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface ResearchNoteRow {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceTaskRow {
  id: string;
  workspace_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceActivityRow {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  details: string | null;
  created_at: string;
}

// Convert database rows to frontend types
function rowToWorkspace(row: WorkspaceRow, ownerName?: string, researchTheme?: string, accessLevel?: string, objective?: string): Workspace {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    researchTheme: researchTheme || 'Land Governance', // Default theme
    objective: objective || row.description,
    owner: ownerName || 'Unknown',
    ownerInstitution: 'Unknown',
    memberCount: 0, // Will be loaded separately
    documentCount: 0, // Will be loaded separately
    lastActivity: row.updated_at,
    status: row.status as 'Active' | 'Draft' | 'Archived',
    accessLevel: (accessLevel as any) || 'Private',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToWorkspaceMember(row: WorkspaceMemberRow, displayName?: string): WorkspaceMember {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: displayName || 'Unknown',
    // public.profiles has no email column, so no email is available here.
    email: '',
    role: row.role,
    institution: 'Unknown',
    permission: row.role as 'Owner' | 'Editor' | 'Contributor' | 'Viewer',
    joinedAt: row.created_at
  };
}

function rowToResearchNote(row: ResearchNoteRow, authorName?: string): ResearchNote {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    content: row.content,
    author: authorName || 'Unknown',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToWorkspaceTask(row: WorkspaceTaskRow, assigneeName?: string): WorkspaceTask {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    description: row.description || '',
    assignee: assigneeName || 'Unassigned',
    priority: 'Medium',
    status: row.status as 'To Do' | 'In Progress' | 'Completed',
    dueDate: row.due_date || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToWorkspaceActivity(row: WorkspaceActivityRow, userName?: string): WorkspaceActivity {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    user: userName || 'Unknown',
    action: row.action,
    objectType: 'workspace',
    objectId: row.workspace_id,
    objectName: row.details || '',
    timestamp: row.created_at
  };
}

/**
 * Fetch display names for a set of user UUIDs.
 *
 * public.profiles is keyed by the same UUID as auth.users and has no foreign key to
 * public.workspaces, so PostgREST cannot embed it inside a workspaces query (PGRST200).
 * Profile data is therefore always loaded in a separate query keyed on the user UUID.
 * Never let this secondary lookup fail the calling query.
 */
async function loadProfileNames(userIds: (string | null | undefined)[]): Promise<Record<string, string>> {
  const ids = [...new Set(userIds.filter((id): id is string => Boolean(id)))];
  if (ids.length === 0) return {};

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', ids);

    if (error) {
      console.error('Error loading profile names:', error);
      return {};
    }

    const names: Record<string, string> = {};
    (data || []).forEach((profile: any) => {
      if (profile.full_name) names[profile.id] = profile.full_name;
    });
    return names;
  } catch (error) {
    console.error('Unexpected error loading profile names:', error);
    return {};
  }
}

/**
 * Get workspace member count
 */
export async function getWorkspaceMemberCount(workspaceId: string): Promise<{ count: number; error: string | null }> {
  try {
    const { count, error } = await supabase
      .from('workspace_members')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);

    if (error) {
      console.error('Error getting workspace member count:', error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Unexpected error getting workspace member count:', error);
    return { count: 0, error: 'Failed to get member count' };
  }
}

/**
 * Get workspace document count
 */
export async function getWorkspaceDocumentCount(workspaceId: string): Promise<{ count: number; error: string | null }> {
  try {
    const { count, error } = await supabase
      .from('workspace_documents')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);

    if (error) {
      console.error('Error getting workspace document count:', error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Unexpected error getting workspace document count:', error);
    return { count: 0, error: 'Failed to get document count' };
  }
}

/**
 * Load all workspaces for the current user
 */
export async function loadWorkspaces(userId: string): Promise<{ workspaces: Workspace[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading workspaces:', error);
      return { workspaces: [], error: error.message };
    }

    // Owner profiles are fetched separately: owner_id references auth.users, there is no
    // workspaces -> profiles foreign key to embed.
    const ownerNames = await loadProfileNames((data || []).map((w: any) => w.owner_id));

    const workspaces = (data || []).map((row: any) => rowToWorkspace(row, ownerNames[row.owner_id]));

    // Load counts for each workspace
    const workspacesWithCounts = await Promise.all(
      workspaces.map(async (workspace) => {
        const [memberCountResult, documentCountResult] = await Promise.all([
          getWorkspaceMemberCount(workspace.id),
          getWorkspaceDocumentCount(workspace.id)
        ]);

        return {
          ...workspace,
          memberCount: memberCountResult.error ? 0 : memberCountResult.count,
          documentCount: documentCountResult.error ? 0 : documentCountResult.count
        };
      })
    );

    return { workspaces: workspacesWithCounts, error: null };
  } catch (error) {
    console.error('Unexpected error loading workspaces:', error);
    return { workspaces: [], error: 'Failed to load workspaces' };
  }
}

/**
 * Load a single workspace by ID
 */
export async function loadWorkspaceById(workspaceId: string): Promise<{ workspace: Workspace | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (error) {
      console.error('Error loading workspace:', error);
      return { workspace: null, error: error.message };
    }

    if (!data) {
      return { workspace: null, error: null };
    }

    // Owner profile is fetched separately, keyed on owner_id (no embeddable relationship).
    let ownerName: string | undefined;
    if (data.owner_id) {
      const ownerNames = await loadProfileNames([data.owner_id]);
      ownerName = ownerNames[data.owner_id];
    }

    const workspace = rowToWorkspace(data as any, ownerName);
    return { workspace, error: null };
  } catch (error) {
    console.error('Unexpected error loading workspace:', error);
    return { workspace: null, error: 'Failed to load workspace' };
  }
}

/**
 * Create a new workspace.
 *
 * The insert deliberately does NOT chain `.select()`. In PostgREST `.select()` becomes an
 * `INSERT ... RETURNING`, and RETURNING makes PostgreSQL evaluate the table's SELECT policy
 * against the brand-new row. That policy is
 * `USING (public.can_access_workspace(id, auth.uid()))`, and its helper looks the row up in
 * public.workspaces using the same statement snapshot, which cannot contain a row that is
 * still being inserted. The result is
 * `42501 new row violates row-level security policy for table "workspaces"` even though the
 * INSERT policy `WITH CHECK (owner_id = auth.uid())` was satisfied.
 * Reading the row back afterwards is a separate statement, so the SELECT policy sees it.
 */
export async function createWorkspace(
  name: string,
  description: string,
  ownerId: string,
  researchTheme?: string,
  accessLevel?: string,
  objective?: string
): Promise<{ workspace: Workspace | null; error: string | null }> {
  try {
    // owner_id must be the signed-in Auth user's UUID, verified against the server rather
    // than trusted from component state.
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('Error creating workspace: no authenticated user', authError);
      return { workspace: null, error: 'You must be signed in to create a workspace' };
    }

    const authUserId = authData.user.id;
    if (ownerId !== authUserId) {
      console.error(
        'createWorkspace: caller ownerId did not match the authenticated user; using the session user id.'
      );
    }

    const { error } = await supabase
      .from('workspaces')
      .insert({
        name,
        description,
        owner_id: authUserId, // satisfies WITH CHECK (owner_id = auth.uid())
        // Matches the status vocabulary the workspace UI filters and labels on.
        status: 'Active'
      });

    if (error) {
      console.error('Error creating workspace:', error);
      return { workspace: null, error: error.message };
    }

    // Separate statement: the SELECT policy can see the new row here.
    const { data: created, error: readError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', authUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (readError || !created) {
      // The workspace was created; the caller refreshes its list in this case.
      console.error('Workspace created but could not be read back:', readError);
      return { workspace: null, error: null };
    }

    const workspace = rowToWorkspace(created as WorkspaceRow, undefined, researchTheme, accessLevel, objective);

    // Record activity
    await recordActivity(created.id, authUserId, 'workspace_created', 'Workspace created');

    return { workspace, error: null };
  } catch (error) {
    console.error('Unexpected error creating workspace:', error);
    return { workspace: null, error: 'Failed to create workspace' };
  }
}

/**
 * Load workspace members
 */
export async function loadWorkspaceMembers(workspaceId: string): Promise<{ members: WorkspaceMember[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (error) {
      console.error('Error loading workspace members:', error);
      return { members: [], error: error.message };
    }

    const memberNames = await loadProfileNames((data || []).map((w: any) => w.user_id));

    const members = (data || []).map((row: any) =>
      rowToWorkspaceMember(row, memberNames[row.user_id])
    );
    return { members, error: null };
  } catch (error) {
    console.error('Unexpected error loading workspace members:', error);
    return { members: [], error: 'Failed to load members' };
  }
}

/**
 * Add a member to workspace
 */
export async function addWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: string,
  addedBy: string
): Promise<{ member: WorkspaceMember | null; error: string | null }> {
  try {
    // Check if already a member
    const { data: existing } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return { member: null, error: 'User is already a member of this workspace' };
    }

    const { data, error } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        role
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding workspace member:', error);
      return { member: null, error: error.message };
    }

    const member = rowToWorkspaceMember(data as WorkspaceMemberRow);
    
    // Record activity
    await recordActivity(workspaceId, addedBy, 'member_added', `Added member with role: ${role}`);
    
    return { member, error: null };
  } catch (error) {
    console.error('Unexpected error adding workspace member:', error);
    return { member: null, error: 'Failed to add member' };
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<{ userId: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error finding user:', error);
      return { userId: null, error: error.message };
    }

    return { userId: data?.id || null, error: null };
  } catch (error) {
    console.error('Unexpected error finding user:', error);
    return { userId: null, error: 'Failed to find user' };
  }
}

/**
 * Load workspace documents
 */
export async function loadWorkspaceDocuments(workspaceId: string): Promise<{ documents: WorkspaceDocument[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('workspace_documents')
      .select(`
        *,
        repository_documents!inner(title, content_type, author, published_at)
      `)
      .eq('workspace_id', workspaceId);

    if (error) {
      console.error('Error loading workspace documents:', error);
      return { documents: [], error: error.message };
    }

    const documents = (data || []).map((row: any) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      documentId: row.document_id,
      title: row.repository_documents?.title || 'Unknown',
      type: row.repository_documents?.content_type || 'Document',
      author: row.repository_documents?.author || 'Unknown',
      date: row.repository_documents?.published_at || '',
      status: 'linked',
      tags: [],
      addedAt: row.created_at
    }));
    return { documents, error: null };
  } catch (error) {
    console.error('Unexpected error loading workspace documents:', error);
    return { documents: [], error: 'Failed to load documents' };
  }
}

/**
 * Add a document to workspace
 */
export async function addWorkspaceDocument(
  workspaceId: string,
  documentId: string,
  addedBy: string
): Promise<{ document: WorkspaceDocument | null; error: string | null }> {
  try {
    const { error } = await supabase
      .from('workspace_documents')
      .insert({
        workspace_id: workspaceId,
        document_id: documentId,
        added_by: addedBy
      });

    if (error) {
      console.error('Error adding workspace document:', error);
      return { document: null, error: error.message };
    }

    // Record activity
    await recordActivity(workspaceId, addedBy, 'document_added', `Added document to workspace`);
    
    return { document: null, error: null }; // Will reload full list
  } catch (error) {
    console.error('Unexpected error adding workspace document:', error);
    return { document: null, error: 'Failed to add document' };
  }
}

/**
 * Remove a document link from a workspace.
 *
 * RLS only allows workspace owners to delete workspace_documents rows, and a blocked DELETE
 * silently affects zero rows, so `select('id')` is used to detect that case instead of
 * reporting a false success.
 */
export async function removeWorkspaceDocument(
  workspaceId: string,
  workspaceDocumentId: string
): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('workspace_documents')
      .delete()
      .eq('id', workspaceDocumentId)
      .eq('workspace_id', workspaceId)
      .select('id');

    if (error) {
      console.error('Error removing workspace document:', error);
      return { error: error.message };
    }

    if (!data || data.length === 0) {
      return { error: 'Only the workspace owner can remove documents' };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error removing workspace document:', error);
    return { error: 'Failed to remove document' };
  }
}

/**
 * Load research notes
 */
export async function loadResearchNotes(workspaceId: string): Promise<{ notes: ResearchNote[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('research_notes')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading research notes:', error);
      return { notes: [], error: error.message };
    }

    const userNames = await loadProfileNames((data || []).map((w: any) => w.user_id));

    const notes = (data || []).map((row: any) => 
      rowToResearchNote(row, userNames[row.user_id])
    );
    return { notes, error: null };
  } catch (error) {
    console.error('Unexpected error loading research notes:', error);
    return { notes: [], error: 'Failed to load notes' };
  }
}

/**
 * Create a research note
 */
export async function createResearchNote(
  workspaceId: string,
  userId: string,
  title: string,
  content: string
): Promise<{ note: ResearchNote | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('research_notes')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        title,
        content
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating research note:', error);
      return { note: null, error: error.message };
    }

    const note = rowToResearchNote(data as ResearchNoteRow);
    
    // Record activity
    await recordActivity(workspaceId, userId, 'note_created', `Created note: ${title}`);
    
    return { note, error: null };
  } catch (error) {
    console.error('Unexpected error creating research note:', error);
    return { note: null, error: 'Failed to create note' };
  }
}

/**
 * Update a research note
 */
export async function updateResearchNote(
  noteId: string,
  title: string,
  content: string
): Promise<{ note: ResearchNote | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('research_notes')
      .update({ title, content })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating research note:', error);
      return { note: null, error: error.message };
    }

    const note = rowToResearchNote(data as ResearchNoteRow);
    return { note, error: null };
  } catch (error) {
    console.error('Unexpected error updating research note:', error);
    return { note: null, error: 'Failed to update note' };
  }
}

/**
 * Delete a research note
 */
export async function deleteResearchNote(noteId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('research_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting research note:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error deleting research note:', error);
    return { error: 'Failed to delete note' };
  }
}

/**
 * Load workspace tasks
 */
export async function loadWorkspaceTasks(workspaceId: string): Promise<{ tasks: WorkspaceTask[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('workspace_tasks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading workspace tasks:', error);
      return { tasks: [], error: error.message };
    }

    const assigneeNames = await loadProfileNames((data || []).map((w: any) => w.assigned_to));

    const tasks = (data || []).map((row: any) =>
      rowToWorkspaceTask(row, assigneeNames[row.assigned_to])
    );
    return { tasks, error: null };
  } catch (error) {
    console.error('Unexpected error loading workspace tasks:', error);
    return { tasks: [], error: 'Failed to load tasks' };
  }
}

/**
 * Create a workspace task
 */
export async function createWorkspaceTask(
  workspaceId: string,
  assignedTo: string | null,
  title: string,
  description: string,
  dueDate: string | null,
  createdBy: string
): Promise<{ task: WorkspaceTask | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('workspace_tasks')
      .insert({
        workspace_id: workspaceId,
        assigned_to: assignedTo,
        title,
        description,
        due_date: dueDate,
        status: 'To Do',
        created_by: createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workspace task:', error);
      return { task: null, error: error.message };
    }

    const task = rowToWorkspaceTask(data as WorkspaceTaskRow);
    
    // Record activity
    await recordActivity(workspaceId, createdBy, 'task_created', `Created task: ${title}`);
    
    return { task, error: null };
  } catch (error) {
    console.error('Unexpected error creating workspace task:', error);
    return { task: null, error: 'Failed to create task' };
  }
}

/**
 * Update a workspace task
 */
export async function updateWorkspaceTask(
  taskId: string,
  status: string
): Promise<{ task: WorkspaceTask | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('workspace_tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating workspace task:', error);
      return { task: null, error: error.message };
    }

    const task = rowToWorkspaceTask(data as WorkspaceTaskRow);
    return { task, error: null };
  } catch (error) {
    console.error('Unexpected error updating workspace task:', error);
    return { task: null, error: 'Failed to update task' };
  }
}

/**
 * Load workspace activity
 */
export async function loadWorkspaceActivity(workspaceId: string): Promise<{ activities: WorkspaceActivity[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('workspace_activity')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading workspace activity:', error);
      return { activities: [], error: error.message };
    }

    const userNames = await loadProfileNames((data || []).map((w: any) => w.user_id));

    const activities = (data || []).map((row: any) => 
      rowToWorkspaceActivity(row, userNames[row.user_id])
    );
    return { activities, error: null };
  } catch (error) {
    console.error('Unexpected error loading workspace activity:', error);
    return { activities: [], error: 'Failed to load activity' };
  }
}

/**
 * Record workspace activity
 */
async function recordActivity(
  workspaceId: string,
  userId: string,
  action: string,
  details: string
): Promise<void> {
  try {
    await supabase
      .from('workspace_activity')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        action,
        details
      });
  } catch (error) {
    console.error('Error recording activity:', error);
    // Don't fail the operation if activity logging fails
  }
}

/**
 * Check if user is a member of a workspace
 */
export async function isWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<{ isMember: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking workspace membership:', error);
      return { isMember: false, error: error.message };
    }

    return { isMember: !!data, error: null };
  } catch (error) {
    console.error('Unexpected error checking workspace membership:', error);
    return { isMember: false, error: 'Failed to check membership' };
  }
}
