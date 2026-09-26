import { Link } from "react-router-dom";
import { Clock, FileText } from "lucide-react";
import type { DashboardRecentItem } from "../../lib/supabaseDashboard";

/**
 * "Continue where you left off" built from the user's own newest records.
 *
 * There is no platform-wide activity feed table, so this lists real rows the user created —
 * a repository upload, a saved simulation, a saved search or an innovation submission — each
 * linking to the page that owns it.
 */
export default function RecentActivity({
  items,
  loading,
}: {
  items: DashboardRecentItem[];
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#1F2933]">Continue where you left off</h2>

      {loading && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg border border-[#E1E5EA] bg-[#F5F7FA]" />
          ))}
          <span className="sr-only" role="status">
            Loading your recent items
          </span>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-[#C9D2DC] px-5 py-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-[#5A6472]" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-[#1F2933]">Nothing here yet</p>
          <p className="mt-1 text-xs text-[#5A6472]">
            Upload a document, save a search or run a simulation and it will appear here.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className="flex items-start gap-4 rounded-lg border border-[#E1E5EA] p-3 transition-colors hover:border-[#0B3D91] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1F2933]">{item.title}</p>
                  <p className="truncate text-xs text-[#5A6472]">{item.kind}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#5A6472]">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {new Date(item.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
