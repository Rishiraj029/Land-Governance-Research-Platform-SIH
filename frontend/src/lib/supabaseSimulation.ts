import { supabase } from './supabase';
import type { SimulationParameters, SimulationResult, SimulationRun } from '../types/simulation';

interface SimulationRunRow { id: string; user_id: string; scenario_name: string; parameters: unknown; results: unknown; created_at: string; }

function isParameters(value: unknown): value is SimulationParameters { return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.values(value).every((entry) => typeof entry === 'number' && Number.isFinite(entry)); }
function isResult(value: unknown): value is SimulationResult { return typeof value === 'object' && value !== null && 'scenarioId' in value && 'scenarioName' in value && 'assumptions' in value && 'outcomes' in value && 'methodology' in value && 'limitations' in value && 'keyResult' in value; }
function rowToRun(row: SimulationRunRow): SimulationRun | null { if (!isParameters(row.parameters) || !isResult(row.results)) return null; return { id: row.id, userId: row.user_id, scenarioName: row.scenario_name, parameters: row.parameters, results: row.results, createdAt: row.created_at }; }
function describeError(code: string | undefined, message: string): string { if (code === '42501' || message.includes('permission denied')) return 'Your account does not have access to saved simulations. An administrator must apply the Simulation Lab RLS policy.'; if (code === 'PGRST205') return 'The simulation_runs table is not available in the database schema.'; return message || 'The request could not be completed. Please try again.'; }

export async function loadSimulationRuns(userId: string): Promise<{ runs: SimulationRun[]; error: string | null }> {
  try { const { data, error } = await supabase.from('simulation_runs').select('id, user_id, scenario_name, parameters, results, created_at').eq('user_id', userId).order('created_at', { ascending: false }); if (error) return { runs: [], error: describeError(error.code, error.message) }; return { runs: ((data ?? []) as unknown as SimulationRunRow[]).map(rowToRun).filter((row): row is SimulationRun => row !== null), error: null }; } catch (error) { console.error('Unexpected error loading simulations:', error); return { runs: [], error: 'Failed to load saved simulations. Please try again.' }; }
}

export async function saveSimulationRun(userId: string, scenarioName: string, parameters: SimulationParameters, results: SimulationResult): Promise<{ run: SimulationRun | null; error: string | null }> {
  try { const { data, error } = await supabase.from('simulation_runs').insert({ user_id: userId, scenario_name: scenarioName, parameters, results }).select('id, user_id, scenario_name, parameters, results, created_at').single(); if (error) return { run: null, error: describeError(error.code, error.message) }; return { run: rowToRun(data as unknown as SimulationRunRow), error: null }; } catch (error) { console.error('Unexpected error saving simulation:', error); return { run: null, error: 'Failed to save the simulation. Please try again.' }; }
}
