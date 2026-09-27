/**
 * GIS → Research connection.
 *
 * The GIS Explorer links to the existing Knowledge Repository, carrying the selected feature's
 * metadata as URL parameters, and the Repository reads them back to show what the results came
 * from. No new search system, route, table or relationship: the keywords travel as the
 * repository's own `q` text search, which already queries the real `repository_documents` rows
 * (title, description, summary, theme, state, district, author, institution).
 *
 * Matching priority follows the platform's strongest available fields — category, then theme,
 * then state, then district. Terms are OR-ed by the repository search rather than AND-ed, so a
 * feature whose category/theme are absent from the repository vocabulary still falls back to its
 * state's documents instead of returning nothing. Nothing here is fabricated: an empty result
 * simply renders the repository's empty state.
 */
export interface GisResearchFeature {
  name: string;
  state: string;
  district: string | null;
  category: string;
  theme: string;
}

export interface GisResearchContext {
  /** Name of the GIS feature the results were opened from. */
  featureName: string;
  /** "Jodhpur, Rajasthan", or "" when the feature had no geography recorded. */
  location: string;
  /** Metadata fields that contributed a keyword, strongest first. */
  matchedFields: string[];
  /** Keyword string handed to the repository's existing text search. */
  query: string;
}

export const GIS_RESEARCH_FEATURE_PARAM = "gisFeature";
export const GIS_RESEARCH_LOCATION_PARAM = "gisLocation";
export const GIS_RESEARCH_MATCHED_PARAM = "gisMatched";

/** Human-readable names for the matched metadata fields, in the platform's wording. */
const FIELD_LABELS: Record<string, string> = {
  category: "category",
  theme: "theme",
  state: "state",
  district: "district",
};

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/** Field-plus-value pairs in matching priority order. */
function rankedFields(feature: GisResearchFeature): Array<[string, string]> {
  return [
    ["category", clean(feature.category)],
    ["theme", clean(feature.theme)],
    ["state", clean(feature.state)],
    ["district", clean(feature.district)],
  ];
}

/**
 * Build the keyword query for a GIS feature. Duplicate values (for example a category and theme
 * that read the same) are only counted once, and a feature with no usable metadata yields an
 * empty query so the repository simply lists its documents.
 */
export function buildGisResearchSearch(feature: GisResearchFeature): {
  query: string;
  matchedFields: string[];
  location: string;
} {
  const seen = new Set<string>();
  const keywords: string[] = [];
  const matchedFields: string[] = [];

  for (const [field, value] of rankedFields(feature)) {
    if (!value) continue;
    const token = value.toLowerCase();
    if (seen.has(token)) continue;
    seen.add(token);
    keywords.push(value);
    matchedFields.push(field);
  }

  const location = [clean(feature.district), clean(feature.state)].filter(Boolean).join(", ");

  return { query: keywords.join(" "), matchedFields, location };
}

/** Repository URL that opens the existing search pre-filled with this feature's context. */
export function buildGisResearchUrl(feature: GisResearchFeature): string {
  const { query, matchedFields, location } = buildGisResearchSearch(feature);
  const params = new URLSearchParams();

  if (query) params.set("q", query);
  params.set(GIS_RESEARCH_FEATURE_PARAM, clean(feature.name) || "GIS feature");
  if (location) params.set(GIS_RESEARCH_LOCATION_PARAM, location);
  if (matchedFields.length > 0) params.set(GIS_RESEARCH_MATCHED_PARAM, matchedFields.join(","));

  return `/repository?${params.toString()}`;
}

/**
 * Read the GIS context back out of the repository URL. Returns null when the parameters are
 * missing, empty or otherwise unusable, so the repository behaves exactly as before.
 */
export function readGisResearchContext(searchParams: URLSearchParams): GisResearchContext | null {
  const featureName = clean(searchParams.get(GIS_RESEARCH_FEATURE_PARAM));
  if (!featureName) return null;

  return {
    featureName,
    location: clean(searchParams.get(GIS_RESEARCH_LOCATION_PARAM)),
    matchedFields: clean(searchParams.get(GIS_RESEARCH_MATCHED_PARAM))
      .split(",")
      .map((field) => field.trim().toLowerCase())
      .filter(Boolean),
    query: clean(searchParams.get("q")),
  };
}

/** "category, theme, state" — the fields the related-research search was built from. */
export function gisResearchMatchLabel(matchedFields: string[]): string {
  return matchedFields.map((field) => FIELD_LABELS[field] ?? field).join(", ");
}
