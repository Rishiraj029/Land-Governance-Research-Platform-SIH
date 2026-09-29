/**
 * Cross-Domain Relationship Computation
 *
 * Computes relationships between land-governance domains using existing application data.
 * Uses client-side computation based on shared categories, themes, geography and keywords.
 *
 * IMPORTANT: This does NOT establish causal relationships. Every connection produced here is
 * a "Related domains" link derived from shared categories, themes, geography or keyword overlap
 * in the application's own records — nothing in this module implies that one land-governance
 * factor causes another.
 */

import type { RepositoryDocument } from '../types/repository';
import type { DashboardIndicator } from '../types/dashboard';
import type { GISFeature } from '../types/gis';

/**
 * A domain node in the relationship graph.
 * One node exists per distinct domain name; repository themes, dashboard categories and
 * GIS categories/themes that share a name are merged so the node reports every related record.
 */
export interface DomainNode {
  /** Unique identifier for the node (`domain-<normalised name>`). */
  id: string;
  /** Domain name — a repository theme, dashboard category or GIS category/theme. */
  name: string;
  /** "theme" when the domain has repository documents, otherwise "category". */
  type: 'category' | 'theme';
  /** Number of related repository documents. */
  documentCount: number;
  /** Number of related dashboard indicators. */
  indicatorCount: number;
  /** Number of related GIS features (a feature can relate to both a category and a theme domain). */
  gisFeatureCount: number;
  /** GIS features whose *category* equals this domain — used for exact GIS Explorer filters. */
  gisCategoryCount: number;
  /** GIS features whose *theme* equals this domain — used for exact GIS Explorer filters. */
  gisThemeCount: number;
  /** Related geographies (states) derived from the underlying records. */
  geographies: string[];
}

/**
 * A relationship edge between two domain nodes.
 * Edges are labelled "Related domains" in the UI — never "cause" or "prediction".
 */
export interface RelationshipEdge {
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Relationship strength (0-1) based on shared attributes */
  strength: number;
  /** Why the domains are related: shared geography or keyword overlap in their names */
  type: 'shared-geography' | 'keyword-match';
}

/**
 * Cross-domain analysis result.
 */
export interface CrossDomainAnalysis {
  /** Domain nodes matching the query (all nodes when the query matched nothing) */
  nodes: DomainNode[];
  /** Relationship edges between the returned nodes */
  edges: RelationshipEdge[];
  /** Query used for the analysis */
  query: string;
  /** Total documents analyzed */
  totalDocuments: number;
  /** Total indicators analyzed */
  totalIndicators: number;
  /** Total GIS features analyzed */
  totalGisFeatures: number;
  /** False when a non-empty query matched no domain and the full graph is shown instead */
  matchedByQuery: boolean;
}

/**
 * Normalize text for comparison (case-insensitive, trimmed).
 */
function normalizeText(text: string | null | undefined): string {
  return (text || '').toLowerCase().trim();
}

/**
 * Extract keywords from text for matching (words longer than two characters).
 */
function extractKeywords(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

/**
 * Compute Jaccard similarity between two keyword sets.
 */
function keywordSimilarity(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;

  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Get (or create) the node for a domain name. Names are compared case-insensitively so
 * "Land Disputes" from the repository, the dashboard and the GIS table all meet in one node.
 */
function getOrCreateNode(
  registry: Map<string, DomainNode>,
  name: string | null,
): DomainNode | null {
  const cleanName = (name || '').trim();
  if (!cleanName) return null;

  const id = `domain-${normalizeText(cleanName)}`;
  const existing = registry.get(id);
  if (existing) return existing;

  const node: DomainNode = {
    id,
    name: cleanName,
    type: 'category',
    documentCount: 0,
    indicatorCount: 0,
    gisFeatureCount: 0,
    gisCategoryCount: 0,
    gisThemeCount: 0,
    geographies: [],
  };
  registry.set(id, node);
  return node;
}

/**
 * Build one node per domain name from the application's three data sources.
 */
function buildDomainNodes(
  documents: RepositoryDocument[],
  indicators: DashboardIndicator[],
  gisFeatures: GISFeature[],
): Map<string, DomainNode> {
  const registry = new Map<string, DomainNode>();

  // Repository documents contribute their theme.
  for (const doc of documents) {
    const node = getOrCreateNode(registry, doc.theme);
    if (!node) continue;
    node.documentCount += 1;
    if (doc.state) node.geographies.push(doc.state);
  }

  // Dashboard indicators contribute their category.
  for (const indicator of indicators) {
    const node = getOrCreateNode(registry, indicator.category);
    if (!node) continue;
    node.indicatorCount += 1;
    if (indicator.state) node.geographies.push(indicator.state);
  }

  // GIS features carry both a category and a theme; each can name a domain.
  for (const feature of gisFeatures) {
    const categoryNode = getOrCreateNode(registry, feature.category);
    const themeNode = getOrCreateNode(registry, feature.theme);

    if (categoryNode && categoryNode === themeNode) {
      // Category and theme hold the same value: the feature relates to one domain only.
      categoryNode.gisFeatureCount += 1;
      categoryNode.gisCategoryCount += 1;
      categoryNode.gisThemeCount += 1;
      if (feature.state) categoryNode.geographies.push(feature.state);
    } else {
      if (categoryNode) {
        categoryNode.gisFeatureCount += 1;
        categoryNode.gisCategoryCount += 1;
        if (feature.state) categoryNode.geographies.push(feature.state);
      }
      if (themeNode) {
        themeNode.gisFeatureCount += 1;
        themeNode.gisThemeCount += 1;
        if (feature.state) themeNode.geographies.push(feature.state);
      }
    }
  }

  // Finalise: de-duplicate geographies and derive the node type.
  for (const node of registry.values()) {
    node.geographies = [...new Set(node.geographies)];
    node.type = node.documentCount > 0 ? 'theme' : 'category';
  }

  return registry;
}

/**
 * Compute relationships between nodes based on shared attributes:
 * shared geography (states) and keyword overlap between domain names.
 * Only one edge is kept per pair — the strongest reason found.
 */
function computeRelationships(nodes: Map<string, DomainNode>): RelationshipEdge[] {
  const bestByPair = new Map<string, RelationshipEdge>();
  const nodeArray = Array.from(nodes.values());

  const record = (edge: RelationshipEdge): void => {
    const pairKey = [edge.source, edge.target].sort().join('|');
    const existing = bestByPair.get(pairKey);
    if (!existing || edge.strength > existing.strength) {
      bestByPair.set(pairKey, edge);
    }
  };

  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const nodeA = nodeArray[i];
      const nodeB = nodeArray[j];

      // Shared geographies: both domains have records in the same state.
      const sharedGeographies = nodeA.geographies.filter((geo) => nodeB.geographies.includes(geo));
      if (sharedGeographies.length > 0) {
        const strength =
          sharedGeographies.length /
          Math.max(nodeA.geographies.length, nodeB.geographies.length, 1);
        record({ source: nodeA.id, target: nodeB.id, strength, type: 'shared-geography' });
      }

      // Keyword similarity between domain names.
      const similarity = keywordSimilarity(
        extractKeywords(nodeA.name),
        extractKeywords(nodeB.name),
      );
      if (similarity > 0.3) {
        record({ source: nodeA.id, target: nodeB.id, strength: similarity, type: 'keyword-match' });
      }
    }
  }

  return Array.from(bestByPair.values());
}

/**
 * Filter nodes and edges for a query.
 *
 * A node matches when the query hits its name (e.g. "urban expansion") or one of the
 * geographies its records cover (e.g. "Rajasthan"). Name matches are listed first.
 * When a non-empty query matches nothing, every domain is returned with
 * `matchedByQuery: false` so the UI can say so — relationships are never invented.
 */
function filterByQuery(
  nodes: Map<string, DomainNode>,
  edges: RelationshipEdge[],
  query: string,
): { nodes: DomainNode[]; edges: RelationshipEdge[]; matchedByQuery: boolean } {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return { nodes: Array.from(nodes.values()), edges, matchedByQuery: true };
  }

  const queryKeywords = extractKeywords(normalizedQuery);
  const nameMatches: DomainNode[] = [];
  const geographyMatches: DomainNode[] = [];
  const matchingNodeIds = new Set<string>();

  for (const [id, node] of nodes) {
    const nodeText = normalizeText(node.name);
    const nodeKeywords = extractKeywords(node.name);

    const matchesName =
      nodeText.includes(normalizedQuery) ||
      queryKeywords.some((qk) => nodeKeywords.some((nk) => nk.includes(qk) || qk.includes(nk)));

    if (matchesName) {
      nameMatches.push(node);
      matchingNodeIds.add(id);
      continue;
    }

    const matchesGeography = node.geographies.some((geo) => {
      const normalizedGeo = normalizeText(geo);
      if (normalizedGeo.includes(normalizedQuery)) return true;
      const geoKeywords = extractKeywords(geo);
      return queryKeywords.some((qk) => geoKeywords.some((gk) => gk.includes(qk) || qk.includes(gk)));
    });

    if (matchesGeography) {
      geographyMatches.push(node);
      matchingNodeIds.add(id);
    }
  }

  const matched = [...nameMatches, ...geographyMatches];
  if (matched.length === 0) {
    return { nodes: Array.from(nodes.values()), edges, matchedByQuery: false };
  }

  const filteredEdges = edges.filter(
    (edge) => matchingNodeIds.has(edge.source) && matchingNodeIds.has(edge.target),
  );
  return { nodes: matched, edges: filteredEdges, matchedByQuery: true };
}

/**
 * Main function to compute cross-domain relationships (client-side, no extra services).
 */
export function computeCrossDomainRelationships(
  documents: RepositoryDocument[],
  indicators: DashboardIndicator[],
  gisFeatures: GISFeature[],
  query: string,
): CrossDomainAnalysis {
  // Build one node per domain name across documents, indicators and GIS features.
  const nodes = buildDomainNodes(documents, indicators, gisFeatures);

  // Compute relationships (shared geography / shared keywords).
  const edges = computeRelationships(nodes);

  // Filter by query.
  const { nodes: finalNodes, edges: finalEdges, matchedByQuery } = filterByQuery(
    nodes,
    edges,
    query,
  );

  return {
    nodes: finalNodes,
    edges: finalEdges,
    query,
    totalDocuments: documents.length,
    totalIndicators: indicators.length,
    totalGisFeatures: gisFeatures.length,
    matchedByQuery,
  };
}

/**
 * The node's single geography, when every related record sits in one state.
 * Used to add an exact state filter to navigation URLs without hiding any records.
 */
function soleGeography(node: DomainNode): string | null {
  return node.geographies.length === 1 ? node.geographies[0] : null;
}

/**
 * Knowledge Repository URL for a node.
 * Domains with documents use the repository's exact theme filter; other domains use the
 * existing text search. The state filter is only added for single-state domains.
 */
export function getNodeRepositoryUrl(node: DomainNode): string {
  const params = new URLSearchParams();
  params.set(node.documentCount > 0 ? 'themes' : 'q', node.name);
  const state = soleGeography(node);
  if (state) params.set('state', state);
  return `/repository?${params.toString()}`;
}

/**
 * Dashboards Hub URL for a node.
 * Domains with indicators use the exact category filter; otherwise the existing indicator
 * search box is pre-filled with the domain name.
 */
export function getNodeDashboardUrl(node: DomainNode): string {
  const params = new URLSearchParams();
  params.set(node.indicatorCount > 0 ? 'category' : 'search', node.name);
  const state = soleGeography(node);
  if (state) params.set('state', state);
  return `/dashboards?${params.toString()}`;
}

/**
 * GIS Explorer URL for a node.
 * Filters by GIS category (preferred) or GIS theme when the domain has GIS features.
 */
export function getNodeGisUrl(node: DomainNode): string {
  const params = new URLSearchParams();
  if (node.gisCategoryCount > 0) params.set('category', node.name);
  else if (node.gisThemeCount > 0) params.set('theme', node.name);
  const state = soleGeography(node);
  if (state) params.set('state', state);
  return `/gis-explorer?${params.toString()}`;
}

/**
 * Primary destination for a node: the module that actually holds its records.
 */
export function getNodeNavigationUrl(node: DomainNode): string {
  if (node.documentCount > 0) return getNodeRepositoryUrl(node);
  if (node.indicatorCount > 0) return getNodeDashboardUrl(node);
  if (node.gisFeatureCount > 0) return getNodeGisUrl(node);
  return getNodeRepositoryUrl(node);
}

/**
 * Get the domains related to a specific node ("Related domains").
 */
export function getRelatedDomains(
  nodeId: string,
  edges: RelationshipEdge[],
  nodes: DomainNode[],
): DomainNode[] {
  const relatedIds = new Set<string>();

  for (const edge of edges) {
    if (edge.source === nodeId) {
      relatedIds.add(edge.target);
    } else if (edge.target === nodeId) {
      relatedIds.add(edge.source);
    }
  }

  return nodes.filter((node) => relatedIds.has(node.id));
}
