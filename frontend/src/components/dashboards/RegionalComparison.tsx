/**
 * RegionalComparison — bar chart comparing states on a selected metric.
 */
import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import type { DashboardRecord } from "../../types/dashboard";
import type { IndicatorName } from "../../types/dashboard";
import { STATE_COLORS } from "../../lib/mockDashboardIndicators";

const METRICS: IndicatorName[] = [
  "Land Records Digitization",
  "Land Dispute Cases",
  "Urban Expansion Rate",
  "Tenure Security Index",
  "Climate Risk Index",
];

interface Props {
  records: DashboardRecord[];
  filterState: string;
  filterYear: string;
}

interface ChartRow {
  state: string;
  shortName: string;
  value: number;
}

const SHORT_NAMES: Record<string, string> = {
  "Rajasthan": "RJ",
  "Maharashtra": "MH",
  "Gujarat": "GJ",
  "Karnataka": "KA",
  "Uttar Pradesh": "UP",
  "Madhya Pradesh": "MP",
  "Telangana": "TG",
  "Odisha": "OD",
};

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export default function RegionalComparison({ records, filterState, filterYear }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<IndicatorName>("Land Records Digitization");

  const chartData = useMemo<ChartRow[]>(() => {
    const metricRecords = records.filter((r) => r.indicator === selectedMetric);

    // When a single state is set, show just that state highlighted
    const states = filterState
      ? [filterState]
      : [...new Set(metricRecords.map((r) => r.state))].sort();

    return states.map((state) => {
      const stateRecords = metricRecords.filter((r) => r.state === state);
      const yearFiltered = filterYear
        ? stateRecords.filter((r) => r.year === parseInt(filterYear))
        : stateRecords;
      const value = avg((yearFiltered.length > 0 ? yearFiltered : stateRecords).map((r) => r.value));
      return { state, shortName: SHORT_NAMES[state] ?? state.slice(0, 2), value };
    });
  }, [records, selectedMetric, filterState, filterYear]);

  const unit = records.find((r) => r.indicator === selectedMetric)?.unit ?? "";
  const hasData = chartData.some((d) => d.value > 0);

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#1F2933]">Regional Comparison</h3>
          <p className="text-xs text-[#5A6472]">
            {filterState
              ? `Showing ${filterState} — select a metric to compare`
              : "Compare states by indicator"}
          </p>
        </div>
        <div>
          <label htmlFor="regional-metric" className="sr-only">Select metric</label>
          <select
            id="regional-metric"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as IndicatorName)}
            className="rounded-md border border-[#E1E5EA] bg-white px-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
          >
            {METRICS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E5EA" vertical={false} />
            <XAxis
              dataKey="shortName"
              tick={{ fill: "#5A6472", fontSize: 12 }}
              axisLine={{ stroke: "#E1E5EA" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#5A6472", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: unit,
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
              formatter={(value: any) => [`${value} ${unit}`, selectedMetric]}
              labelFormatter={(label: any) => {
                const full = chartData.find((d) => d.shortName === String(label))?.state ?? label;
                return full;
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.state}
                  fill={
                    filterState && entry.state === filterState
                      ? "#0B3D91"
                      : (STATE_COLORS[entry.state] ?? "#0B3D91")
                  }
                  fillOpacity={filterState && entry.state !== filterState ? 0.5 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-48 text-[#5A6472] text-sm">
          No comparison data for current filters.
        </div>
      )}

      <p className="text-xs text-[#5A6472] mt-2">
        Prototype data · Values are illustrative and not official government statistics.
      </p>
    </div>
  );
}
