import { Link } from "react-router-dom";
import { FolderKanban, Plus, ArrowRight } from "lucide-react";

/**
 * Dashboard entry point for workspaces. Workspace browsing, creation and management all
 * live on the public /workspaces page, so this section links straight into it.
 */
export default function MyWorkspaces() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2933]">My Workspaces</h1>
        <p className="text-[#5A6472] mt-1">
          Collaborative spaces where you and your team keep research, documents, notes and tasks together.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#E1E5EA] p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#0B3D91]/10">
            <FolderKanban className="h-6 w-6 text-[#0B3D91]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#1F2933]">
              Workspace management is on the Workspaces page
            </h2>
            <p className="text-sm text-[#5A6472] mt-1">
              Open it to see every workspace you can access, link repository documents, invite
              members, and add notes and tasks. New workspaces are created from there in a few
              seconds.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/workspaces"
                className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63] transition-colors"
              >
                Open Workspaces
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/workspaces"
                state={{ createWorkspace: true }}
                className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Workspace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
