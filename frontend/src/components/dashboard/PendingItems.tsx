import { Link } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import type { DashboardPendingItem } from "../../lib/supabaseDashboard";

/**
 * Items genuinely awaiting an outcome, derived from the one real review-status column on the
 * platform (`innovations.status`). There is no moderation queue table, so nothing else is
 * listed here and the empty state is shown honestly when nothing is pending.
 */
export default function PendingItems({ items }: { items: DashboardPendingItem[] }) {
  return (
    <div className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#1F2933]">Needs your attention</h2>

      {items.length === 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-[#E1E5EA] bg-[#F5F7FA] p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#138808]" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-[#1F2933]">Nothing needs your attention</p>
            <p className="mt-0.5 text-xs text-[#5A6472]">
              Submissions you send for review will appear here until they are decided.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className="block rounded-lg border border-[#E1E5EA] bg-[#F5F7FA] p-4 transition-colors hover:border-[#0B3D91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
              >
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#E8A33D]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1F2933]">{item.title}</p>
                    <p className="mt-0.5 text-xs text-[#5A6472]">{item.detail}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
