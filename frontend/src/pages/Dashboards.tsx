/**
 * PAGE 8 — DASHBOARDS HUB
 * Reads indicator data from Supabase (public.dashboard_indicators) and renders
 * filters, KPIs, charts, a comparison view and a detail panel.
 *
 * A failed or empty read never falls back to mock data: the page shows an error
 * state with Retry, or an explicit empty-dataset state.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ChevronRight,
  Database,
  DatabaseZap,
  Home,
  LayoutDashboard,
  Loader2,
  Map as MapIcon,
  RefreshCw,
  Search as SearchIcon,
} from "lucide-react";

import type { DashboardFilters, DashboardIndicator } from "../types/dashboard";
import {
  EMPTY_DASHBOARD_FILTERS,
  buildFilterOptions,
  filterIndicators,
  hasActiveDashboardFilters,
  loadDashboardIndicators,
  summariseDataset,
} from "../lib/supabaseDashboards";

import DashboardFiltersBar from "../components/dashboards/DashboardFilters";
import DashboardKpiCards from "../components/dashboards/DashboardKpiCards";
import TrendChart from "../components/dashboards/TrendChart";
import RegionalComparison from "../components/dashboards/RegionalComparison";
import CategoryDistribution from "../components/dashboards/CategoryDistribution";
import GeographicCoverage from "../components/dashboards/GeographicCoverage";
import DashboardDataTable from "../components/dashboards/DashboardDataTable";
import DashboardInfo from "../components/dashboards/DashboardInfo";
import CompareStates from "../components/dashboards/CompareStates";
import IndicatorDetailPanel from "../components/dashboards/IndicatorDetailPanel";

export default function Dashboards() {
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedIndicatorId = searchParams.get("indicatorId");
  const [indicators, setIndicators] = useState<DashboardIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(() => ({
    ...EMPTY_DASHBOARD_FILTERS,
    state: searchParams.get("state") ?? "",
    district: searchParams.get("district") ?? "",
    year: searchParams.get("year") ?? "",
  }));
  const [selected, setSelected] = useState<DashboardIndicator | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await loadDashboardIndicators();
    setIndicators(result.indicators);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Derived data ────────────────────────────────
  const options = useMemo(() => buildFilterOptions(indicators, filters), [indicators, filters]);
  const filteredRecords = useMemo(() => filterIndicators(indicators, filters), [indicators, filters]);
  const meta = useMemo(() => summariseDataset(indicators), [indicators]);
  const hasActiveFilters = hasActiveDashboardFilters(filters);
  const linkedIndicator = linkedIndicatorId
    ? indicators.find((indicator) => indicator.id === linkedIndicatorId) ?? null
    : null;
  const selectedIndicator = selected ?? linkedIndicator;

  /** Changing state invalidates any district from the previous state. */
  const handleFiltersChange = useCallback((next: DashboardFilters) => {
    setFilters((previous) =>
      next.state === previous.state ? next : { ...next, district: "" },
    );
  }, []);

  const handleResetFilters = useCallback(() => setFilters(EMPTY_DASHBOARD_FILTERS), []);

  function closeIndicatorDetail() {
    setSelected(null);
    if (searchParams.has("indicatorId")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("indicatorId");
      setSearchParams(nextParams, { replace: true });
    }
  }

  const categoryTabs = useMemo(
    () => [{ value: "", label: "All Categories" }, ...options.categories.map((c) => ({ value: c, label: c }))],
    [options.categories],
  );

  const statusBadge = (() => {
    if (loading) {
      return { label: "Loading dataset", className: "bg-[#0B3D91]/10 text-[#0B3D91]", icon: DatabaseZap };
    }
    if (error) {
      return { label: "Dataset unavailable", className: "bg-[#D64545]/10 text-[#D64545]", icon: AlertTriangle };
    }
    if (meta.illustrative) {
      return { label: "Illustrative dataset", className: "bg-[#FF9933]/15 text-[#D67C22]", icon: AlertTriangle };
    }
    return { label: "Live Supabase data", className: "bg-[#138808]/10 text-[#138808]", icon: Database };
  })();
  const StatusIcon = statusBadge.icon;

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
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold font-poppins text-[#1F2933]">
                Land Governance Dashboards
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {statusBadge.label}
              </span>
            </div>
            <p className="text-[#5A6472] max-w-2xl text-base">
              Explore indicators, trends and regional patterns from the platform's
              dashboard dataset. Every figure is read from Supabase and keeps its own
              source and year.
            </p>
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#E1E5EA] bg-white text-sm font-medium text-[#1F2933] hover:border-[#0B3D91] hover:text-[#0B3D91] disabled:opacity-60 disabled:cursor-not-allowed transition-colors self-start"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh data
          </button>
        </div>

        {/* SECTION 3: Category selector (options come from the database) */}
        {categoryTabs.length > 1 && (
          <div className="bg-white rounded-lg border border-[#E1E5EA] p-1 flex overflow-x-auto hide-scrollbar">
            {categoryTabs.map((tab) => (
              <button
                key={tab.value || "all"}
                onClick={() => handleFiltersChange({ ...filters, category: tab.value })}
                className={`whitespace-nowrap px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  (filters.category || "") === tab.value
                    ? "bg-[#0B3D91] text-white"
                    : "text-[#5A6472] hover:bg-[#F5F7FA] hover:text-[#1F2933]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* SECTION 4: Loading / Error / Empty dataset */}
        {loading ? (
          <div className="bg-white border border-[#E1E5EA] rounded-lg p-12 text-center">
            <Loader2 className="h-10 w-10 text-[#0B3D91] mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-[#1F2933] mb-2">Loading indicators</h3>
            <p className="text-[#5A6472]">
              Reading public.dashboard_indicators from the platform database…
            </p>
          </div>
        ) : error ? (
          <div className="bg-white border border-[#D64545]/30 rounded-lg p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-[#D64545] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1F2933] mb-2">
              Could not load dashboard indicators
            </h3>
            <p className="text-[#5A6472] mb-6 max-w-xl mx-auto">{error}</p>
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B3D91] text-white text-sm font-medium rounded-md hover:bg-[#062A63] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : indicators.length === 0 ? (
          <div className="bg-white border border-[#E1E5EA] rounded-lg p-12 text-center">
            <Database className="h-12 w-12 text-[#E1E5EA] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1F2933] mb-2">
              No indicator data available
            </h3>
            <p className="text-[#5A6472] mb-6 max-w-xl mx-auto">
              The dashboard dataset is reachable but contains no rows yet. Charts are not
              drawn because there is nothing to show.
            </p>
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B3D91] text-white text-sm font-medium rounded-md hover:bg-[#062A63] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reload dataset
            </button>
          </div>
        ) : (
          <>
            {/* SECTION 5: Filters */}
            <DashboardFiltersBar
              filters={filters}
              options={options}
              onChange={handleFiltersChange}
              onReset={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              resultCount={filteredRecords.length}
              totalCount={indicators.length}
            />

            {/* SECTION 6: Empty filtered result vs content */}
            {filteredRecords.length === 0 ? (
              <div className="bg-white border border-[#E1E5EA] rounded-lg p-12 text-center">
                <LayoutDashboard className="h-12 w-12 text-[#E1E5EA] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1F2933] mb-2">
                  No dashboard data matches the selected filters.
                </h3>
                <p className="text-[#5A6472] mb-6">
                  {indicators.length} records are loaded, but none match the current
                  state, district, category, year or search term.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#0B3D91] text-white text-sm font-medium rounded-md hover:bg-[#062A63] transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* KPIs */}
                <DashboardKpiCards records={filteredRecords} totalRecords={indicators.length} />

                {/* Trend & state comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TrendChart records={filteredRecords} />
                  <RegionalComparison records={filteredRecords} />
                </div>

                {/* Distribution & coverage */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                  <CategoryDistribution records={filteredRecords} />
                  <div className="space-y-6">
                    <GeographicCoverage records={filteredRecords} />
                    <DashboardInfo meta={meta} />
                  </div>
                </div>

                {/* Table */}
                <DashboardDataTable records={filteredRecords} onSelect={setSelected} />
              </div>
            )}

            {/*
              Compare States — reads the same loaded rows but keeps its own state/year
              selection, so it stays usable even when the filters above match nothing.
            */}
            <CompareStates indicators={indicators} />
          </>
        )}

        {/* SECTION 7: Related Modules */}
        <div className="pt-8 border-t border-[#E1E5EA]">
          <h2 className="text-xl font-bold font-poppins text-[#1F2933] mb-4">Explore Further</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/gis-explorer"
              className="group p-4 bg-white border border-[#E1E5EA] rounded-lg hover:border-[#0B3D91] hover:shadow-sm transition-all"
            >
              <MapIcon className="h-6 w-6 text-[#0B3D91] mb-3" />
              <h3 className="font-semibold text-[#1F2933] mb-1 group-hover:text-[#0B3D91] transition-colors">
                GIS Explorer
              </h3>
              <p className="text-xs text-[#5A6472]">Interactive spatial data and regional mapping.</p>
            </Link>
            <Link
              to="/repository"
              className="group p-4 bg-white border border-[#E1E5EA] rounded-lg hover:border-[#0B3D91] hover:shadow-sm transition-all"
            >
              <Database className="h-6 w-6 text-[#138808] mb-3" />
              <h3 className="font-semibold text-[#1F2933] mb-1 group-hover:text-[#0B3D91] transition-colors">
                Knowledge Repository
              </h3>
              <p className="text-xs text-[#5A6472]">Access research papers and policy documents.</p>
            </Link>
            <Link
              to="/search"
              className="group p-4 bg-white border border-[#E1E5EA] rounded-lg hover:border-[#0B3D91] hover:shadow-sm transition-all"
            >
              <SearchIcon className="h-6 w-6 text-[#FF9933] mb-3" />
              <h3 className="font-semibold text-[#1F2933] mb-1 group-hover:text-[#0B3D91] transition-colors">
                AI Search
              </h3>
              <p className="text-xs text-[#5A6472]">Semantic search across governance resources.</p>
            </Link>
            <Link
              to="/simulation-lab"
              className="group p-4 bg-white border border-[#E1E5EA] rounded-lg hover:border-[#0B3D91] hover:shadow-sm transition-all"
            >
              <LayoutDashboard className="h-6 w-6 text-[#8B5CF6] mb-3" />
              <h3 className="font-semibold text-[#1F2933] mb-1 group-hover:text-[#0B3D91] transition-colors">
                Simulation Lab
              </h3>
              <p className="text-xs text-[#5A6472]">Policy impact modeling and scenario analysis.</p>
            </Link>
          </div>
        </div>
      </div>

      {selectedIndicator && (
        <IndicatorDetailPanel
          indicator={selectedIndicator}
          illustrative={meta.illustrative}
          onClose={closeIndicatorDetail}
        />
      )}
    </div>
  );
}
