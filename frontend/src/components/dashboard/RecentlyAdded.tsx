import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, FileText, Loader2 } from "lucide-react";
import { loadRepositoryDocuments } from "../../lib/supabaseRepository";
import type { RepositoryDocument } from "../../types/repository";

/**
 * The newest records in the knowledge repository.
 *
 * This is a real query against `repository_documents` (which is publicly readable), not a
 * personalisation engine — the platform has no recommendation model, so nothing here claims
 * to be "recommended for you".
 */
export default function RecentlyAdded() {
  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;

    // 'Relevance' is the repository service's newest-ingested-first ordering (created_at
    // descending); it is a chronological listing, not a relevance score.
    loadRepositoryDocuments(undefined, undefined, "Relevance", 1, 4).then((result) => {
      if (!current) return;
      if (result.error) setError(result.error);
      else setDocuments(result.documents);
      setLoading(false);
    });

    return () => {
      current = false;
    };
  }, []);

  return (
    <div className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-[#1F2933]">Recently added to the repository</h2>
        <Link
          to="/repository"
          className="rounded text-sm font-medium text-[#0B3D91] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
        >
          Browse all
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-6 text-sm text-[#5A6472]" role="status">
          <Loader2 className="h-5 w-5 animate-spin text-[#0B3D91]" aria-hidden="true" />
          Loading the latest repository records
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-md border border-[#F1C6C3] bg-[#FFF7F6] p-4 text-sm text-[#9E2A22]" role="alert">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="rounded-lg border border-dashed border-[#C9D2DC] px-5 py-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-[#5A6472]" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-[#1F2933]">No repository documents yet</p>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <ul className="space-y-3">
          {documents.map((document) => (
            <li key={document.id}>
              <Link
                to={`/repository/${document.id}`}
                className="block rounded-lg border border-[#E1E5EA] p-4 transition-colors hover:border-[#0B3D91] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
              >
                <p className="line-clamp-2 text-sm font-medium text-[#1F2933]">{document.title}</p>
                <p className="mt-1 text-xs text-[#5A6472]">
                  {[document.contentType, document.institution, document.state].filter(Boolean).join(" · ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
