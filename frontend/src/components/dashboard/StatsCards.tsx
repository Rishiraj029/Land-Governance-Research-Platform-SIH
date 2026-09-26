import { Link } from "react-router-dom";
import { Activity, FileText, FolderKanban, Lightbulb, Search } from "lucide-react";
import type { DashboardMetric } from "../../lib/supabaseDashboard";

const STAT_ICONS: Record<string, typeof FileText> = {
  uploads: FileText,
  workspaces: FolderKanban,
  "saved-searches": Search,
  simulations: Activity,
  innovations: Lightbulb,
};

const STAT_COLORS: Record<string, { bgColor: string; textColor: string }> = {
  uploads: { bgColor: "bg-[#0B3D91]/10", textColor: "text-[#0B3D91]" },
  workspaces: { bgColor: "bg-[#FF9933]/10", textColor: "text-[#FF9933]" },
  "saved-searches": { bgColor: "bg-[#138808]/10", textColor: "text-[#138808]" },
  simulations: { bgColor: "bg-[#062A63]/10", textColor: "text-[#062A63]" },
  innovations: { bgColor: "bg-[#FF9933]/10", textColor: "text-[#FF9933]" },
};

/**
 * Counts for the signed-in user, loaded from the real tables.
 *
 * Metrics this account cannot read arrive as `null` and are omitted entirely: showing 0 would
 * claim "you have uploaded nothing" when the truth is "we could not read that table".
 */
export default function StatsCards({
  metrics,
  loading,
}: {
  metrics: DashboardMetric[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
            <div className="h-3 w-24 animate-pulse rounded bg-[#E1E5EA]" />
            <div className="mt-3 h-7 w-12 animate-pulse rounded bg-[#E1E5EA]" />
          </div>
        ))}
        <span className="sr-only" role="status">
          Loading your activity counts
        </span>
      </div>
    );
  }

  const visible = metrics.filter((metric) => metric.value !== null);
  if (visible.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visible.map((metric) => {
        const Icon = STAT_ICONS[metric.key] ?? Activity;
        const colors = STAT_COLORS[metric.key] ?? { bgColor: "bg-[#0B3D91]/10", textColor: "text-[#0B3D91]" };
        return (
          <Link
            key={metric.key}
            to={metric.href}
            className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm transition-colors hover:border-[#0B3D91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm text-[#5A6472]">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold text-[#1F2933]">{metric.value?.toLocaleString()}</p>
                <p className="mt-1 text-xs text-[#5A6472]">{metric.hint}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.bgColor}`}>
                <Icon className={`h-5 w-5 ${colors.textColor}`} aria-hidden="true" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
