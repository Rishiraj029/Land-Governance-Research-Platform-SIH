/**
 * PAGE 8 — DASHBOARDS HUB
 * Provides themed analytics views using a local prototype dataset.
 * Does NOT connect to a backend/database.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home, LayoutDashboard, Database, Search as SearchIcon, Map as MapIcon, DatabaseZap } from "lucide-react";

import type { DashboardCategory, DashboardFilters as DashboardFiltersType } from "../types/dashboard";
import {
  DASHBOARD_CATEGORIES,
  DASHBOARD_RECORDS,
  CATEGORY_KPI_MAP,
  DASHBOARD_DATASET_INFO
} from "../lib/mockDashboardIndicators";

import DashboardFilters from "../components/dashboards/DashboardFilters";
import DashboardKpiCards from "../components/dashboards/DashboardKpiCards";
import TrendChart from "../components/dashboards/TrendChart";
import RegionalComparison from "../components/dashboards/RegionalComparison";
import CategoryDistribution from "../components/dashboards/CategoryDistribution";
import GeographicCoverage from "../components/dashboards/GeographicCoverage";
import DashboardDataTable from "../components/dashboards/DashboardDataTable";
import DashboardInfo from "../components/dashboards/DashboardInfo";

export default function Dashboards() {
  // State
  const [activeCategory, setActiveCategory] = useState<DashboardCategory>("Land Governance Overview");

  const [filters, setFilters] = useState<DashboardFiltersType>({
    state: "",
    year: "",
    category: "", // Global category filter (overriden by active tab usually)
    district: "",
  });

  const handleResetFilters = () => {
    setFilters({ state: "", year: "", category: "", district: "" });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  // Apply filters to records
  const filteredRecords = useMemo(() => {
    let result = DASHBOARD_RECORDS;

    // The active tab acts as the primary category filter unless the global filter overrides it 
    // (though we sync them in the UI, we use the active tab here for explicit tab grouping)
    const categoryToFilterBy = filters.category || activeCategory;
    result = result.filter(r => r.category === categoryToFilterBy);

    if (filters.state) {
      result = result.filter(r => r.state === filters.state);
    }
    if (filters.year) {
      result = result.filter(r => r.year === parseInt(filters.year));
    }
    if (filters.district) {
      result = result.filter(r => r.district === filters.district);
    }

    return result;
  }, [filters, activeCategory]);

  const currentKPIs = CATEGORY_KPI_MAP[activeCategory] || [];

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-inter">
      {/* SECTION 1: Breadcrumb */}
      <div className="bg-white border-b border-[#E1E5EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-[#5A6472]">
            <Link to="/" className="flex items-center hover:text-[#0B3D91] transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-[#E1E5EA]" />
            <span className="text-[#1F2933] font-medium">Dashboards</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* SECTION 2: Page Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold font-poppins text-[#1F2933]">
                Land Governance Dashboards
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF9933]/15 text-[#D67C22]">
                <DatabaseZap className="h-3.5 w-3.5" />
                Prototype dashboard data
              </span>
            </div>
            <p className="text-[#5A6472] max-w-2xl text-base">
              Explore indicators, trends and regional patterns to support research and policy analysis.
              Values shown are illustrative data for platform demonstration.
            </p>
          </div>
        </div>

        {/* SECTION 3: Dashboard Category Selector */}
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-1 flex overflow-x-auto hide-scrollbar">
          {DASHBOARD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                if (filters.category) setFilters({ ...filters, category: cat });
              }}
              className={`whitespace-nowrap px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${activeCategory === cat
                ? "bg-[#0B3D91] text-white"
                : "text-[#5A6472] hover:bg-[#F5F7FA] hover:text-[#1F2933]"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SECTION 4: Global Filters */}
        <DashboardFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Empty State vs Content */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white border border-[#E1E5EA] rounded-lg p-12 text-center">
            <LayoutDashboard className="h-12 w-12 text-[#E1E5EA] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1F2933] mb-2">
              No dashboard data matches the selected filters.
            </h3>
            <p className="text-[#5A6472] mb-6">
              Try adjusting your state, year, or district filters to see results.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#0B3D91] text-white text-sm font-medium rounded-md hover:bg-[#062A63] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SECTION 5: Key Indicator Cards */}
            <DashboardKpiCards
              kpis={currentKPIs}
              records={filteredRecords}
              selectedYear={filters.year}
            />

            {/* SECTION 6 & 7: Trend Chart & Regional Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart
                records={filteredRecords}
                filterState={filters.state}
                filterYear={filters.year}
              />
              <RegionalComparison
                records={filteredRecords}
                filterState={filters.state}
                filterYear={filters.year}
              />
            </div>

            {/* SECTION 8 & 9: Distribution & Coverage */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              <CategoryDistribution records={filteredRecords} />
              <div className="space-y-6">
                <GeographicCoverage records={filteredRecords} />
                <DashboardInfo info={DASHBOARD_DATASET_INFO} />
              </div>
            </div>

            {/* SECTION 10: Data Table */}
            <DashboardDataTable records={filteredRecords} />
          </div>
        )}

        {/* SECTION 14: Related Modules */}
        <div className="pt-8 border-t border-[#E1E5EA]">
          <h2 className="text-xl font-bold font-poppins text-[#1F2933] mb-4">Explore Further</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/gis-explorer" className="group p-4 bg-white border border-[#E1E5EA] rounded-lg hover:border-[#0B3D91] hover:shadow-sm transition-all">
              <MapIcon className="h-6 w-6 text-[#0B3D91] mb-3" />
              <h3 className="font-semibold text-[#1F2933] mb-1 group-hover:text-[#0B3D91] transition-colors">GIS Explorer</h3>
              <p className="text-xs text-[#5A6472]">Interactive spatial data and regional mapping.</p>
            </Link>
            <Link to="/repository" className="group p-4 bg-white border border-[#E1E5EA] rounded-lg hover:border-[#0B3D91] hover:shadow-sm transition-all">
              <Database className="h-6 w-6 text-[#138808] mb-3" />
              <h3 className="font-semibold text-[#1F2933] mb-1 group-hover:text-[#0B3D91] transition-colors">Knowledge Repository</h3>
              <p className="text-xs text-[#5A6472]">Access research papers and policy documents.</p>
            </Link>
            <Link to="/search" className="group p-4 bg-white border border-[#E1E5EA] rounded-lg hover:border-[#0B3D91] hover:shadow-sm transition-all">
              <SearchIcon className="h-6 w-6 text-[#FF9933] mb-3" />
              <h3 className="font-semibold text-[#1F2933] mb-1 group-hover:text-[#0B3D91] transition-colors">AI Search</h3>
              <p className="text-xs text-[#5A6472]">Semantic search across governance resources.</p>
            </Link>
            <Link to="/" className="group p-4 bg-white border border-[#E1E5EA] rounded-lg hover:border-[#0B3D91] hover:shadow-sm transition-all relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#F5F7FA] text-[#5A6472] text-[10px] font-bold rounded">COMING SOON</div>
              <LayoutDashboard className="h-6 w-6 text-[#5A6472] mb-3" />
              <h3 className="font-semibold text-[#1F2933] mb-1 group-hover:text-[#0B3D91] transition-colors">Simulation Lab</h3>
              <p className="text-xs text-[#5A6472]">Policy impact modeling and scenario analysis.</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}