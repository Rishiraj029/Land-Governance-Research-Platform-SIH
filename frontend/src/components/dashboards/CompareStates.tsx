/**
 * CompareStates — side-by-side comparison of two states for one year.
 *
 * Reads the same public.dashboard_indicators rows the page has already loaded, but keeps its own
 * state/year selection so it is independent of the dashboard's normal filters and never changes
 * them. Only indicators present for BOTH states in the SAME year are compared; anything else is
 * reported as missing rather than filled in.
 *
 * The section reports measured values only. Nothing is ranked and a larger number is never
 * presented as "better" — this is a research and policy tool, not a scorecard.
 */
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowLeftRight, Info } from "lucide-react";
import type { DashboardIndicator } from "../../types/dashboard";
import {
  compareStates,
  dominantUnit,
  formatMeasure,
  listStates,
  listYears,
  yearsWithDataForState,
  type ComparisonValue,
  type StateComparisonRow,
} from "../../lib/supabaseDashboards";

/** The platform's two primary colours, so the pair is always distinguishable. */
const STATE_A_COLOR = "#0B3D91";
const STATE_B_COLOR = "#FF9933";

const SELECT_CLASS =
  "mt-1 w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 disabled:bg-[#F5F7FA] disabled:text-[#5A6472]";

interface Props {
  /** Every loaded row. Deliberately NOT the filter-applied rows. */
  indicators: DashboardIndicator[];
}

/** How a figure was derived, spelled out so an aggregate is never mistaken for a state total. */
function describeBasis(value: ComparisonValue, state: string): string {
  if (value.basis === "statewide") return `${state}: statewide`;
  const records = `${value.recordCount} district ${value.recordCount === 1 ? "record" : "records"}`;
  return `${state}: mean of ${records}`;
}

export default function CompareStates({ indicators }: Props) {
  const states = useMemo(() => listStates(indicators), [indicators]);
  const allYears = useMemo(() => listYears(indicators), [indicators]);

  // Defaults come from the data itself — the first two states that report indicators — so no
  // state is hardcoded and any dataset ordering still yields a populated comparison.
  const [stateA, setStateA] = useState(() => states[0] ?? "");
  const [stateB, setStateB] = useState(() => states[1] ?? "");
  const [requestedYear, setRequestedYear] = useState<number | null>(null);
  const [requestedUnit, setRequestedUnit] = useState("");

  /** Years both states report, newest first — the sensible default year. */
  const sharedYears = useMemo(() => {
    if (!stateA || !stateB || stateA === stateB) return [];
    const yearsA = new Set(yearsWithDataForState(indicators, stateA));
    return yearsWithDataForState(indicators, stateB).filter((year) => yearsA.has(year));
  }, [indicators, stateA, stateB]);

  /*
    Derived rather than synced with an effect: an out-of-range year falls back to the newest year
    both states share, so changing a state can never leave a stale year selected, and no repeated
    state update loop is possible.
  */
  const year =
    requestedYear !== null && allYears.includes(requestedYear)
      ? requestedYear
      : (sharedYears[0] ?? allYears[0] ?? null);

  const sameState = stateA !== "" && stateA === stateB;
  const canCompare = !sameState && stateA !== "" && stateB !== "" && year !== null;

  const result = useMemo(
    () => (canCompare ? compareStates(indicators, stateA, stateB, year as number) : null),
    [canCompare, indicators, stateA, stateB, year],
  );

  const missingA = Boolean(result) && result!.a.values.length === 0;
  const missingB = Boolean(result) && result!.b.values.length === 0;

  const shared = useMemo(() => result?.shared ?? [], [result]);
  const unitOptions = result?.units ?? [];
  const defaultUnit = useMemo(() => dominantUnit(shared), [shared]);

  // Same derive-don't-sync rule as the year: a unit that is not present among the shared
  // indicators can never stay selected.
  const activeUnit = unitOptions.includes(requestedUnit)
    ? requestedUnit
    : defaultUnit || (unitOptions[0] ?? "");

  const chartRows = useMemo(
    () =>
      shared
        .filter((row) => (row.unit ?? "") === activeUnit)
        .map((row) => ({
          indicator: row.indicatorName,
          [stateA]: row.a.value,
          [stateB]: row.b.value,
        })),
    [shared, activeUnit, stateA, stateB],
  );

  if (states.length < 2) {
    return (
      <Shell>
        <p className="text-sm text-[#5A6472]">
          Comparing states needs indicator data for at least two states. The dataset currently
          covers {states.length}.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label htmlFor="compare-state-a" className="block text-xs font-medium text-[#5A6472]">
            State A
          </label>
          <select
            id="compare-state-a"
            value={stateA}
            onChange={(event) => setStateA(event.target.value)}
            className={SELECT_CLASS}
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="compare-state-b" className="block text-xs font-medium text-[#5A6472]">
            State B
          </label>
          <select
            id="compare-state-b"
            value={stateB}
            onChange={(event) => setStateB(event.target.value)}
            className={SELECT_CLASS}
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="compare-year" className="block text-xs font-medium text-[#5A6472]">
            Year
          </label>
          <select
            id="compare-year"
            value={year === null ? "" : String(year)}
            onChange={(event) => setRequestedYear(Number(event.target.value))}
            disabled={allYears.length === 0}
            className={SELECT_CLASS}
          >
            {allYears.map((option) => (
              <option key={option} value={String(option)}>
                {option}
                {sharedYears.includes(option) ? "" : " (not reported by both states)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sameState && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-md border border-[#E8A33D]/30 bg-[#E8A33D]/10 p-3 text-sm text-[#8A5A12]"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            State A and State B are both {stateA}. Choose two different states to compare.
          </span>
        </p>
      )}

      {canCompare && result && (
        <>
          {/* Overview */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <OverviewStat label={stateA} value={`${result.a.values.length}`} caption="indicators reported" />
            <OverviewStat label={stateB} value={`${result.b.values.length}`} caption="indicators reported" />
            <OverviewStat
              label="Indicators compared"
              value={`${shared.length}`}
              caption={`reported by both states in ${result.year}`}
            />
          </div>

          {(missingA || missingB) && (
            <ul className="mt-4 space-y-2">
              {missingA && (
                <li className="rounded-md border border-[#E8A33D]/30 bg-[#E8A33D]/10 p-3 text-sm text-[#8A5A12]">
                  No data available for {stateA} for {result.year}.
                </li>
              )}
              {missingB && (
                <li className="rounded-md border border-[#E8A33D]/30 bg-[#E8A33D]/10 p-3 text-sm text-[#8A5A12]">
                  No data available for {stateB} for {result.year}.
                </li>
              )}
            </ul>
          )}

          {shared.length === 0 ? (
            !missingA && !missingB ? (
              <div className="mt-4 rounded-md border border-[#E1E5EA] bg-[#F5F7FA] p-6 text-center">
                <ArrowLeftRight className="mx-auto mb-2 h-6 w-6 text-[#5A6472]" aria-hidden="true" />
                <p className="text-sm font-medium text-[#1F2933]">
                  No common indicators are currently available for these two states.
                </p>
                <p className="mt-1 text-sm text-[#5A6472]">Try another state or year.</p>
              </div>
            ) : null
          ) : (
            <>
              {/* Table */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-[#1F2933]">Indicator comparison</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-[#E1E5EA] text-left text-xs font-semibold uppercase tracking-wider text-[#5A6472]">
                        <th scope="col" className="py-2 pr-3">Indicator</th>
                        <th scope="col" className="py-2 pr-3">{stateA}</th>
                        <th scope="col" className="py-2 pr-3">{stateB}</th>
                        <th scope="col" className="py-2">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shared.map((row) => (
                        <ComparisonTableRow
                          key={row.indicatorName}
                          row={row}
                          stateA={stateA}
                          stateB={stateB}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 flex items-start gap-2 text-xs text-[#5A6472]">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    Figures are reported exactly as stored in public.dashboard_indicators for the
                    selected year. Indicators recorded for the whole state are shown as reported;
                    when an indicator exists only for districts, the figure is that state's mean
                    across those district records and is labelled above. Values are not ranked —
                    a higher figure is not automatically better.
                  </span>
                </p>
              </div>

              {/* Chart */}
              <div className="mt-6 border-t border-[#E1E5EA] pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-[#1F2933]">Visual comparison</h4>
                    <p className="text-xs text-[#5A6472]">
                      {activeUnit
                        ? `Indicators reported in ${activeUnit}, ${result.year}`
                        : `Shared indicators, ${result.year}`}
                    </p>
                  </div>
                  {unitOptions.length > 1 && (
                    <div>
                      <label htmlFor="compare-unit" className="sr-only">
                        Select unit
                      </label>
                      <select
                        id="compare-unit"
                        value={activeUnit}
                        onChange={(event) => setRequestedUnit(event.target.value)}
                        className="rounded-md border border-[#E1E5EA] bg-white px-3 py-1.5 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                      >
                        {unitOptions.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {chartRows.length > 0 ? (
                  <div className="mt-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={chartRows} margin={{ top: 4, right: 16, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E1E5EA" vertical={false} />
                        <XAxis
                          dataKey="indicator"
                          interval={0}
                          angle={-30}
                          textAnchor="end"
                          height={96}
                          tick={{ fill: "#5A6472", fontSize: 11 }}
                          axisLine={{ stroke: "#E1E5EA" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#5A6472", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          label={{
                            value: activeUnit || "value",
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
                          formatter={(value, name) => [
                            `${formatMeasure(typeof value === "number" ? value : Number(value))}${activeUnit ? ` ${activeUnit}` : ""}`,
                            String(name),
                          ]}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, color: "#5A6472" }} />
                        <Bar dataKey={stateA} fill={STATE_A_COLOR} radius={[4, 4, 0, 0]} />
                        <Bar dataKey={stateB} fill={STATE_B_COLOR} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    {unitOptions.length > 1 && (
                      <p className="mt-2 text-xs text-[#5A6472]">
                        {shared.length - chartRows.length} of the {shared.length} shared indicators
                        are reported in another unit and are listed in the table above; values in
                        different units are not drawn on one scale.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[#5A6472]">
                    The shared indicators carry no single comparable unit for this year, so no
                    chart is drawn. The table above lists every shared indicator with its unit.
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </Shell>
  );
}

/** One row of the comparison table. */
function ComparisonTableRow({
  row,
  stateA,
  stateB,
}: {
  row: StateComparisonRow;
  stateA: string;
  stateB: string;
}) {
  const usesDistrictMean = row.a.basis === "district-mean" || row.b.basis === "district-mean";

  return (
    <tr className="border-b border-[#E1E5EA]/70 align-top">
      <td className="py-2 pr-3">
        <span className="text-[#1F2933]">{row.indicatorName}</span>
        {usesDistrictMean && (
          <span className="mt-0.5 block text-xs text-[#5A6472]">
            {describeBasis(row.a, stateA)} · {describeBasis(row.b, stateB)}
          </span>
        )}
      </td>
      <td className="py-2 pr-3 font-medium text-[#1F2933]">{formatMeasure(row.a.value)}</td>
      <td className="py-2 pr-3 font-medium text-[#1F2933]">{formatMeasure(row.b.value)}</td>
      <td className="py-2 text-[#5A6472]">{row.unit ?? "—"}</td>
    </tr>
  );
}

/** One number in the comparison overview strip. */
function OverviewStat({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-md border border-[#E1E5EA] bg-[#F5F7FA] p-3">
      <p className="truncate text-xs font-medium text-[#5A6472]">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-[#1F2933]">{value}</p>
      <p className="text-xs text-[#5A6472]">{caption}</p>
    </div>
  );
}

/** Section frame, matching the hub's other analysis cards. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-white border border-[#E1E5EA] rounded-lg p-6">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold font-poppins text-[#1F2933]">
          <ArrowLeftRight className="h-5 w-5 text-[#0B3D91]" aria-hidden="true" />
          Compare States
        </h2>
        <p className="mt-1 text-sm text-[#5A6472]">
          Compare land-governance indicators between two states for the same year, using the
          platform's dashboard dataset.
        </p>
      </div>
      {children}
    </section>
  );
}
