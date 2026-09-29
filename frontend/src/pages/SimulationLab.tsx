import { useEffect, useMemo, useState } from 'react';
import { BarChart3, BookOpen, Clock3, FileText, Info, Map, Play, Save, Scale, SlidersHorizontal } from 'lucide-react';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import Toast from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { formatSimulationValue, runSimulation, SIMULATION_SCENARIOS, validateParameters } from '../lib/simulationEngine';
import { loadSimulationRuns, saveSimulationRun } from '../lib/supabaseSimulation';
import type { SimulationParameters, SimulationResult, SimulationRun, SimulationScenario, SimulationScenarioId } from '../types/simulation';

type ToastState = { message: string; type: 'success' | 'error' } | null;
type SimulationMode = 'single' | 'compare';

function SimulationParameterFields({
  scenario,
  inputValues,
  validationErrors,
  inputPrefix,
  onChange,
}: {
  scenario: SimulationScenario;
  inputValues: Record<string, string>;
  validationErrors: Record<string, string>;
  inputPrefix: string;
  onChange: (parameterId: string, value: string) => void;
}) {
  return <div className="space-y-5">{scenario.parameters.map((parameter) => {
    const inputId = `${inputPrefix}-${parameter.id}`;
    return <div key={parameter.id}>
      <label htmlFor={inputId} className="block text-sm font-semibold text-[#334E68]">{parameter.label} <span className="font-normal text-[#5A6472]">({parameter.unit})</span></label>
      <p id={`${inputId}-description`} className="mt-1 text-xs leading-5 text-[#6B7280]">{parameter.description}</p>
      <input id={inputId} type="number" inputMode="decimal" min={parameter.min} max={parameter.max} step="any" value={inputValues[parameter.id] ?? ''} onChange={(event) => onChange(parameter.id, event.target.value)} aria-describedby={`${inputId}-description${validationErrors[parameter.id] ? ` ${inputId}-error` : ''}`} aria-invalid={Boolean(validationErrors[parameter.id])} className={`mt-2 w-full rounded-md border bg-white px-3 py-2.5 text-sm text-[#1F2933] outline-none transition focus:ring-2 focus:ring-[#0B3D91] ${validationErrors[parameter.id] ? 'border-red-600 focus:border-red-600 focus:ring-red-200' : 'border-[#B8C6D9] focus:border-[#0B3D91]'}`} />
      {validationErrors[parameter.id] && <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-sm text-red-700">{validationErrors[parameter.id]}</p>}
    </div>;
  })}</div>;
}

function comparisonChange(currentValue: number, proposedValue: number, currentDetail?: string, proposedDetail?: string): string {
  if (currentDetail?.toLowerCase().includes('not calculated') || proposedDetail?.toLowerCase().includes('not calculated')) return 'Not calculated';
  const change = proposedValue - currentValue;
  return `${change > 0 ? '+' : ''}${formatSimulationValue(change)}`;
}

function ComparisonResults({
  currentPolicy,
  proposedPolicy,
}: {
  currentPolicy: SimulationResult;
  proposedPolicy: SimulationResult;
}) {
  const rows = currentPolicy.outcomes.map((currentOutcome) => ({
    currentOutcome,
    proposedOutcome: proposedPolicy.outcomes.find((outcome) => outcome.label === currentOutcome.label),
  }));

  return <div className="mt-6 space-y-6">
    <div className="rounded-md border border-[#B9CCE9] bg-[#F0F5FC] px-4 py-3">
      <p className="font-semibold text-[#244C82]">Illustrative Simulation Result</p>
      <p className="mt-1 text-sm text-[#244C82]">Simulation outputs are illustrative and should not be interpreted as official forecasts.</p>
    </div>
    <div className="overflow-x-auto rounded-md border border-[#D9E0E8]">
      <table className="w-full min-w-155 text-left text-sm">
        <thead className="bg-[#F5F7FA] text-[#334E68]">
          <tr><th scope="col" className="px-4 py-3 font-semibold">Metric</th><th scope="col" className="px-4 py-3 font-semibold">Current Policy</th><th scope="col" className="px-4 py-3 font-semibold">Proposed Policy</th><th scope="col" className="px-4 py-3 font-semibold">Change (Proposed - Current)</th></tr>
        </thead>
        <tbody className="divide-y divide-[#E6EBF0]">
          {rows.map(({ currentOutcome, proposedOutcome }) => {
            const change = proposedOutcome
              ? comparisonChange(currentOutcome.value, proposedOutcome.value, currentOutcome.detail, proposedOutcome.detail)
              : 'Not available';
            return <tr key={currentOutcome.label}>
              <th scope="row" className="px-4 py-3 font-medium text-[#334E68]">{currentOutcome.label}</th>
              <td className="px-4 py-3 text-[#1F2933]">{formatSimulationValue(currentOutcome.value)} {currentOutcome.unit}</td>
              <td className="px-4 py-3 text-[#1F2933]">{proposedOutcome ? `${formatSimulationValue(proposedOutcome.value)} ${proposedOutcome.unit}` : 'Not available'}</td>
              <td className="px-4 py-3 font-semibold text-[#0B3D91]">{change === 'Not calculated' || change === 'Not available' ? change : `${change} ${currentOutcome.unit}`}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>

    <section className="rounded-md border border-[#D9E0E8] p-4" aria-labelledby="comparison-chart-heading">
      <h3 id="comparison-chart-heading" className="font-poppins text-base font-semibold text-[#062A63]">Outcome comparison</h3>
      <p className="mt-1 text-xs text-[#5A6472]">Each pair is scaled independently to the larger absolute result for that metric.</p>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#52606D]">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#0B3D91]" aria-hidden="true" />Current Policy</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#138808]" aria-hidden="true" />Proposed Policy</span>
      </div>
      <ul className="mt-4 space-y-4">
        {rows.map(({ currentOutcome, proposedOutcome }) => {
          const maximum = Math.max(Math.abs(currentOutcome.value), Math.abs(proposedOutcome?.value ?? 0));
          const currentWidth = maximum === 0 ? 0 : Math.abs(currentOutcome.value) / maximum * 100;
          const proposedWidth = maximum === 0 || !proposedOutcome ? 0 : Math.abs(proposedOutcome.value) / maximum * 100;
          return <li key={`chart-${currentOutcome.label}`}>
            <p className="mb-2 text-sm font-medium text-[#334E68]">{currentOutcome.label}</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3"><span className="w-16 shrink-0 text-xs text-[#5A6472]">Current</span><div className="h-3 flex-1 rounded-sm bg-[#F0F2F5]"><div className="h-3 rounded-sm bg-[#0B3D91]" style={{ width: `${currentWidth}%` }} /></div><span className="min-w-24 text-right text-xs text-[#344054]">{formatSimulationValue(currentOutcome.value)} {currentOutcome.unit}</span></div>
              <div className="flex items-center gap-3"><span className="w-16 shrink-0 text-xs text-[#5A6472]">Proposed</span><div className="h-3 flex-1 rounded-sm bg-[#F0F2F5]"><div className="h-3 rounded-sm bg-[#138808]" style={{ width: `${proposedWidth}%` }} /></div><span className="min-w-24 text-right text-xs text-[#344054]">{proposedOutcome ? `${formatSimulationValue(proposedOutcome.value)} ${proposedOutcome.unit}` : 'Not available'}</span></div>
            </div>
          </li>;
        })}
      </ul>
    </section>
  </div>;
}

const scenarioIcons: Record<SimulationScenarioId, typeof FileText> = {
  'land-record-digitization': FileText,
  'property-mapping-coverage': Map,
  'land-dispute-reduction': Scale,
  'land-record-processing-efficiency': Clock3,
};

function toInputValues(parameters: SimulationParameters): Record<string, string> {
  return Object.fromEntries(Object.entries(parameters).map(([key, value]) => [key, String(value)]));
}

function formatRunDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
}

export default function SimulationLab() {
  const { user } = useAuth();
  const [selectedScenarioId, setSelectedScenarioId] = useState<SimulationScenarioId | null>(null);
  const [mode, setMode] = useState<SimulationMode>('single');
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [proposedInputValues, setProposedInputValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [proposedValidationErrors, setProposedValidationErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [comparisonResults, setComparisonResults] = useState<{ currentPolicy: SimulationResult; proposedPolicy: SimulationResult } | null>(null);
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const selectedScenario = useMemo(
    () => SIMULATION_SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ?? null,
    [selectedScenarioId],
  );

  const loadRuns = async (userId: string) => {
    setRunsLoading(true);
    setRunsError(null);
    try {
      const { runs: savedRuns, error } = await loadSimulationRuns(userId);
      if (error) {
        setRunsError(error);
        return;
      }
      setRuns(savedRuns);
    } catch (error) {
      setRunsError(error instanceof Error ? error.message : 'Unable to load saved simulations.');
    } finally {
      setRunsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      const timer = window.setTimeout(() => {
        setRuns([]);
        setRunsError(null);
        setRunsLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    void loadRuns(user.id);
  }, [user]);

  const selectScenario = (scenario: SimulationScenario) => {
    setSelectedScenarioId(scenario.id);
    setInputValues({});
    setProposedInputValues({});
    setValidationErrors({});
    setProposedValidationErrors({});
    setResult(null);
    setComparisonResults(null);
  };

  const updateInput = (parameterId: string, value: string) => {
    setInputValues((current) => ({ ...current, [parameterId]: value }));
    setValidationErrors((current) => {
      const { [parameterId]: discardedError, ...remainingErrors } = current;
      void discardedError;
      return remainingErrors;
    });
    setComparisonResults(null);
  };

  const updateProposedInput = (parameterId: string, value: string) => {
    setProposedInputValues((current) => ({ ...current, [parameterId]: value }));
    setProposedValidationErrors((current) => {
      const { [parameterId]: discardedError, ...remainingErrors } = current;
      void discardedError;
      return remainingErrors;
    });
    setComparisonResults(null);
  };

  const handleRunSimulation = () => {
    if (!selectedScenario) {
      setToast({ message: 'Choose a scenario before running a simulation.', type: 'error' });
      return;
    }
    const validation = validateParameters(selectedScenario, inputValues);
    if (validation.parameters === null) {
      setValidationErrors(validation.errors);
      setResult(null);
      return;
    }
    setResult(runSimulation(selectedScenario, validation.parameters));
    setComparisonResults(null);
    setValidationErrors({});
  };

  const handleRunComparison = () => {
    if (!selectedScenario) {
      setToast({ message: 'Choose a scenario before comparing policies.', type: 'error' });
      return;
    }
    const currentValidation = validateParameters(selectedScenario, inputValues);
    const proposedValidation = validateParameters(selectedScenario, proposedInputValues);
    setValidationErrors(currentValidation.errors);
    setProposedValidationErrors(proposedValidation.errors);
    setComparisonResults(null);
    if (!currentValidation.parameters || !proposedValidation.parameters) return;
    setComparisonResults({
      currentPolicy: runSimulation(selectedScenario, currentValidation.parameters),
      proposedPolicy: runSimulation(selectedScenario, proposedValidation.parameters),
    });
  };

  const handleSaveSimulation = async () => {
    if (!selectedScenario || !result) return;
    if (!user) {
      setToast({ message: 'Please sign in to save a simulation and view previous runs.', type: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      const { run: savedRun, error } = await saveSimulationRun(user.id, selectedScenario.title, result.assumptions, result);
      if (error || !savedRun) throw new Error(error ?? 'Unable to save this simulation.');
      setRuns((current) => [savedRun, ...current]);
      setToast({ message: 'Simulation saved successfully.', type: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Unable to save this simulation.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveComparison = async () => {
    if (!selectedScenario || !comparisonResults) return;
    if (!user) {
      setToast({ message: 'Please sign in to save policy scenarios and view previous runs.', type: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      const [currentSaved, proposedSaved] = await Promise.all([
        saveSimulationRun(user.id, `${selectedScenario.title} - Current Policy`, comparisonResults.currentPolicy.assumptions, comparisonResults.currentPolicy),
        saveSimulationRun(user.id, `${selectedScenario.title} - Proposed Policy`, comparisonResults.proposedPolicy.assumptions, comparisonResults.proposedPolicy),
      ]);
      const savedRuns = [currentSaved.run, proposedSaved.run].filter((run): run is SimulationRun => run !== null);
      if (savedRuns.length) setRuns((current) => [...savedRuns, ...current]);
      if (currentSaved.error || proposedSaved.error || savedRuns.length !== 2) {
        const failedPolicies = [currentSaved.error ? 'Current Policy' : null, proposedSaved.error ? 'Proposed Policy' : null].filter(Boolean).join(' and ');
        setToast({ message: savedRuns.length ? `Saved available run(s); ${failedPolicies || 'one policy run'} could not be saved.` : currentSaved.error || proposedSaved.error || 'Unable to save both policy scenarios.', type: 'error' });
        return;
      }
      setToast({ message: 'Both policy scenarios saved successfully.', type: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Unable to save the policy comparison.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const openSavedRun = (run: SimulationRun) => {
    const scenario = SIMULATION_SCENARIOS.find((item) => item.title === run.scenarioName)
      ?? SIMULATION_SCENARIOS.find((item) => item.id === run.results.scenarioId);
    if (!scenario) {
      setToast({ message: 'This saved simulation uses an unavailable scenario.', type: 'error' });
      return;
    }
    setSelectedScenarioId(scenario.id);
    setInputValues(toInputValues(run.parameters));
    setProposedInputValues({});
    setValidationErrors({});
    setProposedValidationErrors({});
    setResult(run.results);
    setComparisonResults(null);
    setMode('single');
    setToast({ message: 'Saved simulation opened.', type: 'success' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetSimulation = () => {
    setSelectedScenarioId(null);
    setInputValues({});
    setProposedInputValues({});
    setValidationErrors({});
    setProposedValidationErrors({});
    setResult(null);
    setComparisonResults(null);
    setMode('single');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA] text-[#1F2933]">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-[#D9E0E8] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#0B3D91]"><BarChart3 className="h-4 w-4" aria-hidden="true" />Research and policy experimentation</div>
                <h1 className="font-poppins text-3xl font-bold text-[#062A63] sm:text-4xl">Policy Simulation Lab</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-[#52606D]">Explore hypothetical land-governance scenarios using transparent, user-defined assumptions.</p>
              </div>
              <button type="button" onClick={resetSimulation} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-[#B8C6D9] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B3D91] transition-colors hover:bg-[#F0F5FC] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:ring-offset-2"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" />Reset simulation</button>
            </div>
            <div className="mt-6 flex gap-3 rounded-lg border border-[#B9CCE9] bg-[#F0F5FC] p-4 text-sm leading-6 text-[#244C82]"><Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><p>Simulation results are scenario estimates based on the assumptions entered by the user. They are not official government forecasts.</p></div>
            <div className="mt-5 inline-flex rounded-md border border-[#B8C6D9] bg-[#F5F7FA] p-1" role="group" aria-label="Simulation mode">
              <button type="button" aria-pressed={mode === 'single'} onClick={() => { setMode('single'); setComparisonResults(null); }} className={`min-h-10 rounded px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3D91] ${mode === 'single' ? 'bg-white text-[#0B3D91] shadow-sm' : 'text-[#52606D] hover:text-[#1F2933]'}`}>Single Scenario</button>
              <button type="button" aria-pressed={mode === 'compare'} onClick={() => { setMode('compare'); setComparisonResults(null); }} className={`min-h-10 rounded px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3D91] ${mode === 'compare' ? 'bg-white text-[#0B3D91] shadow-sm' : 'text-[#52606D] hover:text-[#1F2933]'}`}>Compare Policies</button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section aria-labelledby="scenario-heading">
            <div className="mb-4"><h2 id="scenario-heading" className="font-poppins text-xl font-semibold text-[#062A63]">Select a scenario</h2><p className="mt-1 text-sm text-[#5A6472]">Choose a scenario, then enter your own assumptions.</p></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {SIMULATION_SCENARIOS.map((scenario) => {
                const Icon = scenarioIcons[scenario.id];
                const isSelected = selectedScenarioId === scenario.id;
                return <button key={scenario.id} type="button" aria-pressed={isSelected} onClick={() => selectScenario(scenario)} className={`min-h-40 rounded-lg border p-5 text-left shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:ring-offset-2 ${isSelected ? 'border-[#0B3D91] bg-[#F0F5FC] ring-1 ring-[#0B3D91]' : 'border-[#D9E0E8] bg-white hover:border-[#8EACC9] hover:bg-[#FAFBFC]'}`}>
                  <span className="mb-4 inline-flex rounded-md bg-[#E8F0FB] p-2 text-[#0B3D91]"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="block font-poppins text-base font-semibold text-[#1F2933]">{scenario.title}</span><span className="mt-2 block text-sm leading-5 text-[#5A6472]">{scenario.description}</span>
                </button>;
              })}
            </div>
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="rounded-lg border border-[#D9E0E8] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="parameters-heading">
              <h2 id="parameters-heading" className="font-poppins text-xl font-semibold text-[#062A63]">Parameters</h2>
              {!selectedScenario ? <div className="mt-6 rounded-md border border-dashed border-[#C8D3E0] bg-[#FAFBFC] p-8 text-center text-sm text-[#5A6472]">Select a scenario to enter assumptions. No external or government dataset is used.</div> : <>
                <p className="mt-2 text-sm leading-6 text-[#5A6472]">All values are user-provided assumptions. {mode === 'single' ? 'Fields are intentionally blank until you enter them.' : 'Use the same simulation model for both policies and set each policy’s assumptions independently.'}</p>
                {mode === 'single' ? <div className="mt-6">
                  <SimulationParameterFields scenario={selectedScenario} inputValues={inputValues} validationErrors={validationErrors} inputPrefix="single" onChange={updateInput} />
                  <button type="button" onClick={handleRunSimulation} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0B3D91] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#062A63] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:ring-offset-2"><Play className="h-5 w-5" aria-hidden="true" />Run Simulation</button>
                </div> : <>
                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <section className="rounded-md border border-[#D9E0E8] bg-[#FCFCFD] p-4" aria-labelledby="current-policy-heading">
                      <h3 id="current-policy-heading" className="font-poppins text-lg font-semibold text-[#062A63]">Scenario A: Current Policy</h3>
                      <div className="mt-5"><SimulationParameterFields scenario={selectedScenario} inputValues={inputValues} validationErrors={validationErrors} inputPrefix="current" onChange={updateInput} /></div>
                    </section>
                    <section className="rounded-md border border-[#D9E0E8] bg-[#FCFCFD] p-4" aria-labelledby="proposed-policy-heading">
                      <h3 id="proposed-policy-heading" className="font-poppins text-lg font-semibold text-[#062A63]">Scenario B: Proposed Policy</h3>
                      <div className="mt-5"><SimulationParameterFields scenario={selectedScenario} inputValues={proposedInputValues} validationErrors={proposedValidationErrors} inputPrefix="proposed" onChange={updateProposedInput} /></div>
                    </section>
                  </div>
                  <button type="button" onClick={handleRunComparison} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0B3D91] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#062A63] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:ring-offset-2"><Scale className="h-5 w-5" aria-hidden="true" />Run Policy Comparison</button>
                </>}
              </>}
            </section>

            <section className="rounded-lg border border-[#D9E0E8] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="results-heading">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="results-heading" className="font-poppins text-xl font-semibold text-[#062A63]">{mode === 'compare' ? 'Policy Comparison' : 'Scenario Result'}</h2><p className="mt-1 text-sm text-[#5A6472]">Calculated only from the assumptions you enter.</p></div>{mode === 'compare' ? comparisonResults && <button type="button" onClick={handleSaveComparison} disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-[#138808] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0E6806] focus:outline-none focus:ring-2 focus:ring-[#138808] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"><Save className="h-4 w-4" aria-hidden="true" />{isSaving ? 'Saving…' : 'Save Both Scenarios'}</button> : result && <button type="button" onClick={handleSaveSimulation} disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-[#138808] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0E6806] focus:outline-none focus:ring-2 focus:ring-[#138808] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"><Save className="h-4 w-4" aria-hidden="true" />{isSaving ? 'Saving…' : 'Save Simulation'}</button>}</div>
              {mode === 'compare' ? comparisonResults ? <ComparisonResults currentPolicy={comparisonResults.currentPolicy} proposedPolicy={comparisonResults.proposedPolicy} /> : <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed border-[#C8D3E0] bg-[#FAFBFC] px-6 text-center"><BarChart3 className="h-9 w-9 text-[#8EACC9]" aria-hidden="true" /><h3 className="mt-4 font-poppins text-lg font-semibold text-[#334E68]">No comparison yet</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#5A6472]">Choose a simulation model, enter valid assumptions for both policies, and run the comparison.</p></div> : !result ? <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed border-[#C8D3E0] bg-[#FAFBFC] px-6 text-center"><BarChart3 className="h-9 w-9 text-[#8EACC9]" aria-hidden="true" /><h3 className="mt-4 font-poppins text-lg font-semibold text-[#334E68]">No result yet</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#5A6472]">Select a scenario, enter valid assumptions, and run the simulation to view a transparent scenario estimate.</p></div> : <div className="mt-6">
                <div className="rounded-md border border-[#B9CCE9] bg-[#F0F5FC] px-4 py-3 text-sm font-medium text-[#244C82]">{result.keyResult}</div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">{result.outcomes.map((outcome) => <article key={outcome.label} className="rounded-md border border-[#E1E5EA] bg-white p-4"><p className="text-sm font-medium text-[#52606D]">{outcome.label}</p><p className="mt-2 font-poppins text-2xl font-semibold text-[#062A63]">{formatSimulationValue(outcome.value)} {outcome.unit}</p>{outcome.detail && <p className="mt-2 text-xs leading-5 text-[#5A6472]">{outcome.detail}</p>}</article>)}</div>
                <details className="mt-6 rounded-md border border-[#D9E0E8] bg-[#FAFBFC] p-4" open><summary className="cursor-pointer font-poppins text-base font-semibold text-[#062A63] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]">Methodology &amp; Assumptions</summary><div className="mt-4 space-y-5 text-sm leading-6 text-[#52606D]">
                  <div><h3 className="font-semibold text-[#334E68]">Inputs used</h3><dl className="mt-2 grid gap-x-5 gap-y-1 sm:grid-cols-2">{selectedScenario?.parameters.map((parameter) => <div key={parameter.id} className="flex justify-between gap-3 border-b border-[#E6EBF0] py-1.5"><dt>{parameter.label}</dt><dd className="font-medium text-[#334E68]">{formatSimulationValue(result.assumptions[parameter.id])} {parameter.unit}</dd></div>)}</dl></div>
                  <div><h3 className="font-semibold text-[#334E68]">Formulas applied</h3><ul className="mt-2 list-disc space-y-1 pl-5">{result.methodology.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div><h3 className="font-semibold text-[#334E68]">Limitations</h3><ul className="mt-2 list-disc space-y-1 pl-5">{result.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>
                </div></details>
              </div>}
            </section>
          </div>

          <section className="mt-8 rounded-lg border border-[#D9E0E8] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="previous-heading">
            <div className="flex items-center gap-3"><span className="rounded-md bg-[#E8F0FB] p-2 text-[#0B3D91]"><BookOpen className="h-5 w-5" aria-hidden="true" /></span><div><h2 id="previous-heading" className="font-poppins text-xl font-semibold text-[#062A63]">Previous Simulations</h2><p className="mt-1 text-sm text-[#5A6472]">Saved simulations are private to the account that created them.</p></div></div>
            {!user ? <div className="mt-5 rounded-md border border-[#D9E0E8] bg-[#FAFBFC] p-5 text-sm leading-6 text-[#52606D]">Sign in to save simulations and view previous simulations. You can still run scenario estimates locally.</div> : runsLoading ? <div className="mt-5 rounded-md border border-[#D9E0E8] bg-[#FAFBFC] p-5 text-sm text-[#52606D]">Loading saved simulations…</div> : runsError ? <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert"><p>{runsError}</p><button type="button" onClick={() => void loadRuns(user.id)} className="mt-3 font-semibold underline focus:outline-none focus:ring-2 focus:ring-red-700">Retry</button></div> : runs.length === 0 ? <div className="mt-5 rounded-md border border-dashed border-[#C8D3E0] bg-[#FAFBFC] p-6 text-center"><p className="font-medium text-[#334E68]">No saved simulations yet.</p><p className="mt-1 text-sm text-[#5A6472]">Run a simulation and save it to see it here.</p></div> : <ul className="mt-5 divide-y divide-[#E6EBF0] rounded-md border border-[#E1E5EA]">{runs.map((run) => <li key={run.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-[#334E68]">{run.scenarioName}</p><p className="mt-1 text-sm text-[#5A6472]">{formatRunDate(run.createdAt)} · {run.results.keyResult}</p></div><button type="button" onClick={() => openSavedRun(run)} className="inline-flex shrink-0 items-center justify-center rounded-md border border-[#0B3D91] px-3 py-2 text-sm font-semibold text-[#0B3D91] hover:bg-[#F0F5FC] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:ring-offset-2">Open</button></li>)}</ul>}
          </section>
        </div>
      </main>
      <Footer />
      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
