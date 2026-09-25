/**
 * Mock indicator dataset for PAGE 8 — Dashboards Hub
 *
 * IMPORTANT: All values are ILLUSTRATIVE PROTOTYPE DATA for frontend demonstration only.
 * These are NOT official government statistics. They are designed to demonstrate
 * dashboard functionality. The production version will connect to validated datasets.
 *
 * States aligned with mockGISData.ts:
 * Rajasthan, Maharashtra, Gujarat, Karnataka, Uttar Pradesh,
 * Madhya Pradesh, Telangana, Odisha
 *
 * Years: 2022–2026 (prototype years, not historical measurements)
 */

import type { DashboardRecord, DashboardCategory, IndicatorName, DashboardDatasetInfo, KPIDefinition } from "../types/dashboard";

// ─────────────────────────────────────────────────
// Reference arrays
// ─────────────────────────────────────────────────
export const DASHBOARD_STATES = [
  "Rajasthan",
  "Maharashtra",
  "Gujarat",
  "Karnataka",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Telangana",
  "Odisha",
] as const;

export const DASHBOARD_YEARS = [2022, 2023, 2024, 2025, 2026] as const;

export const DASHBOARD_CATEGORIES: DashboardCategory[] = [
  "Land Governance Overview",
  "Land Use & Urbanization",
  "Tenure & Land Records",
  "Land Disputes",
  "Climate & Land",
  "Geospatial Governance",
];

// ─────────────────────────────────────────────────
// KPI card definitions per category
// ─────────────────────────────────────────────────
export const CATEGORY_KPI_MAP: Record<DashboardCategory, KPIDefinition[]> = {
  "Land Governance Overview": [
    { id: "digitization", title: "Land Records Digitization", indicator: "Land Records Digitization", unit: "%", description: "Proportion of land records in digital format", icon: "Database", higherIsBetter: true },
    { id: "disputes", title: "Active Land Dispute Cases", indicator: "Land Dispute Cases", unit: "cases/yr", description: "Annual land dispute cases filed", icon: "AlertTriangle", higherIsBetter: false },
    { id: "research", title: "Research Datasets", indicator: "Research Datasets", unit: "datasets", description: "Platform datasets available for analysis", icon: "FileText", higherIsBetter: true },
    { id: "districts", title: "Districts Covered", indicator: "Districts Covered", unit: "districts", description: "Administrative districts in platform scope", icon: "MapPin", higherIsBetter: true },
  ],
  "Land Use & Urbanization": [
    { id: "urban", title: "Urban Expansion Rate", indicator: "Urban Expansion Rate", unit: "sq km/yr", description: "Average annual urban land expansion", icon: "Building2", higherIsBetter: false },
    { id: "research", title: "Research Datasets", indicator: "Research Datasets", unit: "datasets", description: "Platform datasets available for analysis", icon: "FileText", higherIsBetter: true },
    { id: "districts", title: "Districts Covered", indicator: "Districts Covered", unit: "districts", description: "Administrative districts in platform scope", icon: "MapPin", higherIsBetter: true },
    { id: "digitization", title: "Land Records Digitization", indicator: "Land Records Digitization", unit: "%", description: "Proportion of land records in digital format", icon: "Database", higherIsBetter: true },
  ],
  "Tenure & Land Records": [
    { id: "digitization", title: "Land Records Digitization", indicator: "Land Records Digitization", unit: "%", description: "Proportion of land records in digital format", icon: "Database", higherIsBetter: true },
    { id: "tenure", title: "Tenure Security Index", indicator: "Tenure Security Index", unit: "index (0–100)", description: "Composite tenure security score", icon: "Shield", higherIsBetter: true },
    { id: "coverage", title: "Tenure Coverage", indicator: "Tenure Coverage", unit: "%", description: "Share of land parcels with documented tenure", icon: "CheckCircle", higherIsBetter: true },
    { id: "districts", title: "Districts Covered", indicator: "Districts Covered", unit: "districts", description: "Administrative districts in platform scope", icon: "MapPin", higherIsBetter: true },
  ],
  "Land Disputes": [
    { id: "disputes", title: "Active Land Dispute Cases", indicator: "Land Dispute Cases", unit: "cases/yr", description: "Annual land dispute cases filed", icon: "AlertTriangle", higherIsBetter: false },
    { id: "districts", title: "Districts Covered", indicator: "Districts Covered", unit: "districts", description: "Administrative districts in scope", icon: "MapPin", higherIsBetter: true },
    { id: "research", title: "Research Datasets", indicator: "Research Datasets", unit: "datasets", description: "Dispute-related datasets on platform", icon: "FileText", higherIsBetter: true },
    { id: "tenure", title: "Tenure Security Index", indicator: "Tenure Security Index", unit: "index (0–100)", description: "Tenure security (inversely related to disputes)", icon: "Shield", higherIsBetter: true },
  ],
  "Climate & Land": [
    { id: "climate", title: "Climate Risk Index", indicator: "Climate Risk Index", unit: "index (0–100)", description: "Composite climate vulnerability for land use", icon: "CloudRain", higherIsBetter: false },
    { id: "districts", title: "Districts Covered", indicator: "Districts Covered", unit: "districts", description: "Administrative districts in platform scope", icon: "MapPin", higherIsBetter: true },
    { id: "research", title: "Research Datasets", indicator: "Research Datasets", unit: "datasets", description: "Climate-land datasets on platform", icon: "FileText", higherIsBetter: true },
    { id: "urban", title: "Urban Expansion Rate", indicator: "Urban Expansion Rate", unit: "sq km/yr", description: "Urban expansion affecting natural land cover", icon: "Building2", higherIsBetter: false },
  ],
  "Geospatial Governance": [
    { id: "digitization", title: "Land Records Digitization", indicator: "Land Records Digitization", unit: "%", description: "Proportion of land records in digital format", icon: "Database", higherIsBetter: true },
    { id: "districts", title: "Districts Covered", indicator: "Districts Covered", unit: "districts", description: "Districts with geospatial coverage", icon: "MapPin", higherIsBetter: true },
    { id: "research", title: "Research Datasets", indicator: "Research Datasets", unit: "datasets", description: "Geospatial datasets on platform", icon: "FileText", higherIsBetter: true },
    { id: "tenure", title: "Tenure Security Index", indicator: "Tenure Security Index", unit: "index (0–100)", description: "Composite tenure security score", icon: "Shield", higherIsBetter: true },
  ],
};

// ─────────────────────────────────────────────────
// Prototype records
// ~54 records: 8 states × ~6 indicators × 5 years (sampled)
// Values are illustrative. Do not cite as official data.
// ─────────────────────────────────────────────────

// Helper to create an id
const rid = (state: string, year: number, indicator: string) =>
  `${state.slice(0, 3).toLowerCase()}-${year}-${indicator.slice(0, 6).toLowerCase().replace(/ /g, "")}`;

type RecordInput = {
  state: string;
  district: string;
  year: number;
  category: DashboardCategory;
  indicator: IndicatorName;
  value: number;
  unit: string;
};

const r = (input: RecordInput): DashboardRecord => ({
  id: rid(input.state, input.year, input.indicator),
  ...input,
});

export const DASHBOARD_RECORDS: DashboardRecord[] = [
  // ── Rajasthan ──────────────────────────────────
  r({ state: "Rajasthan", district: "Jaipur", year: 2022, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 71, unit: "%" }),
  r({ state: "Rajasthan", district: "Jaipur", year: 2023, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 75, unit: "%" }),
  r({ state: "Rajasthan", district: "Jaipur", year: 2024, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 79, unit: "%" }),
  r({ state: "Rajasthan", district: "Jaipur", year: 2025, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 83, unit: "%" }),
  r({ state: "Rajasthan", district: "Jaipur", year: 2026, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 86, unit: "%" }),
  r({ state: "Rajasthan", district: "Jaipur", year: 2024, category: "Land Disputes", indicator: "Land Dispute Cases", value: 127, unit: "cases/yr" }),
  r({ state: "Rajasthan", district: "Jodhpur", year: 2024, category: "Land Use & Urbanization", indicator: "Urban Expansion Rate", value: 34, unit: "sq km/yr" }),
  r({ state: "Rajasthan", district: "Udaipur", year: 2024, category: "Climate & Land", indicator: "Climate Risk Index", value: 68, unit: "index (0–100)" }),
  r({ state: "Rajasthan", district: "Jaipur", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Security Index", value: 72, unit: "index (0–100)" }),
  r({ state: "Rajasthan", district: "Jaipur", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Coverage", value: 66, unit: "%" }),
  r({ state: "Rajasthan", district: "Jaipur", year: 2024, category: "Geospatial Governance", indicator: "Research Datasets", value: 8, unit: "datasets" }),
  r({ state: "Rajasthan", district: "Jaipur", year: 2024, category: "Geospatial Governance", indicator: "Districts Covered", value: 12, unit: "districts" }),

  // ── Maharashtra ────────────────────────────────
  r({ state: "Maharashtra", district: "Mumbai", year: 2022, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 84, unit: "%" }),
  r({ state: "Maharashtra", district: "Mumbai", year: 2023, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 87, unit: "%" }),
  r({ state: "Maharashtra", district: "Mumbai", year: 2024, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 90, unit: "%" }),
  r({ state: "Maharashtra", district: "Mumbai", year: 2025, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 92, unit: "%" }),
  r({ state: "Maharashtra", district: "Mumbai", year: 2026, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 94, unit: "%" }),
  r({ state: "Maharashtra", district: "Pune", year: 2024, category: "Land Disputes", indicator: "Land Dispute Cases", value: 183, unit: "cases/yr" }),
  r({ state: "Maharashtra", district: "Pune", year: 2024, category: "Land Use & Urbanization", indicator: "Urban Expansion Rate", value: 23, unit: "sq km/yr" }),
  r({ state: "Maharashtra", district: "Nagpur", year: 2024, category: "Climate & Land", indicator: "Climate Risk Index", value: 55, unit: "index (0–100)" }),
  r({ state: "Maharashtra", district: "Mumbai", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Security Index", value: 81, unit: "index (0–100)" }),
  r({ state: "Maharashtra", district: "Mumbai", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Coverage", value: 77, unit: "%" }),
  r({ state: "Maharashtra", district: "Mumbai", year: 2024, category: "Geospatial Governance", indicator: "Research Datasets", value: 14, unit: "datasets" }),
  r({ state: "Maharashtra", district: "Mumbai", year: 2024, category: "Geospatial Governance", indicator: "Districts Covered", value: 18, unit: "districts" }),

  // ── Gujarat ────────────────────────────────────
  r({ state: "Gujarat", district: "Ahmedabad", year: 2022, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 78, unit: "%" }),
  r({ state: "Gujarat", district: "Ahmedabad", year: 2023, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 81, unit: "%" }),
  r({ state: "Gujarat", district: "Ahmedabad", year: 2024, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 85, unit: "%" }),
  r({ state: "Gujarat", district: "Ahmedabad", year: 2025, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 88, unit: "%" }),
  r({ state: "Gujarat", district: "Ahmedabad", year: 2026, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 91, unit: "%" }),
  r({ state: "Gujarat", district: "Surat", year: 2024, category: "Land Disputes", indicator: "Land Dispute Cases", value: 94, unit: "cases/yr" }),
  r({ state: "Gujarat", district: "Surat", year: 2024, category: "Land Use & Urbanization", indicator: "Urban Expansion Rate", value: 29, unit: "sq km/yr" }),
  r({ state: "Gujarat", district: "Ahmedabad", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Security Index", value: 79, unit: "index (0–100)" }),
  r({ state: "Gujarat", district: "Ahmedabad", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Coverage", value: 71, unit: "%" }),
  r({ state: "Gujarat", district: "Ahmedabad", year: 2024, category: "Geospatial Governance", indicator: "Research Datasets", value: 11, unit: "datasets" }),
  r({ state: "Gujarat", district: "Ahmedabad", year: 2024, category: "Geospatial Governance", indicator: "Districts Covered", value: 14, unit: "districts" }),

  // ── Karnataka ──────────────────────────────────
  r({ state: "Karnataka", district: "Bangalore", year: 2022, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 82, unit: "%" }),
  r({ state: "Karnataka", district: "Bangalore", year: 2023, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 85, unit: "%" }),
  r({ state: "Karnataka", district: "Bangalore", year: 2024, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 88, unit: "%" }),
  r({ state: "Karnataka", district: "Bangalore", year: 2025, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 90, unit: "%" }),
  r({ state: "Karnataka", district: "Bangalore", year: 2026, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 93, unit: "%" }),
  r({ state: "Karnataka", district: "Bangalore", year: 2024, category: "Land Disputes", indicator: "Land Dispute Cases", value: 112, unit: "cases/yr" }),
  r({ state: "Karnataka", district: "Bangalore", year: 2024, category: "Land Use & Urbanization", indicator: "Urban Expansion Rate", value: 31, unit: "sq km/yr" }),
  r({ state: "Karnataka", district: "Mysore", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Security Index", value: 84, unit: "index (0–100)" }),
  r({ state: "Karnataka", district: "Mysore", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Coverage", value: 78, unit: "%" }),
  r({ state: "Karnataka", district: "Bangalore", year: 2024, category: "Geospatial Governance", indicator: "Research Datasets", value: 13, unit: "datasets" }),
  r({ state: "Karnataka", district: "Bangalore", year: 2024, category: "Geospatial Governance", indicator: "Districts Covered", value: 15, unit: "districts" }),

  // ── Uttar Pradesh ─────────────────────────────
  r({ state: "Uttar Pradesh", district: "Lucknow", year: 2022, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 58, unit: "%" }),
  r({ state: "Uttar Pradesh", district: "Lucknow", year: 2023, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 63, unit: "%" }),
  r({ state: "Uttar Pradesh", district: "Lucknow", year: 2024, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 68, unit: "%" }),
  r({ state: "Uttar Pradesh", district: "Lucknow", year: 2025, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 73, unit: "%" }),
  r({ state: "Uttar Pradesh", district: "Lucknow", year: 2026, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 78, unit: "%" }),
  r({ state: "Uttar Pradesh", district: "Lucknow", year: 2024, category: "Land Disputes", indicator: "Land Dispute Cases", value: 245, unit: "cases/yr" }),
  r({ state: "Uttar Pradesh", district: "Kanpur", year: 2024, category: "Climate & Land", indicator: "Climate Risk Index", value: 58, unit: "index (0–100)" }),
  r({ state: "Uttar Pradesh", district: "Lucknow", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Security Index", value: 61, unit: "index (0–100)" }),
  r({ state: "Uttar Pradesh", district: "Lucknow", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Coverage", value: 54, unit: "%" }),
  r({ state: "Uttar Pradesh", district: "Lucknow", year: 2024, category: "Geospatial Governance", indicator: "Research Datasets", value: 9, unit: "datasets" }),
  r({ state: "Uttar Pradesh", district: "Lucknow", year: 2024, category: "Geospatial Governance", indicator: "Districts Covered", value: 20, unit: "districts" }),

  // ── Madhya Pradesh ────────────────────────────
  r({ state: "Madhya Pradesh", district: "Bhopal", year: 2022, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 64, unit: "%" }),
  r({ state: "Madhya Pradesh", district: "Bhopal", year: 2023, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 69, unit: "%" }),
  r({ state: "Madhya Pradesh", district: "Bhopal", year: 2024, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 74, unit: "%" }),
  r({ state: "Madhya Pradesh", district: "Bhopal", year: 2025, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 79, unit: "%" }),
  r({ state: "Madhya Pradesh", district: "Bhopal", year: 2026, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 83, unit: "%" }),
  r({ state: "Madhya Pradesh", district: "Indore", year: 2024, category: "Land Disputes", indicator: "Land Dispute Cases", value: 136, unit: "cases/yr" }),
  r({ state: "Madhya Pradesh", district: "Indore", year: 2024, category: "Land Use & Urbanization", indicator: "Urban Expansion Rate", value: 26, unit: "sq km/yr" }),
  r({ state: "Madhya Pradesh", district: "Bhopal", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Security Index", value: 69, unit: "index (0–100)" }),
  r({ state: "Madhya Pradesh", district: "Bhopal", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Coverage", value: 61, unit: "%" }),
  r({ state: "Madhya Pradesh", district: "Bhopal", year: 2024, category: "Geospatial Governance", indicator: "Research Datasets", value: 7, unit: "datasets" }),
  r({ state: "Madhya Pradesh", district: "Bhopal", year: 2024, category: "Geospatial Governance", indicator: "Districts Covered", value: 13, unit: "districts" }),

  // ── Telangana ─────────────────────────────────
  r({ state: "Telangana", district: "Hyderabad", year: 2022, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 79, unit: "%" }),
  r({ state: "Telangana", district: "Hyderabad", year: 2023, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 82, unit: "%" }),
  r({ state: "Telangana", district: "Hyderabad", year: 2024, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 86, unit: "%" }),
  r({ state: "Telangana", district: "Hyderabad", year: 2025, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 89, unit: "%" }),
  r({ state: "Telangana", district: "Hyderabad", year: 2026, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 92, unit: "%" }),
  r({ state: "Telangana", district: "Warangal", year: 2024, category: "Land Disputes", indicator: "Land Dispute Cases", value: 98, unit: "cases/yr" }),
  r({ state: "Telangana", district: "Hyderabad", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Security Index", value: 82, unit: "index (0–100)" }),
  r({ state: "Telangana", district: "Hyderabad", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Coverage", value: 75, unit: "%" }),
  r({ state: "Telangana", district: "Hyderabad", year: 2024, category: "Geospatial Governance", indicator: "Research Datasets", value: 10, unit: "datasets" }),
  r({ state: "Telangana", district: "Hyderabad", year: 2024, category: "Geospatial Governance", indicator: "Districts Covered", value: 11, unit: "districts" }),

  // ── Odisha ────────────────────────────────────
  r({ state: "Odisha", district: "Khordha", year: 2022, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 56, unit: "%" }),
  r({ state: "Odisha", district: "Khordha", year: 2023, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 61, unit: "%" }),
  r({ state: "Odisha", district: "Khordha", year: 2024, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 67, unit: "%" }),
  r({ state: "Odisha", district: "Khordha", year: 2025, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 72, unit: "%" }),
  r({ state: "Odisha", district: "Khordha", year: 2026, category: "Land Governance Overview", indicator: "Land Records Digitization", value: 77, unit: "%" }),
  r({ state: "Odisha", district: "Khordha", year: 2024, category: "Land Disputes", indicator: "Land Dispute Cases", value: 87, unit: "cases/yr" }),
  r({ state: "Odisha", district: "Khordha", year: 2024, category: "Land Use & Urbanization", indicator: "Urban Expansion Rate", value: 22, unit: "sq km/yr" }),
  r({ state: "Odisha", district: "Khordha", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Security Index", value: 63, unit: "index (0–100)" }),
  r({ state: "Odisha", district: "Khordha", year: 2024, category: "Tenure & Land Records", indicator: "Tenure Coverage", value: 57, unit: "%" }),
  r({ state: "Odisha", district: "Khordha", year: 2024, category: "Geospatial Governance", indicator: "Research Datasets", value: 6, unit: "datasets" }),
  r({ state: "Odisha", district: "Khordha", year: 2024, category: "Geospatial Governance", indicator: "Districts Covered", value: 9, unit: "districts" }),
];

// ─────────────────────────────────────────────────
// Dataset metadata
// ─────────────────────────────────────────────────
export const DASHBOARD_DATASET_INFO: DashboardDatasetInfo = {
  name: "Land Governance Dashboard Prototype Dataset",
  description:
    "Illustrative indicator dataset for demonstrating dashboard functionality. Contains representative indicator values across 8 states and 5 prototype years. Not official government statistics.",
  recordCount: DASHBOARD_RECORDS.length,
  statesCovered: DASHBOARD_STATES.length,
  yearRange: "2022–2026",
  lastUpdated: "2026-09-24",
  source: "Prototype dataset for demonstration",
};

// ─────────────────────────────────────────────────
// Trend chart indicators (available for selection)
// ─────────────────────────────────────────────────
export const TREND_INDICATORS: IndicatorName[] = [
  "Land Records Digitization",
  "Land Dispute Cases",
  "Urban Expansion Rate",
  "Tenure Security Index",
  "Climate Risk Index",
];

// ─────────────────────────────────────────────────
// Color mapping per category (for charts)
// ─────────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  "Land Governance Overview": "#0B3D91",
  "Land Use & Urbanization": "#FF9933",
  "Tenure & Land Records": "#138808",
  "Land Disputes": "#D64545",
  "Climate & Land": "#E8A33D",
  "Geospatial Governance": "#8B5CF6",
};

// ─────────────────────────────────────────────────
// Chart colors for states (bar chart)
// ─────────────────────────────────────────────────
export const STATE_COLORS: Record<string, string> = {
  Rajasthan: "#0B3D91",
  Maharashtra: "#138808",
  Gujarat: "#FF9933",
  Karnataka: "#D64545",
  "Uttar Pradesh": "#E8A33D",
  "Madhya Pradesh": "#8B5CF6",
  Telangana: "#0891B2",
  Odisha: "#BE185D",
};
