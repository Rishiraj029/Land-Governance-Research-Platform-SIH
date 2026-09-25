/**
 * DashboardDataTable — compact sortable data table for the Dashboards Hub.
 * Uses the same underlying records as the charts.
 * Supports sorting by column and client-side pagination.
 */
import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { DashboardRecord, SortColumn, TableSort } from "../../types/dashboard";
import { CATEGORY_COLORS } from "../../lib/mockDashboardIndicators";

const PAGE_SIZE = 12;

interface Props {
  records: DashboardRecord[];
}

export default function DashboardDataTable({ records }: Props) {
  const [sort, setSort] = useState<TableSort>({ column: "state", direction: "asc" });
  const [page, setPage] = useState(1);

  const handleSort = (column: SortColumn) => {
    setSort((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "asc" }
    );
    setPage(1);
  };

  const sorted = useMemo(() => {
    const copy = [...records];
    copy.sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;
      if (sort.column === "value") return dir * (a.value - b.value);
      if (sort.column === "year") return dir * (a.year - b.year);
      const av = String(a[sort.column]);
      const bv = String(b[sort.column]);
      return dir * av.localeCompare(bv);
    });
    return copy;
  }, [records, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortColumn }) => {
    if (sort.column !== col) return <ChevronsUpDown className="h-3 w-3 text-[#5A6472]" />;
    return sort.direction === "asc"
      ? <ChevronUp className="h-3 w-3 text-[#0B3D91]" />
      : <ChevronDown className="h-3 w-3 text-[#0B3D91]" />;
  };

  const columns: { key: SortColumn; label: string }[] = [
    { key: "state", label: "State" },
    { key: "year", label: "Year" },
    { key: "indicator", label: "Indicator" },
    { key: "value", label: "Value" },
    { key: "unit", label: "Unit" },
    { key: "category", label: "Category" },
  ];

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E1E5EA] flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1F2933]">Data Table</h3>
          <p className="text-xs text-[#5A6472]">
            {sorted.length} records · click column headers to sort
          </p>
        </div>
        <span className="text-xs text-[#E8A33D] font-medium">Prototype data</span>
      </div>

      {/* Horizontally scrollable on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="bg-[#F5F7FA] border-b border-[#E1E5EA]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-2 text-left font-medium text-[#5A6472] whitespace-nowrap"
                >
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-[#0B3D91] transition-colors"
                    aria-label={`Sort by ${col.label}`}
                  >
                    {col.label}
                    <SortIcon col={col.key} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#5A6472]">
                  No data for current filters.
                </td>
              </tr>
            ) : (
              paginated.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-[#E1E5EA] last:border-0 hover:bg-[#F5F7FA] transition-colors"
                >
                  <td className="px-4 py-2 text-[#1F2933] whitespace-nowrap">{record.state}</td>
                  <td className="px-4 py-2 text-[#1F2933]">{record.year}</td>
                  <td className="px-4 py-2 text-[#1F2933] whitespace-nowrap">{record.indicator}</td>
                  <td className="px-4 py-2 font-semibold text-[#0B3D91]">{record.value.toLocaleString()}</td>
                  <td className="px-4 py-2 text-[#5A6472] whitespace-nowrap">{record.unit}</td>
                  <td className="px-4 py-2">
                    <span
                      className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[record.category] ?? "#0B3D91"}15`,
                        color: CATEGORY_COLORS[record.category] ?? "#0B3D91",
                      }}
                    >
                      {record.category}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[#E1E5EA] flex items-center justify-between">
          <p className="text-xs text-[#5A6472]">
            Page {page} of {totalPages} · {sorted.length} records total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs rounded border border-[#E1E5EA] text-[#1F2933] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs rounded border border-[#E1E5EA] text-[#1F2933] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
