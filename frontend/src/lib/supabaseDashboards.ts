/**
 * Supabase data access for PAGE 8 — Dashboards Hub.
 *
 * Reads public.dashboard_indicators and maps rows into clean frontend types.
 * A failed request never falls back to mock data: it returns an actionable error
 * that the page renders as an error state with Retry.
 */
import { supabase } from './supabase';
import type {
  DashboardDatasetMeta,
  DashboardFilterOptions,
  DashboardFilters,
  DashboardIndicator,
  DashboardLoadResult,
} from '../types/dashboard';

/** Only the columns that actually exist in public.dashboard_indicators. */
const DASHBOARD_COLUMNS =
  'id, indicator_name, category, state, district, year, value, unit, source, description, created_at';
const DASHBOARD_PAGE_SIZE = 1000;
let dashboardIndicatorsInFlight: Promise<DashboardLoadResult> | null = null;

/** Raw row shape as returned by PostgREST. */
interface DashboardIndicatorRow {
  id: string;
  indicator_name: string | null;
  category: string | null;
  state: string | null;
  district: string | null;
  year: number | string | null;
  value: number | string | null;
  unit: string | null;
  source: string | null;
  description: string | null;
  created_at: string | null;
}

// ─────────────────────────────────────────────────
// Value coercion
// ─────────────────────────────────────────────────
/** Trim strings and treat empty strings as "no value". */
function cleanString(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** Postgres numeric columns can arrive as strings; accept both and reject junk. */
function toFiniteNumber(value: number | string | null): number | null {
  if (value === null || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Years are stored as integers; keep only plausible finite values. */
function toYear(value: number | string | null): number | null {
  const parsed = toFiniteNumber(value);
  if (parsed === null || !Number.isInteger(parsed)) return null;
  if (parsed < 1000 || parsed > 9999) return null;
  return parsed;
}

function rowToIndicator(row: DashboardIndicatorRow): DashboardIndicator {
  return {
    id: row.id,
    indicatorName: cleanString(row.indicator_name) ?? '',
    category: cleanString(row.category),
    state: cleanString(row.state),
    district: cleanString(row.district),
    year: toYear(row.year),
    value: toFiniteNumber(row.value),
    unit: cleanString(row.unit),
    source: cleanString(row.source),
    description: cleanString(row.description),
    createdAt: cleanString(row.created_at),
  };
}

// ─────────────────────────────────────────────────
// Error copy
// ─────────────────────────────────────────────────
function describeDashboardError(code: string | undefined, message: string): string {
  if (code === '42501' || message.includes('permission denied')) {
    return 'Your account does not have read access to the dashboard dataset (public.dashboard_indicators). An administrator needs to grant SELECT to this role.';
  }
  if (code === 'PGRST205' || message.includes('Could not find the table')) {
    return 'The dashboard dataset table (public.dashboard_indicators) was not found in the database schema.';
  }
  return message;
}

// ─────────────────────────────────────────────────
// Read
// ─────────────────────────────────────────────────
/**
 * Load every dashboard indicator row.
 * Ordered by category → state → year so the table and charts start grouped.
 */
export function loadDashboardIndicators(): Promise<DashboardLoadResult> {
  if (dashboardIndicatorsInFlight) return dashboardIndicatorsInFlight;

  const request = fetchDashboardIndicators();
  const sharedRequest = request.finally(() => {
    if (dashboardIndicatorsInFlight === sharedRequest) dashboardIndicatorsInFlight = null;
  });
  dashboardIndicatorsInFlight = sharedRequest;
  return sharedRequest;
}

async function fetchDashboardIndicators(): Promise<DashboardLoadResult> {
  try {
    const rows: DashboardIndicatorRow[] = [];

    for (let offset = 0; ; offset += DASHBOARD_PAGE_SIZE) {
      const { data, error } = await supabase
        .from('dashboard_indicators')
        .select(DASHBOARD_COLUMNS)
        .order('category', { ascending: true })
        .order('state', { ascending: true })
        .order('year', { ascending: true })
        .order('id', { ascending: true })
        .range(offset, offset + DASHBOARD_PAGE_SIZE - 1);

      if (error) {
        console.error('Error loading dashboard indicators:', error);
        return { indicators: [], error: describeDashboardError(error.code, error.message) };
      }

      const page = (data || []) as DashboardIndicatorRow[];
      rows.push(...page);
      if (page.length < DASHBOARD_PAGE_SIZE) break;
    }

    return { indicators: rows.map(rowToIndicator), error: null };
  } catch (error) {
    console.error('Unexpected error loading dashboard indicators:', error);
    return { indicators: [], error: 'Failed to load dashboard indicators. Please try again.' };
  }
}

// ─────────────────────────────────────────────────
// Pure derivations (no network, no mock data)
// ─────────────────────────────────────────────────
export const EMPTY_DASHBOARD_FILTERS: DashboardFilters = {
  state: '',
  district: '',
  category: '',
  year: '',
  search: '',
};

export function hasActiveDashboardFilters(filters: DashboardFilters): boolean {
  return Object.values(filters).some((value) => value !== '');
}

/** Apply state/district/category/year/search to the loaded rows. */
export function filterIndicators(
  rows: DashboardIndicator[],
  filters: DashboardFilters,
): DashboardIndicator[] {
  const search = filters.search.trim().toLowerCase();
  const year = filters.year === '' ? null : Number(filters.year);

  return rows.filter((row) => {
    if (filters.state && row.state !== filters.state) return false;
    if (filters.district && row.district !== filters.district) return false;
    if (filters.category && row.category !== filters.category) return false;
    if (year !== null && row.year !== year) return false;
    if (search) {
      const haystack = [
        row.indicatorName,
        row.category,
        row.state,
        row.district,
        row.unit,
        row.source,
        row.description,
      ]
        .filter((part): part is string => Boolean(part))
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function sortedUnique(values: (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b),
  );
}

/**
 * Select options derived from the loaded rows.
 * States/categories/years come from every row so options stay stable,
 * while districts are scoped to the currently selected state.
 */
export function buildFilterOptions(
  rows: DashboardIndicator[],
  filters: DashboardFilters,
): DashboardFilterOptions {
  const districtSource = filters.state ? rows.filter((row) => row.state === filters.state) : rows;
  const years = [
    ...new Set(rows.map((row) => row.year).filter((year): year is number => year !== null)),
  ].sort((a, b) => b - a);

  return {
    states: sortedUnique(rows.map((row) => row.state)),
    districts: sortedUnique(districtSource.map((row) => row.district)),
    categories: sortedUnique(rows.map((row) => row.category)),
    years,
  };
}

/** Distinct indicator names present in the given rows (for chart selectors). */
export function listIndicators(rows: DashboardIndicator[]): string[] {
  return sortedUnique(rows.map((row) => row.indicatorName || null));
}

/** Distinct state names present in the given rows. */
export function listStates(rows: DashboardIndicator[]): string[] {
  return sortedUnique(rows.map((row) => row.state));
}

/**
 * The indicator with the most rows, used as the default chart selection so the
 * first view shows the best-covered series rather than an arbitrary one.
 */
export function defaultIndicator(rows: DashboardIndicator[]): string {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.indicatorName) continue;
    counts.set(row.indicatorName, (counts.get(row.indicatorName) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = -1;
  for (const [name, count] of counts) {
    if (count > bestCount || (count === bestCount && best !== null && name.localeCompare(best) < 0)) {
      best = name;
      bestCount = count;
    }
  }
  return best ?? '';
}

/** The single unit shared by every valued row, or null when units differ/absent. */
export function singleUnit(rows: DashboardIndicator[]): string | null {
  const units = new Set(
    rows
      .filter((row) => row.value !== null)
      .map((row) => row.unit ?? ''),
  );
  if (units.size !== 1) return null;
  const [only] = [...units];
  return only === '' ? null : only;
}

/** True when the rows carry more than one distinct unit (values are not comparable). */
export function hasMixedUnits(rows: DashboardIndicator[]): boolean {
  const units = new Set(rows.filter((row) => row.value !== null).map((row) => row.unit ?? ''));
  return units.size > 1;
}

/** Mean of the rows' values, or null when there is nothing to average. */
export function averageValue(rows: DashboardIndicator[]): number | null {
  const values = rows.map((row) => row.value).filter((value): value is number => value !== null);
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/** Mean value per state, descending — used by the state comparison chart. */
export function meanValueByState(
  rows: DashboardIndicator[],
): { state: string; value: number }[] {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const row of rows) {
    if (row.value === null || !row.state) continue;
    const entry = totals.get(row.state) ?? { sum: 0, count: 0 };
    entry.sum += row.value;
    entry.count += 1;
    totals.set(row.state, entry);
  }
  return [...totals.entries()]
    .map(([state, { sum, count }]) => ({ state, value: sum / count }))
    .sort((a, b) => b.value - a.value);
}

// ─────────────────────────────────────────────────
// State-to-state comparison (Compare States)
// ─────────────────────────────────────────────────
/**
 * How a state figure was derived from the rows.
 *
 * `dashboard_indicators` stores some indicators for the whole state (district = "All") and
 * others only per district. A statewide row is used as reported; when an indicator exists only
 * for districts, the state figure is the mean of those district records and is labelled as such,
 * so a district average is never presented as a statewide measurement.
 */
export type ComparisonBasis = 'statewide' | 'district-mean';

/** One comparable figure: a single state, indicator and year. */
export interface ComparisonValue {
  indicatorName: string;
  category: string | null;
  value: number;
  unit: string | null;
  basis: ComparisonBasis;
  /** Rows behind the figure (1 when a statewide row was used). */
  recordCount: number;
  /** Districts averaged for a district mean, alphabetically; empty for a statewide row. */
  districts: string[];
  source: string | null;
  description: string | null;
}

/** Every indicator one state reports for one year. */
export interface StateYearSummary {
  state: string;
  year: number;
  values: ComparisonValue[];
}

/** One indicator both states report, with each state's own figure. */
export interface StateComparisonRow {
  indicatorName: string;
  category: string | null;
  unit: string | null;
  a: ComparisonValue;
  b: ComparisonValue;
}

export interface StateComparisonResult {
  year: number;
  a: StateYearSummary;
  b: StateYearSummary;
  /** Indicators present for both states, alphabetically — never ranked. */
  shared: StateComparisonRow[];
  /** Distinct units across the shared indicators, alphabetically. */
  units: string[];
}

/** Years present in the rows, newest first. */
export function listYears(rows: DashboardIndicator[]): number[] {
  return [
    ...new Set(rows.map((row) => row.year).filter((year): year is number => year !== null)),
  ].sort((a, b) => b - a);
}

/** Years with at least one row for the given state, newest first. */
export function yearsWithDataForState(rows: DashboardIndicator[], state: string): number[] {
  return listYears(rows.filter((row) => row.state === state));
}

/** True when the row is recorded for the whole state rather than one district. */
function isStatewideRow(row: DashboardIndicator): boolean {
  return (row.district ?? '').trim().toLowerCase() === 'all';
}

/**
 * One state's figures for one year.
 *
 * Rows without a usable number are skipped rather than treated as zero, and indicators with no
 * name are ignored, so nothing here can invent a value the table does not contain.
 */
export function stateYearSummary(
  rows: DashboardIndicator[],
  state: string,
  year: number,
): StateYearSummary {
  const rowsForStateYear = rows.filter(
    (row) => row.state === state && row.year === year && row.value !== null && row.indicatorName,
  );

  const grouped = new Map<string, DashboardIndicator[]>();
  for (const row of rowsForStateYear) {
    const bucket = grouped.get(row.indicatorName);
    if (bucket) bucket.push(row);
    else grouped.set(row.indicatorName, [row]);
  }

  const values: ComparisonValue[] = [];
  for (const [indicatorName, group] of grouped) {
    const statewide = group.filter(isStatewideRow);
    const contributing = statewide.length > 0 ? [statewide[0]] : group;
    const numbers = contributing
      .map((row) => row.value)
      .filter((value): value is number => value !== null);
    if (numbers.length === 0) continue;

    const units = new Set(contributing.map((row) => row.unit ?? ''));
    const unit = units.size === 1 ? ([...units][0] || null) : null;
    const basis: ComparisonBasis = statewide.length > 0 ? 'statewide' : 'district-mean';

    values.push({
      indicatorName,
      category: contributing.find((row) => row.category)?.category ?? null,
      value: numbers.reduce((total, value) => total + value, 0) / numbers.length,
      unit,
      basis,
      recordCount: contributing.length,
      districts:
        basis === 'district-mean' ? sortedUnique(contributing.map((row) => row.district)) : [],
      source: contributing.find((row) => row.source)?.source ?? null,
      description: contributing.find((row) => row.description)?.description ?? null,
    });
  }

  values.sort((left, right) => left.indicatorName.localeCompare(right.indicatorName));
  return { state, year, values };
}

/** Indicators both states report for the year, with each state's own figure. */
export function compareStates(
  rows: DashboardIndicator[],
  stateA: string,
  stateB: string,
  year: number,
): StateComparisonResult {
  const a = stateYearSummary(rows, stateA, year);
  const b = stateYearSummary(rows, stateB, year);
  const bByName = new Map(b.values.map((value) => [value.indicatorName, value]));

  const shared: StateComparisonRow[] = [];
  for (const value of a.values) {
    const counterpart = bByName.get(value.indicatorName);
    if (!counterpart) continue;
    shared.push({
      indicatorName: value.indicatorName,
      category: value.category ?? counterpart.category,
      unit: value.unit ?? counterpart.unit,
      a: value,
      b: counterpart,
    });
  }
  shared.sort((left, right) => left.indicatorName.localeCompare(right.indicatorName));

  return { year, a, b, shared, units: sortedUnique(shared.map((row) => row.unit)) };
}

/**
 * The unit covering the most rows — the default chart scale.
 *
 * Indicators are reported in different units (percent, index, cards…), and the dashboard never
 * draws them on one axis. Charting the best-covered unit keeps the grouped bars comparable.
 */
export function dominantUnit(rows: { unit: string | null }[]): string {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.unit) continue;
    counts.set(row.unit, (counts.get(row.unit) ?? 0) + 1);
  }
  let best = '';
  let bestCount = -1;
  for (const [unit, count] of [...counts.entries()].sort((x, y) => x[0].localeCompare(y[0]))) {
    if (count > bestCount) {
      best = unit;
      bestCount = count;
    }
  }
  return best;
}

/** Words the records use to describe themselves as non-official data. */
const ILLUSTRATIVE_TERMS =
  /illustrat|indicative|prototype|demo|dummy|sample|mock|placeholder|hypothetical|not official/i;

/** Summarise the whole (unfiltered) dataset for the info panel and trust badges. */
export function summariseDataset(rows: DashboardIndicator[]): DashboardDatasetMeta {
  const years = rows.map((row) => row.year).filter((year): year is number => year !== null);
  const sortedYears = [...years].sort((a, b) => a - b);
  const yearRange =
    sortedYears.length === 0
      ? '—'
      : sortedYears[0] === sortedYears[sortedYears.length - 1]
        ? String(sortedYears[0])
        : `${sortedYears[0]}–${sortedYears[sortedYears.length - 1]}`;

  const evidence = new Set<string>();
  for (const row of rows) {
    const text = `${row.source ?? ''} ${row.description ?? ''} ${row.indicatorName}`;
    const match = text.match(ILLUSTRATIVE_TERMS);
    if (match) evidence.add(row.source ?? match[0]);
  }

  const createdAtValues = rows
    .map((row) => row.createdAt)
    .filter((value): value is string => Boolean(value))
    .sort();

  return {
    recordCount: rows.length,
    statesCovered: sortedUnique(rows.map((row) => row.state)).length,
    districtsCovered: sortedUnique(rows.map((row) => row.district)).length,
    categoriesCovered: sortedUnique(rows.map((row) => row.category)).length,
    indicatorTypes: listIndicators(rows).length,
    yearRange,
    units: sortedUnique(rows.map((row) => row.unit)),
    sources: sortedUnique(rows.map((row) => row.source)),
    lastUpdated: createdAtValues.length > 0 ? createdAtValues[createdAtValues.length - 1] : null,
    illustrative: evidence.size > 0,
    illustrativeEvidence: [...evidence].slice(0, 4),
    rowsMissingValue: rows.filter((row) => row.value === null).length,
    rowsMissingIndicatorName: rows.filter((row) => row.indicatorName === '').length,
  };
}

/** Stable colour per category/state name, drawn from the platform palette. */
export const DASHBOARD_PALETTE = [
  '#0B3D91',
  '#FF9933',
  '#138808',
  '#D64545',
  '#E8A33D',
  '#8B5CF6',
  '#0891B2',
  '#BE185D',
] as const;

export function paletteColor(name: string, offset = 0): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 100000;
  }
  return DASHBOARD_PALETTE[(hash + offset) % DASHBOARD_PALETTE.length];
}

/** Format a numeric measure compactly, without inventing precision. */
export function formatMeasure(value: number | null): string {
  if (value === null) return '—';
  return Math.abs(value) >= 100
    ? Math.round(value).toLocaleString()
    : Number(value.toFixed(2)).toLocaleString();
}

// ─────────────────────────────────────────────────
// Risk Signals Analysis (Land Governance Risk Signals)
// ─────────────────────────────────────────────────

/**
 * Trend types for risk signal analysis.
 * These are rule-based classifications, not predictions.
 */
export type TrendType = 'increasing' | 'decreasing' | 'stable' | 'unusual-change' | 'insufficient-data';

/**
 * A single risk signal for a geography-indicator combination.
 */
export interface RiskSignal {
  /** Geography (state or state + district) */
  geography: string;
  /** Indicator name */
  indicator: string;
  /** Rule-based trend classification */
  trend: TrendType;
  /** Time period covered by the analysis (e.g., "2021–2023") */
  period: string;
  /** Underlying data points used for the analysis */
  dataPoints: Array<{ year: number; value: number; unit: string | null }>;
  /** Data source from the original records */
  source: string | null;
  /** Data quality/confidence note */
  confidenceNote: string;
  /** Category of the indicator */
  category: string | null;
}

/**
 * A single risk signal for a geography-indicator combination.
 */
export interface RiskSignal {
  /** Geography (state or state + district) */
  geography: string;
  /** Indicator name */
  indicator: string;
  /** Rule-based trend classification */
  trend: TrendType;
  /** Time period covered by the analysis (e.g., "2021–2023") */
  period: string;
  /** Underlying data points used for the analysis */
  dataPoints: Array<{ year: number; value: number; unit: string | null }>;
  /** Data source from the original records */
  source: string | null;
  /** Data quality/confidence note */
  confidenceNote: string;
  /** Category of the indicator */
  category: string | null;
}

/**
 * Minimum number of data points required for trend analysis.
 */
const MIN_DATA_POINTS = 3;

/**
 * Threshold for considering a change "unusual" (percentage change).
 * If the year-over-year change exceeds this percentage, it's flagged as unusual.
 */
const UNUSUAL_CHANGE_THRESHOLD = 0.5; // 50% change

/**
 * Threshold for considering a trend "stable" (coefficient of variation).
 * If the coefficient of variation is below this, the trend is considered stable.
 */
const STABLE_TREND_THRESHOLD = 0.1; // 10% coefficient of variation

/**
 * Calculate the coefficient of variation (CV) for a set of values.
 * CV = standard deviation / mean. Lower CV indicates more stable values.
 */
function calculateCoefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return stdDev / Math.abs(mean);
}

/**
 * Calculate the average year-over-year percentage change.
 */
function calculateAverageYearOverYearChange(values: number[]): number {
  if (values.length < 2) return 0;
  let totalChange = 0;
  let changeCount = 0;
  
  for (let i = 1; i < values.length; i++) {
    const prevValue = values[i - 1];
    const currValue = values[i];
    if (prevValue !== 0) {
      const change = (currValue - prevValue) / Math.abs(prevValue);
      totalChange += change;
      changeCount++;
    }
  }
  
  return changeCount > 0 ? totalChange / changeCount : 0;
}

/**
 * Detect unusual large recent changes in the data.
 * Returns true if the most recent year-over-year change exceeds the threshold.
 */
function hasUnusualRecentChange(values: number[]): boolean {
  if (values.length < 2) return false;
  const lastIndex = values.length - 1;
  const prevValue = values[lastIndex - 1];
  const currValue = values[lastIndex];
  
  if (prevValue === 0) return false;
  const change = Math.abs((currValue - prevValue) / Math.abs(prevValue));
  return change > UNUSUAL_CHANGE_THRESHOLD;
}

/**
 * Classify the trend type based on the data values.
 * Uses simple rule-based logic, not machine learning.
 */
function classifyTrend(values: number[]): TrendType {
  if (values.length < MIN_DATA_POINTS) {
    return 'insufficient-data';
  }
  
  // Check for unusual recent change first
  if (hasUnusualRecentChange(values)) {
    return 'unusual-change';
  }
  
  // Check if trend is stable
  const cv = calculateCoefficientOfVariation(values);
  if (cv < STABLE_TREND_THRESHOLD) {
    return 'stable';
  }
  
  // Check if increasing or decreasing
  const avgChange = calculateAverageYearOverYearChange(values);
  if (avgChange > 0.05) { // More than 5% average increase
    return 'increasing';
  } else if (avgChange < -0.05) { // More than 5% average decrease
    return 'decreasing';
  }
  
  // Default to stable if changes are small
  return 'stable';
}

/**
 * Generate risk signals for all geography-indicator combinations in the dataset.
 * Returns signals sorted by geography and indicator name.
 */
export function generateRiskSignals(indicators: DashboardIndicator[]): RiskSignal[] {
  const signals: RiskSignal[] = [];
  
  // Group indicators by geography and indicator name
  const groups = new Map<string, DashboardIndicator[]>();
  
  for (const indicator of indicators) {
    if (indicator.value === null || !indicator.indicatorName) continue;
    
    // Create a unique key for geography + indicator
    const geography = indicator.state || 'Unknown';
    const district = indicator.district ? `, ${indicator.district}` : '';
    const key = `${geography}${district}::${indicator.indicatorName}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(indicator);
  }
  
  // Analyze each group
  for (const [key, group] of groups) {
    if (group.length < MIN_DATA_POINTS) {
      // Still create a signal with insufficient data
      const [geography, indicator] = key.split('::');
      const sortedGroup = [...group].sort((a, b) => (a.year || 0) - (b.year || 0));
      const dataPoints = sortedGroup.map(row => ({
        year: row.year || 0,
        value: row.value || 0,
        unit: row.unit
      }));
      
      signals.push({
        geography,
        indicator,
        trend: 'insufficient-data',
        period: dataPoints.length > 0 
          ? `${Math.min(...dataPoints.map(d => d.year))}–${Math.max(...dataPoints.map(d => d.year))}`
          : 'No data',
        dataPoints,
        source: group[0].source,
        confidenceNote: `Insufficient data: only ${group.length} data point(s) available. Minimum ${MIN_DATA_POINTS} required for trend analysis.`,
        category: group[0].category
      });
      continue;
    }
    
    // Sort by year
    const sortedGroup = [...group].sort((a, b) => (a.year || 0) - (b.year || 0));
    
    // Extract values for analysis
    const values = sortedGroup.map(row => row.value || 0);
    const dataPoints = sortedGroup.map(row => ({
      year: row.year || 0,
      value: row.value || 0,
      unit: row.unit
    }));
    
    const [geography, indicator] = key.split('::');
    const trend = classifyTrend(values);
    const years = dataPoints.map(d => d.year);
    const period = `${Math.min(...years)}–${Math.max(...years)}`;
    
    // Determine confidence note based on data quality
    let confidenceNote = 'Adequate data for trend analysis.';
    if (values.some(v => v < 0)) {
      confidenceNote += ' Note: Some values are negative.';
    }
    if (new Set(sortedGroup.map(row => row.unit)).size > 1) {
      confidenceNote += ' Warning: Mixed units detected in data series.';
    }
    
    signals.push({
      geography,
      indicator,
      trend,
      period,
      dataPoints,
      source: group[0].source,
      confidenceNote,
      category: group[0].category
    });
  }
  
  // Sort by geography, then by indicator name
  return signals.sort((a, b) => {
    const geoCompare = a.geography.localeCompare(b.geography);
    if (geoCompare !== 0) return geoCompare;
    return a.indicator.localeCompare(b.indicator);
  });
}

/**
 * Get trend icon component name based on trend type.
 */
export function getTrendIcon(trend: TrendType): string {
  switch (trend) {
    case 'increasing':
      return 'TrendingUp';
    case 'decreasing':
      return 'TrendingDown';
    case 'stable':
      return 'Minus';
    case 'unusual-change':
      return 'AlertTriangle';
    case 'insufficient-data':
      return 'HelpCircle';
    default:
      return 'Minus';
  }
}

/**
 * Get trend display label with emoji.
 */
export function getTrendLabel(trend: TrendType): string {
  switch (trend) {
    case 'increasing':
      return '↑ Increasing trend';
    case 'decreasing':
      return '↓ Decreasing trend';
    case 'stable':
      return '→ Stable trend';
    case 'unusual-change':
      return '⚠ Unusual change';
    case 'insufficient-data':
      return '○ Insufficient data';
    default:
      return 'Unknown';
  }
}

/**
 * Get trend color class for styling.
 */
export function getTrendColor(trend: TrendType): string {
  switch (trend) {
    case 'increasing':
      return 'text-[#D64545] bg-[#D64545]/10'; // Red for concerning increases
    case 'decreasing':
      return 'text-[#138808] bg-[#138808]/10'; // Green for positive decreases
    case 'stable':
      return 'text-[#0B3D91] bg-[#0B3D91]/10'; // Blue for stable
    case 'unusual-change':
      return 'text-[#FF9933] bg-[#FF9933]/10'; // Orange for unusual
    case 'insufficient-data':
      return 'text-[#5A6472] bg-[#5A6472]/10'; // Gray for insufficient
    default:
      return 'text-[#5A6472] bg-[#5A6472]/10';
  }
}
