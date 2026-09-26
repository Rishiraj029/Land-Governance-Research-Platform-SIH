/**
 * DashboardFilters — filter bar for the Dashboards Hub.
 * State, District (scoped to the selected state), Category, Year and free-text search.
 * Every option is derived from the loaded public.dashboard_indicators rows.
 */
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { DashboardFilterOptions, DashboardFilters as DashboardFiltersType } from "../../types/dashboard";

interface Props {
  filters: DashboardFiltersType;
  options: DashboardFilterOptions;
  onChange: (filters: DashboardFiltersType) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  /** Rows matching the current filters. */
  resultCount: number;
  /** Rows loaded from the database. */
  totalCount: number;
}

const SELECT_CLASS =
  "w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 disabled:bg-[#F5F7FA] disabled:text-[#5A6472]";

export default function DashboardFilters({
  filters,
  options,
  onChange,
  onReset,
  hasActiveFilters,
  resultCount,
  totalCount,
}: Props) {
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#5A6472]">
            {resultCount} of {totalCount} records
          </span>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="filter-search" className="block text-xs text-[#5A6472] mb-1 font-medium">
            Search indicators
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6472]" />
            <input
              id="filter-search"
              type="search"
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              placeholder="Indicator, category, state, district, unit or source"
              className="w-full rounded-md border border-[#E1E5EA] bg-white pl-9 pr-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
            />
          </div>
        </div>

        {/* State */}
        <div>
          <label htmlFor="filter-state" className="block text-xs text-[#5A6472] mb-1 font-medium">
            State
          </label>
          <select
            id="filter-state"
            value={filters.state}
            onChange={(e) => handleChange("state", e.target.value)}
            disabled={options.states.length === 0}
            className={SELECT_CLASS}
          >
            <option value="">All States</option>
            {options.states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* District — scoped to the selected state */}
        <div>
          <label htmlFor="filter-district" className="block text-xs text-[#5A6472] mb-1 font-medium">
            District
          </label>
          <select
            id="filter-district"
            value={filters.district}
            onChange={(e) => handleChange("district", e.target.value)}
            disabled={options.districts.length === 0}
            className={SELECT_CLASS}
          >
            <option value="">
              {filters.state ? `All districts in ${filters.state}` : "All Districts"}
            </option>
            {options.districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
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
            disabled={options.categories.length === 0}
            className={SELECT_CLASS}
          >
            <option value="">All Categories</option>
            {options.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
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
            disabled={options.years.length === 0}
            className={SELECT_CLASS}
          >
            <option value="">All Years</option>
            {options.years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#E1E5EA]">
          <span className="text-xs text-[#5A6472]">Active:</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
              Search: “{filters.search}”
            </span>
          )}
          {filters.state && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
              State: {filters.state}
            </span>
          )}
          {filters.district && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
              District: {filters.district}
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
              Category: {filters.category}
            </span>
          )}
          {filters.year && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
              Year: {filters.year}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
