/**
 * DashboardDataTable — sortable, paginated table of the rows in view.
 * Clicking a row (or pressing Enter on it) opens the indicator detail panel.
 */
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ChevronsUpDown, ChevronUp } from "lucide-react";
import type { DashboardIndicator, SortColumn, TableSort } from "../../types/dashboard";
import { formatMeasure, paletteColor } from "../../lib/supabaseDashboards";

const PAGE_SIZE = 12;

interface Props {
  /** Rows matching the active filters. */
  records: DashboardIndicator[];
  onSelect: (indicator: DashboardIndicator) => void;
}

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: "state", label: "State" },
  { key: "district", label: "District" },
  { key: "year", label: "Year" },
  { key: "indicatorName", label: "Indicator" },
  { key: "value", label: "Value" },
  { key: "unit", label: "Unit" },
  { key: "category", label: "Category" },
  { key: "source", label: "Source" },
];

export default function DashboardDataTable({ records, onSelect }: Props) {
  const [sort, setSort] = useState<TableSort>({ column: "state", direction: "asc" });
  const [page, setPage] = useState(1);

  const handleSort = (column: SortColumn) => {
    setSort((previous) =>
      previous.column === column
        ? { column, direction: previous.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "asc" },
    );
    setPage(1);
  };

  const sorted = useMemo(() => {
    const copy = [...records];
    const direction = sort.direction === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      if (sort.column === "value") {
        // Rows without a numeric value always sort last.
        if (a.value === null && b.value === null) return 0;
        if (a.value === null) return 1;
        if (b.value === null) return -1;
        return direction * (a.value - b.value);
      }
      if (sort.column === "year") {
        if (a.year === null && b.year === null) return 0;
        if (a.year === null) return 1;
        if (b.year === null) return -1;
        return direction * (a.year - b.year);
      }
      const left = a[sort.column] ?? "";
      const right = b[sort.column] ?? "";
      return direction * String(left).localeCompare(String(right));
    });
    return copy;
  }, [records, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sort.column !== column) return <ChevronsUpDown className="h-3 w-3 text-[#5A6472]" />;
    return sort.direction === "asc" ? (
      <ChevronUp className="h-3 w-3 text-[#0B3D91]" />
    ) : (
      <ChevronDown className="h-3 w-3 text-[#0B3D91]" />
    );
  };

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E1E5EA] flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-[#1F2933]">Indicator Records</h3>
          <p className="text-xs text-[#5A6472]">
            {sorted.length} records · sort by any column · select a row for full details
          </p>
        </div>
        <span className="text-xs text-[#5A6472]">Source and year recorded per row</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F5F7FA] border-b border-[#E1E5EA]">
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-2 text-left font-medium text-[#5A6472] whitespace-nowrap"
                >
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-1 hover:text-[#0B3D91] transition-colors"
                    aria-label={`Sort by ${column.label}`}
                  >
                    {column.label}
                    <SortIcon column={column.key} />
                  </button>
                </th>
              ))}
              <th scope="col" className="px-4 py-2 text-right font-medium text-[#5A6472]">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-8 text-center text-[#5A6472]">
                  No data for current filters.
                </td>
              </tr>
            ) : (
              paginated.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => onSelect(record)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(record);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${record.indicatorName || "record"}`}
                  className="border-b border-[#E1E5EA] last:border-0 hover:bg-[#F5F7FA] focus:bg-[#F5F7FA] focus:outline-none cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2 text-[#1F2933] whitespace-nowrap">
                    {record.state ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-[#1F2933] whitespace-nowrap">
                    {record.district ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-[#1F2933]">{record.year ?? "—"}</td>
                  <td className="px-4 py-2 text-[#1F2933] whitespace-nowrap">
                    {record.indicatorName || "—"}
                  </td>
                  <td className="px-4 py-2 font-semibold text-[#0B3D91] whitespace-nowrap">
                    {formatMeasure(record.value)}
                  </td>
                  <td className="px-4 py-2 text-[#5A6472] whitespace-nowrap">
                    {record.unit ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: `${paletteColor(record.category ?? "Uncategorised")}15`,
                        color: paletteColor(record.category ?? "Uncategorised"),
                      }}
                    >
                      {record.category ?? "Uncategorised"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[#5A6472] max-w-[180px] truncate" title={record.source ?? ""}>
                    {record.source ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <ChevronRight className="h-4 w-4 text-[#5A6472] inline" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[#E1E5EA] flex items-center justify-between">
          <p className="text-xs text-[#5A6472]">
            Page {safePage} of {totalPages} · {sorted.length} records total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="px-3 py-1 text-xs rounded border border-[#E1E5EA] text-[#1F2933] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
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
