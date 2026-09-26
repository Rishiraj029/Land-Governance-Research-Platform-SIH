export type SimulationScenarioId =
  | 'land-record-digitization'
  | 'property-mapping-coverage'
  | 'land-dispute-reduction'
  | 'land-record-processing-efficiency';

export interface SimulationParameterDefinition {
  id: string;
  label: string;
  unit: string;
  description: string;
  min: number;
  max: number;
  allowZero?: boolean;
}

export interface SimulationScenario {
  id: SimulationScenarioId;
  title: string;
  description: string;
  parameters: SimulationParameterDefinition[];
}

/** Exact numeric assumptions used in a completed calculation. */
export type SimulationParameters = Record<string, number>;

export interface SimulationOutcome {
  label: string;
  value: number;
  unit: string;
  detail?: string;
}

/** Deterministic result stored in simulation_runs.results. */
export interface SimulationResult {
  scenarioId: SimulationScenarioId;
  scenarioName: string;
  assumptions: SimulationParameters;
  outcomes: SimulationOutcome[];
  methodology: string[];
  limitations: string[];
  keyResult: string;
}

export interface SimulationRun {
  id: string;
  userId: string;
  scenarioName: string;
  parameters: SimulationParameters;
  results: SimulationResult;
  createdAt: string;
}
