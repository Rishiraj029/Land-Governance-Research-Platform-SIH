/**
 * Repository types for PAGE 4 — Knowledge Repository
 * 
 * These types mirror the columns of the `repository_documents` table in Supabase;
 * document records are loaded at runtime through lib/supabaseRepository.ts.
 */

export type ContentType = 
  | "Research Paper"
  | "Policy Document"
  | "Legal Document"
  | "Case Study"
  | "Dataset"
  | "Report";

export type Theme = 
  | "Climate & Land"
  | "Urbanization"
  | "Land Disputes"
  | "Sustainable Land-Use Planning"
  | "Geospatial Governance"
  | "Digital Transformation"
  | "Tenure Security"
  | "Legal Framework";

export type AccessTier = "Public" | "Restricted" | "Government-Only";

export type SortOption = "Relevance" | "Most Recent";

export type ViewMode = "list" | "grid";

export interface RepositoryDocument {
  id: string;
  title: string;
  contentType: ContentType;
  description: string;
  summary: string;
  author: string;
  institution: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  theme: Theme;
  state: string;
  district?: string;
  language: string;
  accessTier: AccessTier;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  /**
   * auth user id of the contributor. Null for the seeded government records, which were
   * imported without an owner, so it is only ever used to find a user's *own* uploads.
   */
  createdBy?: string;
}

export interface RepositoryFilters {
  contentTypes: ContentType[];
  themes: Theme[]; // Keep as array for UI filtering, but database uses single theme
  states: string[];
  districts: string[];
  dateRange: {
    from: string;
    to: string;
  };
  languages: string[];
  accessTiers: AccessTier[];
}

export interface RepositorySearchState {
  query: string;
  filters: RepositoryFilters;
  sortBy: SortOption;
  viewMode: ViewMode;
  currentPage: number;
  itemsPerPage: number;
}

export interface UploadFormData {
  contentType: ContentType;
  file: File | null;
  title: string;
  description: string;
  theme: Theme;
  state: string;
  district?: string;
  accessTier: AccessTier;
}
