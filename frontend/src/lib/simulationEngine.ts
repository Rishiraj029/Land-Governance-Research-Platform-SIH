import type {
  SimulationOutcome,
  SimulationParameters,
  SimulationResult,
  SimulationScenario,
  SimulationScenarioId,
} from '../types/simulation';

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'land-record-digitization',
    title: 'Land Record Digitization',
    description: 'Calculate the change in coverage and processing time using your assumptions.',
    parameters: [
      { id: 'currentCoverage', label: 'Current Digitization Coverage', unit: '%', description: 'Your assumed current share of records digitized.', min: 0, max: 100, allowZero: true },
      { id: 'targetCoverage', label: 'Target Digitization Coverage', unit: '%', description: 'Your assumed target share of records digitized.', min: 0, max: 100, allowZero: true },
      { id: 'currentProcessingTime', label: 'Current Processing Time', unit: 'days', description: 'Your assumed current processing time.', min: 0, max: 100000 },
      { id: 'expectedImprovement', label: 'Expected Processing Improvement', unit: '%', description: 'Assumed reduction in processing time.', min: 0, max: 100, allowZero: true },
    ],
  },
  {
    id: 'property-mapping-coverage',
    title: 'Property Mapping Coverage',
    description: 'Calculate mapped and additional properties from coverage assumptions.',
    parameters: [
      { id: 'currentCoverage', label: 'Current Mapping Coverage', unit: '%', description: 'Your assumed current share of mapped properties.', min: 0, max: 100, allowZero: true },
      { id: 'targetCoverage', label: 'Target Mapping Coverage', unit: '%', description: 'Your assumed target share of mapped properties.', min: 0, max: 100, allowZero: true },
      { id: 'totalProperties', label: 'Total Properties / Parcels', unit: 'properties', description: 'The total number of properties or parcels in your scenario.', min: 0, max: 1000000000, allowZero: true },
      { id: 'mappingEfficiency', label: 'Expected Mapping Efficiency', unit: '%', description: 'A recorded user assumption for the scenario; it is not used to infer additional data.', min: 0, max: 100, allowZero: true },
    ],
  },
  {
    id: 'land-dispute-reduction',
    title: 'Land Dispute Reduction',
    description: 'Calculate a scenario estimate of additional resolved disputes from resolution-rate assumptions.',
    parameters: [
      { id: 'annualDisputes', label: 'Current Annual Disputes', unit: 'disputes', description: 'Your assumed number of annual disputes.', min: 0, max: 1000000000, allowZero: true },
      { id: 'currentResolutionRate', label: 'Current Resolution Rate', unit: '%', description: 'Your assumed current resolution rate.', min: 0, max: 100, allowZero: true },
      { id: 'resolutionRateImprovement', label: 'Improvement in Resolution Rate', unit: 'percentage points', description: 'Additional percentage points assumed for the resolution rate.', min: 0, max: 100, allowZero: true },
      { id: 'simulationPeriod', label: 'Simulation Period', unit: 'years', description: 'Number of years to apply the assumption.', min: 0, max: 1000 },
    ],
  },
  {
    id: 'land-record-processing-efficiency',
    title: 'Land Record Processing Efficiency',
    description: 'Calculate processing-time savings from user-defined efficiency assumptions.',
    parameters: [
      { id: 'currentProcessingTime', label: 'Current Processing Time', unit: 'days', description: 'Your assumed current time per application.', min: 0, max: 100000 },
      { id: 'processingImprovement', label: 'Expected Processing Improvement', unit: '%', description: 'Assumed reduction in processing time.', min: 0, max: 100, allowZero: true },
      { id: 'annualApplications', label: 'Annual Applications', unit: 'applications', description: 'Your assumed number of applications per year.', min: 0, max: 1000000000, allowZero: true },
      { id: 'simulationPeriod', label: 'Simulation Period', unit: 'years', description: 'Number of years covered by the scenario.', min: 0, max: 1000 },
    ],
  },
];

export const EMPTY_PARAMETERS: Record<SimulationScenarioId, SimulationParameters> = {
  'land-record-digitization': {},
  'property-mapping-coverage': {},
  'land-dispute-reduction': {},
  'land-record-processing-efficiency': {},
};

export function validateParameters(scenario: SimulationScenario, values: Record<string, string>): { parameters: SimulationParameters | null; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const parameters: SimulationParameters = {};
  for (const parameter of scenario.parameters) {
    const raw = values[parameter.id]?.trim() ?? '';
    const value = Number(raw);
    if (raw === '' || !Number.isFinite(value)) errors[parameter.id] = 'Enter a valid number.';
    else if (value < parameter.min || value > parameter.max || (!parameter.allowZero && value === 0)) errors[parameter.id] = parameter.allowZero
      ? `Enter a value from ${parameter.min} to ${parameter.max}.`
      : `Enter a value greater than ${parameter.min} and no more than ${parameter.max}.`;
    else parameters[parameter.id] = value;
  }
  if ('currentCoverage' in parameters && 'targetCoverage' in parameters && parameters.targetCoverage < parameters.currentCoverage) errors.targetCoverage = 'Target coverage cannot be lower than current coverage.';
  return { parameters: Object.keys(errors).length ? null : parameters, errors };
}

function outcome(label: string, value: number, unit: string, detail?: string): SimulationOutcome { return { label, value, unit, detail }; }
const limitations = [
  'This calculation uses only the values entered by the user.',
  'It does not account for funding, regional conditions, implementation delays, legal factors, or other real-world variables.',
  'It is a scenario estimate, not an official government forecast or policy recommendation.',
];

export function runSimulation(scenario: SimulationScenario, assumptions: SimulationParameters): SimulationResult {
  let outcomes: SimulationOutcome[];
  let methodology: string[];
  let keyResult: string;

  if (scenario.id === 'land-record-digitization') {
    const increase = assumptions.targetCoverage - assumptions.currentCoverage;
    const relative = assumptions.currentCoverage === 0 ? null : (increase / assumptions.currentCoverage) * 100;
    const newTime = assumptions.currentProcessingTime * (1 - assumptions.expectedImprovement / 100);
    const saved = assumptions.currentProcessingTime - newTime;
    outcomes = [outcome('Coverage increase', increase, 'percentage points'), outcome('Relative coverage change', relative ?? 0, '%', relative === null ? 'Not calculated because current coverage is 0%.' : undefined), outcome('Scenario processing time', newTime, 'days'), outcome('Calculated time saved', saved, 'days')];
    methodology = ['Coverage increase = target coverage − current coverage.', 'Scenario processing time = current processing time × (1 − expected improvement ÷ 100).', 'Calculated time saved = current processing time − scenario processing time.'];
    keyResult = `Calculated time saved: ${Number(saved.toFixed(2))} days per processing cycle.`;
  } else if (scenario.id === 'property-mapping-coverage') {
    const increase = assumptions.targetCoverage - assumptions.currentCoverage;
    const mapped = assumptions.totalProperties * assumptions.targetCoverage / 100;
    const additional = assumptions.totalProperties * increase / 100;
    outcomes = [outcome('Coverage increase', increase, 'percentage points'), outcome('Scenario mapped properties', mapped, 'properties'), outcome('Additional properties mapped', additional, 'properties'), outcome('Mapping efficiency assumption', assumptions.mappingEfficiency, '%')];
    methodology = ['Coverage increase = target coverage − current coverage.', 'Scenario mapped properties = total properties × target coverage ÷ 100.', 'Additional properties mapped = total properties × coverage increase ÷ 100.', 'Mapping efficiency is retained as an explicit user assumption and does not introduce external data.'];
    keyResult = `Calculated additional properties mapped: ${Number(additional.toFixed(2))}.`;
  } else if (scenario.id === 'land-dispute-reduction') {
    const newRate = Math.min(100, assumptions.currentResolutionRate + assumptions.resolutionRateImprovement);
    const effectiveImprovement = newRate - assumptions.currentResolutionRate;
    const additionalResolved = assumptions.annualDisputes * (effectiveImprovement / 100) * assumptions.simulationPeriod;
    outcomes = [outcome('Scenario resolution rate', newRate, '%'), outcome('Resolution-rate change', effectiveImprovement, 'percentage points'), outcome('Estimated additional resolved disputes', additionalResolved, 'disputes'), outcome('Simulation period', assumptions.simulationPeriod, 'years')];
    methodology = ['Scenario resolution rate = min(100, current resolution rate + improvement in resolution rate).', 'Estimated additional resolved disputes = annual disputes × resolution-rate change ÷ 100 × simulation period.'];
    keyResult = `Scenario estimate of additional resolved disputes: ${Number(additionalResolved.toFixed(2))}.`;
  } else {
    const newTime = assumptions.currentProcessingTime * (1 - assumptions.processingImprovement / 100);
    const savedPerApplication = assumptions.currentProcessingTime - newTime;
    const annualSaved = savedPerApplication * assumptions.annualApplications;
    const periodSaved = annualSaved * assumptions.simulationPeriod;
    outcomes = [outcome('Scenario processing time', newTime, 'days'), outcome('Time saved per application', savedPerApplication, 'days'), outcome('Estimated annual processing time saved', annualSaved, 'days'), outcome('Estimated time saved over period', periodSaved, 'days')];
    methodology = ['Scenario processing time = current processing time × (1 − expected improvement ÷ 100).', 'Time saved per application = current processing time − scenario processing time.', 'Estimated annual processing time saved = time saved per application × annual applications.', 'The total-period estimate multiplies annual saved days by the simulation period.'];
    keyResult = `Calculated annual processing time saved: ${Number(annualSaved.toFixed(2))} days.`;
  }
  return { scenarioId: scenario.id, scenarioName: scenario.title, assumptions, outcomes, methodology, limitations, keyResult };
}

export function formatSimulationValue(value: number): string { return Number(value.toFixed(2)).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
