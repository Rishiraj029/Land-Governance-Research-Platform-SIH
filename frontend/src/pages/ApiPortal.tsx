import { useState } from "react";
import {
  Code,
  Copy,
  Check,
  Search,
  Book,
  Shield,
  Clock,
  Play,
  Terminal
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Toast from "../components/ui/Toast";

interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  category: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  response: any;
  example: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "repo-1",
    method: "GET",
    path: "/api/repository",
    category: "Repository API",
    description: "Get all research documents and datasets from the knowledge repository",
    parameters: [
      { name: "page", type: "number", required: false, description: "Page number for pagination" },
      { name: "limit", type: "number", required: false, description: "Number of results per page" },
      { name: "category", type: "string", required: false, description: "Filter by content category" },
      { name: "theme", type: "string", required: false, description: "Filter by research theme" }
    ],
    response: {
      success: true,
      data: [
        {
          id: "1",
          title: "Impact of Land Ceiling Reforms on Urban Housing Supply",
          contentType: "Research Paper",
          author: "Dr. Priya Sharma",
          institution: "National Institute of Public Finance and Policy"
        }
      ],
      pagination: { page: 1, limit: 20, total: 156 }
    },
    example: "GET /api/repository?page=1&limit=20&theme=Urbanization"
  },
  {
    id: "repo-2",
    method: "GET",
    path: "/api/repository/:id",
    category: "Repository API",
    description: "Get detailed information about a specific document or dataset",
    parameters: [
      { name: "id", type: "string", required: true, description: "Document ID" }
    ],
    response: {
      success: true,
      data: {
        id: "1",
        title: "Impact of Land Ceiling Reforms on Urban Housing Supply",
        contentType: "Research Paper",
        description: "Comprehensive analysis of land ceiling repeal effects across 5 major states",
        author: "Dr. Priya Sharma",
        institution: "National Institute of Public Finance and Policy",
        publishDate: "2024-03-15",
        themes: ["Urbanization", "Land Disputes"]
      }
    },
    example: "GET /api/repository/1"
  },
  {
    id: "gis-1",
    method: "GET",
    path: "/api/gis/features",
    category: "GIS Data API",
    description: "Get geospatial features and layers for the GIS Explorer",
    parameters: [
      { name: "layer", type: "string", required: false, description: "Specific layer name" },
      { name: "bbox", type: "string", required: false, description: "Bounding box coordinates" },
      { name: "state", type: "string", required: false, description: "Filter by state" }
    ],
    response: {
      success: true,
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "Maharashtra", land_use: "Mixed" },
            geometry: { type: "Polygon", coordinates: [] }
          }
        ]
      }
    },
    example: "GET /api/gis/features?layer=land_use&state=Maharashtra"
  },
  {
    id: "dash-1",
    method: "GET",
    path: "/api/dashboards/indicators",
    category: "Dashboard Indicators API",
    description: "Get dashboard indicators and KPI data for policy dashboards",
    parameters: [
      { name: "dashboard", type: "string", required: false, description: "Dashboard type" },
      { name: "indicator", type: "string", required: false, description: "Specific indicator name" },
      { name: "state", type: "string", required: false, description: "Filter by state" }
    ],
    response: {
      success: true,
      data: {
        indicators: [
          {
            name: "Land Dispute Rate",
            value: 12.5,
            unit: "cases per 1000 people",
            trend: "decreasing"
          }
        ]
      }
    },
    example: "GET /api/dashboards/indicators?dashboard=land_disputes&state=Maharashtra"
  },
  {
    id: "ws-1",
    method: "GET",
    path: "/api/workspaces",
    category: "Workspace API",
    description: "Get all collaborative workspaces",
    parameters: [
      { name: "status", type: "string", required: false, description: "Filter by workspace status" },
      { name: "theme", type: "string", required: false, description: "Filter by research theme" }
    ],
    response: {
      success: true,
      data: [
        {
          id: "ws-1",
          name: "Rajasthan Land Records Modernization",
          description: "Comprehensive study of digital land record implementation",
          status: "Active",
          memberCount: 12
        }
      ]
    },
    example: "GET /api/workspaces?status=Active"
  },
  {
    id: "inv-1",
    method: "GET",
    path: "/api/innovations",
    category: "Innovation API",
    description: "Get all innovation submissions and hackathon entries",
    parameters: [
      { name: "category", type: "string", required: false, description: "Filter by innovation category" },
      { name: "status", type: "string", required: false, description: "Filter by submission status" }
    ],
    response: {
      success: true,
      data: [
        {
          id: "inv-1",
          title: "AI-Powered Land Dispute Prediction System",
          category: "Legal & Dispute Resolution",
          status: "Shortlisted",
          votes: 127
        }
      ]
    },
    example: "GET /api/innovations?category=Legal%20&%20Dispute%20Resolution"
  }
];

const API_CATEGORIES = ["Repository API", "GIS Data API", "Dashboard Indicators API", "Workspace API", "Innovation API"];

export default function ApiPortal() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [showTryApi, setShowTryApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredEndpoints = API_ENDPOINTS.filter(endpoint => {
    const matchesCategory = selectedCategory === "All" || endpoint.category === selectedCategory;
    const matchesSearch = endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToastMessage("Code copied to clipboard");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setCopiedCode(null);
    }, 2000);
  };

  const handleTryApi = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setShowTryApi(true);
    // Simulate API call with mock response
    setTimeout(() => {
      setApiResponse(endpoint.response);
    }, 500);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-[#138808]/10 text-[#138808] border-[#138808]/20";
      case "POST":
        return "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20";
      case "PUT":
        return "bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]/20";
      case "DELETE":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[#1F2933]">Developer Portal</h1>
                  <span className="inline-flex items-center rounded-full bg-[#FF9933]/10 px-2.5 py-0.5 text-xs font-medium text-[#FF9933] border border-[#FF9933]/20">
                    Prototype API Documentation
                  </span>
                </div>
                <p className="text-[#5A6472] max-w-2xl">
                  Explore and test the platform's REST APIs for repository access, GIS data, dashboards, workspaces, and innovation submissions.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-[#138808] rounded-full animate-pulse" />
                  <span className="text-[#138808] font-medium">API Status: Operational</span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" />
              <input
                type="text"
                placeholder="Search API endpoints by path or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[#E1E5EA] bg-[#F5F7FA] py-3 pl-12 pr-4 text-base text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Left Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <h2 className="text-sm font-semibold text-[#1F2933]">API Categories</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === "All" ? "bg-[#0B3D91] text-white" : "text-[#5A6472] hover:bg-[#F5F7FA]"
                    }`}
                  >
                    All APIs
                  </button>
                  {API_CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category ? "bg-[#0B3D91] text-white" : "text-[#5A6472] hover:bg-[#F5F7FA]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-[#E1E5EA]">
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Quick Links</h3>
                  <div className="space-y-2">
                    <a href="#" className="flex items-center gap-2 text-sm text-[#0B3D91] hover:text-[#FF9933]">
                      <Book className="h-4 w-4" />
                      Getting Started
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm text-[#0B3D91] hover:text-[#FF9933]">
                      <Shield className="h-4 w-4" />
                      Authentication
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm text-[#0B3D91] hover:text-[#FF9933]">
                      <Clock className="h-4 w-4" />
                      Rate Limits
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* API Overview */}
              <div className="mb-8 bg-white border border-[#E1E5EA] rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-4">API Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#0B3D91]/10 rounded-lg flex items-center justify-center">
                      <Code className="h-5 w-5 text-[#0B3D91]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933]">RESTful API</h3>
                      <p className="text-xs text-[#5A6472]">Standard REST endpoints with JSON responses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#138808]/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-[#138808]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933]">API Key Auth</h3>
                      <p className="text-xs text-[#5A6472]">Secure authentication with API keys</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#FF9933]/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-[#FF9933]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933]">Rate Limited</h3>
                      <p className="text-xs text-[#5A6472]">1000 requests per minute per API key</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Endpoints List */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#1F2933]">Available Endpoints</h2>
                
                {filteredEndpoints.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-[#E1E5EA] rounded-lg">
                    <Code className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#1F2933] mb-2">No endpoints found</h3>
                    <p className="text-[#5A6472]">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                ) : (
                  filteredEndpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className="bg-white border border-[#E1E5EA] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium border ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm font-mono text-[#0B3D91]">{endpoint.path}</code>
                        </div>
                        <button
                          onClick={() => handleTryApi(endpoint)}
                          className="inline-flex items-center gap-2 text-sm text-[#0B3D91] hover:text-[#FF9933]"
                        >
                          <Play className="h-4 w-4" />
                          Try API
                        </button>
                      </div>
                      
                      <p className="text-sm text-[#5A6472] mb-4">{endpoint.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-[#1F2933] mb-2">Parameters</h4>
                        <div className="bg-[#F5F7FA] rounded-lg p-3">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-[#5A6472]">
                                <th className="pb-2">Name</th>
                                <th className="pb-2">Type</th>
                                <th className="pb-2">Required</th>
                                <th className="pb-2">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.parameters.map((param, idx) => (
                                <tr key={idx} className="border-t border-[#E1E5EA]">
                                  <td className="py-2 font-mono text-[#0B3D91]">{param.name}</td>
                                  <td className="py-2 text-[#5A6472]">{param.type}</td>
                                  <td className="py-2">
                                    {param.required ? (
                                      <span className="text-red-600">Yes</span>
                                    ) : (
                                      <span className="text-[#5A6472]">No</span>
                                    )}
                                  </td>
                                  <td className="py-2 text-[#5A6472]">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-medium text-[#1F2933]">Example Request</h4>
                          <button
                            onClick={() => handleCopyCode(endpoint.example)}
                            className="text-xs text-[#0B3D91] hover:text-[#FF9933] flex items-center gap-1"
                          >
                            {copiedCode === endpoint.example ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-[#1F2933] rounded-lg p-3">
                          <code className="text-sm text-green-400 font-mono">{endpoint.example}</code>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Try API Modal */}
        {showTryApi && selectedEndpoint && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-[#E1E5EA]">
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-[#0B3D91]" />
                  <h2 className="text-xl font-semibold text-[#1F2933]">Try API</h2>
                </div>
                <button
                  onClick={() => setShowTryApi(false)}
                  className="p-2 hover:bg-[#F5F7FA] rounded-full text-[#5A6472]"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Request */}
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-3">Request</h3>
                  <div className="bg-[#F5F7FA] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium border ${getMethodColor(selectedEndpoint.method)}`}>
                        {selectedEndpoint.method}
                      </span>
                      <code className="text-sm font-mono text-[#0B3D91]">{selectedEndpoint.path}</code>
                    </div>
                    <button
                      onClick={() => {
                        setApiResponse(selectedEndpoint.response);
                        setToastMessage("API request executed successfully");
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                      }}
                      className="inline-flex items-center gap-2 bg-[#0B3D91] text-white px-4 py-2 rounded-md text-sm hover:bg-[#062A63] transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      Execute Request
                    </button>
                  </div>
                </div>

                {/* Response */}
                {apiResponse && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-[#1F2933]">Response</h3>
                      <button
                        onClick={() => handleCopyCode(JSON.stringify(apiResponse, null, 2))}
                        className="text-xs text-[#0B3D91] hover:text-[#FF9933] flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy JSON
                      </button>
                    </div>
                    <div className="bg-[#1F2933] rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-green-400 font-mono">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Prototype Notice */}
                <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-lg p-4">
                  <p className="text-sm text-[#FF9933]">
                    <strong>Prototype Notice:</strong> This is a frontend prototype API interface. The endpoints shown are documentation examples for future implementation. No actual backend API calls are being made.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}