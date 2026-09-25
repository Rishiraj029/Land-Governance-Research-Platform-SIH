import { FileText, FolderKanban, Search, Activity } from "lucide-react";
import { MOCK_STATS } from "../../lib/mockDashboardData";

const STAT_CONFIG = [
  { label: "Documents Uploaded", value: MOCK_STATS.documentsUploaded, icon: FileText, bgColor: "bg-[#0B3D91]/10", textColor: "text-[#0B3D91]" },
  { label: "Active Workspaces", value: MOCK_STATS.activeWorkspaces, icon: FolderKanban, bgColor: "bg-[#FF9933]/10", textColor: "text-[#FF9933]" },
  { label: "Saved Searches", value: MOCK_STATS.savedSearches, icon: Search, bgColor: "bg-[#138808]/10", textColor: "text-[#138808]" },
  { label: "Simulations Run", value: MOCK_STATS.simulationsRun, icon: Activity, bgColor: "bg-[#062A63]/10", textColor: "text-[#062A63]" },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_CONFIG.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-lg border border-[#E1E5EA] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A6472]">{stat.label}</p>
                <p className="text-2xl font-bold text-[#1F2933] mt-1">{stat.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}