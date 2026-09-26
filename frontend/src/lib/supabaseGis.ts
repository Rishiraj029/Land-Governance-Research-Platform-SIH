import { supabase } from './supabase';
import type { GISFeature } from '../types/gis';

/**
 * Database row interface matching public.gis_features.
 * Only these columns exist in the table — do not invent others.
 */
interface GISFeatureRow {
  id: string;
  name: string | null;
  state: string | null;
  district: string | null;
  category: string | null;
  theme: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  description: string | null;
  dataset_name: string | null;
  created_at: string | null;
}

export interface GISLoadResult {
  /** Rows that have usable coordinates and can be drawn as markers. */
  features: GISFeature[];
  /** Total rows returned by the query. */
  totalRows: number;
  /** Rows returned but skipped because latitude/longitude were missing or invalid. */
  skippedNoCoordinates: number;
  error: string | null;
}

/** Postgres numeric columns can arrive as strings; accept both and reject junk. */
function toFiniteNumber(value: number | string | null): number | null {
  if (value === null || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rowToFeature(row: GISFeatureRow): GISFeature | null {
  const latitude = toFiniteNumber(row.latitude);
  const longitude = toFiniteNumber(row.longitude);
  if (latitude === null || longitude === null) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  // (0, 0) is the classic "coordinates not entered" placeholder, not a real location here.
  if (latitude === 0 && longitude === 0) return null;

  return {
    id: row.id,
    name: row.name || 'Untitled feature',
    state: row.state || 'Not specified',
    district: row.district,
    category: row.category || 'Uncategorised',
    theme: row.theme || 'Uncategorised',
    latitude,
    longitude,
    description: row.description || '',
    datasetName: row.dataset_name,
    createdAt: row.created_at,
  };
}

/** Translate Postgres/PostgREST errors into copy a user can act on. */
function describeGisError(code: string | undefined, message: string): string {
  if (code === '42501' || message.includes('permission denied')) {
    return 'Your account does not have read access to the GIS dataset (public.gis_features). An administrator needs to grant SELECT to this role.';
  }
  if (code === 'PGRST205' || message.includes('Could not find the table')) {
    return 'The GIS dataset table (public.gis_features) was not found in the database schema.';
  }
  return message;
}

/**
 * Load every GIS feature from public.gis_features.
 *
 * Rows without usable coordinates are counted but not returned, so the map never
 * plots a marker at a made-up position.
 */
export async function loadGisFeatures(): Promise<GISLoadResult> {
  try {
    const { data, error } = await supabase
      .from('gis_features')
      .select('*')
      .order('state', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading GIS features:', error);
      return {
        features: [],
        totalRows: 0,
        skippedNoCoordinates: 0,
        error: describeGisError(error.code, error.message),
      };
    }

    const rows = (data || []) as GISFeatureRow[];
    const features: GISFeature[] = [];
    for (const row of rows) {
      const feature = rowToFeature(row);
      if (feature) features.push(feature);
    }

    return {
      features,
      totalRows: rows.length,
      skippedNoCoordinates: rows.length - features.length,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error loading GIS features:', error);
    return {
      features: [],
      totalRows: 0,
      skippedNoCoordinates: 0,
      error: 'Failed to load GIS features. Please try again.',
    };
  }
}
