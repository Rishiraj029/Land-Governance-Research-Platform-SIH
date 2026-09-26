/**
 * Repository option constants used by the Knowledge Repository filters and the
 * document upload form (content types, themes, states, languages, access tiers).
 *
 * Document records are NOT defined here: they are loaded at runtime from the
 * `repository_documents` table in Supabase (see lib/supabaseRepository.ts).
 */

import type { ContentType, Theme, AccessTier } from "../types/repository";

export const CONTENT_TYPES: ContentType[] = [
  "Research Paper",
  "Policy Document",
  "Legal Document",
  "Case Study",
  "Dataset",
  "Report",
];

export const THEMES: Theme[] = [
  "Climate & Land",
  "Urbanization",
  "Land Disputes",
  "Sustainable Land-Use Planning",
  "Geospatial Governance",
  "Digital Transformation",
  "Tenure Security",
  "Legal Framework",
];

export const STATES = [
  "Maharashtra",
  "Karnataka",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Rajasthan",
  "Punjab",
  "Haryana",
  "Odisha",
  "West Bengal",
  "Andhra Pradesh",
  "Delhi",
  "Tamil Nadu",
  "Gujarat",
  "Kerala",
  "Telangana",
];

export const LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
];

export const ACCESS_TIERS: AccessTier[] = ["Public", "Restricted", "Government-Only"];
