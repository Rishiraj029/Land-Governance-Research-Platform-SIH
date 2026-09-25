import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Search, 
  X, 
  Filter, 
  Bookmark, 
  Calendar,
  MapPin,
  FileText,
  BookOpen,
  Building2,
  User,
  ChevronDown,
  Clock,
  Star,
  Sparkles,
  AlertCircle,
  TrendingUp,
  XCircle,
  Brain
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { MOCK_REPOSITORY_DATA, CONTENT_TYPES, THEMES, STATES, ACCESS_TIERS } from "../lib/mockRepositoryData";
import type { 
  RepositoryDocument, 
  RepositoryFilters, 
  ContentType,
  Theme,
  AccessTier 
} from "../types/repository";
import Toast from "../components/ui/Toast";

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

interface SavedSearchItem {
  query: string;
  filters: RepositoryFilters;
  timestamp: number;
}

const SUGGESTED_QUESTIONS = [
  "Land use change and urbanization",
  "Climate resilient land governance",
  "Digital land records",
  "Land dispute resolution",
  "Tenure security",
  "Geospatial land governance"
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  
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
  
  const [sortBy, setSortBy] = useState<"Relevance" | "Most Recent" | "Most Downloaded" | "Most Cited">("Relevance");

  // Load search history and saved searches from localStorage
  useEffect(() => {
    try {
      const history = localStorage.getItem("searchHistory");
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
      
      const saved = localStorage.getItem("savedSearches");
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistoryItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now()
    };
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.query !== query.trim());
      const updated = [newHistoryItem, ...filtered].slice(0, 10);
      localStorage.setItem("searchHistory", JSON.stringify(updated));
      return updated;
    });
  };

  // Save current search
  const saveCurrentSearch = () => {
    if (!searchQuery.trim()) return;
    
    const newSavedSearch: SavedSearchItem = {
      query: searchQuery.trim(),
      filters,
      timestamp: Date.now()
    };
    
    setSavedSearches(prev => {
      const filtered = prev.filter(item => item.query !== searchQuery.trim());
      const updated = [newSavedSearch, ...filtered].slice(0, 10);
      localStorage.setItem("savedSearches", JSON.stringify(updated));
      return updated;
    });
    
    setToastMessage("Search saved successfully");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Remove from history
  const removeFromHistory = (query: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => item.query !== query);
      localStorage.setItem("searchHistory", JSON.stringify(updated));
      return updated;
    });
  };

  // Remove saved search
  const removeSavedSearch = (query: string) => {
    setSavedSearches(prev => {
      const updated = prev.filter(item => item.query !== query);
      localStorage.setItem("savedSearches", JSON.stringify(updated));
      return updated;
    });
  };

  // Clear all history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  // Execute search
  const executeSearch = (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
    saveToHistory(query);
    setShowHistory(false);
  };

  // Execute saved search
  const executeSavedSearch = (savedSearch: SavedSearchItem) => {
    setSearchQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    setHasSearched(true);
    setShowSavedSearches(false);
  };

  // Filter toggle
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
  };

  // Clear all filters
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
  };

  // Local relevance scoring
  const calculateRelevance = (doc: RepositoryDocument, query: string): number => {
    if (!query.trim()) return 0;
    
    const queryLower = query.toLowerCase();
    let score = 0;
    
    // Title match (highest weight)
    if (doc.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // Description match
    if (doc.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // Summary match
    if (doc.summary.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // Theme match
    if (doc.theme.toLowerCase().includes(queryLower) || queryLower.includes(doc.theme.toLowerCase())) {
      score += 3;
    }
    
    // Geography match
    if (doc.state.toLowerCase().includes(queryLower) || queryLower.includes(doc.state.toLowerCase())) {
      score += 3;
    }
    
    // Institution match
    if (doc.institution.toLowerCase().includes(queryLower)) {
      score += 2;
    }
    
    // Author match
    if (doc.author.toLowerCase().includes(queryLower)) {
      score += 2;
    }
    
    return score;
  };

  // Filter and search results
  const searchResults = useMemo(() => {
    let results = [...MOCK_REPOSITORY_DATA];

    // Apply search query
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      results = results.filter(doc => 
        doc.title.toLowerCase().includes(queryLower) ||
        doc.author.toLowerCase().includes(queryLower) ||
        doc.institution.toLowerCase().includes(queryLower) ||
        doc.description.toLowerCase().includes(queryLower) ||
        doc.summary.toLowerCase().includes(queryLower) ||
        doc.theme.toLowerCase().includes(queryLower) ||
        doc.state.toLowerCase().includes(queryLower)
      );
    }

    // Apply filters
    if (filters.contentTypes.length > 0) {
      results = results.filter(doc => filters.contentTypes.includes(doc.contentType));
    }

    if (filters.themes.length > 0) {
      results = results.filter(doc => 
        filters.themes.includes(doc.theme)
      );
    }

    if (filters.states.length > 0) {
      results = results.filter(doc => filters.states.includes(doc.state));
    }

    if (filters.dateRange.from || filters.dateRange.to) {
      results = results.filter(doc => {
        const docDate = new Date(doc.publishedAt);
        if (filters.dateRange.from && docDate < new Date(filters.dateRange.from)) return false;
        if (filters.dateRange.to && docDate > new Date(filters.dateRange.to)) return false;
        return true;
      });
    }

    if (filters.languages.length > 0) {
      results = results.filter(doc => filters.languages.includes(doc.language));
    }

    if (filters.accessTiers.length > 0) {
      results = results.filter(doc => filters.accessTiers.includes(doc.accessTier));
    }

    // Apply sorting
    switch (sortBy) {
      case "Most Recent":
        results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case "Most Downloaded":
        results.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case "Most Cited":
        results.sort((a, b) => (b.citations || 0) - (a.citations || 0));
        break;
      case "Relevance":
      default:
        results.sort((a, b) => calculateRelevance(b, searchQuery) - calculateRelevance(a, searchQuery));
        break;
    }

    return results;
  }, [searchQuery, filters, sortBy]);

  // Calculate match reasons for a document
  const getMatchReasons = (doc: RepositoryDocument, query: string): string[] => {
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase();
    const reasons: string[] = [];
    
    if (doc.title.toLowerCase().includes(queryLower)) {
      reasons.push("Title contains search term");
    }
    
    if (doc.theme.toLowerCase().includes(queryLower) || queryLower.includes(doc.theme.toLowerCase())) {
      reasons.push("Matches your theme");
    }
    
    if (doc.state.toLowerCase().includes(queryLower) || queryLower.includes(doc.state.toLowerCase())) {
      reasons.push("Matches your geography");
    }
    
    if (doc.description.toLowerCase().includes(queryLower) || doc.summary.toLowerCase().includes(queryLower)) {
      reasons.push("Content matches search");
    }
    
    if (doc.institution.toLowerCase().includes(queryLower)) {
      reasons.push("From matched institution");
    }
    
    return reasons.slice(0, 3);
  };

  // Derive search interpretation from query and results
  const searchInterpretation = useMemo(() => {
    if (!searchQuery.trim() || searchResults.length === 0) {
      return null;
    }
    
    const queryLower = searchQuery.toLowerCase();
    const matchedThemes = new Set<Theme>();
    const matchedStates = new Set<string>();
    const matchedTypes = new Set<ContentType>();
    
    searchResults.forEach(doc => {
      if (doc.theme.toLowerCase().includes(queryLower) || queryLower.includes(doc.theme.toLowerCase())) {
        matchedThemes.add(doc.theme);
      }
      
      if (doc.state.toLowerCase().includes(queryLower) || queryLower.includes(doc.state.toLowerCase())) {
        matchedStates.add(doc.state);
      }
      
      if (doc.contentType.toLowerCase().includes(queryLower) || queryLower.includes(doc.contentType.toLowerCase())) {
        matchedTypes.add(doc.contentType);
      }
    });
    
    return {
      themes: Array.from(matchedThemes).slice(0, 3),
      states: Array.from(matchedStates).slice(0, 2),
      types: Array.from(matchedTypes).slice(0, 2)
    };
  }, [searchQuery, searchResults]);

  // Calculate results summary
  const resultsSummary = useMemo(() => {
    if (searchResults.length === 0) return null;
    
    const contentTypes = new Set<ContentType>();
    const states = new Set<string>();
    const themes = new Set<Theme>();
    const institutions = new Set<string>();
    
    searchResults.forEach(doc => {
      contentTypes.add(doc.contentType);
      states.add(doc.state);
      themes.add(doc.theme);
      institutions.add(doc.institution);
    });
    
    return {
      contentTypes: Array.from(contentTypes),
      states: Array.from(states),
      themes: Array.from(themes),
      institutions: Array.from(institutions)
    };
  }, [searchResults]);

  // Get related documents based on current results
  const relatedDocuments = useMemo(() => {
    if (searchResults.length === 0) return [];
    
    const currentTheme = searchResults[0]?.theme;
    const currentState = searchResults[0]?.state;
    
    return MOCK_REPOSITORY_DATA
      .filter(doc => 
        !searchResults.find(result => result.id === doc.id) &&
        (doc.theme === currentTheme || doc.state === currentState)
      )
      .slice(0, 4);
  }, [searchResults]);

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
        return <FileText className="h-4 w-4" />;
      case "Report":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get access tier color
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

  const hasActiveFilters = Object.values(filters).some(
    value => Array.isArray(value) ? value.length > 0 : 
    typeof value === 'object' && value !== null ? 
    (value as any).from || (value as any).to : false
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        {/* Search Header */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold text-[#1F2933] mb-2">Search Land Governance Research</h1>
              <p className="text-[#5A6472] mb-6">
                Ask questions about land governance research, policy, datasets, and more
              </p>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" />
                <input
                  type="text"
                  placeholder="How does urban expansion affect agricultural land?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeSearch(searchQuery);
                    }
                  }}
                  className="w-full rounded-full border border-[#E1E5EA] bg-[#F5F7FA] py-4 pl-12 pr-24 text-base text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-2 hover:bg-[#F5F7FA] rounded-full text-[#5A6472]"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => executeSearch(searchQuery)}
                    className="bg-[#0B3D91] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#062A63] transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Search History and Saved Searches */}
              <div className="flex items-center gap-4 mt-4">
                <div className="relative">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    <Clock className="h-4 w-4" />
                    Recent searches
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showHistory && searchHistory.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg border border-[#E1E5EA] shadow-lg z-10">
                      <div className="p-3 border-b border-[#E1E5EA] flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1F2933]">Recent searches</span>
                        <button
                          onClick={clearHistory}
                          className="text-xs text-[#0B3D91] hover:text-[#FF9933]"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {searchHistory.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 hover:bg-[#F5F7FA] cursor-pointer"
                            onClick={() => executeSearch(item.query)}
                          >
                            <span className="text-sm text-[#1F2933]">{item.query}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromHistory(item.query);
                              }}
                              className="p-1 hover:bg-[#E1E5EA] rounded text-[#5A6472]"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowSavedSearches(!showSavedSearches)}
                    className="flex items-center gap-2 text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    <Star className="h-4 w-4" />
                    Saved searches
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showSavedSearches && savedSearches.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg border border-[#E1E5EA] shadow-lg z-10">
                      <div className="p-3 border-b border-[#E1E5EA]">
                        <span className="text-sm font-medium text-[#1F2933]">Saved searches</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {savedSearches.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 hover:bg-[#F5F7FA] cursor-pointer"
                            onClick={() => executeSavedSearch(item)}
                          >
                            <span className="text-sm text-[#1F2933]">{item.query}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSavedSearch(item.query);
                              }}
                              className="p-1 hover:bg-[#E1E5EA] rounded text-[#5A6472]"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {hasSearched && (
                  <button
                    onClick={saveCurrentSearch}
                    className="flex items-center gap-2 text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    <Star className="h-4 w-4" />
                    Save this search
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {!hasSearched ? (
            /* Initial State */
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <Sparkles className="h-16 w-16 text-[#0B3D91]/30 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#1F2933] mb-4">Explore Land Governance Research</h2>
                <p className="text-[#5A6472]">
                  Start with a suggested research question or enter your own query
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => executeSearch(question)}
                    className="p-4 bg-white rounded-lg border border-[#E1E5EA] hover:border-[#0B3D91] hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <Search className="h-5 w-5 text-[#0B3D91] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#1F2933]">{question}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Search Results */}
              <div className="flex gap-8">
                {/* Filter Sidebar */}
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

                    {/* Access Tier Filter */}
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
                  {searchResults.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-lg border border-[#E1E5EA] p-12 text-center">
                      <AlertCircle className="h-16 w-16 text-[#5A6472] mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-[#1F2933] mb-2">No research found for this query</h3>
                      <p className="text-[#5A6472] mb-6">
                        Try adjusting your search terms or filters
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                          onClick={clearAllFilters}
                          className="rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63]"
                        >
                          Clear filters
                        </button>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setHasSearched(false);
                          }}
                          className="rounded-md border border-[#E1E5EA] px-4 py-2 text-sm font-semibold text-[#1F2933] hover:bg-[#F5F7FA]"
                        >
                          Try another search
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Search Interpretation */}
                      {searchInterpretation && (
                        <div className="bg-white rounded-lg border border-[#E1E5EA] p-6 mb-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-[#FF9933]" />
                            <h2 className="text-lg font-semibold text-[#1F2933]">Search interpretation</h2>
                            <span className="text-xs px-2 py-1 bg-[#E8A33D]/10 text-[#E8A33D] rounded-full">
                              Preview interpretation
                            </span>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-sm text-[#5A6472] mb-2">Research question:</p>
                            <p className="text-base font-medium text-[#1F2933]">"{searchQuery}"</p>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-4">
                            {searchInterpretation.themes.length > 0 && (
                              <div>
                                <p className="text-xs text-[#5A6472] mb-2">Themes:</p>
                                <div className="flex flex-wrap gap-1">
                                  {searchInterpretation.themes.map(theme => (
                                    <span key={theme} className="text-xs px-2 py-1 bg-[#0B3D91]/10 text-[#0B3D91] rounded">
                                      {theme}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {searchInterpretation.states.length > 0 && (
                              <div>
                                <p className="text-xs text-[#5A6472] mb-2">Geography:</p>
                                <div className="flex flex-wrap gap-1">
                                  {searchInterpretation.states.map(state => (
                                    <span key={state} className="text-xs px-2 py-1 bg-[#138808]/10 text-[#138808] rounded">
                                      {state}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {searchInterpretation.types.length > 0 && (
                              <div>
                                <p className="text-xs text-[#5A6472] mb-2">Content:</p>
                                <div className="flex flex-wrap gap-1">
                                  {searchInterpretation.types.map(type => (
                                    <span key={type} className="text-xs px-2 py-1 bg-[#FF9933]/10 text-[#FF9933] rounded">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* AI Research Synthesis */}
                      <div className="bg-gradient-to-r from-[#0B3D91]/5 to-[#FF9933]/5 rounded-lg border border-[#E1E5EA] p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Brain className="h-5 w-5 text-[#0B3D91]" />
                          <h2 className="text-lg font-semibold text-[#1F2933]">AI Research Synthesis</h2>
                          <span className="text-xs px-2 py-1 bg-[#E8A33D]/10 text-[#E8A33D] rounded-full">
                            Prototype synthesis — AI backend not connected
                          </span>
                        </div>
                        
                        <div className="text-[#5A6472] space-y-3">
                          <p>
                            Based on the documents currently available in this prototype, the search results indicate several recurring research themes in land governance.
                          </p>
                          
                          {resultsSummary && (
                            <div className="grid sm:grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-sm font-medium text-[#1F2933] mb-2">Recurring themes:</p>
                                <div className="flex flex-wrap gap-1">
                                  {resultsSummary.themes.slice(0, 3).map(theme => (
                                    <span key={theme} className="text-xs px-2 py-1 bg-white border border-[#E1E5EA] rounded">
                                      {theme}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-[#1F2933] mb-2">Geographic coverage:</p>
                                <div className="flex flex-wrap gap-1">
                                  {resultsSummary.states.slice(0, 3).map(state => (
                                    <span key={state} className="text-xs px-2 py-1 bg-white border border-[#E1E5EA] rounded">
                                      {state}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-[#1F2933] mb-2">Document types:</p>
                                <div className="flex flex-wrap gap-1">
                                  {resultsSummary.contentTypes.map(type => (
                                    <span key={type} className="text-xs px-2 py-1 bg-white border border-[#E1E5EA] rounded">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-[#1F2933] mb-2">Institutions:</p>
                                <div className="flex flex-wrap gap-1">
                                  {resultsSummary.institutions.slice(0, 2).map(inst => (
                                    <span key={inst} className="text-xs px-2 py-1 bg-white border border-[#E1E5EA] rounded">
                                      {inst}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 pt-4 border-t border-[#E1E5EA]">
                            <p className="text-sm font-medium text-[#1F2933] mb-2">Sources used:</p>
                            <div className="flex flex-wrap gap-2">
                              {searchResults.slice(0, 3).map(doc => (
                                <Link
                                  key={doc.id}
                                  to={`/repository/${doc.id}`}
                                  className="text-xs text-[#0B3D91] hover:text-[#FF9933]"
                                >
                                  {doc.title}
                                </Link>
                              ))}
                              {searchResults.length > 3 && (
                                <span className="text-xs text-[#5A6472]">
                                  +{searchResults.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Results Summary */}
                      {resultsSummary && (
                        <div className="bg-white rounded-lg border border-[#E1E5EA] p-6 mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-[#1F2933]">
                              {searchResults.length} results found
                            </h2>
                            
                            <div className="flex items-center gap-4">
                              <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                              >
                                <option value="Relevance">Prototype relevance</option>
                                <option value="Most Recent">Most Recent</option>
                                <option value="Most Downloaded">Most Downloaded</option>
                                <option value="Most Cited">Most Cited</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {resultsSummary.contentTypes.map(type => (
                              <span key={type} className="text-xs px-3 py-1.5 bg-[#0B3D91]/10 text-[#0B3D91] rounded-full">
                                {type}
                              </span>
                            ))}
                            {resultsSummary.states.map(state => (
                              <span key={state} className="text-xs px-3 py-1.5 bg-[#138808]/10 text-[#138808] rounded-full">
                                {state}
                              </span>
                            ))}
                            {resultsSummary.themes.slice(0, 3).map(theme => (
                              <span key={theme} className="text-xs px-3 py-1.5 bg-[#FF9933]/10 text-[#FF9933] rounded-full">
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Result Cards */}
                      <div className="space-y-4">
                        {searchResults.map(doc => {
                          const matchReasons = getMatchReasons(doc, searchQuery);
                          return (
                            <div
                              key={doc.id}
                              className="bg-white rounded-lg border border-[#E1E5EA] p-6 hover:border-[#0B3D91] hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getAccessTierColor(doc.accessTier)}`}>
                                      {getContentTypeIcon(doc.contentType)}
                                      {doc.contentType}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getAccessTierColor(doc.accessTier)}`}>
                                      {doc.accessTier}
                                    </span>
                                  </div>
                                  
                                  <Link
                                    to={`/repository/${doc.id}`}
                                    className="text-lg font-semibold text-[#1F2933] mb-2 hover:text-[#0B3D91] block"
                                  >
                                    {doc.title}
                                  </Link>
                                  
                                  <p className="text-sm text-[#5A6472] mb-3 line-clamp-2">
                                    {doc.summary}
                                  </p>
                                  
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#5A6472] mb-3">
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
                                  
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    <span
                                      className="text-xs px-2 py-1 bg-[#F5F7FA] rounded text-[#5A6472]"
                                    >
                                      {doc.theme}
                                    </span>
                                  </div>

                                  {matchReasons.length > 0 && (
                                    <div className="mb-3">
                                      <p className="text-xs font-medium text-[#1F2933] mb-1">Why this result?</p>
                                      <div className="flex flex-wrap gap-1">
                                        {matchReasons.map((reason, index) => (
                                          <span
                                            key={index}
                                            className="text-xs px-2 py-0.5 bg-[#0B3D91]/10 text-[#0B3D91] rounded"
                                          >
                                            {reason}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                  <button
                                    onClick={(e) => toggleBookmark(doc.id, e)}
                                    className={`p-2 rounded-md ${savedItems.has(doc.id) ? "text-[#FF9933] bg-[#FF9933]/10" : "text-[#5A6472] hover:bg-[#F5F7FA]"}`}
                                  >
                                    <Bookmark className={`h-5 w-5 ${savedItems.has(doc.id) ? "fill-current" : ""}`} />
                                  </button>
                                  
                                  <div className="flex items-center gap-3 text-xs text-[#5A6472]">
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" />
                                      <span>{doc.citations}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3" />
                                      <span>{doc.downloads}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Related Research */}
                      {relatedDocuments.length > 0 && (
                        <div className="mt-8">
                          <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Explore Related Research</h2>
                          <div className="grid md:grid-cols-2 gap-4">
                            {relatedDocuments.map(doc => (
                              <Link
                                key={doc.id}
                                to={`/repository/${doc.id}`}
                                className="block p-4 bg-white rounded-lg border border-[#E1E5EA] hover:border-[#0B3D91] hover:shadow-md transition-all"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getAccessTierColor(doc.accessTier)}`}>
                                    {getContentTypeIcon(doc.contentType)}
                                    {doc.contentType}
                                  </span>
                                </div>
                                <h3 className="text-sm font-semibold text-[#1F2933] mb-2 line-clamp-2 hover:text-[#0B3D91]">
                                  {doc.title}
                                </h3>
                                <p className="text-xs text-[#5A6472] mb-2">{doc.institution}</p>
                                <div className="flex flex-wrap gap-1">
                                  <span
                                    className="text-xs px-2 py-0.5 bg-[#F5F7FA] rounded text-[#5A6472]"
                                  >
                                    {doc.theme}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
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
