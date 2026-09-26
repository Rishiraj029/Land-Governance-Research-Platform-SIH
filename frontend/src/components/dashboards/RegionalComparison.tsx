/**
 * RegionalComparison — compares states on one indicator from the rows in view.
 * State names and the metric list are read from the data; nothing is hardcoded.
 */
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { DashboardIndicator } from "../../types/dashboard";
import {
  defaultIndicator,
  hasMixedUnits,
  listIndicators,
  meanValueByState,
  paletteColor,
  singleUnit,
} from "../../lib/supabaseDashboards";

interface Props {
  /** Rows matching the active filters. */
  records: DashboardIndicator[];
}

export default function RegionalComparison({ records }: Props) {
  const indicators = useMemo(() => listIndicators(records), [records]);
  const fallbackIndicator = useMemo(() => defaultIndicator(records), [records]);
  const [requested, setRequested] = useState<string>("");
  const activeIndicator = indicators.includes(requested)
    ? requested
    : (fallbackIndicator || (indicators[0] ?? ""));

  const indicatorRows = useMemo(
    () => records.filter((record) => record.indicatorName === activeIndicator),
    [records, activeIndicator],
  );

  const unitsAreMixed = hasMixedUnits(indicatorRows);
  const unit = unitsAreMixed ? null : singleUnit(indicatorRows);
  const chartData = useMemo(() => meanValueByState(indicatorRows), [indicatorRows]);

  if (indicators.length === 0) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-48 text-[#5A6472] text-sm">
          No indicators in the current selection.
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      selector={
        <select
          id="regional-metric"
          value={activeIndicator}
          onChange={(event) => setRequested(event.target.value)}
          className="rounded-md border border-[#E1E5EA] bg-white px-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
        >
          {indicators.map((indicator) => (
            <option key={indicator} value={indicator}>
              {indicator}
            </option>
          ))}
        </select>
      }
    >
      {unitsAreMixed ? (
        <div className="flex flex-col items-center justify-center h-48 text-center px-6">
          <BarChart3 className="h-8 w-8 text-[#E1E5EA] mb-3" />
          <p className="text-sm text-[#5A6472]">
            This indicator uses more than one unit, so states cannot be compared on a single
            scale. Narrow the filters to one unit first.
          </p>
        </div>
      ) : chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E5EA" vertical={false} />
              <XAxis
                dataKey="state"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={72}
                tick={{ fill: "#5A6472", fontSize: 11 }}
                axisLine={{ stroke: "#E1E5EA" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#5A6472", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: unit ?? "value",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#5A6472", fontSize: 11 },
                  offset: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E1E5EA",
                  fontSize: 12,
                  color: "#1F2933",
                }}
                formatter={(value) => [`${value}${unit ? ` ${unit}` : ""}`, activeIndicator]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.state} fill={paletteColor(entry.state)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-[#5A6472] mt-2">
            Mean value per state, highest first — {chartData.length}{" "}
            {chartData.length === 1 ? "state" : "states"} in the current selection.
          </p>
        </>
      ) : (
        <div className="flex items-center justify-center h-48 text-[#5A6472] text-sm">
          No comparison data for the current filters.
        </div>
      )}
    </Shell>
  );
}

function Shell({
  children,
  selector,
}: {
  children: React.ReactNode;
  selector?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#1F2933]">State Comparison</h3>
          <p className="text-xs text-[#5A6472]">Compare states on a single indicator</p>
        </div>
        {selector && (
          <div>
            <label htmlFor="regional-metric" className="sr-only">
              Select metric
            </label>
            {selector}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
