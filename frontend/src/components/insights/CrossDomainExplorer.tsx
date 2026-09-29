/**
 * Cross-Domain Insight Explorer
 *
 * Visualizes relationships between land-governance domains using existing application data.
 * Every connection is labelled "Related domains" — the graph never claims causation.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Database,
  ExternalLink,
  FileText,
  Map as MapIcon,
  Network,
  Search as SearchIcon,
} from "lucide-react";
import type { RepositoryDocument } from "../../types/repository";
import type { DashboardIndicator } from "../../types/dashboard";
import type { GISFeature } from "../../types/gis";
import {
  computeCrossDomainRelationships,
  getNodeDashboardUrl,
  getNodeGisUrl,
  getNodeNavigationUrl,
  getNodeRepositoryUrl,
  getRelatedDomains,
  type DomainNode,
} from "../../lib/crossDomainRelationships";

interface Props {
  documents: RepositoryDocument[];
  indicators: DashboardIndicator[];
  gisFeatures: GISFeature[];
}

/** How many nodes are drawn in the SVG graph (the full list stays in the grid below). */
const GRAPH_NODE_LIMIT = 10;
/** How many connections are drawn, strongest first. */
const GRAPH_EDGE_LIMIT = 20;
const GRAPH_WIDTH = 860;
const GRAPH_HEIGHT = 470;

const NODE_FILL: Record<DomainNode["type"], string> = {
  theme: "#0B3D91",
  category: "#FF9933",
};

/** The disclaimer shown wherever relationships are displayed. */
const DISCLAIMER =
  "Relationships shown here are based on shared categories, themes, geography and available evidence. They do not establish causal relationships.";

function totalRecords(node: DomainNode): number {
  return node.documentCount + node.indicatorCount + node.gisFeatureCount;
}

function truncateLabel(text: string, max = 18): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default function CrossDomainExplorer({ documents, indicators, gisFeatures }: Props) {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<DomainNode | null>(null);

  /*
    The computation is pure, so it runs during render instead of inside an effect — results
    always reflect the loaded data and the last submitted query. Client-side, no extra services.
  */
  const analysis = useMemo(
    () => computeCrossDomainRelationships(documents, indicators, gisFeatures, appliedQuery),
    [documents, indicators, gisFeatures, appliedQuery],
  );

  /* Circle layout for the connected-node relationship graph. */
  const graph = useMemo(() => {
    const shown = analysis.nodes.slice(0, GRAPH_NODE_LIMIT);
    const shownIds = new Set(shown.map((node) => node.id));
    const edges = analysis.edges
      .filter((edge) => shownIds.has(edge.source) && shownIds.has(edge.target))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, GRAPH_EDGE_LIMIT);

    const centerX = GRAPH_WIDTH / 2;
    const centerY = GRAPH_HEIGHT / 2 - 8;
    const radius = Math.min(GRAPH_WIDTH, GRAPH_HEIGHT) / 2 - 95;
    const positions = new Map<string, { x: number; y: number }>();

    shown.forEach((node, index) => {
      if (shown.length === 1) {
        positions.set(node.id, { x: centerX, y: centerY });
        return;
      }
      const angle = (index / shown.length) * Math.PI * 2 - Math.PI / 2;
      positions.set(node.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    return { shown, edges, positions };
  }, [analysis]);

  const relatedNodes = selectedNode
    ? getRelatedDomains(selectedNode.id, analysis.edges, analysis.nodes)
    : [];

  const submitQuery = () => {
    setSelectedNode(null);
    setAppliedQuery(query.trim());
  };

  const handleNodeClick = (node: DomainNode) => {
    setSelectedNode((current) => (current?.id === node.id ? null : node));
  };

  const getNodeColor = (node: DomainNode) => {
    switch (node.type) {
      case "theme":
        return "bg-[#0B3D91] border-[#0B3D91]";
      case "category":
        return "bg-[#FF9933] border-[#FF9933]";
      default:
        return "bg-[#5A6472] border-[#5A6472]";
    }
  };

  const getNodeTypeIcon = (node: DomainNode) => {
    switch (node.type) {
      case "theme":
        return <FileText className="h-4 w-4" />;
      case "category":
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Network className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-2">
        <Network className="h-6 w-6 text-[#0B3D91]" />
        <h2 className="text-xl font-bold font-poppins text-[#1F2933]">
          Cross-Domain Insight Explorer
        </h2>
      </div>
      <p className="text-sm text-[#5A6472] max-w-2xl mb-6">
        Explore relationships between land-governance domains using existing repository documents,
        dashboard indicators, and GIS features.
      </p>

      {/* Disclaimer */}
      <div className="bg-[#FF9933]/10 border border-[#FF9933]/30 rounded-md p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#FF9933] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#D67C22] text-sm mb-1">
              Related domains — not causal relationships
            </p>
            <p className="text-xs text-[#5A6472] leading-relaxed">
              {DISCLAIMER} Every connection below is labelled &quot;Related domains&quot;. Always
              investigate further using the linked repository documents, dashboards, and GIS
              Explorer.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6472]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitQuery();
              }}
              placeholder="Search domains (e.g., 'urban expansion land disputes Rajasthan')"
              aria-label="Search domains"
              className="w-full pl-10 pr-4 py-2 border border-[#E1E5EA] rounded-md text-sm text-[#1F2933] placeholder:text-[#98A2B3] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
            />
          </div>
          <button
            onClick={submitQuery}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B3D91] text-white text-sm font-medium rounded-md hover:bg-[#062A63] transition-colors"
          >
            <SearchIcon className="h-4 w-4" />
            Explore
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#F5F7FA] rounded-md p-3">
          <p className="text-xs text-[#5A6472] mb-1">Domains Found</p>
          <p className="text-lg font-semibold text-[#1F2933]">{analysis.nodes.length}</p>
        </div>
        <div className="bg-[#F5F7FA] rounded-md p-3">
          <p className="text-xs text-[#5A6472] mb-1">Documents</p>
          <p className="text-lg font-semibold text-[#1F2933]">{analysis.totalDocuments}</p>
        </div>
        <div className="bg-[#F5F7FA] rounded-md p-3">
          <p className="text-xs text-[#5A6472] mb-1">Indicators</p>
          <p className="text-lg font-semibold text-[#1F2933]">{analysis.totalIndicators}</p>
        </div>
        <div className="bg-[#F5F7FA] rounded-md p-3">
          <p className="text-xs text-[#5A6472] mb-1">GIS Features</p>
          <p className="text-lg font-semibold text-[#1F2933]">{analysis.totalGisFeatures}</p>
        </div>
      </div>

      {/* Honest fallback note when the query matched nothing */}
      {appliedQuery && !analysis.matchedByQuery && (
        <div className="bg-[#F0F5FC] border border-[#0B3D91]/20 rounded-md p-3 mb-6 text-xs text-[#5A6472]">
          No domain matched &quot;{appliedQuery}&quot; exactly, so every domain is shown instead.
          Connections still only reflect shared categories, themes, geography or keywords.
        </div>
      )}

      {/* Relationship graph — connected nodes, labelled "Related domains" */}
      {analysis.nodes.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1F2933]">Related Domains</h3>
            <span className="text-xs text-[#5A6472]">
              {graph.edges.length} connection{graph.edges.length === 1 ? "" : "s"} shown
            </span>
          </div>

          <div className="border border-[#E1E5EA] rounded-lg bg-[#F5F7FA] p-2 sm:p-4">
            <svg
              viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
              className="w-full h-auto"
              role="img"
              aria-label="Relationship graph of related land-governance domains. Connections are labelled Related domains."
            >
              {/* Connections */}
              {graph.edges.map((edge) => {
                const from = graph.positions.get(edge.source);
                const to = graph.positions.get(edge.target);
                if (!from || !to) return null;
                const active =
                  selectedNode !== null &&
                  (selectedNode.id === edge.source || selectedNode.id === edge.target);
                return (
                  <line
                    key={`${edge.source}-${edge.target}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={active ? "#0B3D91" : "#98A2B3"}
                    strokeWidth={active ? 2.5 : 1 + edge.strength}
                    strokeOpacity={selectedNode ? (active ? 1 : 0.2) : 0.7}
                    strokeDasharray={edge.type === "keyword-match" ? "6 4" : undefined}
                  >
                    <title>
                      Related domains — shared{" "}
                      {edge.type === "shared-geography" ? "geography" : "name keywords"}
                    </title>
                  </line>
                );
              })}

              {/* Nodes */}
              {graph.shown.map((node) => {
                const position = graph.positions.get(node.id);
                if (!position) return null;
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${node.name}`}
                    className="cursor-pointer"
                    onClick={() => handleNodeClick(node)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleNodeClick(node);
                      }
                    }}
                  >
                    <title>
                      {node.name} — {node.type}: {node.documentCount} documents,{" "}
                      {node.indicatorCount} indicators, {node.gisFeatureCount} GIS features
                    </title>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={30}
                      fill={NODE_FILL[node.type]}
                      stroke={isSelected ? "#1F2933" : "#FFFFFF"}
                      strokeWidth={isSelected ? 4 : 2.5}
                    />
                    <text
                      x={position.x}
                      y={position.y + 50}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="600"
                      fill="#1F2933"
                    >
                      {truncateLabel(node.name)}
                    </text>
                    <text
                      x={position.x}
                      y={position.y + 63}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#5A6472"
                    >
                      {node.documentCount} docs · {node.indicatorCount} ind ·{" "}
                      {node.gisFeatureCount} GIS
                    </text>
                    <text
                      x={position.x}
                      y={position.y + 75}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#98A2B3"
                    >
                      {node.type}
                    </text>
                  </g>
                );
              })}
            </svg>

            {graph.edges.length === 0 && (
              <p className="text-center text-xs text-[#5A6472] pb-1">
                No shared categories, themes, geography or keywords between the displayed
                domains — so no connections are drawn.
              </p>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 mt-2 border-t border-[#E1E5EA] text-xs text-[#5A6472]">
              <span className="inline-flex items-center gap-2">
                <svg width="30" height="8" aria-hidden="true">
                  <line x1="0" y1="4" x2="30" y2="4" stroke="#98A2B3" strokeWidth="2" />
                </svg>
                Related domains
              </span>
              <span className="inline-flex items-center gap-2">
                <svg width="30" height="8" aria-hidden="true">
                  <line
                    x1="0"
                    y1="4"
                    x2="30"
                    y2="4"
                    stroke="#98A2B3"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                </svg>
                Related domains (name keywords)
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: NODE_FILL.theme }}
                />
                Repository theme
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: NODE_FILL.category }}
                />
                Category (dashboard / GIS)
              </span>
            </div>
          </div>
          <p className="text-xs text-[#5A6472] mt-2">
            Each node shows the domain, related documents, indicators and GIS features. Click a
            node to inspect it, then use its links to open the matching module with filters
            applied. Showing {graph.shown.length} of {analysis.nodes.length} domains.
          </p>
        </div>
      ) : (
        <div className="text-center py-8 mb-6">
          <Network className="h-12 w-12 text-[#E1E5EA] mx-auto mb-3" />
          <p className="text-sm text-[#5A6472]">No domains found in the loaded data yet.</p>
        </div>
      )}

      {/* Domain cards — every node, with counts and a direct open link */}
      {analysis.nodes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#1F2933] mb-4">Domains</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedNode?.id === node.id
                    ? "border-[#0B3D91] bg-[#F0F5FC]"
                    : "border-[#E1E5EA] bg-white hover:border-[#0B3D91]"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-md ${getNodeColor(node)} text-white`}>
                      {getNodeTypeIcon(node)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1F2933] text-sm">{node.name}</h4>
                      <p className="text-xs text-[#5A6472] capitalize">{node.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      to={getNodeNavigationUrl(node)}
                      onClick={(event) => event.stopPropagation()}
                      title={`Open ${node.name} in the relevant module`}
                      aria-label={`Open ${node.name} in the relevant module`}
                      className="p-1.5 rounded text-[#5A6472] hover:text-[#0B3D91] hover:bg-[#F0F5FC] transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <ArrowRight className="h-4 w-4 text-[#5A6472]" />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#5A6472]">
                    <FileText className="h-3 w-3" />
                    <span>{node.documentCount} documents</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5A6472]">
                    <BarChart3 className="h-3 w-3" />
                    <span>{node.indicatorCount} indicators</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5A6472]">
                    <MapIcon className="h-3 w-3" />
                    <span>{node.gisFeatureCount} GIS features</span>
                  </div>
                </div>

                {node.geographies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#E1E5EA]">
                    <p className="text-xs text-[#5A6472] mb-1">Geographies:</p>
                    <div className="flex flex-wrap gap-1">
                      {node.geographies.slice(0, 3).map((geo) => (
                        <span
                          key={geo}
                          className="text-xs px-2 py-0.5 bg-[#F5F7FA] rounded text-[#5A6472]"
                        >
                          {geo}
                        </span>
                      ))}
                      {node.geographies.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-[#F5F7FA] rounded text-[#5A6472]">
                          +{node.geographies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected node details */}
      {selectedNode && (
        <div className="border-t border-[#E1E5EA] pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1F2933]">
              Selected: {selectedNode.name}
            </h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-[#5A6472] hover:text-[#0B3D91]"
            >
              Clear selection
            </button>
          </div>

          <div className="bg-[#F5F7FA] rounded-md p-4 mb-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[#5A6472] mb-1">Type</p>
                <p className="text-sm font-medium text-[#1F2933] capitalize">
                  {selectedNode.type}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5A6472] mb-1">Total Records</p>
                <p className="text-sm font-medium text-[#1F2933]">
                  {totalRecords(selectedNode)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5A6472] mb-1">Geographies</p>
                <p className="text-sm font-medium text-[#1F2933]">
                  {selectedNode.geographies.length}
                </p>
              </div>
            </div>
          </div>

          {/* Related domains */}
          {relatedNodes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-[#1F2933] mb-3">Related Domains</h4>
              <div className="flex flex-wrap gap-2">
                {relatedNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className="text-xs px-3 py-1.5 bg-white border border-[#E1E5EA] rounded hover:border-[#0B3D91] hover:text-[#0B3D91] transition-colors"
                  >
                    {node.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation to existing modules, with their filters pre-applied */}
          <div className="pt-4 border-t border-[#E1E5EA]">
            <h4 className="text-xs font-semibold text-[#1F2933] mb-3">Investigate Further</h4>
            <div className="flex flex-wrap gap-2">
              <Link
                to={getNodeRepositoryUrl(selectedNode)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#0B3D91] bg-[#F0F5FC] rounded-md hover:bg-[#0B3D91] hover:text-white transition-colors"
              >
                <Database className="h-4 w-4" />
                View in Repository
              </Link>
              <Link
                to={getNodeDashboardUrl(selectedNode)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#0B3D91] bg-[#F0F5FC] rounded-md hover:bg-[#0B3D91] hover:text-white transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                View in Dashboards
              </Link>
              <Link
                to={getNodeGisUrl(selectedNode)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#0B3D91] bg-[#F0F5FC] rounded-md hover:bg-[#0B3D91] hover:text-white transition-colors"
              >
                <MapIcon className="h-4 w-4" />
                View in GIS Explorer
              </Link>
            </div>
            <p className="text-xs text-[#5A6472] mt-3">
              Links open the module with this domain&apos;s filters already applied. Connections
              above are &quot;Related domains&quot; — they do not establish causal relationships.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
