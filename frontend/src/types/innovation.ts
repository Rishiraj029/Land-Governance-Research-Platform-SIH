/**
 * Innovation Portal types for PAGE 11 — Innovation Portal
 * 
 * These types are designed to map cleanly to Supabase tables in the future.
 * The current implementation uses mock data and localStorage, but the structure is database-ready.
 */

export type InnovationCategory = 
  | "GIS & Mapping"
  | "Land Records"
  | "Climate & Sustainability"
  | "Legal & Dispute Resolution"
  | "Rural Development"
  | "Urban Planning"
  | "Digital Governance";

export type InnovationStatus = "Submitted" | "Under Review" | "Shortlisted" | "Selected" | "Not Selected";

export type InnovationState = 
  | "Andhra Pradesh"
  | "Bihar"
  | "Gujarat"
  | "Jharkhand"
  | "Karnataka"
  | "Madhya Pradesh"
  | "Maharashtra"
  | "Odisha"
  | "Punjab"
  | "Rajasthan"
  | "Tamil Nadu"
  | "Telangana"
  | "Uttar Pradesh"
  | "West Bengal"
  | "Delhi"
  | "Other";

export interface Innovation {
  id: string;
  title: string;
  description: string;
  category: InnovationCategory;
  problem: string;
  solution: string;
  location: InnovationState;
  organization: string;
  team: string;
  contact: string;
  status: InnovationStatus;
  votes: number;
  submittedAt: string;
  updatedAt: string;
  featured: boolean;
}

export interface InnovationFilters {
  category: InnovationCategory[];
  status: InnovationStatus[];
  state: InnovationState[];
}

export type InnovationSortOption = "Most Recent" | "Most Votes" | "Most Popular";

export interface CreateInnovationFormData {
  title: string;
  description: string;
  category: InnovationCategory;
  problem: string;
  solution: string;
  location: InnovationState;
  organization: string;
  team: string;
  contact: string;
}