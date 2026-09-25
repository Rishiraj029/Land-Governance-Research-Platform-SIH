/**
 * DashboardFilters — global filter bar for the Dashboards Hub
 * Provides State, Year, Category, and District filters.
 */
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { DashboardFilters as DashboardFiltersType } from "../../types/dashboard";
import { DASHBOARD_STATES, DASHBOARD_YEARS } from "../../lib/mockDashboardIndicators";

const ALL_DISTRICTS = [
  "Jaipur", "Jodhpur", "Udaipur",
  "Mumbai", "Pune", "Nagpur", "Nashik",
  "Ahmedabad", "Surat", "Vadodara", "Rajkot",
  "Bangalore", "Mysore",
  "Lucknow", "Kanpur",
  "Bhopal", "Indore",
  "Hyderabad", "Warangal",
  "Khordha",
];

interface Props {
  filters: DashboardFiltersType;
  onChange: (filters: DashboardFiltersType) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export default function DashboardFilters({ filters, onChange, onReset, hasActiveFilters }: Props) {
  const handleChange = (field: keyof DashboardFiltersType, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#0B3D91]" />
          <span className="text-sm font-semibold text-[#1F2933]">Filters</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
              Active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-[#5A6472] hover:text-[#0B3D91] transition-colors"
            aria-label="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* State */}
        <div>
          <label htmlFor="filter-state" className="block text-xs text-[#5A6472] mb-1 font-medium">
            State
          </label>
          <select
            id="filter-state"
            value={filters.state}
            onChange={(e) => handleChange("state", e.target.value)}
            className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
          >
            <option value="">All States</option>
            {DASHBOARD_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label htmlFor="filter-year" className="block text-xs text-[#5A6472] mb-1 font-medium">
            Year
          </label>
          <select
            id="filter-year"
            value={filters.year}
            onChange={(e) => handleChange("year", e.target.value)}
            className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
          >
            <option value="">All Years</option>
            {DASHBOARD_YEARS.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="filter-category" className="block text-xs text-[#5A6472] mb-1 font-medium">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
          >
            <option value="">All Categories</option>
            <option value="Land Governance Overview">Land Governance Overview</option>
            <option value="Land Use & Urbanization">Land Use &amp; Urbanization</option>
            <option value="Tenure & Land Records">Tenure &amp; Land Records</option>
            <option value="Land Disputes">Land Disputes</option>
            <option value="Climate & Land">Climate &amp; Land</option>
            <option value="Geospatial Governance">Geospatial Governance</option>
          </select>
        </div>

        {/* District */}
        <div>
          <label htmlFor="filter-district" className="block text-xs text-[#5A6472] mb-1 font-medium">
            District
          </label>
          <select
            id="filter-district"
            value={filters.district}
            onChange={(e) => handleChange("district", e.target.value)}
            className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
          >
            <option value="">All Districts</option>
            {ALL_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#E1E5EA]">
          <span className="text-xs text-[#5A6472]">Active:</span>
          {filters.state && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
              State: {filters.state}
            </span>
          )}
          {filters.year && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
              Year: {filters.year}
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
              {filters.category}
            </span>
          )}
          {filters.district && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
              District: {filters.district}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
