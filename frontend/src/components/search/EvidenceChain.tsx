import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, FileText, MapPinned, Network, TableProperties } from "lucide-react";
import type { DashboardIndicator } from "../../types/dashboard";
import type { GISFeature } from "../../types/gis";
import type { RepositoryDocument } from "../../types/repository";

export type EvidenceConfidence = "High" | "Medium" | "Low";

interface EvidenceChainProps {
  insightText: string;
  insightLabel?: string;
  supportingDocumentIds: string[];
  documents: RepositoryDocument[];
  dashboardIndicatorRefs?: DashboardIndicator[];
  gisFeatureRefs?: GISFeature[];
  sourceMethodologyText: string;
  confidence: EvidenceConfidence;
}

const INSUFFICIENT_EVIDENCE = "Insufficient evidence available in the current repository.";

function displayYear(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/\b\d{4}\b/);
  return match?.[0] ?? null;
}

function gisFeatureHref(feature: GISFeature): string {
  const params = new URLSearchParams({ state: feature.state });
  if (feature.district) params.set("district", feature.district);
  return `/gis-explorer?${params.toString()}`;
}

function dashboardIndicatorHref(indicator: DashboardIndicator): string {
  const params = new URLSearchParams({ indicatorId: indicator.id });
  if (indicator.state) params.set("state", indicator.state);
  if (indicator.district) params.set("district", indicator.district);
  if (indicator.year !== null) params.set("year", String(indicator.year));
  return `/dashboards?${params.toString()}`;
}

export default function EvidenceChain({
  insightText,
  insightLabel = "AI insight",
  supportingDocumentIds,
  documents,
  dashboardIndicatorRefs = [],
  gisFeatureRefs = [],
  sourceMethodologyText,
  confidence,
}: EvidenceChainProps) {
  const [isOpen, setIsOpen] = useState(false);
  const records = new Map(documents.map((document) => [document.id, document]));
  const evidenceDocuments = [...new Set(supportingDocumentIds)]
    .map((id) => records.get(id))
    .filter((document): document is RepositoryDocument => Boolean(document));
  const hasEvidence = evidenceDocuments.length > 0 || dashboardIndicatorRefs.length > 0 || gisFeatureRefs.length > 0;

  return (
    <div className="mt-4 border-t border-[#D7E2F3] pt-4">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#0B3D91] bg-white px-3 py-2 text-sm font-semibold text-[#0B3D91] hover:bg-[#F0F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
      >
        <Network className="h-4 w-4" aria-hidden="true" />
        {isOpen ? "Hide Evidence" : "View Evidence"}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="mt-4 rounded-md border border-[#DCE2E8] bg-white p-4 sm:p-5">
          <div className="mb-4 border-b border-[#EAECF0] pb-4">
            <p className="text-xs font-semibold uppercase text-[#667085]">{insightLabel}</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#344054]">{insightText}</p>
          </div>

          {!hasEvidence ? (
            <p role="status" className="text-sm font-medium text-[#9E2A22]">{INSUFFICIENT_EVIDENCE}</p>
          ) : (
            <ol className="space-y-3 border-l-2 border-[#B9CBE5] pl-4">
              {evidenceDocuments.map((document) => (
                <li key={`document-${document.id}`} className="relative rounded border border-[#DCE2E8] bg-[#FCFCFD] p-3 before:absolute before:-left-5.5 before:top-4 before:h-2 before:w-2 before:rounded-full before:bg-[#0B3D91]">
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#0B3D91]" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-[#667085]">Repository document</p>
                      <Link to={`/repository/${document.id}`} className="mt-0.5 block text-sm font-semibold text-[#0B3D91] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">
                        {document.title}
                      </Link>
                      <p className="mt-1 text-xs text-[#667085]">
                        Source: {[document.institution, document.author].filter(Boolean).join(" · ") || "Not stated in record"}
                        {displayYear(document.publishedAt) && ` · ${displayYear(document.publishedAt)}`}
                      </p>
                    </div>
                  </div>
                </li>
              ))}

              {dashboardIndicatorRefs.map((indicator) => (
                <li key={`indicator-${indicator.id}`} className="relative rounded border border-[#DCE2E8] bg-[#FCFCFD] p-3 before:absolute before:-left-5.5 before:top-4 before:h-2 before:w-2 before:rounded-full before:bg-[#138A5B]">
                  <div className="flex items-start gap-2">
                    <TableProperties className="mt-0.5 h-4 w-4 shrink-0 text-[#138A5B]" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-[#667085]">Dashboard indicator · geographic association</p>
                      <Link to={dashboardIndicatorHref(indicator)} className="mt-0.5 block text-sm font-semibold text-[#0B3D91] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">
                        {indicator.indicatorName || "Unnamed indicator"}
                      </Link>
                      <p className="mt-1 text-xs text-[#667085]">
                        Source: {indicator.source || "Not stated in record"}
                        {indicator.year && ` · ${indicator.year}`}
                        {indicator.state && ` · ${[indicator.district, indicator.state].filter(Boolean).join(", ")}`}
                      </p>
                    </div>
                  </div>
                </li>
              ))}

              {gisFeatureRefs.map((feature) => (
                <li key={`gis-${feature.id}`} className="relative rounded border border-[#DCE2E8] bg-[#FCFCFD] p-3 before:absolute before:-left-5.5 before:top-4 before:h-2 before:w-2 before:rounded-full before:bg-[#D67C22]">
                  <div className="flex items-start gap-2">
                    <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-[#D67C22]" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-[#667085]">GIS feature · geographic association</p>
                      <Link to={gisFeatureHref(feature)} className="mt-0.5 block text-sm font-semibold text-[#0B3D91] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">
                        {feature.name}
                      </Link>
                      <p className="mt-1 text-xs text-[#667085]">
                        Source: {feature.datasetName || "GIS feature record"}
                        {displayYear(feature.createdAt) && ` · ${displayYear(feature.createdAt)}`}
                        {` · ${[feature.district, feature.state].filter(Boolean).join(", ")}`}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-4 grid gap-3 border-t border-[#EAECF0] pt-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase text-[#667085]">Source / methodology</p>
              <p className="mt-1 text-xs leading-5 text-[#475467]">{sourceMethodologyText}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase text-[#667085]">{confidence} confidence</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-[#667085]">Application-generated evidence assessment, not an official statistical confidence interval.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}