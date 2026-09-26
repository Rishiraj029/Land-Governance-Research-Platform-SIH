/**
 * DashboardKpiCards — KPI summary for the Dashboards Hub.
 * Every number is computed from the rows currently in view
 * (public.dashboard_indicators after filtering). Nothing is hardcoded.
 */
import { Building2, CalendarDays, FileText, Globe, Sigma } from "lucide-react";
import type { DashboardIndicator } from "../../types/dashboard";
import { averageValue, formatMeasure, hasMixedUnits, singleUnit } from "../../lib/supabaseDashboards";

interface Props {
  /** Rows matching the active filters. */
  records: DashboardIndicator[];
  /** Rows loaded from the database. */
  totalRecords: number;
}

interface KpiCard {
  id: string;
  label: string;
  value: string;
  /** Small unit/suffix shown next to the value. */
  suffix?: string;
  description: string;
  icon: typeof FileText;
  badge?: string;
}

function distinctCount(values: (string | null)[]): number {
  return new Set(values.filter((value): value is string => Boolean(value))).size;
}

export default function DashboardKpiCards({ records, totalRecords }: Props) {
  const years = records
    .map((record) => record.year)
    .filter((year): year is number => year !== null);
  const latestYear = years.length > 0 ? Math.max(...years) : null;

  const unitsAreMixed = hasMixedUnits(records);
  const unit = unitsAreMixed ? null : singleUnit(records);
  const mean = unitsAreMixed ? null : averageValue(records);
  const valuedRows = records.filter((record) => record.value !== null).length;

  const cards: KpiCard[] = [
    {
      id: "records",
      label: "Indicator records",
      value: records.length.toLocaleString(),
      description:
        totalRecords > 0 && records.length !== totalRecords
          ? `Matching filters, of ${totalRecords.toLocaleString()} loaded`
          : "Rows currently loaded from the database",
      icon: FileText,
      badge: "in view",
    },
    {
      id: "states",
      label: "States represented",
      value: distinctCount(records.map((record) => record.state)).toLocaleString(),
      description: "Distinct states among the records in view",
      icon: Globe,
    },
    {
      id: "districts",
      label: "Districts represented",
      value: distinctCount(records.map((record) => record.district)).toLocaleString(),
      description: "Distinct districts among the records in view",
      icon: Building2,
    },
    {
      id: "latest-year",
      label: "Latest year",
      value: latestYear === null ? "—" : String(latestYear),
      description:
        years.length === 0
          ? "No year recorded on the rows in view"
          : `Most recent year present${years.length > 1 ? ` (${Math.min(...years)}–${latestYear})` : ""}`,
      icon: CalendarDays,
    },
    {
      id: "average",
      label: "Average value",
      value: mean === null ? "—" : formatMeasure(mean),
      suffix: mean === null ? undefined : (unit ?? undefined),
      description:
        mean === null
          ? unitsAreMixed
            ? "Not shown: the rows in view use different units"
            : "No numeric values in view"
          : `Mean of ${valuedRows} numerical ${valuedRows === 1 ? "record" : "records"}`,
      icon: Sigma,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className="bg-white border border-[#E1E5EA] rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#0B3D91]/10 rounded-lg">
                <Icon className="h-5 w-5 text-[#0B3D91]" />
              </div>
              {card.badge && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5A6472] bg-[#F5F7FA] rounded px-1.5 py-0.5">
                  {card.badge}
                </span>
              )}
            </div>

            <div>
              <p className="text-2xl font-bold text-[#1F2933]">
                {card.value}
                {card.suffix && (
                  <span className="text-sm font-normal text-[#5A6472] ml-1">{card.suffix}</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#1F2933]">{card.label}</p>
              <p className="text-xs text-[#5A6472] mt-0.5 leading-relaxed">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
