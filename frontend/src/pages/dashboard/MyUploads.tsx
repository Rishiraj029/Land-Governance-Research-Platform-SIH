import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Loader2, AlertCircle, Upload, ExternalLink, Calendar, Building2, MapPin, Tag
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { loadMyRepositoryDocuments } from "../../lib/supabaseRepository";
import type { RepositoryDocument } from "../../types/repository";

export default function MyUploads() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return undefined;
    let current = true;

    // created_by is filtered on the server. The previous implementation downloaded a page of
    // documents and compared a `createdBy` field the row mapper never populated, so this page
    // reported "No documents uploaded yet" even for users who had uploads.
    loadMyRepositoryDocuments(user.id, 200)
      .then((result) => {
        if (!current) return;
        if (result.error) {
          setError(result.error);
        } else {
          setDocuments(result.documents);
          setError(null);
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1F2933]">My Uploads</h1>
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-8 shadow-sm text-center">
          <AlertCircle className="h-10 w-10 text-[#D64545] mx-auto mb-3" />
          <p className="text-[#1F2933] font-medium">Sign in to view your uploads</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2933]">My Uploads</h1>
          <p className="text-[#5A6472] mt-1">
            Documents and datasets you have contributed to the repository.
          </p>
        </div>
        <Link
          to="/repository"
          className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63] transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Link>
      </div>

      {loading && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-10 shadow-sm flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91]" />
          <p className="text-sm text-[#5A6472]">Loading your uploads…</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-8 shadow-sm flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-[#D64545]" />
          <p className="text-sm font-medium text-[#1F2933]">Could not load uploads</p>
          <p className="text-xs text-[#5A6472]">{error}</p>
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-10 shadow-sm flex flex-col items-center gap-3 text-center">
          <FileText className="h-12 w-12 text-[#0B3D91]/30 mb-2" />
          <p className="text-sm font-medium text-[#1F2933]">No documents uploaded yet</p>
          <p className="text-xs text-[#5A6472] max-w-xs">
            Upload research papers, policy documents, datasets, and case studies to the repository.
          </p>
          <Link
            to="/repository"
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63] transition-colors"
          >
            <Upload className="h-4 w-4" />
            Go to Repository
          </Link>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] shadow-sm overflow-hidden">
          <div className="divide-y divide-[#E1E5EA]">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-[#F5F7FA] transition-colors">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-[#0B3D91] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/repository/${doc.id}`}
                      className="text-sm font-medium text-[#0B3D91] hover:text-[#062A63] line-clamp-2"
                    >
                      {doc.title}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5A6472]">
                      {doc.contentType && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {doc.contentType}
                        </span>
                      )}
                      {doc.institution && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {doc.institution}
                        </span>
                      )}
                      {doc.state && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {doc.state}
                        </span>
                      )}
                      {doc.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.publishedAt).getFullYear()}
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full border ${
                        doc.accessTier === "Public"
                          ? "bg-[#138808]/10 text-[#138808] border-[#138808]/20"
                          : doc.accessTier === "Restricted"
                          ? "bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/20"
                          : "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20"
                      }`}
                    >
                      {doc.accessTier}
                    </span>
                  </div>
                  <Link
                    to={`/repository/${doc.id}`}
                    className="flex-shrink-0 p-1 text-[#5A6472] hover:text-[#0B3D91]"
                    title="View document"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}