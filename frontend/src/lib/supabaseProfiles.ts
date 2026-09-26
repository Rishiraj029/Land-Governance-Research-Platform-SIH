import { supabase } from './supabase';
import { USER_ROLES, type Profile, type ProfileUpdateInput, type UserRole } from '../types/auth';

/**
 * Access to public.profiles — the source of truth for a user's role.
 *
 * Verified live schema: `id, full_name, role, institution, created_at, updated_at`
 * (no email / avatar / phone / department columns exist, so none are used here).
 */

interface ProfileRow {
  id: string;
  full_name: string | null;
  role: string | null;
  institution: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    full_name: row.full_name,
    // An unrecognised role falls back to the least-privileged one rather than being
    // trusted, so a malformed row can never unlock admin-only UI.
    role: isUserRole(row.role) ? row.role : 'citizen',
    institution: row.institution,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function describeProfileError(code: string | undefined, message: string): string {
  if (code === '42501' || message.includes('permission denied')) {
    return 'Your account does not have access to profile records. An administrator must grant access to public.profiles.';
  }
  if (code === 'PGRST205') {
    return 'The profiles table is not available in the database schema.';
  }
  if (code === 'PGRST116') {
    return 'No profile record exists for your account yet.';
  }
  return message || 'The request could not be completed. Please try again.';
}

/** Load the signed-in user's own profile row. */
export async function loadMyProfile(userId: string): Promise<{ profile: Profile | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, institution, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      return { profile: null, error: describeProfileError(error.code, error.message) };
    }
    if (!data) {
      return { profile: null, error: 'No profile record exists for your account yet.' };
    }
    return { profile: rowToProfile(data as ProfileRow), error: null };
  } catch (error) {
    console.error('Unexpected error loading profile:', error);
    return { profile: null, error: 'Could not load your profile. Please try again.' };
  }
}

/**
 * Update the fields a user may change about themselves.
 *
 * `role` is deliberately never sent. Role changes are additionally blocked at the database
 * level by the guard trigger in supabase/profiles_and_saved_searches_rls.sql, because a
 * frontend-only restriction would not stop a crafted request from promoting an account.
 */
export async function updateMyProfile(
  userId: string,
  input: ProfileUpdateInput
): Promise<{ profile: Profile | null; error: string | null }> {
  const fullName = input.fullName.trim();
  const institution = input.institution.trim();

  if (!fullName) {
    return { profile: null, error: 'Full name is required.' };
  }
  if (fullName.length > 120) {
    return { profile: null, error: 'Full name must be 120 characters or fewer.' };
  }
  if (institution.length > 160) {
    return { profile: null, error: 'Institution must be 160 characters or fewer.' };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, institution: institution || null })
      .eq('id', userId)
      .select('id, full_name, role, institution, created_at, updated_at')
      .maybeSingle();

    if (error) {
      console.error('Error updating profile:', error);
      // The guard trigger raises 42501 when a request tries to change its own role.
      if (error.code === '42501' && /role/i.test(error.message)) {
        return { profile: null, error: 'You are not allowed to change your own role.' };
      }
      return { profile: null, error: describeProfileError(error.code, error.message) };
    }
    if (!data) {
      // Zero rows updated: RLS blocked it, or no profile row exists for this user.
      return { profile: null, error: 'Your profile could not be saved. An administrator must grant update access to public.profiles.' };
    }
    return { profile: rowToProfile(data as ProfileRow), error: null };
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return { profile: null, error: 'Could not save your profile. Please try again.' };
  }
}

/**
 * Count profile rows, used by the admin overview.
 * Returns a null count when the caller cannot read the table so the admin page can omit the
 * metric instead of showing a misleading zero.
 */
export async function countProfiles(): Promise<{ count: number | null; error: string | null }> {
  try {
    const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    if (error) {
      console.error('Error counting profiles:', error);
      return { count: null, error: describeProfileError(error.code, error.message) };
    }
    return { count: count ?? 0, error: null };
  } catch (error) {
    console.error('Unexpected error counting profiles:', error);
    return { count: null, error: 'The profile count could not be loaded.' };
  }
}

/** List profile rows for the admin user table (names, roles and institutions only). */
export async function listProfiles(
  limit: number = 50
): Promise<{ profiles: Profile[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, institution, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error listing profiles:', error);
      return { profiles: [], error: describeProfileError(error.code, error.message) };
    }
    return { profiles: ((data ?? []) as ProfileRow[]).map(rowToProfile), error: null };
  } catch (error) {
    console.error('Unexpected error listing profiles:', error);
    return { profiles: [], error: 'Could not load the user list. Please try again.' };
  }
}
