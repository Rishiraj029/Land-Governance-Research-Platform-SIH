export type ParameterType = 'slider' | 'number' | 'toggle';

export interface SimulationParameter {
  id: string;
  name: string;
  type: ParameterType;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | boolean;
  unit?: string;
  description?: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  objective: string;
  baselineValue: number;
  baselineLabel: string;
  parameters: SimulationParameter[];
  metrics: { label: string; key: string; isPercentage?: boolean }[];
  calculate: (params: Record<string, any>, baseline: number) => SimulationResult;
}

export interface SimulationResult {
  baseline: number;
  projected: number;
  changeAbsolute: number;
  changePercentage: number;
  implementationPeriod: number;
  metrics: Record<string, number | string>;
  yearlyProjection: { year: string; baseline: number; projected: number }[];
}

export interface SavedScenario {
  id: string;
  name: string;
  scenarioId: string;
  scenarioTitle: string;
  parameters: Record<string, any>;
  result: SimulationResult;
  timestamp: number;
}
