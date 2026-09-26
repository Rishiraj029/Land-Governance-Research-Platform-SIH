/**
 * TrendChart — year-over-year trend for one indicator, taken from the rows in view.
 * The indicator list, states, years and unit all come from the data, never from
 * a hardcoded reference list.
 */
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { DashboardIndicator } from "../../types/dashboard";
import {
  defaultIndicator,
  hasMixedUnits,
  listIndicators,
  listStates,
  paletteColor,
  singleUnit,
} from "../../lib/supabaseDashboards";

interface Props {
  /** Rows matching the active filters. */
  records: DashboardIndicator[];
}

type ChartRow = { year: number } & Record<string, number>;

/** More than this many states makes a line chart unreadable, so we aggregate. */
const MAX_SERIES = 6;

export default function TrendChart({ records }: Props) {
  const indicators = useMemo(() => listIndicators(records), [records]);
  const fallbackIndicator = useMemo(() => defaultIndicator(records), [records]);
  const [requested, setRequested] = useState<string>("");

  // Derive the selection instead of syncing it with an effect, so a filter change
  // that removes the selected indicator can never leave the chart blank.
  const activeIndicator = indicators.includes(requested)
    ? requested
    : (fallbackIndicator || (indicators[0] ?? ""));

  const indicatorRows = useMemo(
    () => records.filter((record) => record.indicatorName === activeIndicator),
    [records, activeIndicator],
  );

  const states = useMemo(() => listStates(indicatorRows), [indicatorRows]);
  const aggregate = states.length > MAX_SERIES;
  const unitsAreMixed = hasMixedUnits(indicatorRows);
  const unit = unitsAreMixed ? null : singleUnit(indicatorRows);

  const chartData = useMemo<ChartRow[]>(() => {
    const years = [
      ...new Set(
        indicatorRows.map((row) => row.year).filter((year): year is number => year !== null),
      ),
    ].sort((a, b) => a - b);

    return years.map((year) => {
      const row: ChartRow = { year };
      const yearRows = indicatorRows.filter((item) => item.year === year);

      if (aggregate) {
        const values = yearRows
          .map((item) => item.value)
          .filter((value): value is number => value !== null);
        if (values.length > 0) {
          row["All states (mean)"] = Number(
            (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2),
          );
        }
        return row;
      }

      for (const state of states) {
        const values = yearRows
          .filter((item) => item.state === state)
          .map((item) => item.value)
          .filter((value): value is number => value !== null);
        if (values.length > 0) {
          row[state] = Number(
            (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2),
          );
        }
      }
      return row;
    });
  }, [indicatorRows, states, aggregate]);

  const series = aggregate ? ["All states (mean)"] : states;
  const hasData =
    chartData.length > 0 &&
    series.some((name) => chartData.some((row) => row[name] !== undefined));

  if (indicators.length === 0) {
    return (
      <ChartShell>
        <div className="flex items-center justify-center h-48 text-[#5A6472] text-sm">
          No indicators in the current selection.
        </div>
      </ChartShell>
    );
  }

  return (
    <ChartShell
      selector={
        <select
          id="trend-indicator"
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
          <TrendingUp className="h-8 w-8 text-[#E1E5EA] mb-3" />
          <p className="text-sm text-[#5A6472]">
            This indicator reports values in more than one unit, so a single trend line
            would not be comparable. Narrow the filters to one unit to see the trend.
          </p>
        </div>
      ) : hasData ? (
        <>
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
                tickFormatter={(value: number) => `${value}`}
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
                formatter={(value) => [`${value}${unit ? ` ${unit}` : ""}`, ""]}
              />
              {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: "#5A6472" }} />}
              {series.map((name) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={paletteColor(name)}
                  strokeWidth={2}
                  dot={{ r: 3, fill: paletteColor(name) }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          {chartData.length === 1 && (
            <p className="text-xs text-[#5A6472] mt-2">
              Only one year is present for this indicator in the current selection, so no
              multi-year trend can be drawn.
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-48 text-[#5A6472] text-sm">
          No trend data for the current filters.
        </div>
      )}
    </ChartShell>
  );
}

/** Shared card frame so loading/empty/chart states keep the same chrome. */
function ChartShell({
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
          <h3 className="text-base font-semibold text-[#1F2933]">Indicator Trends</h3>
          <p className="text-xs text-[#5A6472]">
            Mean value per year for the selected indicator
          </p>
        </div>
        {selector && (
          <div>
            <label htmlFor="trend-indicator" className="sr-only">
              Select indicator
            </label>
            {selector}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
