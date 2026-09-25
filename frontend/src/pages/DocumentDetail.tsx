import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  Lock, 
  Bookmark, 
  Download, 
  Share2, 
  Eye, 
  Calendar,
  MapPin,
  User,
  Building2,
  BookOpen,
  Copy,
  Check,
  MessageSquare,
  Brain,
  Globe,
  FileJson,
  AlertCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { loadRepositoryDocumentById, loadRelatedDocuments, getDocumentPublicUrl } from "../lib/supabaseRepository";
import type { RepositoryDocument, ContentType } from "../types/repository";
import Toast from "../components/ui/Toast";

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  
  const [document, setDocument] = useState<RepositoryDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [relatedDocuments, setRelatedDocuments] = useState<RepositoryDocument[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  // Load document from Supabase
  useEffect(() => {
    const loadDocument = async () => {
      if (!id) {
        setError("No document ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setAccessDenied(false);
      setPdfError(false);

      const result = await loadRepositoryDocumentById(id);

      if (result.error) {
        // Check if error is due to access permissions
        if (result.error.includes('permission') || result.error.includes('access')) {
          setAccessDenied(true);
          setError("You don't have permission to access this document");
        } else {
          setError(result.error);
        }
        setDocument(null);
      } else if (result.document) {
        setDocument(result.document);
        // Get document URL
        const url = getDocumentPublicUrl(result.document.filePath || null);
        setDocumentUrl(url);
        // Set loading state for PDF
        if (url && result.document.mimeType === 'application/pdf') {
          setPdfLoading(true);
        }
        // Load related documents
        const relatedResult = await loadRelatedDocuments(
          id,
          result.document.theme,
          result.document.contentType,
          result.document.state
        );
        if (!relatedResult.error) {
          setRelatedDocuments(relatedResult.documents);
        }
      } else {
        // Document not found
        setDocument(null);
      }

      setLoading(false);
    };

    loadDocument();
  }, [id]);

  // Get content type icon
  const getContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case "Research Paper":
        return <FileText className="h-4 w-4" />;
      case "Policy Document":
        return <BookOpen className="h-4 w-4" />;
      case "Legal Document":
        return <BookOpen className="h-4 w-4" />;
      case "Case Study":
        return <FileText className="h-4 w-4" />;
      case "Dataset":
        return <FileJson className="h-4 w-4" />;
      case "Report":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get access tier color
  const getAccessTierColor = (tier: string) => {
    switch (tier) {
      case "Public":
        return "bg-[#138808]/10 text-[#138808] border-[#138808]/20";
      case "Restricted":
        return "bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/20";
      case "Government-Only":
        return "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Bookmark handler
  const toggleBookmark = () => {
    setBookmarked(prev => !prev);
    setToastMessage(bookmarked ? "Removed from saved items" : "Added to saved items");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Download handler
  const handleDownload = () => {
    if (documentUrl) {
      // Open in new tab for download
      window.open(documentUrl, '_blank');
      setToastMessage("Opening document for download");
    } else {
      setToastMessage("Document file not available");
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Share handler
  const handleShare = async () => {
    const shareData = {
      title: document?.title || "Document",
      text: document?.description || "",
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setToastMessage("Shared successfully");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMessage("Link copied to clipboard");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Copy citation
  const copyCitation = () => {
    if (!document) return;
    
    const citation = `${document.author}. (${new Date(document.publishedAt).getFullYear()}). ${document.title}. ${document.institution}.`;
    navigator.clipboard.writeText(citation);
    setCopySuccess(true);
    setToastMessage("Citation copied to clipboard");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setCopySuccess(false);
    }, 3000);
  };

  // AI action handler
  const handleAIAction = (action: string) => {
    setToastMessage(`AI Research Assistant will be connected during backend integration for: ${action}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91] mx-auto mb-4" />
            <p className="text-[#5A6472]">Loading document...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg border border-[#E1E5EA] p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-[#E8A33D]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="h-8 w-8 text-[#E8A33D]" />
                </div>
                
                <h1 className="text-2xl font-bold text-[#1F2933] mb-4">
                  Access Restricted
                </h1>
                
                <p className="text-[#5A6472] mb-6">
                  This document requires additional permissions to access. Please sign in or contact the document owner for access.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0B3D91] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#062A63]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/repository"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#E1E5EA] px-6 py-2.5 text-sm font-semibold text-[#1F2933] hover:bg-[#F5F7FA]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Return to Repository
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg border border-[#E1E5EA] p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-[#D64545]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-8 w-8 text-[#D64545]" />
                </div>
                
                <h1 className="text-2xl font-bold text-[#1F2933] mb-4">
                  Error Loading Document
                </h1>
                
                <p className="text-[#5A6472] mb-6">
                  {error}
                </p>

                <Link
                  to="/repository"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#062A63]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Repository
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (!document) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg border border-[#E1E5EA] p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-[#D64545]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-8 w-8 text-[#D64545]" />
                </div>
                
                <h1 className="text-2xl font-bold text-[#1F2933] mb-4">
                  Document Not Found
                </h1>
                
                <p className="text-[#5A6472] mb-6">
                  The document you're looking for doesn't exist or has been removed.
                </p>

                <Link
                  to="/repository"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#062A63]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Repository
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#5A6472] mb-6">
            <Link to="/" className="hover:text-[#0B3D91]">Home</Link>
            <span>/</span>
            <Link to="/repository" className="hover:text-[#0B3D91]">Repository</Link>
            <span>/</span>
            <span className="text-[#1F2933] font-medium truncate max-w-xs">
              {document.title}
            </span>
          </nav>

          {/* Document Header */}
          <div className="bg-white rounded-lg border border-[#E1E5EA] p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                {/* Content Type and Access Tier Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getAccessTierColor(document.accessTier)}`}>
                    {getContentTypeIcon(document.contentType)}
                    {document.contentType}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAccessTierColor(document.accessTier)}`}>
                    {document.accessTier}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#F5F7FA] text-[#5A6472]">
                    <Globe className="h-3 w-3" />
                    {document.language}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-[#1F2933] mb-3">
                  {document.title}
                </h1>

                {/* Description */}
                <p className="text-[#5A6472] mb-4">
                  {document.description}
                </p>

                {/* Author and Institution */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#5A6472] mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{document.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{document.institution}</span>
                  </div>
                </div>

                {/* Publication Date and Geography */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#5A6472]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Published: {new Date(document.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{document.state}{document.district ? `, ${document.district}` : ""}</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-md border ${bookmarked ? "border-[#FF9933] text-[#FF9933] bg-[#FF9933]/10" : "border-[#E1E5EA] text-[#5A6472] hover:bg-[#F5F7FA]"}`}
                  title="Bookmark"
                >
                  <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-md border border-[#E1E5EA] text-[#5A6472] hover:bg-[#F5F7FA]"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-md border border-[#E1E5EA] text-[#5A6472] hover:bg-[#F5F7FA]"
                  title="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleAIAction("document analysis")}
                  className="p-2 rounded-md border border-[#E1E5EA] text-[#5A6472] hover:bg-[#F5F7FA]"
                  title="Open in AI Research Assistant"
                >
                  <Brain className="h-5 w-5" />
                </button>
                <Link
                  to="/repository"
                  className="p-2 rounded-md border border-[#E1E5EA] text-[#5A6472] hover:bg-[#F5F7FA]"
                  title="Back to Repository"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Stats - Only show if we have real data, otherwise hide */}
            {(document.views || 0) > 0 || (document.downloads || 0) > 0 || (document.citations || 0) > 0 ? (
              <div className="flex items-center gap-6 pt-4 mt-4 border-t border-[#E1E5EA] text-sm text-[#5A6472]">
                {(document.views || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{document.views} views</span>
                  </div>
                )}
                {(document.downloads || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>{document.downloads} downloads</span>
                  </div>
                )}
                {(document.citations || 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{document.citations} citations</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary / Abstract */}
              <div className="bg-white rounded-lg border border-[#E1E5EA] p-6">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Summary</h2>
                <p className="text-[#5A6472] leading-relaxed">
                  {document.summary}
                </p>
              </div>

              {/* Document Preview Area */}
              <div className="bg-white rounded-lg border border-[#E1E5EA] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#1F2933]">Document Preview</h2>
                  {documentUrl && document.mimeType === 'application/pdf' && (
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#0B3D91] hover:text-[#FF9933]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in new tab
                    </a>
                  )}
                </div>

                <div className="border border-[#E1E5EA] rounded-lg bg-[#F5F7FA]">
                  {documentUrl && document.mimeType === 'application/pdf' ? (
                    /* PDF Viewer */
                    <div className="relative" style={{ height: '600px' }}>
                      {pdfLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#F5F7FA]">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91] mx-auto mb-4" />
                            <p className="text-[#5A6472]">Loading document...</p>
                          </div>
                        </div>
                      )}
                      {pdfError ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#F5F7FA]">
                          <div className="text-center p-8">
                            <AlertCircle className="h-12 w-12 text-[#D64545] mx-auto mb-4" />
                            <p className="text-[#5A6472] mb-4">Unable to load document preview</p>
                            <a
                              href={documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[#0B3D91] hover:text-[#FF9933]"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open in new tab
                            </a>
                          </div>
                        </div>
                      ) : (
                        <iframe
                          src={documentUrl}
                          className="w-full h-full border-0"
                          title="Document Preview"
                          onLoad={() => setPdfLoading(false)}
                          onError={() => {
                            setPdfLoading(false);
                            setPdfError(true);
                          }}
                        />
                      )}
                    </div>
                  ) : documentUrl ? (
                    /* Non-PDF Document Preview */
                    <div className="aspect-[3/4] flex flex-col items-center justify-center p-8">
                      <FileText className="h-16 w-16 text-[#0B3D91]/30 mb-4" />
                      <p className="text-[#5A6472] text-center mb-2">{document.title}</p>
                      <p className="text-xs text-[#5A6472]/70 mb-4">
                        Document type: {document.mimeType || 'Unknown'}
                      </p>
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B3D91] text-white rounded-md hover:bg-[#062A63]"
                      >
                        <Download className="h-4 w-4" />
                        Download Document
                      </a>
                    </div>
                  ) : (
                    /* No File Available */
                    <div className="aspect-[3/4] flex flex-col items-center justify-center p-8">
                      <FileText className="h-16 w-16 text-[#0B3D91]/30 mb-4" />
                      <p className="text-[#5A6472] text-center mb-2">{document.title}</p>
                      <p className="text-xs text-[#5A6472]/70">Document file not available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Findings / Highlights */}
              <div className="bg-white rounded-lg border border-[#E1E5EA] p-6">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Key Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#1F2933] mb-2">Policy Relevance</h3>
                    <p className="text-sm text-[#5A6472]">
                      This document provides evidence-based insights relevant to land governance policy formulation and implementation.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#1F2933] mb-2">Geographic Coverage</h3>
                    <p className="text-sm text-[#5A6472]">
                      {document.state}{document.district ? ` (${document.district} district)` : ""} with potential applicability to similar regions.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#1F2933] mb-2">Research Focus</h3>
                    <p className="text-sm text-[#5A6472]">
                      Addresses key theme: {document.theme}.
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Action Panel */}
              <div className="bg-gradient-to-r from-[#0B3D91]/5 to-[#FF9933]/5 rounded-lg border border-[#E1E5EA] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-[#0B3D91]" />
                  <h2 className="text-lg font-semibold text-[#1F2933]">Explore with AI</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAIAction("ask about this document")}
                    className="flex items-center gap-2 p-3 rounded-md bg-white border border-[#E1E5EA] hover:border-[#0B3D91] text-left transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-[#0B3D91]" />
                    <span className="text-sm text-[#1F2933]">Ask about this document</span>
                  </button>
                  <button
                    onClick={() => handleAIAction("summarize this document")}
                    className="flex items-center gap-2 p-3 rounded-md bg-white border border-[#E1E5EA] hover:border-[#0B3D91] text-left transition-colors"
                  >
                    <FileText className="h-4 w-4 text-[#0B3D91]" />
                    <span className="text-sm text-[#1F2933]">Summarize this document</span>
                  </button>
                  <button
                    onClick={() => handleAIAction("find related research")}
                    className="flex items-center gap-2 p-3 rounded-md bg-white border border-[#E1E5EA] hover:border-[#0B3D91] text-left transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-[#0B3D91]" />
                    <span className="text-sm text-[#1F2933]">Find related research</span>
                  </button>
                  <button
                    onClick={() => handleAIAction("compare with other documents")}
                    className="flex items-center gap-2 p-3 rounded-md bg-white border border-[#E1E5EA] hover:border-[#0B3D91] text-left transition-colors"
                  >
                    <Brain className="h-4 w-4 text-[#0B3D91]" />
                    <span className="text-sm text-[#1F2933]">Compare with other documents</span>
                  </button>
                </div>
              </div>

              {/* Related Documents */}
              {relatedDocuments.length > 0 && (
                <div className="bg-white rounded-lg border border-[#E1E5EA] p-6">
                  <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Related Documents</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {relatedDocuments.map(relatedDoc => (
                      <Link
                        key={relatedDoc.id}
                        to={`/repository/${relatedDoc.id}`}
                        className="block p-4 rounded-lg border border-[#E1E5EA] hover:border-[#0B3D91] hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getAccessTierColor(relatedDoc.accessTier)}`}>
                            {getContentTypeIcon(relatedDoc.contentType)}
                            {relatedDoc.contentType}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#1F2933] mb-2 line-clamp-2 hover:text-[#0B3D91]">
                          {relatedDoc.title}
                        </h3>
                        <p className="text-xs text-[#5A6472] mb-2">{relatedDoc.institution}</p>
                        <div className="flex flex-wrap gap-1">
                          <span
                            className="text-xs px-2 py-0.5 bg-[#F5F7FA] rounded text-[#5A6472]"
                          >
                            {relatedDoc.theme}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Key Metadata */}
              <div className="bg-white rounded-lg border border-[#E1E5EA] p-6">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Key Metadata</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-[#5A6472]">Author</span>
                    <span className="text-sm text-[#1F2933] text-right max-w-[150px]">{document.author}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-[#5A6472]">Institution</span>
                    <span className="text-sm text-[#1F2933] text-right max-w-[150px]">{document.institution}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-[#5A6472]">Content Type</span>
                    <span className="text-sm text-[#1F2933] text-right">{document.contentType}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-[#5A6472]">Language</span>
                    <span className="text-sm text-[#1F2933] text-right">{document.language}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-[#5A6472]">State</span>
                    <span className="text-sm text-[#1F2933] text-right">{document.state}</span>
                  </div>
                  {document.district && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-[#5A6472]">District</span>
                      <span className="text-sm text-[#1F2933] text-right">{document.district}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-[#5A6472]">Published</span>
                    <span className="text-sm text-[#1F2933] text-right">{new Date(document.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-[#5A6472]">Access Tier</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${getAccessTierColor(document.accessTier)}`}>
                      {document.accessTier}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-[#5A6472]">Citations</span>
                    <span className="text-sm text-[#1F2933] text-right">{document.citations}</span>
                  </div>
                </div>
              </div>

              {/* Themes / Tags */}
              <div className="bg-white rounded-lg border border-[#E1E5EA] p-6">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Theme</h2>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="text-xs px-3 py-1.5 bg-[#0B3D91]/10 text-[#0B3D91] rounded-full"
                  >
                    {document.theme}
                  </span>
                </div>
              </div>

              {/* Access Information */}
              <div className="bg-white rounded-lg border border-[#E1E5EA] p-6">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Access Information</h2>
                <div className={`p-4 rounded-lg ${getAccessTierColor(document.accessTier)}`}>
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1F2933]">{document.accessTier} Access</p>
                      <p className="text-sm mt-1">
                        {document.accessTier === "Public" && "This document is publicly accessible to all users."}
                        {document.accessTier === "Restricted" && "This document is accessible to verified researchers and institutions."}
                        {document.accessTier === "Government-Only" && "This document is accessible only to government officials with appropriate clearance."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Citation */}
              <div className="bg-white rounded-lg border border-[#E1E5EA] p-6">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Citation</h2>
                <div className="bg-[#F5F7FA] rounded p-3 text-sm text-[#5A6472] mb-3">
                  {document.author}. ({new Date(document.publishedAt).getFullYear()}). {document.title}. {document.institution}.
                </div>
                <button
                  onClick={copyCitation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-[#E1E5EA] text-sm font-medium text-[#1F2933] hover:bg-[#F5F7FA] transition-colors"
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-4 w-4 text-[#138808]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Citation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Toast Notification */}
      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
