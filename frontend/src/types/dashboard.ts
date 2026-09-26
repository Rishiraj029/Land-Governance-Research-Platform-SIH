/**
 * Dashboard types for PAGE 8 — Dashboards Hub.
 *
 * These mirror the live Supabase table public.dashboard_indicators exactly.
 * The table columns are:
 *   id, indicator_name, category, state, district, year, value, unit,
 *   source, description, created_at
 * Do not add fields that the table does not have.
 */

// ─────────────────────────────────────────────────
// One row of public.dashboard_indicators
// ─────────────────────────────────────────────────
export interface DashboardIndicator {
  id: string;
  indicatorName: string;
  category: string | null;
  state: string | null;
  district: string | null;
  year: number | null;
  /** Numeric measure. null when the database value was NULL or not a number. */
  value: number | null;
  unit: string | null;
  source: string | null;
  description: string | null;
  createdAt: string | null;
}

// ─────────────────────────────────────────────────
// Active filter state (single source of truth in Dashboards.tsx)
// An empty string means "all".
// ─────────────────────────────────────────────────
export interface DashboardFilters {
  state: string;
  district: string;
  category: string;
  year: string;
  search: string;
}

/** Select options derived from the loaded rows — never hardcoded. */
export interface DashboardFilterOptions {
  states: string[];
  /** Districts of the selected state (all districts when no state is selected). */
  districts: string[];
  categories: string[];
  /** Descending, so the most recent year is first. */
  years: number[];
}

// ─────────────────────────────────────────────────
// Dataset-level summary, computed from the loaded rows
// ─────────────────────────────────────────────────
export interface DashboardDatasetMeta {
  recordCount: number;
  statesCovered: number;
  districtsCovered: number;
  categoriesCovered: number;
  indicatorTypes: number;
  /** e.g. "2021–2023", or "—" when no usable years exist. */
  yearRange: string;
  units: string[];
  sources: string[];
  lastUpdated: string | null;
  /** True when the records describe themselves as illustrative/demo data. */
  illustrative: boolean;
  /** Which of the records' own words triggered the illustrative flag. */
  illustrativeEvidence: string[];
  /** Rows whose `value` is NULL or not a finite number. */
  rowsMissingValue: number;
  /** Rows with no indicator_name. */
  rowsMissingIndicatorName: number;
}

// ─────────────────────────────────────────────────
// Result of the Supabase read
// ─────────────────────────────────────────────────
export interface DashboardLoadResult {
  indicators: DashboardIndicator[];
  /** Actionable message when the read failed; null on success. */
  error: string | null;
}

// ─────────────────────────────────────────────────
// Column sorting for the data table
// ─────────────────────────────────────────────────
export type SortColumn =
  | "state"
  | "district"
  | "year"
  | "indicatorName"
  | "value"
  | "unit"
  | "category"
  | "source";

export type SortDirection = "asc" | "desc";

export interface TableSort {
  column: SortColumn;
  direction: SortDirection;
}
