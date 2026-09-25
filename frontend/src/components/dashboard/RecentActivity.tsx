import { Link } from "react-router-dom";
import { MOCK_RECENT_ACTIVITY } from "../../lib/mockDashboardData";

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-lg border border-[#E1E5EA] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Continue where you left off</h2>
      <div className="space-y-4">
        {MOCK_RECENT_ACTIVITY.map((item) => (
          <Link
            key={item.id}
            to="#"
            className="flex items-start gap-4 p-3 rounded-lg border border-[#E1E5EA] hover:border-[#0B3D91] hover:bg-[#F5F7FA] transition-colors"
          >
            <div className="flex-shrink-0 text-2xl">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1F2933] truncate">{item.title}</p>
              <p className="text-xs text-[#5A6472] truncate">{item.subtitle}</p>
              <p className="text-xs text-[#5A6472] mt-1">{item.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}