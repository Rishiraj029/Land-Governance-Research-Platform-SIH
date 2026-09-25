import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/** Minimal loading UI shown while the auth session is being resolved. */
function AuthLoadingScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-slate-600">Checking your session…</p>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Renders children only for authenticated users.
 * While loading it shows a neutral loading screen; unauthenticated users are
 * redirected to /login, which returns them to their intended page afterwards.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
