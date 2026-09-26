/**
 * Filter-responsive record-count distributions for category, indicator, and state.
 * Values are counts of rows in view; unlike units are never summed together.
 */
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardIndicator } from "../../types/dashboard";
import { paletteColor } from "../../lib/supabaseDashboards";

interface Props {
  /** Rows matching the active Dashboard filters. */
  records: DashboardIndicator[];
}

interface DistributionSlice {
  name: string;
  value: number;
  color: string;
}

const UNKNOWN_CATEGORY = "Uncategorised";
const UNKNOWN_INDICATOR = "Unnamed indicator";
const UNKNOWN_STATE = "Unknown state";
const MAX_STATE_SLICES = 5;

function countBy(
  records: DashboardIndicator[],
  getName: (record: DashboardIndicator) => string,
): DistributionSlice[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const name = getName(record);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value, color: paletteColor(name) }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

function groupStateSlices(slices: DistributionSlice[]): DistributionSlice[] {
  if (slices.length <= MAX_STATE_SLICES + 1) return slices;
  const leaders = slices.slice(0, MAX_STATE_SLICES);
  const remaining = slices.slice(MAX_STATE_SLICES);
  leaders.push({
    name: "Other states",
    value: remaining.reduce((total, slice) => total + slice.value, 0),
    color: paletteColor("Other states"),
  });
  return leaders;
}

function DistributionChart({
  title,
  subtitle,
  slices,
}: {
  title: string;
  subtitle: string;
  slices: DistributionSlice[];
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (slices.length === 0 || total === 0) {
    return (
      <section className="min-w-0" aria-label={title}>
        <h3 className="text-sm font-semibold text-[#1F2933]">{title}</h3>
        <p className="mt-0.5 text-xs text-[#5A6472]">{subtitle}</p>
        <div className="flex min-h-[180px] items-center justify-center text-center text-xs text-[#5A6472]">
          No data for the current filters.
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0" aria-label={title}>
      <h3 className="text-sm font-semibold text-[#1F2933]">{title}</h3>
      <p className="mt-0.5 min-h-8 text-xs text-[#5A6472]">{subtitle}</p>

      <div className="h-[170px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={69}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              stroke="#FFFFFF"
              strokeWidth={1}
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E1E5EA",
                fontSize: 12,
                color: "#1F2933",
              }}
              formatter={(value, name) => {
                const count = Number(value) || 0;
                const percentage = ((count / total) * 100).toFixed(1);
                return [`${count.toLocaleString()} records (${percentage}%)`, String(name)];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 space-y-1" aria-label={`${title} legend`}>
        {slices.map((slice) => {
          const percentage = ((slice.value / total) * 100).toFixed(1);
          return (
            <li key={slice.name} className="flex min-w-0 items-start gap-1.5 text-[11px] leading-4 text-[#5A6472]">
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-sm"
                style={{ backgroundColor: slice.color }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 break-words">{slice.name}</span>
              <span className="shrink-0 tabular-nums text-right">
                {slice.value.toLocaleString()} · {percentage}%
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function CategoryDistribution({ records }: Props) {
  const categorySlices = useMemo(
    () => countBy(records, (record) => record.category ?? UNKNOWN_CATEGORY),
    [records],
  );
  const indicatorSlices = useMemo(
    () => countBy(records, (record) => record.indicatorName || UNKNOWN_INDICATOR),
    [records],
  );
  const stateSlices = useMemo(
    () => groupStateSlices(countBy(records, (record) => record.state ?? UNKNOWN_STATE)),
    [records],
  );

  return (
    <section className="h-full rounded-lg border border-[#E1E5EA] bg-white p-4 sm:p-5" aria-label="Dashboard record distributions">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[#1F2933]">Record Distributions</h2>
        <p className="text-xs text-[#5A6472]">
          Counts within the current selection; no values across different units are combined.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center text-sm text-[#5A6472]">
          No dashboard data for the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-4">
          <DistributionChart
            title="Category Distribution"
            subtitle="Records by dashboard category"
            slices={categorySlices}
          />
          <DistributionChart
            title="Indicator Distribution"
            subtitle="Records for each indicator"
            slices={indicatorSlices}
          />
          <DistributionChart
            title="State Coverage"
            subtitle={stateSlices.length > MAX_STATE_SLICES ? "Top states and remaining coverage" : "Records by state"}
            slices={stateSlices}
          />
        </div>
      )}
    </section>
  );
}