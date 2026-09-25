/**
 * DashboardKpiCards — KPI summary cards for the Dashboards Hub
 * Values are computed from the filtered dataset. Trend direction
 * is derived by comparing the selected or latest year to the previous year.
 */
import {
  Database, AlertTriangle, FileText, MapPin,
  Building2, Shield, CloudRain, CheckCircle,
  TrendingUp, TrendingDown, Minus
} from "lucide-react";
import type { DashboardRecord, KPIDefinition } from "../../types/dashboard";

interface Props {
  kpis: KPIDefinition[];
  records: DashboardRecord[];
  selectedYear: string;
}

// ─────────────────────────────────────────────────
// Render the correct Lucide icon by name string
// ─────────────────────────────────────────────────
function KPIIcon({ name, className }: { name: string; className?: string }) {
  const cls = className ?? "h-5 w-5";
  switch (name) {
    case "Database": return <Database className={cls} />;
    case "AlertTriangle": return <AlertTriangle className={cls} />;
    case "FileText": return <FileText className={cls} />;
    case "MapPin": return <MapPin className={cls} />;
    case "Building2": return <Building2 className={cls} />;
    case "Shield": return <Shield className={cls} />;
    case "CloudRain": return <CloudRain className={cls} />;
    case "CheckCircle": return <CheckCircle className={cls} />;
    default: return <Database className={cls} />;
  }
}

// ─────────────────────────────────────────────────
// Compute average of a set of values
// ─────────────────────────────────────────────────
function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export default function DashboardKpiCards({ kpis, records, selectedYear }: Props) {
  const YEARS = [2022, 2023, 2024, 2025, 2026];

  const computeKPI = (kpi: KPIDefinition) => {
    // Filter records matching this indicator
    const matching = records.filter((r) => r.indicator === kpi.indicator);

    // Determine the "current" year
    const yearInt = selectedYear ? parseInt(selectedYear) : Math.max(...matching.map((r) => r.year), 2024);
    const currentRecords = matching.filter((r) => r.year === yearInt);
    const value = avg(currentRecords.map((r) => r.value));

    // Determine the "previous" year
    const prevYearIdx = YEARS.indexOf(yearInt) - 1;
    const prevYear = prevYearIdx >= 0 ? YEARS[prevYearIdx] : null;
    const prevRecords = prevYear ? matching.filter((r) => r.year === prevYear) : [];
    const prevValue = avg(prevRecords.map((r) => r.value));

    // Trend
    let trend: "up" | "down" | "neutral" = "neutral";
    if (prevValue > 0 && value !== prevValue) {
      trend = value > prevValue ? "up" : "down";
    }

    // Pick a unit from records
    const unit = currentRecords[0]?.unit ?? kpi.unit;

    return { value, trend, prevValue, unit, hasData: currentRecords.length > 0 };
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const { value, trend, prevValue, unit, hasData } = computeKPI(kpi);
        const isPositiveTrend =
          (kpi.higherIsBetter && trend === "up") ||
          (!kpi.higherIsBetter && trend === "down");
        const isNegativeTrend =
          (kpi.higherIsBetter && trend === "down") ||
          (!kpi.higherIsBetter && trend === "up");

        return (
          <div
            key={kpi.id}
            className="bg-white border border-[#E1E5EA] rounded-lg p-4 flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#0B3D91]/10 rounded-lg">
                <KPIIcon name={kpi.icon} className="h-5 w-5 text-[#0B3D91]" />
              </div>
              {/* Trend indicator */}
              {trend !== "neutral" && hasData && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${isPositiveTrend
                      ? "bg-[#138808]/10 text-[#138808]"
                      : isNegativeTrend
                        ? "bg-[#D64545]/10 text-[#D64545]"
                        : "bg-[#5A6472]/10 text-[#5A6472]"
                    }`}
                >
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  vs prev. yr
                </span>
              )}
              {trend === "neutral" && hasData && (
                <span className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full bg-[#5A6472]/10 text-[#5A6472]">
                  <Minus className="h-3 w-3" />
                  stable
                </span>
              )}
            </div>

            {/* Value */}
            <div>
              {hasData ? (
                <>
                  <p className="text-2xl font-bold text-[#1F2933]">
                    {value.toLocaleString()}
                    <span className="text-sm font-normal text-[#5A6472] ml-1">{unit}</span>
                  </p>
                  {prevValue > 0 && trend !== "neutral" && (
                    <p className="text-xs text-[#5A6472] mt-0.5">
                      Previous year: {prevValue.toLocaleString()} {unit}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-lg font-semibold text-[#5A6472]">—</p>
              )}
            </div>

            {/* Label */}
            <div>
              <p className="text-sm font-medium text-[#1F2933]">{kpi.title}</p>
              <p className="text-xs text-[#5A6472] mt-0.5 leading-relaxed">{kpi.description}</p>
            </div>

            {/* Prototype label */}
            <span className="text-xs text-[#E8A33D] font-medium">Prototype indicator</span>
          </div>
        );
      })}
    </div>
  );
}
