import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  Lock, 
  Bookmark, 
  Download, 
  Share2, 
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
  ExternalLink,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
  loadRepositoryDocumentById,
  loadRelatedDocuments,
  loadRepositoryDocuments,
  resolveDocumentFileUrl,
  loadBookmarkedDocumentIds,
  addDocumentBookmark,
  removeDocumentBookmark,
} from "../lib/supabaseRepository";
import { askRepositoryAi, MAX_AI_CONTEXT_DOCUMENTS, type AiSupportingDocument } from "../lib/aiSearch";
import { useAuth } from "../hooks/useAuth";
import type { RepositoryDocument, ContentType } from "../types/repository";
import Toast from "../components/ui/Toast";
import AddToWorkspaceModal from "../components/repository/AddToWorkspaceModal";
import PolicyProposalWorkspace from "../components/repository/PolicyProposalWorkspace";

/** The AI analyses offered for a single repository document. */
type DocumentAiAction = "summarize" | "related" | "compare" | "ask";

const AI_ACTION_LABELS: Record<DocumentAiAction, string> = {
  summarize: "Summarize this document",
  related: "Find related research",
  compare: "Compare with other documents",
  ask: "Ask about this document",
};

/** One-click analyses shown beside the free-text question box. */
const AI_QUICK_ACTIONS: { action: DocumentAiAction; label: string; icon: typeof FileText }[] = [
  { action: "summarize", label: AI_ACTION_LABELS.summarize, icon: FileText },
  { action: "related", label: AI_ACTION_LABELS.related, icon: BookOpen },
  { action: "compare", label: AI_ACTION_LABELS.compare, icon: Brain },
];

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
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
  const [fileUnreachable, setFileUnreachable] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showPolicyProposal, setShowPolicyProposal] = useState(false);

  // --- AI document analysis (Gemini, proxied through the backend) ---
  const [aiLoading, setAiLoading] = useState(false);
  const [aiActiveAction, setAiActiveAction] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiDisclaimer, setAiDisclaimer] = useState("");
  const [aiSupporting, setAiSupporting] = useState<AiSupportingDocument[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const aiPanelRef = useRef<HTMLDivElement | null>(null);
  const aiQuestionRef = useRef<HTMLInputElement | null>(null);

  // Load document from Supabase
  useEffect(() => {
    let isCurrent = true;

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
      setFileUnreachable(false);

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
        // Resolve the file URL: full government URLs pass through, private-bucket
        // storage paths are signed (a public URL is refused for a private bucket).
        const url = await resolveDocumentFileUrl(result.document.filePath || null);
        if (!isCurrent) return;
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

      if (isCurrent) {
        setLoading(false);
      }
    };

    loadDocument();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  // An external PDF whose host is unreachable never fires the iframe's onLoad, which
  // used to leave the "Loading document..." overlay spinning forever. Fail over to the
  // existing error state (which offers "Open in new tab") once the load times out.
  useEffect(() => {
    if (!pdfLoading) return;

    const timer = setTimeout(() => {
      setPdfLoading(false);
      setPdfError(true);
      setFileUnreachable(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, [pdfLoading]);

  // Load this document's saved (bookmarked) state for the signed-in user.
  useEffect(() => {
    let isCurrent = true;

    if (!user || !id) {
      setBookmarked(false);
      return;
    }

    const loadBookmarkState = async () => {
      const result = await loadBookmarkedDocumentIds(user.id);
      if (!isCurrent || result.error) return;
      setBookmarked(result.ids.includes(id));
    };

    loadBookmarkState();

    return () => {
      isCurrent = false;
    };
  }, [user, id]);

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

  // Bookmark handler — persists to public.document_bookmarks through Supabase
  const toggleBookmark = async () => {
    if (!user || !id) {
      setToastMessage("Sign in to save documents to your account");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const wasSaved = bookmarked;

    // Optimistic update; reverted if Supabase rejects the change (for example by RLS).
    setBookmarked(!wasSaved);

    const result = wasSaved
      ? await removeDocumentBookmark(user.id, id)
      : await addDocumentBookmark(user.id, id);

    if (result.error) {
      setBookmarked(wasSaved);
      setToastMessage(result.error);
    } else {
      setToastMessage(wasSaved ? "Removed from saved documents" : "Added to saved documents");
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Download handler — only ever opens a real file URL (never a fabricated one).
  const handleDownload = () => {
    if (!documentUrl) {
      setToastMessage("Document file not available");
    } else if (fileUnreachable) {
      // The preview already timed out, so opening the URL would just hang in a new tab.
      setToastMessage("The document source is not responding — the file may be unavailable");
    } else if (document && document.accessTier !== "Public" && !user) {
      setToastMessage("Sign in with an authorised account to download this document");
    } else {
      // Open in new tab for download
      window.open(documentUrl, '_blank');
      setToastMessage("Opening document for download");
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

  // --- AI document analysis -------------------------------------------------
  // Every AI control runs the same grounded flow: this document (plus, for the two
  // comparative actions, real same-theme repository records) is sent to the backend as
  // IDs, the server re-verifies those IDs against Supabase and asks Gemini. Nothing is
  // fabricated — if the service is unavailable the panel shows the real error.

  /** Real same-theme repository rows used as context for the comparative actions. */
  const loadCompanionDocumentIds = async (source: RepositoryDocument): Promise<string[]> => {
    const result = await loadRepositoryDocuments(
      source.theme ? { themes: [source.theme] } : undefined,
      undefined,
      "Most Recent",
      1,
      MAX_AI_CONTEXT_DOCUMENTS
    );
    if (result.error) return [];
    return result.documents
      .filter((candidate) => candidate.id !== source.id)
      .slice(0, MAX_AI_CONTEXT_DOCUMENTS - 1)
      .map((candidate) => candidate.id);
  };

  /**
   * Prompt text per action. The target document is named by TITLE rather than by position:
   * PostgREST does not guarantee that rows come back in the order their IDs were requested,
   * so telling Gemini that "[1] is this document" would not be reliable.
   */
  const buildAiPrompt = (action: DocumentAiAction, source: RepositoryDocument, question: string): string => {
    const title = `"${source.title}"`;
    switch (action) {
      case "ask":
        return question;
      case "related":
        return `The supplied repository records include the document titled ${title} alongside other documents. Identify which of the OTHER documents are most relevant when researching ${title}, and explain what they have in common. Refer to documents by their numbered markers.`;
      case "compare":
        return `Compare the document titled ${title} with the other supplied repository documents. Summarise the similarities and differences in theme, geographic coverage, and research focus. Refer to documents by their numbered markers.`;
      case "summarize":
      default:
        return `Summarise the repository document titled ${title} for a land-governance researcher: its subject, geographic focus, and main points.`;
    }
  };

  const runDocumentAi = async (action: DocumentAiAction, question: string = aiQuestion) => {
    if (!document || aiLoading) return;

    const trimmedQuestion = question.trim();
    if (action === "ask" && !trimmedQuestion) {
      setAiError("Type a question about this document, then choose Ask.");
      aiQuestionRef.current?.focus();
      return;
    }

    setAiError(null);
    setAiAnswer("");
    setAiDisclaimer("");
    setAiSupporting([]);
    setAiActiveAction(AI_ACTION_LABELS[action]);
    setAiLoading(true);

    try {
      let documentIds = [document.id];
      if (action === "related" || action === "compare") {
        documentIds = [document.id, ...(await loadCompanionDocumentIds(document))];
      }
      const result = await askRepositoryAi(buildAiPrompt(action, document, trimmedQuestion), documentIds);
      setAiAnswer(result.answer);
      setAiDisclaimer(result.disclaimer);
      setAiSupporting(result.supportingDocuments);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI analysis is currently unavailable.");
    } finally {
      setAiLoading(false);
      setAiActiveAction("");
    }
  };

  /** Toolbar brain button: bring the AI panel into view and place the cursor in the question box. */
  const focusAiPanel = () => {
    aiPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    aiQuestionRef.current?.focus({ preventScroll: true });
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

  // Metadata access is enforced by Postgres RLS. File URLs come from a public storage
  // bucket, so non-public documents only expose their file to signed-in users.
  const fileAccessible = document.accessTier === "Public" || Boolean(user);

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
                  type="button"
                  onClick={() => setShowPolicyProposal(true)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#0B3D91] bg-white px-3 py-2 text-sm font-semibold text-[#0B3D91] hover:bg-[#F0F5FC] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                >
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  Convert to Policy Proposal
                </button>
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
                  onClick={() => {
                    if (!user) {
                      setToastMessage("Sign in to add documents to a workspace");
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                      return;
                    }
                    setShowWorkspaceModal(true);
                  }}
                  className="p-2 rounded-md border border-[#E1E5EA] text-[#5A6472] hover:bg-[#F5F7FA]"
                  title="Add to Workspace"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-plus"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
                </button>
                <button
                  type="button"
                  onClick={focusAiPanel}
                  className="p-2 rounded-md border border-[#E1E5EA] text-[#5A6472] hover:bg-[#F5F7FA]"
                  title="Open in AI Research Assistant"
                  aria-label="Open in AI Research Assistant"
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
                  {documentUrl && fileAccessible && document.mimeType === 'application/pdf' && (
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
                  {documentUrl && fileAccessible && document.mimeType === 'application/pdf' ? (
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
                  ) : documentUrl && fileAccessible ? (
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
                    /* No File Available or Access Restricted */
                    <div className="aspect-[3/4] flex flex-col items-center justify-center p-8">
                      <FileText className="h-16 w-16 text-[#0B3D91]/30 mb-4" />
                      <p className="text-[#5A6472] text-center mb-2">{document.title}</p>
                      <p className="text-xs text-[#5A6472]/70">
                        {documentUrl
                          ? "Sign in with an authorised account to access this document"
                          : "Document file not available"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Some government sites refuse to be embedded (X-Frame-Options: SAMEORIGIN), in
                  which case the iframe stays blank without firing an error. Point the user at
                  the new-tab action instead of leaving them stuck on a blank preview. */}
              {documentUrl && fileAccessible && document.mimeType === 'application/pdf' && /^https?:\/\//i.test(documentUrl) && (
                <p className="mt-3 text-xs text-[#5A6472]">
                  Some government sites block embedding. If the preview stays blank, use{" "}
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0B3D91] underline hover:text-[#FF9933]"
                  >
                    open in a new tab
                  </a>
                  .
                </p>
              )}

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
              <div
                ref={aiPanelRef}
                className="scroll-mt-24 rounded-lg border border-[#E1E5EA] bg-gradient-to-r from-[#0B3D91]/5 to-[#FF9933]/5 p-6"
              >
                <div className="mb-1 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#0B3D91]" />
                  <h2 className="text-lg font-semibold text-[#1F2933]">Explore with AI</h2>
                </div>
                <p className="mb-4 text-sm text-[#5A6472]">
                  Ask a question about this document or run a prepared analysis. Answers are generated by Gemini from
                  the repository record only.
                </p>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void runDocumentAi("ask");
                  }}
                >
                  <label htmlFor="document-ai-question" className="mb-1.5 block text-sm font-medium text-[#344054]">
                    Ask about this document
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="document-ai-question"
                      ref={aiQuestionRef}
                      type="text"
                      value={aiQuestion}
                      maxLength={1000}
                      onChange={(event) => setAiQuestion(event.target.value)}
                      placeholder="e.g. What tenure issues does this document raise?"
                      className="min-h-11 min-w-0 flex-1 rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#1F2933] outline-none placeholder:text-[#98A2B3] focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                    >
                      {aiLoading && aiActiveAction === AI_ACTION_LABELS.ask ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      )}
                      Ask
                    </button>
                  </div>
                </form>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {AI_QUICK_ACTIONS.map(({ action, label, icon: ActionIcon }) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => void runDocumentAi(action)}
                      disabled={aiLoading}
                      className="flex items-center gap-2 rounded-md border border-[#E1E5EA] bg-white p-3 text-left transition-colors hover:border-[#0B3D91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] disabled:cursor-wait disabled:opacity-60"
                    >
                      {aiLoading && aiActiveAction === label ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#0B3D91]" aria-hidden="true" />
                      ) : (
                        <ActionIcon className="h-4 w-4 shrink-0 text-[#0B3D91]" aria-hidden="true" />
                      )}
                      <span className="text-sm text-[#1F2933]">{label}</span>
                    </button>
                  ))}
                </div>

                {aiLoading && (
                  <div
                    role="status"
                    className="mt-4 flex items-center gap-3 rounded-md border border-[#D7E2F3] bg-white p-4 text-sm text-[#475467]"
                  >
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#0B3D91]" aria-hidden="true" />
                    {aiActiveAction}: reviewing repository documents and generating a grounded answer...
                  </div>
                )}

                {aiError && !aiLoading && (
                  <p
                    role="alert"
                    className="mt-4 flex items-start gap-2 rounded-md border border-[#F1C6C3] bg-[#FFF7F6] p-4 text-sm text-[#9E2A22]"
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{aiError}</span>
                  </p>
                )}

                {aiAnswer && !aiLoading && (
                  <section
                    aria-labelledby="document-ai-answer-heading"
                    className="mt-4 rounded-md border border-[#D7E2F3] bg-white p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#0B3D91]" aria-hidden="true" />
                      <h3 id="document-ai-answer-heading" className="text-base font-semibold text-[#1F2933]">
                        AI Research Summary
                      </h3>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#344054]">{aiAnswer}</p>
                    <p className="mt-3 border-t border-[#D7E2F3] pt-3 text-xs text-[#667085]">{aiDisclaimer}</p>
                    {aiSupporting.length > 0 && (
                      <div className="mt-4 border-t border-[#D7E2F3] pt-4">
                        <h4 className="mb-2 text-sm font-semibold text-[#1F2933]">Supporting Documents</h4>
                        <ul className="space-y-2">
                          {aiSupporting.map((supporting) => (
                            <li
                              key={supporting.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#DCE2E8] px-3 py-2"
                            >
                              <Link
                                to={`/repository/${supporting.id}`}
                                className="min-w-0 text-sm font-medium text-[#0B3D91] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                              >
                                {supporting.title}
                              </Link>
                              <span className="text-xs text-[#667085]">
                                {[supporting.contentType, supporting.state].filter(Boolean).join(" · ")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}
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

      {showPolicyProposal && document && (
        <PolicyProposalWorkspace
          key={document.id}
          document={document}
          onClose={() => setShowPolicyProposal(false)}
        />
      )}

      {showWorkspaceModal && document && (
        <AddToWorkspaceModal
          documentId={document.id}
          onClose={() => setShowWorkspaceModal(false)}
          onSuccess={() => {
            setShowWorkspaceModal(false);
            setToastMessage("Document added to workspace successfully");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          }}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
