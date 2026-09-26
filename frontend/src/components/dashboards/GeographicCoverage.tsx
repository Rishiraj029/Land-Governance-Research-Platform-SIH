/**
 * GeographicCoverage — compact summary card showing platform coverage metrics
 * and a link to the GIS Explorer.
 */
import { Link } from "react-router-dom";
import { Globe, Database, BookOpen, Map as MapIcon, Building2 } from "lucide-react";
import type { DashboardIndicator } from "../../types/dashboard";

interface Props {
  records: DashboardIndicator[];
}

function distinct(values: (string | null)[]): number {
  return new Set(values.filter((value): value is string => Boolean(value))).size;
}

export default function GeographicCoverage({ records }: Props) {
  const states = distinct(records.map((r) => r.state));
  const districts = distinct(records.map((r) => r.district));
  const categories = distinct(records.map((r) => r.category));
  const datasets = distinct(records.map((r) => r.indicatorName));

  const stats = [
    { label: "States covered", value: states, icon: <Globe className="h-4 w-4" /> },
    { label: "Districts covered", value: districts, icon: <Building2 className="h-4 w-4" /> },
    { label: "Indicator types", value: datasets, icon: <Database className="h-4 w-4" /> },
    { label: "Research themes", value: categories, icon: <BookOpen className="h-4 w-4" /> },
  ];

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#1F2933]">Geographic Coverage</h3>
          <p className="text-xs text-[#5A6472]">Platform scope for current filters</p>
        </div>
        <MapIcon className="h-5 w-5 text-[#0B3D91]" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 p-2 bg-[#F5F7FA] rounded-lg">
            <span className="text-[#0B3D91]">{stat.icon}</span>
            <div>
              <p className="text-lg font-bold text-[#1F2933]">{stat.value}</p>
              <p className="text-xs text-[#5A6472]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/gis-explorer"
        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md border border-[#0B3D91] text-[#0B3D91] text-sm font-medium hover:bg-[#0B3D91] hover:text-white transition-colors"
      >
        <MapIcon className="h-4 w-4" />
        Explore in GIS
      </Link>
    </div>
  );
}
