/**
 * GIS types for PAGE 7 — GIS Map Explorer
 *
 * These mirror the columns of the live `public.gis_features` table:
 *   id, name, state, district, category, theme, latitude, longitude,
 *   description, dataset_name, created_at
 *
 * Records are loaded at runtime from Supabase (see lib/supabaseGis.ts).
 * `category`/`theme` are plain strings because the values come from the database
 * rather than a fixed frontend union.
 */

/** One row of public.gis_features, normalised to camelCase for the UI. */
export interface GISFeature {
  id: string;
  name: string;
  state: string;
  district: string | null;
  category: string;
  theme: string;
  latitude: number;
  longitude: number;
  description: string;
  datasetName: string | null;
  createdAt: string | null;
}

/** A toggleable map layer, built from the distinct categories in the data. */
export interface GISLayer {
  id: string;
  name: string;
  category: string;
  color: string;
  enabled: boolean;
}

export interface GISFilters {
  state: string;
  district: string;
  category: string;
  theme: string;
  dataset: string;
}

/** Dataset summary shown in the bottom information panel, derived from live rows. */
export interface GISDatasetInfo {
  name: string;
  description: string;
  coverage: string;
  featureCount: number;
  lastUpdated: string;
  source: string;
}
