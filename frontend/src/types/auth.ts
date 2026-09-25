import type { Session, User } from "@supabase/supabase-js";

/** Roles supported by the platform. Mirrors public.profiles.role. */
export const USER_ROLES = ["citizen", "researcher", "policymaker", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Row shape of public.profiles. The database trigger keeps it in sync with auth users. */
export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
}

/** Credentials accepted by the sign-in form. */
export interface SignInCredentials {
  email: string;
  password: string;
}

/** Credentials accepted by the sign-up form. */
export interface SignUpCredentials {
  fullName: string;
  email: string;
  password: string;
}

/** Result of an auth service call. `error` carries a user-facing message, or null on success. */
export interface AuthActionResult {
  error: string | null;
}

export interface SignUpResult extends AuthActionResult {
  /**
   * True when the Supabase project requires email confirmation before a
   * session becomes active, i.e. no session was returned by signUp().
   */
  needsEmailConfirmation: boolean;
}

/** Shape exposed by the useAuth() hook. */
export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  /** True until the initial session has been resolved from Supabase. */
  loading: boolean;
  /** Signs the user out. Resolves with a user-facing error message, or null on success. */
  signOut: () => Promise<string | null>;
}
