/**
 * PAGE 9 — Cross-Domain Insights
 * 
 * Dedicated page for exploring cross-domain relationships between land-governance domains.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import CrossDomainExplorer from "../components/insights/CrossDomainExplorer";
import {
  loadRepositoryDocuments,
} from "../lib/supabaseRepository";
import {
  loadDashboardIndicators,
} from "../lib/supabaseDashboards";
import {
  loadGisFeatures,
} from "../lib/supabaseGis";
import type { RepositoryDocument } from "../types/repository";
import type { DashboardIndicator } from "../types/dashboard";
import type { GISFeature } from "../types/gis";

export default function CrossDomainInsights() {
  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);
  const [indicators, setIndicators] = useState<DashboardIndicator[]>([]);
  const [gisFeatures, setGisFeatures] = useState<GISFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partialError, setPartialError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setPartialError(null);

      const failures: string[] = [];
      let loadedRecords = 0;

      try {
        // Load repository documents
        const docResult = await loadRepositoryDocuments();
        if (docResult.error) {
          failures.push(`repository documents (${docResult.error})`);
        } else {
          setDocuments(docResult.documents);
          loadedRecords += docResult.documents.length;
        }

        // Load dashboard indicators
        const indicatorResult = await loadDashboardIndicators();
        if (indicatorResult.error) {
          failures.push(`dashboard indicators (${indicatorResult.error})`);
        } else {
          setIndicators(indicatorResult.indicators);
          loadedRecords += indicatorResult.indicators.length;
        }

        // Load GIS features
        const gisResult = await loadGisFeatures();
        if (gisResult.error) {
          failures.push(`GIS features (${gisResult.error})`);
        } else {
          setGisFeatures(gisResult.features);
          loadedRecords += gisResult.features.length;
        }
      } catch {
        failures.push("unexpected error while loading data");
      }

      // Fail hard only when nothing could be analysed; otherwise show what loaded.
      if (failures.length > 0 && loadedRecords === 0) {
        setError("Failed to load data for cross-domain analysis.");
      } else if (failures.length > 0) {
        setPartialError(
          `Some data could not be loaded: ${failures.join("; ")}. ` +
            "The analysis below only covers the data that loaded successfully.",
        );
      }

      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-[#E1E5EA] mb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <nav className="flex items-center text-sm text-[#5A6472]">
                <Link to="/" className="flex items-center hover:text-[#0B3D91] transition-colors">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
                <span className="mx-2 text-[#E1E5EA]">/</span>
                <span className="text-[#1F2933] font-medium">Cross-Domain Insights</span>
              </nav>
            </div>
          </div>

          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-poppins text-[#1F2933] mb-2">
                  Cross-Domain Insight Explorer
                </h1>
                <p className="text-[#5A6472] max-w-2xl">
                  Explore relationships between land-governance domains using existing repository documents, 
                  dashboard indicators, and GIS features.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#E1E5EA] bg-white text-sm font-medium text-[#1F2933] hover:border-[#0B3D91] hover:text-[#0B3D91] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-12 text-center">
              <Loader2 className="h-10 w-10 text-[#0B3D91] mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-[#1F2933] mb-2">Loading data</h3>
              <p className="text-[#5A6472]">
                Fetching repository documents, dashboard indicators, and GIS features...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-white border border-[#D64545]/30 rounded-lg p-8 text-center">
              <AlertTriangle className="h-10 w-10 text-[#D64545] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1F2933] mb-2">
                Could not load data
              </h3>
              <p className="text-[#5A6472] mb-6 max-w-xl mx-auto">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B3D91] text-white text-sm font-medium rounded-md hover:bg-[#062A63] transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Partial data warning */}
          {partialError && !loading && !error && (
            <div className="bg-[#FF9933]/10 border border-[#FF9933]/30 rounded-md p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#FF9933] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#5A6472] leading-relaxed">{partialError}</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <CrossDomainExplorer
              documents={documents}
              indicators={indicators}
              gisFeatures={gisFeatures}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}