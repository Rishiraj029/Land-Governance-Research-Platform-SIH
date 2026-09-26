import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, FolderKanban, Loader2, Plus, Users } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { loadWorkspaces } from "../../lib/supabaseWorkspace";
import type { Workspace } from "../../types/workspace";

/**
 * Dashboard view of the user's workspaces.
 *
 * Workspace permissions, membership and editing all live in the completed Workspaces module;
 * this page only reads through the same service and links into it, so there is no second
 * implementation of workspace logic.
 */
export default function MyWorkspaces() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return undefined;
    let current = true;

    loadWorkspaces(user.id)
      .then((result) => {
        if (!current) return;
        if (result.error) {
          setError(result.error);
        } else {
          setWorkspaces(result.workspaces);
          setError(null);
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1F2933]">My Workspaces</h1>
        <div className="rounded-lg border border-[#E1E5EA] bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-[#D64545]" aria-hidden="true" />
          <p className="font-medium text-[#1F2933]">Sign in to view your workspaces</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2933]">My Workspaces</h1>
          <p className="mt-1 text-[#5A6472]">
            Collaborative spaces you own or belong to.
          </p>
        </div>
        <Link
          to="/workspaces"
          state={{ createWorkspace: true }}
          className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#E88A2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9933] focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create Workspace
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E1E5EA] bg-white p-10 shadow-sm" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91]" aria-hidden="true" />
          <p className="text-sm text-[#5A6472]">Loading your workspaces…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E1E5EA] bg-white p-8 text-center shadow-sm" role="alert">
          <AlertCircle className="h-8 w-8 text-[#D64545]" aria-hidden="true" />
          <p className="text-sm font-medium text-[#1F2933]">Could not load workspaces</p>
          <p className="text-xs text-[#5A6472]">{error}</p>
        </div>
      )}

      {!loading && !error && workspaces.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E1E5EA] bg-white p-10 text-center shadow-sm">
          <FolderKanban className="mb-2 h-12 w-12 text-[#0B3D91]/30" aria-hidden="true" />
          <p className="text-sm font-medium text-[#1F2933]">No workspaces yet</p>
          <p className="max-w-xs text-xs text-[#5A6472]">
            Workspaces let you keep related research documents, notes and tasks together with
            the people you work with.
          </p>
          <Link
            to="/workspaces"
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#062A63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create a Workspace
          </Link>
        </div>
      )}

      {!loading && !error && workspaces.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {workspaces.map((workspace) => (
            <li key={workspace.id} className="rounded-lg border border-[#E1E5EA] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-[#1F2933]">{workspace.name}</h2>
                  {workspace.researchTheme && (
                    <p className="mt-0.5 text-xs text-[#5A6472]">{workspace.researchTheme}</p>
                  )}
                </div>
                <span className="flex-shrink-0 rounded-full border border-[#138808]/20 bg-[#138808]/10 px-2 py-0.5 text-xs font-medium text-[#138808]">
                  {workspace.status}
                </span>
              </div>

              {workspace.description && (
                <p className="mt-2 line-clamp-2 text-sm text-[#5A6472]">{workspace.description}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5A6472]">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {workspace.memberCount} {workspace.memberCount === 1 ? "member" : "members"}
                </span>
                {workspace.lastActivity && <span>Last activity {workspace.lastActivity}</span>}
              </div>

              <Link
                to={`/workspaces/${workspace.id}`}
                className="mt-4 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#0B3D91] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
              >
                Open workspace
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
