/**
 * DashboardInfo — "About this dashboard" section explaining prototype nature.
 */
import { Info, AlertCircle, Database } from "lucide-react";
import type { DashboardDatasetInfo } from "../../types/dashboard";

interface Props {
  info: DashboardDatasetInfo;
}

export default function DashboardInfo({ info }: Props) {
  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-[#0B3D91]" />
        <h3 className="text-base font-semibold text-[#1F2933]">About this Dashboard</h3>
      </div>

      {/* Prototype notice */}
      <div className="flex items-start gap-3 p-3 bg-[#E8A33D]/10 rounded-lg border border-[#E8A33D]/30">
        <AlertCircle className="h-4 w-4 text-[#E8A33D] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[#1F2933]">Prototype Dashboard Data</p>
          <p className="text-[#5A6472] mt-1">
            This dashboard uses illustrative data to demonstrate platform functionality.
            Values shown are not official government statistics and should not be cited
            for research or policy purposes.
          </p>
        </div>
      </div>

      {/* About bullets */}
      <ul className="space-y-2 text-sm text-[#5A6472]">
        <li className="flex items-start gap-2">
          <span className="text-[#0B3D91] font-bold mt-0.5">→</span>
          The production version will connect to validated datasets from government departments and research institutions.
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#0B3D91] font-bold mt-0.5">→</span>
          Indicator definitions will be provided with real data, including confidence intervals and data lineage.
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#0B3D91] font-bold mt-0.5">→</span>
          Filters and charts are fully functional using the prototype dataset.
        </li>
      </ul>

      {/* Dataset metadata */}
      <div className="border-t border-[#E1E5EA] pt-3 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4 text-[#0B3D91]" />
          <span className="text-sm font-medium text-[#1F2933]">Data Source</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-[#5A6472]">
          <div>
            <p className="font-medium text-[#1F2933]">Dataset</p>
            <p>{info.name}</p>
          </div>
          <div>
            <p className="font-medium text-[#1F2933]">Year Range</p>
            <p>{info.yearRange} (prototype years)</p>
          </div>
          <div>
            <p className="font-medium text-[#1F2933]">States Covered</p>
            <p>{info.statesCovered} states</p>
          </div>
          <div>
            <p className="font-medium text-[#1F2933]">Records</p>
            <p>{info.recordCount} indicator records</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-[#5A6472]">Source: {info.source}</span>
          <span className="text-[#5A6472]">Prototype data last updated: {info.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
