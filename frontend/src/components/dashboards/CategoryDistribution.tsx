/**
 * CategoryDistribution — record count per category for the rows in view.
 * Categories come from the data (public.dashboard_indicators.category).
 */
import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardIndicator } from "../../types/dashboard";
import { paletteColor } from "../../lib/supabaseDashboards";

interface Props {
  /** Rows matching the active filters. */
  records: DashboardIndicator[];
}

const UNCATEGORISED = "Uncategorised";

export default function CategoryDistribution({ records }: Props) {
  const slices = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of records) {
      const key = record.category ?? UNCATEGORISED;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value, color: paletteColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [records]);

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#1F2933]">Category Distribution</h3>
        <p className="text-xs text-[#5A6472]">Record count per category in view</p>
      </div>

      {slices.length > 0 ? (
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={115}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
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
                formatter={(value) => [`${value} records`, ""]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#5A6472", paddingTop: "20px" }}
                formatter={(value) =>
                  String(value).length > 35 ? `${String(value).slice(0, 35)}…` : value
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center min-h-[300px] text-[#5A6472] text-sm">
          No category data for the current filters.
        </div>
      )}

      <p className="text-xs text-[#5A6472] mt-4">
        Counts only — no values are combined across categories.
      </p>
    </div>
  );
}
