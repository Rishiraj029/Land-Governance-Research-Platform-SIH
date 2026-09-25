/**
 * TrendChart — line/area chart showing indicator trends over time.
 * Responds to state and year filters from the parent Dashboards page.
 */
import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DashboardRecord } from "../../types/dashboard";
import type { IndicatorName } from "../../types/dashboard";
import { TREND_INDICATORS, DASHBOARD_STATES, STATE_COLORS } from "../../lib/mockDashboardIndicators";

interface Props {
  records: DashboardRecord[];
  filterState: string;
  filterYear: string;
}

interface ChartRow {
  year: number;
  [state: string]: number;
}

export default function TrendChart({ records, filterState, filterYear }: Props) {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorName>("Land Records Digitization");

  // When a specific state is selected, show only that one; otherwise show all 8
  const statesToShow = filterState ? [filterState] : DASHBOARD_STATES.slice();

  // Build chart data: one row per year, one column per state
  const chartData = useMemo<ChartRow[]>(() => {
    const indicatorRecords = records.filter((r) => r.indicator === selectedIndicator);

    // Collect all years present
    const years = [...new Set(indicatorRecords.map((r) => r.year))].sort((a, b) => a - b);

    return years.map((year) => {
      const row: ChartRow = { year };
      statesToShow.forEach((state) => {
        const stateYearRecords = indicatorRecords.filter(
          (r) => r.state === state && r.year === year
        );
        if (stateYearRecords.length > 0) {
          const sum = stateYearRecords.reduce((a, b) => a + b.value, 0);
          row[state] = Math.round(sum / stateYearRecords.length);
        }
      });
      return row;
    });
  }, [records, selectedIndicator, filterState, statesToShow]);

  // Pick unit from data
  const unit = records.find((r) => r.indicator === selectedIndicator)?.unit ?? "";

  const hasData = chartData.length > 0 && chartData.some((row) =>
    statesToShow.some((s) => row[s] !== undefined)
  );

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#1F2933]">Indicator Trends</h3>
          <p className="text-xs text-[#5A6472]">
            Year-over-year indicator progression
            {filterYear ? ` — Year filter: all years shown for context` : ""}
          </p>
        </div>
        <div>
          <label htmlFor="trend-indicator" className="sr-only">Select indicator</label>
          <select
            id="trend-indicator"
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value as IndicatorName)}
            className="rounded-md border border-[#E1E5EA] bg-white px-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
          >
            {TREND_INDICATORS.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E5EA" />
            <XAxis
              dataKey="year"
              tick={{ fill: "#5A6472", fontSize: 12 }}
              axisLine={{ stroke: "#E1E5EA" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#5A6472", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}`}
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
              formatter={(value: any) => [`${value} ${unit}`, ""]}
            />
            {statesToShow.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: "#5A6472" }} />}
            {statesToShow.map((state) => (
              <Line
                key={state}
                type="monotone"
                dataKey={state}
                stroke={STATE_COLORS[state] ?? "#0B3D91"}
                strokeWidth={2}
                dot={{ r: 3, fill: STATE_COLORS[state] ?? "#0B3D91" }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-48 text-[#5A6472] text-sm">
          No trend data for current filters.
        </div>
      )}

      <p className="text-xs text-[#5A6472] mt-2">
        Prototype data · Values are illustrative and not official government statistics.
      </p>
    </div>
  );
}
