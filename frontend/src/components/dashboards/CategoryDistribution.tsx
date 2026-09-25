/**
 * CategoryDistribution — donut/pie chart showing record count
 * (or average value) by dashboard category.
 */
import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import type { DashboardRecord } from "../../types/dashboard";
import { CATEGORY_COLORS, DASHBOARD_CATEGORIES } from "../../lib/mockDashboardIndicators";

interface Props {
  records: DashboardRecord[];
}

interface Slice {
  name: string;
  value: number;
  color: string;
}

export default function CategoryDistribution({ records }: Props) {
  const slices = useMemo<Slice[]>(() => {
    return DASHBOARD_CATEGORIES.map((cat) => ({
      name: cat,
      value: records.filter((r) => r.category === cat).length,
      color: CATEGORY_COLORS[cat] ?? "#0B3D91",
    })).filter((s) => s.value > 0);
  }, [records]);

  const hasData = slices.length > 0;

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#1F2933]">Category Distribution</h3>
        <p className="text-xs text-[#5A6472]">Record count per dashboard category</p>
      </div>

      {hasData ? (
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
                formatter={(value: any) => [`${value} records`, ""]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#5A6472", paddingTop: "20px" }}
                formatter={(value: any) => String(value).length > 35 ? String(value).slice(0, 35) + "…" : value}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center min-h-[300px] text-[#5A6472] text-sm">
          No category data for current filters.
        </div>
      )}

      <p className="text-xs text-[#5A6472] mt-4">
        Prototype data · Values are illustrative and not official government statistics.
      </p>
    </div>
  );
}
