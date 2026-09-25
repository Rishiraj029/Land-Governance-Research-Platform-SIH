/**
 * GIS types for PAGE 7 — GIS Map Explorer
 * 
 * These types are designed to map cleanly to GIS data structures in the future.
 * The current implementation uses mock data for frontend demonstration.
 */

export type GISCategory = 
  | "Land Use"
  | "Urban Expansion"
  | "Land Disputes"
  | "Tenure"
  | "Climate Risk"
  | "Digital Land Records";

export type GISTheme = 
  | "Climate & Land"
  | "Urbanization"
  | "Land Disputes"
  | "Sustainable Land-Use Planning"
  | "Geospatial Governance"
  | "Digital Transformation"
  | "Tenure Security";

export interface GISFeature {
  id: string;
  name: string;
  state: string;
  district: string;
  category: GISCategory;
  theme: GISTheme;
  latitude: number;
  longitude: number;
  value: number;
  unit: string;
  description: string;
  datasetName: string;
  lastUpdated: string;
}

export interface GISLayer {
  id: string;
  name: string;
  category: GISCategory;
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

export interface GISDatasetInfo {
  name: string;
  description: string;
  coverage: string;
  featureCount: number;
  lastUpdated: string;
  source: string;
}
