import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Book,
  Check,
  Clock,
  Code,
  Copy,
  Info,
  Play,
  Search,
  Shield,
  Terminal,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

/**
 * Developer Portal.
 *
 * Documents only the endpoints that actually exist in backend/src/index.ts — `GET /api/health`
 * and `POST /api/ai/search`. Request and response shapes are copied from that implementation,
 * and the "Send request" controls perform real HTTP calls so what you see is the server's
 * genuine reply. Nothing here advertises an API the platform does not have.
 */

/**
 * Requests go to the relative `/api` path, which the Vite dev proxy forwards to the Express
 * backend on port 4000. Set VITE_BACKEND_URL when the API is hosted on a different origin.
 */
const API_BASE = String(import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "");

interface EndpointParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ErrorResponse {
  status: number;
  body: string;
  meaning: string;
}

interface ApiEndpoint {
  id: string;
  group: string;
  method: "GET" | "POST";
  path: string;
  summary: string;
  purpose: string;
  authentication: string;
  params: EndpointParam[];
  requestBody: string | null;
  exampleRequest: string;
  exampleResponse: string;
  errors: ErrorResponse[];
  notes: string[];
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    id: "ai-search",
    group: "AI",
    method: "POST",
    path: "/api/ai/search",
    summary: "Answer a research question using repository documents",
    purpose:
      "Selects the repository records whose IDs you supply, verifies them against Supabase, and asks Gemini for a concise research-oriented answer grounded only in those records. Returned citation markers refer to the supplied documents.",
    authentication:
      "No API key. Send the caller's Supabase access token as `Authorization: Bearer <token>` when available — the server forwards it to Supabase so row-level security is evaluated as that user. Without a token the server falls back to its public anon key.",
    params: [
      { name: "query", type: "string", required: true, description: "The research question. Maximum 1,000 characters." },
      {
        name: "documentIds",
        type: "string[]",
        required: true,
        description:
          "Repository document UUIDs used as grounding context. Invalid IDs are discarded; at most the first 10 valid IDs are used.",
      },
    ],
    requestBody: `{
  "query": "What are the major land governance issues discussed?",
  "documentIds": ["03e208ed-3cf5-408c-adff-a51de7376b83"]
}`,
    exampleRequest: `curl -X POST ${API_BASE || "http://localhost:4000"}/api/ai/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What are the major land governance issues discussed?",
    "documentIds": ["03e208ed-3cf5-408c-adff-a51de7376b83"]
  }'`,
    exampleResponse: `{
  "answer": "The supplied records examine digitized land records and tenure security... [1]",
  "model": "gemini-3.8-flash",
  "disclaimer": "AI-generated response based on repository documents. Not official government advice.",
  "supportingDocuments": [
    {
      "id": "03e208ed-3cf5-408c-adff-a51de7376b83",
      "title": "Digital Land Records and Tenure Security",
      "contentType": "Research Paper",
      "theme": "Tenure Security",
      "state": "Rajasthan",
      "author": "Centre for Land Governance Research",
      "institution": "National Land Policy Institute"
    }
  ]
}`,
    errors: [
      { status: 400, body: `{ "error": "A search query is required." }`, meaning: "`query` is missing or blank." },
      {
        status: 400,
        body: `{ "error": "Search questions must be 1,000 characters or fewer." }`,
        meaning: "`query` exceeds the length limit.",
      },
      {
        status: 200,
        body: `{ "error": "No relevant repository documents were found for this query." }`,
        meaning:
          "`documentIds` was empty or none of the IDs matched a readable repository row. Gemini is not called — the server refuses to answer without grounding.",
      },
      {
        status: 502,
        body: `{ "error": "Repository documents could not be verified for the AI summary." }`,
        meaning: "The server could not reach the repository database to verify the IDs.",
      },
      {
        status: 503,
        body: `{ "error": "AI search is not configured on this server (missing GEMINI_API_KEY)." }`,
        meaning: "The server has no Gemini key configured.",
      },
      {
        status: 503,
        body: `{ "error": "AI search cannot verify repository documents. Configure SUPABASE_URL and SUPABASE_ANON_KEY on the server." }`,
        meaning: "The server has no Supabase credentials configured.",
      },
      {
        status: 503,
        body: `{ "error": "AI service is temporarily unavailable. Please try again in a moment." }`,
        meaning: "Every candidate Gemini model failed (for example capacity spikes). Retrying usually succeeds.",
      },
    ],
    notes: [
      "The Gemini API key lives only in the server's environment (`GEMINI_API_KEY`); it is never sent to or stored in the browser.",
      "Only compact metadata plus truncated prose is sent to Gemini: description is cut to 300 characters and summary to 500.",
      "Answers are grounded strictly in the supplied records. If those records do not contain the answer, the model is instructed to say the material is insufficient rather than improvise.",
      "The model name that produced the response is returned in `model`. The server falls back across several Gemini models when one is retired or overloaded.",
      "Output is not official government advice and should be verified against the source documents.",
      "Request bodies are limited to 1 MB, and there is currently no rate limiting or API key management.",
    ],
  },
  {
    id: "health",
    group: "Platform",
    method: "GET",
    path: "/api/health",
    summary: "Liveness probe",
    purpose:
      "Confirms the backend process is running and returns the server's current time. Useful as a connectivity check before calling the AI endpoint.",
    authentication: "None — this endpoint is open.",
    params: [],
    requestBody: null,
    exampleRequest: `curl ${API_BASE || "http://localhost:4000"}/api/health`,
    exampleResponse: `{
  "status": "ok",
  "timestamp": "2026-09-26T04:15:22.000Z"
}`,
    errors: [
      {
        status: 0,
        body: "No HTTP response",
        meaning:
          "The backend is not running, so the request fails at the network level (the browser reports a failed fetch).",
      },
    ],
    notes: [
      "CORS is restricted to the origin in the server's `FRONTEND_URL`, which defaults to http://localhost:5173.",
      "With the Vite dev server running, call it through the proxy at the relative path /api/health.",
    ],
  },
];

const GROUPS = ["All", "Platform", "AI"];

function CodeBlock({ code, label, onCopy, copied }: { code: string; label: string; onCopy: (code: string) => void; copied: boolean }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#1F2933]">{label}</span>
        <button
          type="button"
          onClick={() => onCopy(code)}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-[#0B3D91] hover:text-[#FF9933] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
        >
          {copied ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {/* overflow-x-auto keeps long payloads scrollable instead of breaking the layout */}
      <div className="overflow-x-auto rounded-lg bg-[#1F2933] p-4">
        <pre className="text-xs leading-5 text-[#8CE99A]">
          <code className="font-mono">{code}</code>
        </pre>
      </div>
    </div>
  );
}

export default function ApiPortal() {
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [healthStatus, setHealthStatus] = useState<"checking" | "up" | "down">("checking");
  /** Bumped by the Recheck button to re-run the probe below. */
  const [healthCheckToken, setHealthCheckToken] = useState(0);

  // Real request runner state
  const [activeEndpoint, setActiveEndpoint] = useState<ApiEndpoint | null>(null);
  const [requestBody, setRequestBody] = useState("");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<{ status: number; ok: boolean; body: string } | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Real liveness probe against the backend, so the status shown here is not hardcoded.
  useEffect(() => {
    let current = true;
    fetch(`${API_BASE}/api/health`)
      .then((result) => {
        if (current) setHealthStatus(result.ok ? "up" : "down");
      })
      .catch(() => {
        if (current) setHealthStatus("down");
      });
    return () => {
      current = false;
    };
  }, [healthCheckToken]);

  const filteredEndpoints = ENDPOINTS.filter((endpoint) => {
    const matchesGroup = selectedGroup === "All" || endpoint.group === selectedGroup;
    const haystack = `${endpoint.path} ${endpoint.summary} ${endpoint.purpose}`.toLowerCase();
    return matchesGroup && haystack.includes(searchQuery.toLowerCase());
  });

  function copyCode(code: string) {
    void navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function openRunner(endpoint: ApiEndpoint) {
    setActiveEndpoint(endpoint);
    setRequestBody(endpoint.requestBody ?? "");
    setResponse(null);
    setRequestError(null);
  }

  /** Perform the documented request for real and show the server's actual reply. */
  async function sendRequest() {
    if (!activeEndpoint || sending) return;

    setSending(true);
    setRequestError(null);
    setResponse(null);

    try {
      const init: RequestInit =
        activeEndpoint.method === "GET"
          ? { method: "GET" }
          : { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody };

      const result = await fetch(`${API_BASE}${activeEndpoint.path}`, init);
      const raw = await result.text();

      let pretty = raw;
      try {
        pretty = JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        // Non-JSON (for example an HTML gateway page) is shown verbatim.
      }
      setResponse({ status: result.status, ok: result.ok, body: pretty });
    } catch {
      setRequestError(
        "The request did not reach the server. Start the backend (npm run dev in backend/) and try again."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-[#1F2933]">Developer Portal</h1>
                  <span className="inline-flex items-center rounded-full border border-[#138808]/20 bg-[#138808]/10 px-2.5 py-0.5 text-xs font-medium text-[#138808]">
                    Live backend endpoints
                  </span>
                </div>
                <p className="max-w-2xl text-[#5A6472]">
                  Reference for the platform&apos;s backend HTTP API. Only endpoints that are
                  currently implemented are documented here, and each one can be called for real
                  from this page.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm" role="status">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      healthStatus === "up" ? "bg-[#138808]" : healthStatus === "down" ? "bg-[#D64545]" : "bg-[#E8A33D]"
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={
                      healthStatus === "up"
                        ? "font-medium text-[#138808]"
                        : healthStatus === "down"
                          ? "font-medium text-[#D64545]"
                          : "font-medium text-[#8A5A12]"
                    }
                  >
                    {healthStatus === "up"
                      ? "Backend reachable"
                      : healthStatus === "down"
                        ? "Backend unreachable"
                        : "Checking backend…"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHealthStatus("checking");
                    setHealthCheckToken((token) => token + 1);
                  }}
                  className="rounded-md border border-[#D0D5DD] px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                >
                  Recheck
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mt-6 max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" aria-hidden="true" />
              <label htmlFor="api-endpoint-search" className="sr-only">
                Search API endpoints by path or description
              </label>
              <input
                id="api-endpoint-search"
                type="text"
                placeholder="Search endpoints by path, summary or purpose…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-full border border-[#E1E5EA] bg-[#F5F7FA] py-3 pl-12 pr-4 text-base text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-shrink-0 lg:block">
              <div className="sticky top-24 space-y-6">
                <h2 className="text-sm font-semibold text-[#1F2933]">API Groups</h2>
                <div className="space-y-2">
                  {GROUPS.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] ${
                        selectedGroup === group ? "bg-[#0B3D91] text-white" : "text-[#5A6472] hover:bg-[#F5F7FA]"
                      }`}
                    >
                      {group === "All" ? "All endpoints" : group}
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#E1E5EA] pt-6">
                  <h3 className="mb-3 text-xs font-medium text-[#5A6472]">On this page</h3>
                  <div className="space-y-2">
                    <a href="#overview" className="flex items-center gap-2 text-sm text-[#0B3D91] hover:text-[#FF9933]">
                      <Book className="h-4 w-4" aria-hidden="true" />
                      API Overview
                    </a>
                    <a href="#authentication" className="flex items-center gap-2 text-sm text-[#0B3D91] hover:text-[#FF9933]">
                      <Shield className="h-4 w-4" aria-hidden="true" />
                      Authentication
                    </a>
                    <a href="#limitations" className="flex items-center gap-2 text-sm text-[#0B3D91] hover:text-[#FF9933]">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      Limitations
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Overview */}
              <section id="overview" className="mb-8 scroll-mt-24 rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#1F2933]">API Overview</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0B3D91]/10">
                      <Code className="h-5 w-5 text-[#0B3D91]" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933]">REST over JSON</h3>
                      <p className="text-xs text-[#5A6472]">
                        Two implemented endpoints on one Express service, returning JSON.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#138808]/10">
                      <Shield className="h-5 w-5 text-[#138808]" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933]">Server-side secrets</h3>
                      <p className="text-xs text-[#5A6472]">
                        The Gemini key and Supabase credentials stay on the server.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#FF9933]/10">
                      <Info className="h-5 w-5 text-[#FF9933]" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933]">Base URL</h3>
                      <p className="break-all font-mono text-xs text-[#5A6472]">
                        {API_BASE || "this origin (proxied to :4000)"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Authentication */}
              <section id="authentication" className="mb-8 scroll-mt-24 rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-[#1F2933]">Authentication</h2>
                <p className="text-sm text-[#5A6472]">
                  Neither endpoint requires an API key. There is no API key issuance or quota
                  system in the platform yet.
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[#5A6472]">
                  <li>
                    <code className="rounded bg-[#F5F7FA] px-1 py-0.5 font-mono text-xs">POST /api/ai/search</code>{" "}
                    accepts an optional Supabase access token in{" "}
                    <code className="rounded bg-[#F5F7FA] px-1 py-0.5 font-mono text-xs">Authorization: Bearer</code>.
                    The server forwards it to the repository database so row-level security is applied to
                    the requesting user; otherwise the server&apos;s public anon key is used.
                  </li>
                  <li>
                    Browser clients normally do not need to send a token, because the Vite dev proxy
                    forwards <code className="rounded bg-[#F5F7FA] px-1 py-0.5 font-mono text-xs">/api</code>{" "}
                    to the backend on the same origin.
                  </li>
                  <li>
                    Cross-origin calls are accepted only from the origin configured in the server&apos;s{" "}
                    <code className="rounded bg-[#F5F7FA] px-1 py-0.5 font-mono text-xs">FRONTEND_URL</code>.
                  </li>
                </ul>
              </section>

              {/* Endpoints */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#1F2933]">
                  Available Endpoints ({filteredEndpoints.length})
                </h2>

                {filteredEndpoints.length === 0 && (
                  <div className="rounded-lg border border-[#E1E5EA] bg-white py-12 text-center">
                    <Code className="mx-auto mb-4 h-12 w-12 text-[#5A6472]" aria-hidden="true" />
                    <h3 className="mb-2 text-lg font-medium text-[#1F2933]">No endpoints found</h3>
                    <p className="text-[#5A6472]">Try a different search term or group.</p>
                  </div>
                )}

                {filteredEndpoints.map((endpoint) => (
                  <article key={endpoint.id} className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded border px-2 py-1 text-xs font-semibold ${
                            endpoint.method === "GET"
                              ? "border-[#138808]/20 bg-[#138808]/10 text-[#138808]"
                              : "border-[#0B3D91]/20 bg-[#0B3D91]/10 text-[#0B3D91]"
                          }`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="break-all font-mono text-sm text-[#0B3D91]">{endpoint.path}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => openRunner(endpoint)}
                        className="inline-flex items-center gap-2 rounded-md border border-[#0B3D91] px-3 py-1.5 text-sm font-medium text-[#0B3D91] hover:bg-[#F0F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                      >
                        <Play className="h-4 w-4" aria-hidden="true" />
                        Send request
                      </button>
                    </div>

                    <p className="text-sm font-medium text-[#1F2933]">{endpoint.summary}</p>
                    <p className="mt-1 text-sm text-[#5A6472]">{endpoint.purpose}</p>

                    <p className="mt-3 flex items-start gap-2 rounded-md border border-[#E1E5EA] bg-[#F5F7FA] p-3 text-xs text-[#5A6472]">
                      <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B3D91]" aria-hidden="true" />
                      <span>
                        <strong className="font-semibold text-[#344054]">Authentication: </strong>
                        {endpoint.authentication}
                      </span>
                    </p>

                    {endpoint.params.length > 0 && (
                      <div className="mt-4 min-w-0">
                        <h3 className="mb-2 text-xs font-medium text-[#1F2933]">Request fields</h3>
                        <div className="overflow-x-auto rounded-lg bg-[#F5F7FA] p-3">
                          <table className="w-full min-w-[32rem] text-left text-sm">
                            <thead>
                              <tr className="text-[#5A6472]">
                                <th scope="col" className="pb-2 font-medium">Field</th>
                                <th scope="col" className="pb-2 font-medium">Type</th>
                                <th scope="col" className="pb-2 font-medium">Required</th>
                                <th scope="col" className="pb-2 font-medium">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.params.map((param) => (
                                <tr key={param.name} className="border-t border-[#E1E5EA]">
                                  <td className="py-2 font-mono text-xs text-[#0B3D91]">{param.name}</td>
                                  <td className="py-2 text-xs text-[#5A6472]">{param.type}</td>
                                  <td className="py-2 text-xs">
                                    {param.required ? (
                                      <span className="text-[#D64545]">Yes</span>
                                    ) : (
                                      <span className="text-[#5A6472]">No</span>
                                    )}
                                  </td>
                                  <td className="py-2 text-xs text-[#5A6472]">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
                      {endpoint.requestBody && (
                        <CodeBlock
                          label="Request body"
                          code={endpoint.requestBody}
                          onCopy={copyCode}
                          copied={copiedCode === endpoint.requestBody}
                        />
                      )}
                      <CodeBlock
                        label="Example request"
                        code={endpoint.exampleRequest}
                        onCopy={copyCode}
                        copied={copiedCode === endpoint.exampleRequest}
                      />
                      <CodeBlock
                        label="Example response"
                        code={endpoint.exampleResponse}
                        onCopy={copyCode}
                        copied={copiedCode === endpoint.exampleResponse}
                      />
                    </div>

                    <div className="mt-4">
                      <h3 className="mb-2 text-xs font-medium text-[#1F2933]">Error responses</h3>
                      <ul className="space-y-2">
                        {endpoint.errors.map((error) => (
                          <li key={`${error.status}-${error.body}`} className="rounded-md border border-[#E1E5EA] p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded bg-[#D64545]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[#D64545]">
                                {error.status === 0 ? "network" : error.status}
                              </span>
                              <code className="break-all font-mono text-xs text-[#5A6472]">{error.body}</code>
                            </div>
                            <p className="mt-1.5 text-xs text-[#5A6472]">{error.meaning}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h3 className="mb-2 text-xs font-medium text-[#1F2933]">Notes and limitations</h3>
                      <ul className="list-disc space-y-1.5 pl-5 text-xs text-[#5A6472]">
                        {endpoint.notes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>

              {/* Limitations */}
              <section id="limitations" className="mt-8 scroll-mt-24 rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-[#1F2933]">Platform-wide limitations</h2>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-[#5A6472]">
                  <li>
                    Repository, GIS, dashboard, workspace and innovation data are currently read
                    directly from Supabase by the web client; there are no public REST endpoints for
                    them, so none are documented here.
                  </li>
                  <li>There is no API key management, rate limiting or usage-quota system.</li>
                  <li>
                    AI answers depend on a third-party model. Capacity spikes can make a request fail;
                    retrying is usually enough.
                  </li>
                  <li>No OGC/WMS/WFS or GraphQL interfaces are implemented.</li>
                </ul>
              </section>
            </div>
          </div>
        </div>

        {/* Live request runner */}
        {activeEndpoint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
              className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="api-runner-heading"
            >
              <div className="flex items-center justify-between border-b border-[#E1E5EA] p-6">
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-[#0B3D91]" aria-hidden="true" />
                  <h2 id="api-runner-heading" className="text-xl font-semibold text-[#1F2933]">
                    Send request
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveEndpoint(null)}
                  className="rounded-full p-2 text-[#5A6472] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded border px-2 py-1 text-xs font-semibold ${
                        activeEndpoint.method === "GET"
                          ? "border-[#138808]/20 bg-[#138808]/10 text-[#138808]"
                          : "border-[#0B3D91]/20 bg-[#0B3D91]/10 text-[#0B3D91]"
                      }`}
                    >
                      {activeEndpoint.method}
                    </span>
                    <code className="break-all font-mono text-sm text-[#0B3D91]">{activeEndpoint.path}</code>
                  </div>

                  {activeEndpoint.requestBody !== null && (
                    <div className="mb-3">
                      <label htmlFor="api-runner-body" className="mb-1.5 block text-sm font-medium text-[#344054]">
                        Request body (JSON)
                      </label>
                      <textarea
                        id="api-runner-body"
                        rows={7}
                        value={requestBody}
                        onChange={(event) => setRequestBody(event.target.value)}
                        spellCheck={false}
                        className="w-full rounded-md border border-[#D0D5DD] bg-[#F9FAFB] p-3 font-mono text-xs text-[#1F2933] outline-none focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20"
                      />
                      <p className="mt-1 text-xs text-[#5A6472]">
                        Use real repository document UUIDs.{" "}
                        <Link to="/repository" className="font-medium text-[#0B3D91] hover:underline">
                          Open the repository
                        </Link>{" "}
                        and copy an ID from a document page.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => void sendRequest()}
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#062A63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                  >
                    <Play className="h-4 w-4" aria-hidden="true" />
                    {sending ? "Sending…" : "Execute request"}
                  </button>
                </div>

                {requestError && (
                  <div className="flex items-start gap-2 rounded-md border border-[#F1C6C3] bg-[#FFF7F6] p-4 text-sm text-[#9E2A22]" role="alert">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {requestError}
                  </div>
                )}

                {response && (
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${
                          response.ok ? "bg-[#138808]/10 text-[#138808]" : "bg-[#D64545]/10 text-[#D64545]"
                        }`}
                      >
                        HTTP {response.status}
                      </span>
                      <span className="text-xs text-[#5A6472]">
                        Real response returned by the backend
                      </span>
                    </div>
                    <div className="max-h-80 overflow-auto rounded-lg bg-[#1F2933] p-4">
                      <pre className="text-xs leading-5 text-[#8CE99A]">
                        <code className="font-mono">{response.body}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
