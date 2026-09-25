import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Bookmark, 
  X,
  Calendar,
  MapPin,
  FileText,
  BookOpen,
  Building2,
  User,
  Loader2,
  AlertCircle
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { CONTENT_TYPES, THEMES, STATES, LANGUAGES, ACCESS_TIERS } from "../lib/mockRepositoryData";
import { loadRepositoryDocuments } from "../lib/supabaseRepository";
import type { 
  RepositoryFilters, 
  SortOption, 
  ViewMode,
  ContentType,
  Theme,
  AccessTier,
  RepositoryDocument 
} from "../types/repository";
import { useAuth } from "../hooks/useAuth";
import UploadModal from "../components/repository/UploadModal";
import Toast from "../components/ui/Toast";

export default function Repository() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("Relevance");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Data loading state
  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<RepositoryFilters>({
    contentTypes: [],
    themes: [],
    states: [],
    districts: [],
    dateRange: { from: "", to: "" },
    languages: [],
    accessTiers: [],
  });

  // Load documents from Supabase
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      const result = await loadRepositoryDocuments(
        filters,
        searchQuery,
        sortBy,
        currentPage,
        itemsPerPage
      );
      
      if (result.error) {
        setError(result.error);
        setDocuments([]);
        setTotalCount(0);
      } else {
        setDocuments(result.documents);
        setTotalCount(result.totalCount);
      }
      
      setIsLoading(false);
    };

    loadDocuments();
  }, [filters, searchQuery, sortBy, currentPage, itemsPerPage]);

  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedDocuments = documents;

  // Filter handlers
  const toggleFilter = <T extends string>(
    category: keyof RepositoryFilters,
    value: T
  ) => {
    setFilters(prev => {
      const currentArray = prev[category] as T[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [category]: newArray };
    });
    setCurrentPage(1);
    setError(null);
  };

  const clearAllFilters = () => {
    setFilters({
      contentTypes: [],
      themes: [],
      states: [],
      districts: [],
      dateRange: { from: "", to: "" },
      languages: [],
      accessTiers: [],
    });
    setSearchQuery("");
    setCurrentPage(1);
    setError(null);
  };

  const hasActiveFilters = Object.values(filters).some(
    value => Array.isArray(value) ? value.length > 0 : 
    typeof value === 'object' && value !== null ? 
    (value as any).from || (value as any).to : false
  ) || searchQuery.trim().length > 0 || currentPage > 1;

  // Bookmark handler
  const toggleBookmark = (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
        setToastMessage("Removed from saved items");
      } else {
        newSet.add(docId);
        setToastMessage("Added to saved items");
      }
      return newSet;
    });
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Contribute button handler
  const handleContribute = () => {
    if (!user) {
      navigate("/auth", { state: { from: "/repository" } });
    } else {
      setShowUploadModal(true);
    }
  };

  // Handle successful upload
  const handleUploadSuccess = () => {
    // Reload documents to show the newly uploaded one
    window.location.reload();
  };

  // Document click handler
  const handleDocumentClick = (docId: string) => {
    navigate(`/repository/${docId}`);
  };

  // Content type icon helper
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
        return <FileText className="h-4 w-4" />;
      case "Report":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Access tier badge color
  const getAccessTierColor = (tier: AccessTier) => {
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

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#1F2933] mb-2">Knowledge Repository</h1>
                <p className="text-[#5A6472] max-w-2xl">
                  Central discovery space for land-governance research, policy documents, datasets, legal documents, case studies, and reports.
                </p>
              </div>
              
              <button
                onClick={handleContribute}
                className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Contribute
              </button>
            </div>

            {/* Repository Search Bar */}
            <div className="mt-6 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" />
              <input
                type="text"
                placeholder="Search research, policy, datasets, authors, institutions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                  setError(null);
                }}
                className="w-full rounded-full border border-[#E1E5EA] bg-[#F5F7FA] py-3 pl-12 pr-4 text-base text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Left Filter Panel */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#1F2933]">Filters</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-[#0B3D91] hover:text-[#FF9933]"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Content Type Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Content Type</h3>
                  <div className="space-y-2">
                    {CONTENT_TYPES.map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.contentTypes.includes(type)}
                          onChange={() => toggleFilter("contentTypes", type as ContentType)}
                          className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-[#1F2933]">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Theme Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Theme</h3>
                  <div className="space-y-2">
                    {THEMES.map(theme => (
                      <label key={theme} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.themes.includes(theme)}
                          onChange={() => toggleFilter("themes", theme as Theme)}
                          className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-[#1F2933]">{theme}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Geography Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Geography</h3>
                  <div className="space-y-2">
                    {STATES.slice(0, 8).map(state => (
                      <label key={state} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.states.includes(state)}
                          onChange={() => toggleFilter("states", state)}
                          className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-[#1F2933]">{state}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Date Range</h3>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.dateRange.from}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, from: e.target.value } 
                      }))}
                      className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                    />
                    <input
                      type="date"
                      value={filters.dateRange.to}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, to: e.target.value } 
                      }))}
                      className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Language Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Language</h3>
                  <div className="space-y-2">
                    {LANGUAGES.slice(0, 5).map(language => (
                      <label key={language} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.languages.includes(language)}
                          onChange={() => toggleFilter("languages", language)}
                          className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-[#1F2933]">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Access Tier Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Access Tier</h3>
                  <div className="space-y-2">
                    {ACCESS_TIERS.map(tier => (
                      <label key={tier} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.accessTiers.includes(tier)}
                          onChange={() => toggleFilter("accessTiers", tier)}
                          className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-[#1F2933]">{tier}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden fixed bottom-4 right-4 z-40 rounded-full bg-[#0B3D91] p-3 text-white shadow-lg"
            >
              <Filter className="h-6 w-6" />
            </button>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
                <div className="fixed right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="p-4 border-b border-[#E1E5EA] flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[#1F2933]">Filters</h2>
                    <button onClick={() => setShowMobileFilters(false)}>
                      <X className="h-6 w-6 text-[#5A6472]" />
                    </button>
                  </div>
                  <div className="p-4 space-y-6">
                    {/* Same filter structure as desktop */}
                    <div>
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Content Type</h3>
                      <div className="space-y-2">
                        {CONTENT_TYPES.map(type => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.contentTypes.includes(type)}
                              onChange={() => toggleFilter("contentTypes", type as ContentType)}
                              className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                            />
                            <span className="text-sm text-[#1F2933]">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Theme</h3>
                      <div className="space-y-2">
                        {THEMES.map(theme => (
                          <label key={theme} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.themes.includes(theme)}
                              onChange={() => toggleFilter("themes", theme as Theme)}
                              className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                            />
                            <span className="text-sm text-[#1F2933]">{theme}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Geography</h3>
                      <div className="space-y-2">
                        {STATES.slice(0, 8).map(state => (
                          <label key={state} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.states.includes(state)}
                              onChange={() => toggleFilter("states", state)}
                              className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                            />
                            <span className="text-sm text-[#1F2933]">{state}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Access Tier</h3>
                      <div className="space-y-2">
                        {ACCESS_TIERS.map(tier => (
                          <label key={tier} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.accessTiers.includes(tier)}
                              onChange={() => toggleFilter("accessTiers", tier as AccessTier)}
                              className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                            />
                            <span className="text-sm text-[#1F2933]">{tier}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="w-full rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63]"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Results Area */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-[#5A6472]">
                    Showing {paginatedDocuments.length} of {totalCount} results
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                  >
                    <option value="Relevance">Relevance</option>
                    <option value="Most Recent">Most Recent</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex items-center border border-[#E1E5EA] rounded-md">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${viewMode === "list" ? "bg-[#0B3D91] text-white" : "text-[#5A6472] hover:bg-[#F5F7FA]"}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${viewMode === "grid" ? "bg-[#0B3D91] text-white" : "text-[#5A6472] hover:bg-[#F5F7FA]"}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results */}
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 text-[#0B3D91] mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-[#1F2933] mb-2">Loading documents...</h3>
                  <p className="text-[#5A6472]">Please wait while we fetch the repository</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-[#D64545] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#1F2933] mb-2">Error loading documents</h3>
                  <p className="text-[#5A6472] mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63]"
                  >
                    Try again
                  </button>
                </div>
              ) : paginatedDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#1F2933] mb-2">No results found</h3>
                  <p className="text-[#5A6472] mb-4">Try adjusting your search or filters</p>
                  <button
                    onClick={clearAllFilters}
                    className="rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63]"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  {viewMode === "list" ? (
                    <div className="space-y-4">
                      {paginatedDocuments.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => handleDocumentClick(doc.id)}
                          className="bg-white rounded-lg border border-[#E1E5EA] p-6 hover:border-[#0B3D91] hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getAccessTierColor(doc.accessTier)}`}>
                                  {getContentTypeIcon(doc.contentType)}
                                  {doc.contentType}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getAccessTierColor(doc.accessTier)}`}>
                                  {doc.accessTier}
                                </span>
                              </div>
                              
                              <h3 className="text-lg font-semibold text-[#1F2933] mb-2 hover:text-[#0B3D91]">
                                {doc.title}
                              </h3>
                              
                              <p className="text-sm text-[#5A6472] mb-3 line-clamp-2">
                                {doc.summary}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-3 text-xs text-[#5A6472]">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{doc.author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  <span>{doc.institution}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(doc.publishedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{doc.state}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-3">
                                <span className="text-xs px-2 py-1 bg-[#F5F7FA] rounded text-[#5A6472]">
                                  {doc.theme}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={(e) => toggleBookmark(doc.id, e)}
                                className={`p-2 rounded-md ${savedItems.has(doc.id) ? "text-[#FF9933] bg-[#FF9933]/10" : "text-[#5A6472] hover:bg-[#F5F7FA]"}`}
                              >
                                <Bookmark className={`h-5 w-5 ${savedItems.has(doc.id) ? "fill-current" : ""}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedDocuments.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => handleDocumentClick(doc.id)}
                          className="bg-white rounded-lg border border-[#E1E5EA] p-4 hover:border-[#0B3D91] hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getAccessTierColor(doc.accessTier)}`}>
                              {getContentTypeIcon(doc.contentType)}
                              {doc.contentType}
                            </span>
                            <button
                              onClick={(e) => toggleBookmark(doc.id, e)}
                              className={`p-1 rounded ${savedItems.has(doc.id) ? "text-[#FF9933]" : "text-[#5A6472] hover:bg-[#F5F7FA]"}`}
                            >
                              <Bookmark className={`h-4 w-4 ${savedItems.has(doc.id) ? "fill-current" : ""}`} />
                            </button>
                          </div>
                          
                          <h3 className="text-sm font-semibold text-[#1F2933] mb-2 line-clamp-2 hover:text-[#0B3D91]">
                            {doc.title}
                          </h3>
                          
                          <p className="text-xs text-[#5A6472] mb-3 line-clamp-2">
                            {doc.summary}
                          </p>
                          
                          <div className="flex items-center gap-1 text-xs text-[#5A6472] mb-2">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{doc.institution}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-[#5A6472] mb-3">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(doc.publishedAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs px-2 py-1 bg-[#F5F7FA] rounded text-[#5A6472]">
                              {doc.theme}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Load More / Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage >= totalPages}
                        className="px-6 py-2 rounded-md bg-[#0B3D91] text-white text-sm font-semibold hover:bg-[#062A63] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
