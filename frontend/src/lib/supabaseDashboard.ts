import { supabase } from './supabase';
import { loadWorkspaces } from './supabaseWorkspace';

/**
 * Real data for the /dashboard overview.
 *
 * Every number here is counted from a real table with the caller's own Supabase session, so
 * row-level security decides what is visible. A metric the caller may not read comes back as
 * `null` and the UI omits it — it is never rendered as 0, because a fake zero is as
 * misleading as a fake total.
 */

export interface DashboardMetric {
  key: string;
  label: string;
  /** null means "not readable by this account" — the card is hidden rather than shown as 0. */
  value: number | null;
  hint: string;
  href: string;
}

export interface DashboardRecentItem {
  id: string;
  title: string;
  /** e.g. "Repository document" — always the real record type. */
  kind: string;
  date: string;
  href: string;
}

export interface DashboardPendingItem {
  id: string;
  title: string;
  detail: string;
  href: string;
}

export interface DashboardOverview {
  metrics: DashboardMetric[];
  recentItems: DashboardRecentItem[];
  pendingItems: DashboardPendingItem[];
  /** Messages for tables this account cannot read, or that failed to load. */
  warnings: string[];
}

interface CountResult {
  count: number | null;
  error: string | null;
}

/** Translate PostgREST/Postgres failures into short, honest copy. */
function describeError(label: string, code: string | undefined, message: string): string {
  if (code === '42501' || message.includes('permission denied')) {
    return `${label} is not readable by your account.`;
  }
  if (code === 'PGRST205') {
    return `${label} is not available in the database schema.`;
  }
  return `${label} could not be loaded.`;
}

/**
 * Count rows with a HEAD request so no row data is transferred.
 * `match` narrows the count to the signed-in user's own rows where such a column exists.
 */
async function countRows(
  label: string,
  table: 'repository_documents' | 'saved_searches' | 'simulation_runs' | 'innovations',
  match?: { column: string; value: string }
): Promise<CountResult> {
  try {
    let query = supabase.from(table).select('id', { count: 'exact', head: true });
    if (match) query = query.eq(match.column, match.value);
    const { count, error } = await query;
    if (error) {
      console.error(`Error counting ${table}:`, error);
      return { count: null, error: describeError(label, error.code, error.message) };
    }
    return { count: count ?? 0, error: null };
  } catch (error) {
    console.error(`Unexpected error counting ${table}:`, error);
    return { count: null, error: `${label} could not be loaded.` };
  }
}

interface SavedSearchRow {
  id: string;
  name: string | null;
  query: string | null;
  created_at: string | null;
}

interface InnovationRow {
  id: string;
  title: string | null;
  status: string | null;
  created_at: string | null;
}

interface SimulationRunRow {
  id: string;
  scenario_name: string | null;
  created_at: string | null;
}

/** Innovation statuses that genuinely mean "an administrator has not finished reviewing this". */
const PENDING_INNOVATION_STATUSES = ['Submitted', 'Under Review'];

/**
 * Load everything the overview needs in one pass.
 *
 * The recent-items list is assembled from the user's *own* real records across the modules
 * they can act in — there is no platform-wide "activity feed" table, so nothing is invented.
 */
export async function loadDashboardOverview(userId: string): Promise<DashboardOverview> {
  const warnings: string[] = [];

  const [uploadCount, savedSearchCount, simulationCount, innovationCount, workspacesResult] =
    await Promise.all([
      countRows('Your upload count', 'repository_documents', { column: 'created_by', value: userId }),
      countRows('Your saved searches', 'saved_searches', { column: 'user_id', value: userId }),
      countRows('Your saved simulations', 'simulation_runs', { column: 'user_id', value: userId }),
      countRows('Your innovation submissions', 'innovations', { column: 'submitted_by', value: userId }),
      loadWorkspaces(userId),
    ]);

  if (workspacesResult.error) warnings.push(workspacesResult.error);
  for (const result of [uploadCount, savedSearchCount, simulationCount, innovationCount]) {
    if (result.error) warnings.push(result.error);
  }

  const workspaceCount = workspacesResult.error ? null : workspacesResult.workspaces.length;

  const metrics: DashboardMetric[] = [
    {
      key: 'uploads',
      label: 'Documents Uploaded',
      value: uploadCount.count,
      hint: 'Contributed to the repository',
      href: '/dashboard/uploads',
    },
    {
      key: 'workspaces',
      label: 'Active Workspaces',
      value: workspaceCount,
      hint: 'Workspaces you can access',
      href: '/dashboard/workspaces',
    },
    {
      key: 'saved-searches',
      label: 'Saved Searches',
      value: savedSearchCount.count,
      hint: 'Queries kept for reuse',
      href: '/dashboard/saved-searches',
    },
    {
      key: 'simulations',
      label: 'Simulations Run',
      value: simulationCount.count,
      hint: 'Scenario runs you saved',
      href: '/dashboard/simulations',
    },
    {
      key: 'innovations',
      label: 'Innovations Submitted',
      value: innovationCount.count,
      hint: 'Ideas shared via the portal',
      href: '/dashboard/innovation',
    },
  ];

  const recentItems = await loadRecentItems(userId);

  // "Pending" is derived only from a real status column. Innovations are the one record type
  // on this platform that carries an explicit review status.
  let pendingItems: DashboardPendingItem[] = [];
  if (!innovationCount.error) {
    try {
      const { data, error } = await supabase
        .from('innovations')
        .select('id, title, status, created_at')
        .eq('submitted_by', userId)
        .in('status', PENDING_INNOVATION_STATUSES)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading pending innovations:', error);
      } else {
        pendingItems = ((data ?? []) as InnovationRow[]).map((row) => ({
          id: row.id,
          title: row.title || 'Untitled submission',
          detail: `Innovation submission · ${row.status ?? 'Under review'}`,
          href: '/dashboard/innovation',
        }));
      }
    } catch (error) {
      console.error('Unexpected error loading pending innovations:', error);
    }
  }

  return { metrics, recentItems, pendingItems, warnings: [...new Set(warnings)] };
}

/** The user's own newest records across the modules, newest first. */
async function loadRecentItems(userId: string): Promise<DashboardRecentItem[]> {
  const items: DashboardRecentItem[] = [];

  try {
    const [uploads, simulations, searches, innovations] = await Promise.all([
      supabase
        .from('repository_documents')
        .select('id, title, created_at')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('simulation_runs')
        .select('id, scenario_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('saved_searches')
        .select('id, name, query, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('innovations')
        .select('id, title, created_at')
        .eq('submitted_by', userId)
        .order('created_at', { ascending: false })
        .limit(4),
    ]);

    for (const [label, result] of [
      ['Repository documents', uploads],
      ['Simulation runs', simulations],
      ['Saved searches', searches],
      ['Innovation submissions', innovations],
    ] as const) {
      if (result.error) {
        console.error(`Error loading recent ${label}:`, result.error);
      }
    }

    for (const row of (uploads.data ?? []) as { id: string; title: string | null; created_at: string | null }[]) {
      items.push({
        id: `doc-${row.id}`,
        title: row.title || 'Untitled document',
        kind: 'Repository document',
        date: row.created_at ?? '',
        href: `/repository/${row.id}`,
      });
    }
    for (const row of (simulations.data ?? []) as SimulationRunRow[]) {
      items.push({
        id: `sim-${row.id}`,
        title: row.scenario_name || 'Untitled scenario',
        kind: 'Simulation run',
        date: row.created_at ?? '',
        href: '/dashboard/simulations',
      });
    }
    for (const row of (searches.data ?? []) as SavedSearchRow[]) {
      items.push({
        id: `search-${row.id}`,
        title: row.name || row.query || 'Saved search',
        kind: 'Saved search',
        date: row.created_at ?? '',
        href: '/dashboard/saved-searches',
      });
    }
    for (const row of (innovations.data ?? []) as { id: string; title: string | null; created_at: string | null }[]) {
      items.push({
        id: `inn-${row.id}`,
        title: row.title || 'Untitled innovation',
        kind: 'Innovation submission',
        date: row.created_at ?? '',
        href: '/dashboard/innovation',
      });
    }
  } catch (error) {
    console.error('Unexpected error loading recent items:', error);
  }

  return items
    .filter((item) => Boolean(item.date))
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 5);
}
