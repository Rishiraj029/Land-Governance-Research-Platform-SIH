import { supabase } from './supabase';
import type { CreateInnovationInput, Innovation, InnovationFilterOptions, InnovationFilters } from '../types/innovation';

const INNOVATION_COLUMNS = 'id, title, description, category, state, district, status, submitted_by, organization, support_count, created_at, updated_at';

interface InnovationRow {
  id: string; title: string | null; description: string | null; category: string | null; state: string | null;
  district: string | null; status: string | null; submitted_by: string | null; organization: string | null;
  support_count: number | string | null; created_at: string | null; updated_at: string | null;
}

function toFiniteNumber(value: number | string | null): number | null {
  if (value === null || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rowToInnovation(row: InnovationRow): Innovation {
  return { id: row.id, title: row.title, description: row.description, category: row.category, state: row.state,
    district: row.district, status: row.status, submittedBy: row.submitted_by, organization: row.organization,
    supportCount: toFiniteNumber(row.support_count), createdAt: row.created_at, updatedAt: row.updated_at };
}

function describeInnovationError(code: string | undefined, message: string, action: 'load' | 'submit' | 'support'): string {
  if (code === '42501' || message.includes('permission denied')) {
    return action === 'load'
      ? 'Innovation records are not available to this account. An administrator must grant the required read permission.'
      : 'Your account does not have permission to perform this action.';
  }
  if (code === 'PGRST205' || message.includes('Could not find the table')) return 'The Innovation Portal data tables are not available in the database schema.';
  if (code === '23505') return 'You have already supported this innovation.';
  return message || 'The request could not be completed. Please try again.';
}

export async function loadInnovations(): Promise<{ innovations: Innovation[]; error: string | null }> {
  try {
    const { data, error } = await supabase.from('innovations').select(INNOVATION_COLUMNS).order('created_at', { ascending: false });
    if (error) return { innovations: [], error: describeInnovationError(error.code, error.message, 'load') };
    return { innovations: ((data ?? []) as InnovationRow[]).map(rowToInnovation), error: null };
  } catch (error) {
    console.error('Unexpected error loading innovations:', error);
    return { innovations: [], error: 'Failed to load innovation records. Please try again.' };
  }
}

export async function loadInnovation(id: string): Promise<{ innovation: Innovation | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from('innovations').select(INNOVATION_COLUMNS).eq('id', id).maybeSingle();
    if (error) return { innovation: null, error: describeInnovationError(error.code, error.message, 'load') };
    return { innovation: data ? rowToInnovation(data as InnovationRow) : null, error: null };
  } catch (error) {
    console.error('Unexpected error loading innovation:', error);
    return { innovation: null, error: 'Failed to load this innovation. Please try again.' };
  }
}

export async function submitInnovation(input: CreateInnovationInput, userId: string): Promise<{ innovation: Innovation | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from('innovations').insert({
      title: input.title, description: input.description, category: input.category, state: input.state, district: input.district,
      organization: input.organization, submitted_by: userId, status: 'Submitted',
    }).select(INNOVATION_COLUMNS).single();
    if (error) return { innovation: null, error: describeInnovationError(error.code, error.message, 'submit') };
    return { innovation: rowToInnovation(data as InnovationRow), error: null };
  } catch (error) {
    console.error('Unexpected error submitting innovation:', error);
    return { innovation: null, error: 'Could not submit the innovation. Please try again.' };
  }
}

export async function hasSupportedInnovation(innovationId: string, userId: string): Promise<{ supported: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase.from('innovation_support').select('id').eq('innovation_id', innovationId).eq('user_id', userId).maybeSingle();
    if (error) return { supported: false, error: describeInnovationError(error.code, error.message, 'support') };
    return { supported: Boolean(data), error: null };
  } catch (error) {
    console.error('Unexpected error checking innovation support:', error);
    return { supported: false, error: 'Could not load your support status.' };
  }
}

export async function loadSupportedInnovationIds(userId: string): Promise<{ ids: string[]; error: string | null }> {
  try {
    const { data, error } = await supabase.from('innovation_support').select('innovation_id').eq('user_id', userId);
    if (error) return { ids: [], error: describeInnovationError(error.code, error.message, 'support') };
    return { ids: (data ?? []).map((row) => row.innovation_id).filter((id): id is string => Boolean(id)), error: null };
  } catch (error) {
    console.error('Unexpected error loading innovation supports:', error);
    return { ids: [], error: 'Could not load your support status.' };
  }
}

export async function supportInnovation(innovationId: string, userId: string): Promise<{ innovation: Innovation | null; error: string | null }> {
  try {
    const { error } = await supabase.from('innovation_support').insert({ user_id: userId, innovation_id: innovationId });
    if (error) return { innovation: null, error: describeInnovationError(error.code, error.message, 'support') };
    return loadInnovation(innovationId);
  } catch (error) {
    console.error('Unexpected error supporting innovation:', error);
    return { innovation: null, error: 'Could not record your support. Please try again.' };
  }
}

export async function unsupportInnovation(innovationId: string, userId: string): Promise<{ innovation: Innovation | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from('innovation_support').delete().eq('innovation_id', innovationId).eq('user_id', userId).select('id');
    if (error) return { innovation: null, error: describeInnovationError(error.code, error.message, 'support') };
    if (!data || data.length === 0) return { innovation: null, error: 'Your support could not be removed.' };
    return loadInnovation(innovationId);
  } catch (error) {
    console.error('Unexpected error removing innovation support:', error);
    return { innovation: null, error: 'Could not remove your support. Please try again.' };
  }
}

export const EMPTY_INNOVATION_FILTERS: InnovationFilters = { category: '', state: '', district: '', status: '', search: '' };

function sortedUnique(values: (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())))].sort((a, b) => a.localeCompare(b));
}

export function buildInnovationFilterOptions(innovations: Innovation[], filters: InnovationFilters): InnovationFilterOptions {
  const districtSource = filters.state ? innovations.filter((innovation) => innovation.state === filters.state) : innovations;
  return { categories: sortedUnique(innovations.map((innovation) => innovation.category)), states: sortedUnique(innovations.map((innovation) => innovation.state)),
    districts: sortedUnique(districtSource.map((innovation) => innovation.district)), statuses: sortedUnique(innovations.map((innovation) => innovation.status)) };
}

export function filterInnovations(innovations: Innovation[], filters: InnovationFilters): Innovation[] {
  const search = filters.search.trim().toLowerCase();
  return innovations.filter((innovation) => {
    if (filters.category && innovation.category !== filters.category) return false;
    if (filters.state && innovation.state !== filters.state) return false;
    if (filters.district && innovation.district !== filters.district) return false;
    if (filters.status && innovation.status !== filters.status) return false;
    return !search || [innovation.title, innovation.description, innovation.category, innovation.state, innovation.district, innovation.organization]
      .filter((value): value is string => Boolean(value)).join(' ').toLowerCase().includes(search);
  });
}
