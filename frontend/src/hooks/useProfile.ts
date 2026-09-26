import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { loadMyProfile } from '../lib/supabaseProfiles';
import type { Profile, UserRole } from '../types/auth';

interface UseProfileResult {
  /** The signed-in user's row from public.profiles, or null when unreadable/unavailable. */
  profile: Profile | null;
  /**
   * Effective platform role. public.profiles.role is the source of truth; the JWT
   * `app_metadata.role` claim is used only as a fallback because it is set server-side.
   *
   * `user_metadata.role` is deliberately never consulted: users can edit their own
   * user_metadata from the client, so trusting it would let anyone appear to be an admin.
   */
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  /** Re-read the profile (used after Settings saves, so the sidebar role stays in step). */
  reload: () => void;
}

/** The result of one profile fetch, tagged with the user it belongs to. */
interface ProfileFetch {
  userId: string;
  profile: Profile | null;
  error: string | null;
}

/**
 * Load the current user's profile so role-dependent UI (admin panel, department data,
 * role badge) reflects the database rather than whatever the client claims.
 *
 * The fetch result is stored together with its user id and only used when the ids match, so
 * switching accounts can never briefly expose the previous user's profile or role. `loading`
 * is derived from that same comparison rather than tracked separately, which also keeps the
 * effect free of synchronous state updates.
 */
export function useProfile(): UseProfileResult {
  const { user } = useAuth();
  const [result, setResult] = useState<ProfileFetch | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return undefined;
    let current = true;

    loadMyProfile(userId)
      .then((loaded) => {
        if (!current) return;
        setResult({ userId, profile: loaded.profile, error: loaded.error });
      })
      .catch((error: unknown) => {
        if (!current) return;
        console.error('Unexpected error loading profile:', error);
        setResult({ userId, profile: null, error: 'Could not load your profile.' });
      });

    return () => {
      current = false;
    };
  }, [userId, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const settled = Boolean(userId) && result?.userId === userId;
  const profile = settled ? (result as ProfileFetch).profile : null;
  const error = settled ? (result as ProfileFetch).error : null;

  const appMetadataRole = typeof user?.app_metadata?.role === 'string' ? user.app_metadata.role : null;

  return {
    profile,
    role: profile?.role ?? (appMetadataRole as UserRole | null) ?? null,
    loading: Boolean(userId) && !settled,
    error,
    reload,
  };
}
