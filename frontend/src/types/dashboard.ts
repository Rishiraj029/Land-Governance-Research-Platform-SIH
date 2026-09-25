/**
 * Dashboard types for PAGE 8 — Dashboards Hub
 *
 * IMPORTANT: This page uses a local prototype dataset for frontend demonstration.
 * Do NOT use these values for any real research, policy, or government purposes.
 * The production implementation will replace these types with Supabase-backed queries.
 */

// ─────────────────────────────────────────────────
// Dashboard categories (topic tabs in the hub)
// ─────────────────────────────────────────────────
export type DashboardCategory =
  | "Land Governance Overview"
  | "Land Use & Urbanization"
  | "Tenure & Land Records"
  | "Land Disputes"
  | "Climate & Land"
  | "Geospatial Governance";

// ─────────────────────────────────────────────────
// Indicator names used across the platform
// ─────────────────────────────────────────────────
export type IndicatorName =
  | "Land Records Digitization"
  | "Land Dispute Cases"
  | "Urban Expansion Rate"
  | "Tenure Security Index"
  | "Climate Risk Index"
  | "Research Datasets"
  | "Districts Covered"
  | "Tenure Coverage";

// ─────────────────────────────────────────────────
// Core data record — one row of prototype indicator data
// ─────────────────────────────────────────────────
export interface DashboardRecord {
  id: string;
  state: string;
  district: string;
  year: number;
  category: DashboardCategory;
  indicator: IndicatorName;
  value: number;
  unit: string;
}

// ─────────────────────────────────────────────────
// Active filter state managed in Dashboards.tsx
// ─────────────────────────────────────────────────
export interface DashboardFilters {
  state: string;       // "" → all states
  year: string;        // "" → all years
  category: string;    // "" → all categories (or overridden by selected tab)
  district: string;    // "" → all districts
}

// ─────────────────────────────────────────────────
// KPI card definition
// ─────────────────────────────────────────────────
export interface KPIDefinition {
  id: string;
  title: string;
  indicator: IndicatorName;
  unit: string;
  description: string;
  icon: string; // Lucide icon name string — rendered in component
  higherIsBetter: boolean; // used to determine trend arrow color
}

// ─────────────────────────────────────────────────
// Dataset metadata displayed in About section
// ─────────────────────────────────────────────────
export interface DashboardDatasetInfo {
  name: string;
  description: string;
  recordCount: number;
  statesCovered: number;
  yearRange: string;
  lastUpdated: string;
  source: string;
}

// ─────────────────────────────────────────────────
// Column sort state for data table
// ─────────────────────────────────────────────────
export type SortColumn = "state" | "year" | "indicator" | "value" | "unit" | "category";
export type SortDirection = "asc" | "desc";

export interface TableSort {
  column: SortColumn;
  direction: SortDirection;
}
