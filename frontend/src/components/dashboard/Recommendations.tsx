import { Link } from "react-router-dom";
import { MOCK_RECOMMENDATIONS } from "../../lib/mockDashboardData";
import type { RecommendationItem } from "../../lib/mockDashboardData";

export default function Recommendations() {
  return (
    <div className="bg-white rounded-lg border border-[#E1E5EA] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Recommended for you</h2>
      <div className="space-y-4">
        {MOCK_RECOMMENDATIONS.map((item: RecommendationItem) => (
          <Link
            key={item.id}
            to="#"
            className="block p-4 rounded-lg border border-[#E1E5EA] hover:border-[#0B3D91] hover:bg-[#F5F7FA] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1F2933] mb-1">{item.title}</p>
                {item.institution && (
                  <p className="text-xs text-[#5A6472] mb-2">{item.institution}</p>
                )}
                {item.members && (
                  <p className="text-xs text-[#5A6472] mb-2">{item.members} members</p>
                )}
                {item.tags && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-[#F5F7FA] border border-[#E1E5EA] rounded text-[#5A6472]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-[#0B3D91] mt-3">{item.reason}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}