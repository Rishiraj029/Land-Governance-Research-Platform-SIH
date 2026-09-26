import { supabase } from './supabase';

/**
 * Access to public.saved_searches.
 *
 * Verified against the live schema — the table is exactly:
 *   `id, user_id, name, query, filters, created_at`
 * There is no `title`, `label`, `notify` or `updated_at` column, so none are used here.
 */

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

interface SavedSearchRow {
  id: string;
  user_id: string;
  name: string | null;
  query: string | null;
  filters: unknown;
  created_at: string | null;
}

function rowToSavedSearch(row: SavedSearchRow): SavedSearch {
  const filters =
    typeof row.filters === 'object' && row.filters !== null && !Array.isArray(row.filters)
      ? (row.filters as Record<string, unknown>)
      : {};
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name?.trim() || row.query?.trim() || 'Saved search',
    query: row.query ?? '',
    filters,
    createdAt: row.created_at ?? '',
  };
}

function describeError(code: string | undefined, message: string, action: 'load' | 'add' | 'remove'): string {
  if (code === '42501' || message.includes('permission denied')) {
    return 'Your account does not have access to saved searches. An administrator must apply the saved-searches policy in supabase/profiles_and_saved_searches_rls.sql.';
  }
  if (code === 'PGRST205') {
    return 'The saved_searches table is not available in the database schema.';
  }
  if (action === 'load') return message || 'Could not load your saved searches. Please try again.';
  if (action === 'add') return message || 'Could not save this search. Please try again.';
  return message || 'Could not remove this search. Please try again.';
}

/** Load the signed-in user's own saved searches, newest first. */
export async function loadMySavedSearches(
  userId: string
): Promise<{ searches: SavedSearch[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('id, user_id, name, query, filters, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading saved searches:', error);
      return { searches: [], error: describeError(error.code, error.message, 'load') };
    }
    return { searches: ((data ?? []) as SavedSearchRow[]).map(rowToSavedSearch), error: null };
  } catch (error) {
    console.error('Unexpected error loading saved searches:', error);
    return { searches: [], error: 'Could not load your saved searches. Please try again.' };
  }
}

/** Save a search query for the signed-in user. */
export async function createSavedSearch(
  userId: string,
  name: string,
  query: string,
  filters: Record<string, unknown> = {}
): Promise<{ search: SavedSearch | null; error: string | null }> {
  const cleanName = name.trim();
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    return { search: null, error: 'Enter the search query you want to save.' };
  }
  if (cleanQuery.length > 500) {
    return { search: null, error: 'Search queries must be 500 characters or fewer.' };
  }
  if (cleanName.length > 120) {
    return { search: null, error: 'The name must be 120 characters or fewer.' };
  }

  try {
    const { data, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: userId,
        name: cleanName || cleanQuery,
        query: cleanQuery,
        filters,
      })
      .select('id, user_id, name, query, filters, created_at')
      .single();

    if (error) {
      console.error('Error saving search:', error);
      return { search: null, error: describeError(error.code, error.message, 'add') };
    }
    return { search: rowToSavedSearch(data as SavedSearchRow), error: null };
  } catch (error) {
    console.error('Unexpected error saving search:', error);
    return { search: null, error: 'Could not save this search. Please try again.' };
  }
}

/** Delete one of the user's saved searches. */
export async function deleteSavedSearch(searchId: string): Promise<{ error: string | null }> {
  try {
    // select('id') surfaces a DELETE that RLS silently filtered to zero rows.
    const { data, error } = await supabase.from('saved_searches').delete().eq('id', searchId).select('id');

    if (error) {
      console.error('Error deleting saved search:', error);
      return { error: describeError(error.code, error.message, 'remove') };
    }
    if (!data || data.length === 0) {
      return { error: 'That saved search could not be removed.' };
    }
    return { error: null };
  } catch (error) {
    console.error('Unexpected error deleting saved search:', error);
    return { error: 'Could not remove this search. Please try again.' };
  }
}
