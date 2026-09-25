import { useEffect, useState } from "react";
import { X, Search, FileText, Loader2, AlertCircle } from "lucide-react";
import { loadRepositoryDocuments } from "../../lib/supabaseRepository";
import type { RepositoryDocument } from "../../types/repository";

interface AddDocumentModalProps {
  onClose: () => void;
  onSubmit: (documentId: string) => void;
}

/**
 * Pick a real repository document to link into the workspace. The selected value is the
 * repository_documents.id that workspace_documents.document_id references.
 */
export default function AddDocumentModal({ onClose, onSubmit }: AddDocumentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      setError(null);

      const result = await loadRepositoryDocuments(undefined, undefined, "Most Recent", 1, 50);

      if (result.error) {
        setError(result.error);
        setDocuments([]);
      } else {
        setDocuments(result.documents);
      }

      setIsLoading(false);
    };

    loadDocuments();
  }, []);

  const query = searchQuery.trim().toLowerCase();
  const filteredDocuments = query
    ? documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.author.toLowerCase().includes(query) ||
          doc.institution.toLowerCase().includes(query)
      )
    : documents;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDocument) {
      onSubmit(selectedDocument);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E1E5EA]">
          <h2 className="text-xl font-semibold text-[#1F2933]">Add Document from Repository</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F7FA] rounded-full text-[#5A6472]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Search */}
          <div>
            <label htmlFor="document-search" className="sr-only">
              Search repository documents
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" />
              <input
                type="text"
                id="document-search"
                placeholder="Search documents by title, author, or institution..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[#E1E5EA] bg-[#F5F7FA] py-2 pl-10 pr-4 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              />
            </div>
          </div>

          {/* Document List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91] mx-auto mb-4" />
                <p className="text-sm text-[#5A6472]">Loading repository documents...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-[#D64545] mx-auto mb-4" />
                <p className="text-sm text-[#1F2933] mb-1">Could not load repository documents</p>
                <p className="text-xs text-[#5A6472]">{error}</p>
              </div>
            )}

            {!isLoading && !error && filteredDocuments.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
                <p className="text-sm text-[#5A6472]">
                  {documents.length === 0
                    ? "No documents are available in the repository yet"
                    : "No documents found"}
                </p>
              </div>
            )}

            {!isLoading &&
              !error &&
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDocument === doc.id
                      ? "border-[#0B3D91] bg-[#0B3D91]/5"
                      : "border-[#E1E5EA] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-[#0B3D91] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-[#1F2933] line-clamp-2">{doc.title}</h4>
                      <p className="text-xs text-[#5A6472] mt-1">{doc.author}</p>
                      <p className="text-xs text-[#5A6472]">{doc.institution}</p>
                    </div>
                    {selectedDocument === doc.id && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-[#0B3D91] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E5EA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedDocument}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0B3D91] hover:bg-[#062A63] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
