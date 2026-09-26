/**
 * DashboardInfo — dataset provenance for the Dashboards Hub.
 *
 * The records in public.dashboard_indicators describe themselves as illustrative
 * MVP data, so that is stated plainly here instead of presenting the values as
 * official statistics.
 */
import { AlertCircle, Database, Info, ShieldCheck } from "lucide-react";
import type { DashboardDatasetMeta } from "../../types/dashboard";

interface Props {
  meta: DashboardDatasetMeta;
}

function formatTimestamp(value: string | null): string {
  if (!value) return "not recorded";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function DashboardInfo({ meta }: Props) {
  const sources = meta.sources;
  const shownSources = sources.slice(0, 3);
  const extraSources = sources.length - shownSources.length;

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-[#0B3D91]" />
        <h3 className="text-base font-semibold text-[#1F2933]">About this Dashboard</h3>
      </div>

      {meta.illustrative ? (
        <div className="flex items-start gap-3 p-3 bg-[#E8A33D]/10 rounded-lg border border-[#E8A33D]/30">
          <AlertCircle className="h-4 w-4 text-[#E8A33D] flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-[#1F2933]">Illustrative dataset</p>
            <p className="text-[#5A6472] mt-1">
              The records in this dataset describe themselves as illustrative/demo data
              {meta.illustrativeEvidence.length > 0 && (
                <>
                  {" "}
                  (“{meta.illustrativeEvidence.join('”, “')}”)
                </>
              )}
              . Values are for platform demonstration and must not be cited as official
              government statistics.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-3 bg-[#0B3D91]/5 rounded-lg border border-[#0B3D91]/20">
          <ShieldCheck className="h-4 w-4 text-[#0B3D91] flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-[#1F2933]">Values read live from the database</p>
            <p className="text-[#5A6472] mt-1">
              Each record keeps its own <span className="font-medium">source</span> and{" "}
              <span className="font-medium">year</span>. Check the source before citing any
              figure.
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-[#E1E5EA] pt-3 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[#0B3D91]" />
          <span className="text-sm font-medium text-[#1F2933]">Data Source</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-[#5A6472]">
          <div>
            <p className="font-medium text-[#1F2933]">Dataset</p>
            <p>Supabase · public.dashboard_indicators</p>
          </div>
          <div>
            <p className="font-medium text-[#1F2933]">Records loaded</p>
            <p>{meta.recordCount} indicator records</p>
          </div>
          <div>
            <p className="font-medium text-[#1F2933]">Year range</p>
            <p>{meta.yearRange}</p>
          </div>
          <div>
            <p className="font-medium text-[#1F2933]">Coverage</p>
            <p>
              {meta.statesCovered} states · {meta.districtsCovered} districts
            </p>
          </div>
          <div>
            <p className="font-medium text-[#1F2933]">Indicator types</p>
            <p>
              {meta.indicatorTypes} across {meta.categoriesCovered} categories
            </p>
          </div>
          <div>
            <p className="font-medium text-[#1F2933]">Units in use</p>
            <p>{meta.units.length > 0 ? meta.units.join(", ") : "not recorded"}</p>
          </div>
        </div>

        <div className="text-xs text-[#5A6472] space-y-1">
          <p className="font-medium text-[#1F2933]">Recorded source(s)</p>
          {shownSources.length > 0 ? (
            <p>
              {shownSources.join(" · ")}
              {extraSources > 0 && ` · +${extraSources} more`}
            </p>
          ) : (
            <p>No source value recorded on the loaded rows.</p>
          )}
        </div>

        {(meta.rowsMissingValue > 0 || meta.rowsMissingIndicatorName > 0) && (
          <div className="text-xs text-[#5A6472] border-t border-[#E1E5EA] pt-2">
            <p className="font-medium text-[#1F2933]">Data quality notes</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {meta.rowsMissingValue > 0 && (
                <li>{meta.rowsMissingValue} rows have no usable numeric value</li>
              )}
              {meta.rowsMissingIndicatorName > 0 && (
                <li>{meta.rowsMissingIndicatorName} rows have no indicator name</li>
              )}
            </ul>
          </div>
        )}

        <p className="text-xs text-[#5A6472]">Records last written: {formatTimestamp(meta.lastUpdated)}</p>
      </div>
    </div>
  );
}
