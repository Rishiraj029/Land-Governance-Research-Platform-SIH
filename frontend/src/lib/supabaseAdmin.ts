import { supabase } from './supabase';
import { countProfiles, listProfiles } from './supabaseProfiles';
import type { Profile } from '../types/auth';

/**
 * Read-only, real data for the Admin Panel.
 *
 * Everything here is fetched with the administrator's own Supabase session, so row-level
 * security — not this frontend — decides what an admin can see. Metrics that RLS blocks come
 * back as `null` and are reported in `unavailable` rather than rendered as zero, and there are
 * deliberately no delete, approve or activate operations: no such policy exists on these
 * tables, so shipping the buttons would only produce controls that cannot work.
 */

export interface AdminMetric {
  key: string;
  label: string;
  /** null = not readable by this account; the card is omitted and explained in `unavailable`. */
  value: number | null;
  hint: string;
}

export interface AdminDocumentRow {
  id: string;
  title: string;
  contentType: string | null;
  state: string | null;
  createdAt: string | null;
  hasOwner: boolean;
}

export interface AdminInnovationRow {
  id: string;
  title: string;
  status: string | null;
  organization: string | null;
  createdAt: string | null;
}

export interface AdminOverview {
  metrics: AdminMetric[];
  recentDocuments: AdminDocumentRow[];
  recentInnovations: AdminInnovationRow[];
  /** Plain-language reasons a metric or list is not shown. */
  unavailable: string[];
}

type CountableTable = 'repository_documents' | 'innovations';

async function countTable(
  table: CountableTable,
  match?: { column: string; values: string[] }
): Promise<{ count: number | null; error: string | null }> {
  try {
    let query = supabase.from(table).select('id', { count: 'exact', head: true });
    if (match) query = query.in(match.column, match.values);
    const { count, error } = await query;
    if (error) {
      console.error(`Error counting ${table}:`, error);
      return { count: null, error: `${table} could not be counted (${error.code ?? 'error'}).` };
    }
    return { count: count ?? 0, error: null };
  } catch (error) {
    console.error(`Unexpected error counting ${table}:`, error);
    return { count: null, error: `${table} could not be counted.` };
  }
}

/** Innovation statuses that genuinely mean "an administrator has not finished reviewing this". */
const PENDING_INNOVATION_STATUSES = ['Submitted', 'Under Review'];

export async function loadAdminOverview(): Promise<AdminOverview> {
  const unavailable: string[] = [];

  const [documents, innovations, pendingInnovations, profiles, recentDocumentsResult, recentInnovationsResult] =
    await Promise.all([
      countTable('repository_documents'),
      countTable('innovations'),
      countTable('innovations', { column: 'status', values: PENDING_INNOVATION_STATUSES }),
      countProfiles(),
      supabase
        .from('repository_documents')
        .select('id, title, content_type, state, created_at, created_by')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('innovations')
        .select('id, title, status, organization, created_at')
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

  // RLS scopes workspaces and simulation runs to their members/owners, so a platform-wide
  // total for those is not something a browser session can legitimately ask for.
  unavailable.push(
    'Workspace and simulation totals are not shown: row-level security scopes those tables to their members, so a platform-wide count is not available from a browser session.'
  );

  if (documents.error) unavailable.push(documents.error);
  if (innovations.error) unavailable.push(innovations.error);
  if (pendingInnovations.error) unavailable.push(pendingInnovations.error);
  if (profiles.error) unavailable.push(profiles.error);
  if (recentDocumentsResult.error) unavailable.push('Recent repository documents could not be loaded.');
  if (recentInnovationsResult.error) unavailable.push('Recent innovation submissions could not be loaded.');

  const metrics: AdminMetric[] = [
    {
      key: 'documents',
      label: 'Repository Documents',
      value: documents.count,
      hint: 'Visible to this session',
    },
    {
      key: 'innovations',
      label: 'Innovation Submissions',
      value: innovations.count,
      hint: 'Total submissions on the portal',
    },
    {
      key: 'pending-innovations',
      label: 'Awaiting Review',
      value: pendingInnovations.count,
      hint: `Status: ${PENDING_INNOVATION_STATUSES.join(' or ')}`,
    },
    {
      key: 'users',
      label: 'Registered Profiles',
      value: profiles.count,
      hint: 'Rows in public.profiles',
    },
  ];

  const recentDocuments: AdminDocumentRow[] = (
    (recentDocumentsResult.data ?? []) as {
      id: string;
      title: string | null;
      content_type: string | null;
      state: string | null;
      created_at: string | null;
      created_by: string | null;
    }[]
  ).map((row) => ({
    id: row.id,
    title: row.title || 'Untitled document',
    contentType: row.content_type,
    state: row.state,
    createdAt: row.created_at,
    hasOwner: Boolean(row.created_by),
  }));

  return {
    metrics,
    recentDocuments,
    recentInnovations: toInnovationRows(recentInnovationsResult.data),
    unavailable: [...new Set(unavailable)],
  };
}

interface InnovationQueryRow {
  id: string;
  title: string | null;
  status: string | null;
  organization: string | null;
  created_at: string | null;
}

function toInnovationRows(data: unknown): AdminInnovationRow[] {
  return ((data ?? []) as InnovationQueryRow[]).map((row) => ({
    id: row.id,
    title: row.title || 'Untitled submission',
    status: row.status,
    organization: row.organization,
    createdAt: row.created_at,
  }));
}

/** Read-only innovation submissions for the admin content view. */
export async function loadAdminInnovations(
  limit: number = 100
): Promise<{ innovations: AdminInnovationRow[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('innovations')
      .select('id, title, status, organization, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error loading innovations for admin view:', error);
      return { innovations: [], error: `Innovation submissions could not be loaded (${error.code ?? 'error'}).` };
    }
    return { innovations: toInnovationRows(data), error: null };
  } catch (error) {
    console.error('Unexpected error loading innovations for admin view:', error);
    return { innovations: [], error: 'Innovation submissions could not be loaded.' };
  }
}

/** Profile rows for the read-only user table. */
export async function loadAdminProfiles(limit: number = 50): Promise<{ profiles: Profile[]; error: string | null }> {
  return listProfiles(limit);
}
