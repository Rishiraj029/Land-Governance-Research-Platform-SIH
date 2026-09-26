/**
 * IndicatorDetailPanel — full detail for one public.dashboard_indicators row.
 * Shows exactly the stored fields; missing values render as "—" rather than
 * placeholder text.
 */
import { useEffect } from "react";
import { AlertCircle, Database, X } from "lucide-react";
import type { DashboardIndicator } from "../../types/dashboard";
import { formatMeasure } from "../../lib/supabaseDashboards";

interface Props {
  indicator: DashboardIndicator;
  /** True when the loaded dataset describes itself as illustrative/demo data. */
  illustrative: boolean;
  onClose: () => void;
}

function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export default function IndicatorDetailPanel({ indicator, illustrative, onClose }: Props) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const rows: { label: string; value: string }[] = [
    { label: "Value", value: formatMeasure(indicator.value) },
    { label: "Unit", value: indicator.unit ?? "—" },
    { label: "Year", value: indicator.year === null ? "—" : String(indicator.year) },
    { label: "State", value: indicator.state ?? "—" },
    { label: "District", value: indicator.district ?? "—" },
    { label: "Category", value: indicator.category ?? "—" },
    { label: "Source", value: indicator.source ?? "—" },
    { label: "Record ID", value: indicator.id },
    { label: "Created at", value: formatTimestamp(indicator.createdAt) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1F2933]/50 p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="indicator-detail-title"
        className="bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-lg sm:rounded-lg border border-[#E1E5EA] shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-[#E1E5EA]">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-[#5A6472] mb-1">
              {indicator.category ?? "Uncategorised"}
            </p>
            <h2
              id="indicator-detail-title"
              className="text-lg font-semibold font-poppins text-[#1F2933] break-words"
            >
              {indicator.indicatorName || "Untitled indicator"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#5A6472] hover:text-[#1F2933] hover:bg-[#F5F7FA] transition-colors flex-shrink-0"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Headline value */}
        <div className="p-4 bg-[#F5F7FA] border-b border-[#E1E5EA]">
          <p className="text-3xl font-bold text-[#1F2933]">
            {formatMeasure(indicator.value)}
            {indicator.unit && (
              <span className="text-base font-normal text-[#5A6472] ml-2">{indicator.unit}</span>
            )}
          </p>
          <p className="text-xs text-[#5A6472] mt-1">
            {indicator.year === null ? "Year not recorded" : `Year ${indicator.year}`}
            {indicator.state ? ` · ${indicator.state}` : ""}
            {indicator.district ? ` · ${indicator.district}` : ""}
          </p>
        </div>

        {/* Fields */}
        <dl className="p-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className={row.label === "Record ID" ? "col-span-2" : undefined}>
              <dt className="text-xs text-[#5A6472] mb-0.5">{row.label}</dt>
              <dd className="text-[#1F2933] break-words">{row.value}</dd>
            </div>
          ))}
          <div className="col-span-2">
            <dt className="text-xs text-[#5A6472] mb-0.5">Description</dt>
            <dd className="text-[#1F2933] leading-relaxed">
              {indicator.description ?? "No description recorded for this row."}
            </dd>
          </div>
        </dl>

        {/* Trust footer */}
        <div className="px-4 pb-4 space-y-2">
          <div className="flex items-start gap-2 text-xs text-[#5A6472] bg-[#F5F7FA] rounded-md p-3">
            <Database className="h-4 w-4 text-[#0B3D91] flex-shrink-0 mt-0.5" />
            <span>
              Read from public.dashboard_indicators. Cite the source and year above, not this
              platform.
            </span>
          </div>
          {illustrative && (
            <div className="flex items-start gap-2 text-xs bg-[#E8A33D]/10 border border-[#E8A33D]/30 rounded-md p-3">
              <AlertCircle className="h-4 w-4 text-[#E8A33D] flex-shrink-0 mt-0.5" />
              <span className="text-[#5A6472]">
                This row belongs to a dataset that describes itself as illustrative/demo data.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
