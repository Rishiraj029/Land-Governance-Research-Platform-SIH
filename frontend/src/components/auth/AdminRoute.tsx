import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Loader2, ShieldOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { isAdmin, roleLabel } from "../../lib/roles";

/**
 * Gate for administrator-only routes.
 *
 * The role is read from public.profiles (the documented source of truth) — never from
 * client-editable user metadata. This guard stops a non-admin from *navigating* to the panel;
 * the data behind it is separately protected by row-level security, and role changes are
 * blocked at the database level by the trigger in
 * supabase/profiles_and_saved_searches_rls.sql, so hiding this UI is a convenience rather
 * than the only line of defence.
 *
 * Renders in place (not full-screen) because the admin route lives inside the dashboard shell.
 */
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { role, loading: profileLoading, error } = useProfile();

  if (loading || (user && profileLoading)) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E1E5EA] bg-white p-10 shadow-sm" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91]" aria-hidden="true" />
        <p className="text-sm text-[#5A6472]">Checking your access…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-[#E1E5EA] bg-white p-8 text-center shadow-sm" role="alert">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-[#D64545]" aria-hidden="true" />
        <p className="font-medium text-[#1F2933]">Sign in to continue</p>
      </div>
    );
  }

  if (!isAdmin(role)) {
    return (
      <div className="rounded-lg border border-[#E1E5EA] bg-white p-8 shadow-sm" role="alert">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8A33D]/10">
            <ShieldOff className="h-8 w-8 text-[#E8A33D]" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-[#1F2933]">Administrator access required</h1>
          <p className="mt-2 text-sm text-[#5A6472]">
            {role
              ? `Your account role is ${roleLabel(role)}. The Admin Panel is limited to accounts with the “admin” role.`
              : "Your account does not have a role recorded in the platform profile table."}
          </p>
          {error && <p className="mt-2 text-xs text-[#9E2A22]">{error}</p>}
          <p className="mt-3 text-xs text-[#5A6472]">
            An existing administrator can grant this role by updating your row in
            <code className="mx-1 rounded bg-[#F5F7FA] px-1 py-0.5 font-mono">public.profiles</code>. Role changes
            are enforced by the database, not by this page.
          </p>
          <Link
            to="/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#062A63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
