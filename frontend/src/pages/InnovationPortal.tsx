import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Lightbulb,
  TrendingUp,
  Clock,
  MapPin,
  ThumbsUp,
  Bookmark,
  Plus,
  X,
  Star
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
  MOCK_INNOVATIONS,
  INNOVATION_CATEGORIES,
  INNOVATION_STATUSES,
  INNOVATION_STATES,
  getStoredInnovations,
  setStoredInnovations
} from "../lib/mockInnovationData";
import type {
  Innovation,
  InnovationFilters,
  InnovationSortOption,
  CreateInnovationFormData
} from "../types/innovation";
import SubmitInnovationModal from "../components/innovation/SubmitInnovationModal";
import Toast from "../components/ui/Toast";

export default function InnovationPortal() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<InnovationSortOption>("Most Recent");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [innovations, setInnovations] = useState<Innovation[]>(MOCK_INNOVATIONS);
  const [bookmarkedInnovations, setBookmarkedInnovations] = useState<Set<string>>(new Set());

  // Filter state
  const [filters, setFilters] = useState<InnovationFilters>({
    category: [],
    status: [],
    state: []
  });

  // Load innovations from localStorage on mount
  useEffect(() => {
    const stored = getStoredInnovations();
    setInnovations(stored);
    
    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem("land_governance_bookmarks");
    if (savedBookmarks) {
      setBookmarkedInnovations(new Set(JSON.parse(savedBookmarks)));
    }
  }, []);

  // Filter and search logic
  const filteredAndSortedInnovations = useMemo(() => {
    let filtered = [...innovations];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.title.toLowerCase().includes(query) ||
        inv.description.toLowerCase().includes(query) ||
        inv.organization.toLowerCase().includes(query) ||
        inv.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(inv => filters.category.includes(inv.category));
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(inv => filters.status.includes(inv.status));
    }

    // Apply state filter
    if (filters.state.length > 0) {
      filtered = filtered.filter(inv => filters.state.includes(inv.location));
    }

    // Apply sorting
    switch (sortBy) {
      case "Most Recent":
        filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        break;
      case "Most Votes":
        filtered.sort((a, b) => b.votes - a.votes);
        break;
      case "Most Popular":
        filtered.sort((a, b) => b.votes - a.votes);
        break;
    }

    return filtered;
  }, [innovations, searchQuery, filters, sortBy]);

  // Filter handlers
  const toggleFilter = <T extends string>(
    category: keyof InnovationFilters,
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

  const clearAllFilters = () => {
    setFilters({
      category: [],
      status: [],
      state: []
    });
    setSearchQuery("");
  };

  const hasActiveFilters = Object.values(filters).some(
    value => Array.isArray(value) && value.length > 0
  ) || searchQuery.trim().length > 0;

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selected":
        return "bg-[#138808]/10 text-[#138808] border-[#138808]/20";
      case "Shortlisted":
        return "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20";
      case "Under Review":
        return "bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/20";
      case "Submitted":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "Not Selected":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Handle vote
  const handleVote = (innovationId: string) => {
    const updatedInnovations = innovations.map(inv =>
      inv.id === innovationId ? { ...inv, votes: inv.votes + 1 } : inv
    );
    setInnovations(updatedInnovations);
    setStoredInnovations(updatedInnovations);
    setToastMessage("Vote recorded successfully");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle bookmark
  const handleBookmark = (innovationId: string) => {
    const newBookmarks = new Set(bookmarkedInnovations);
    if (newBookmarks.has(innovationId)) {
      newBookmarks.delete(innovationId);
      setToastMessage("Removed from bookmarks");
    } else {
      newBookmarks.add(innovationId);
      setToastMessage("Added to bookmarks");
    }
    setBookmarkedInnovations(newBookmarks);
    localStorage.setItem("land_governance_bookmarks", JSON.stringify([...newBookmarks]));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle submit innovation
  const handleSubmitInnovation = (data: CreateInnovationFormData) => {
    const newInnovation: Innovation = {
      id: `inv-${Date.now()}`,
      title: data.title,
      description: data.description,
      category: data.category,
      problem: data.problem,
      solution: data.solution,
      location: data.location,
      organization: data.organization,
      team: data.team,
      contact: data.contact,
      status: "Submitted",
      votes: 0,
      submittedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      featured: false
    };

    const updatedInnovations = [newInnovation, ...innovations];
    setInnovations(updatedInnovations);
    setStoredInnovations(updatedInnovations);
    setShowSubmitModal(false);
    setToastMessage("Innovation submitted successfully");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Featured innovations
  const featuredInnovations = innovations.filter(inv => inv.featured);
  const recentInnovations = [...innovations].sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  ).slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[#1F2933]">Innovation Portal</h1>
                  <span className="inline-flex items-center rounded-full bg-[#FF9933]/10 px-2.5 py-0.5 text-xs font-medium text-[#FF9933] border border-[#FF9933]/20">
                    Prototype Portal
                  </span>
                </div>
                <p className="text-[#5A6472] max-w-2xl">
                  Discover and submit innovative solutions for land governance challenges. Join hackathons, research grants, and pilot projects.
                </p>
              </div>
              
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Submit Innovation
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-6 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" />
              <input
                type="text"
                placeholder="Search innovations by title, description, category, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                      Reset Filters
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Category</h3>
                  <div className="space-y-2">
                    {INNOVATION_CATEGORIES.map(category => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category)}
                          onChange={() => toggleFilter("category", category)}
                          className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-[#1F2933]">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Status</h3>
                  <div className="space-y-2">
                    {INNOVATION_STATUSES.map(status => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => toggleFilter("status", status)}
                          className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-[#1F2933]">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* State Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Location</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {INNOVATION_STATES.map(state => (
                      <label key={state} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.state.includes(state)}
                          onChange={() => toggleFilter("state", state)}
                          className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-[#1F2933]">{state}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sorting */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as InnovationSortOption)}
                    className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                  >
                    <option value="Most Recent">Most Recent</option>
                    <option value="Most Votes">Most Votes</option>
                    <option value="Most Popular">Most Popular</option>
                  </select>
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
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Category</h3>
                      <div className="space-y-2">
                        {INNOVATION_CATEGORIES.map(category => (
                          <label key={category} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.category.includes(category)}
                              onChange={() => toggleFilter("category", category)}
                              className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                            />
                            <span className="text-sm text-[#1F2933]">{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Status</h3>
                      <div className="space-y-2">
                        {INNOVATION_STATUSES.map(status => (
                          <label key={status} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.status.includes(status)}
                              onChange={() => toggleFilter("status", status)}
                              className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                            />
                            <span className="text-sm text-[#1F2933]">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Location</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {INNOVATION_STATES.map(state => (
                          <label key={state} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.state.includes(state)}
                              onChange={() => toggleFilter("state", state)}
                              className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                            />
                            <span className="text-sm text-[#1F2933]">{state}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Sort By</h3>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as InnovationSortOption)}
                        className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                      >
                        <option value="Most Recent">Most Recent</option>
                        <option value="Most Votes">Most Votes</option>
                        <option value="Most Popular">Most Popular</option>
                      </select>
                    </div>

                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="w-full rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-medium text-white hover:bg-[#062A63]"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Featured Innovations */}
              {featuredInnovations.length > 0 && !hasActiveFilters && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-[#FF9933]" />
                    <h2 className="text-lg font-semibold text-[#1F2933]">Featured Innovations</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredInnovations.map((innovation) => (
                      <div
                        key={innovation.id}
                        className="bg-white border border-[#FF9933] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative"
                      >
                        <div className="absolute top-4 right-4">
                          <Star className="h-5 w-5 text-[#FF9933] fill-[#FF9933]" />
                        </div>
                        <div className="mb-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(innovation.status)}`}>
                            {innovation.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-[#1F2933] mb-2 line-clamp-2">{innovation.title}</h3>
                        <p className="text-sm text-[#5A6472] line-clamp-3 mb-4">{innovation.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-[#5A6472]">
                            <Lightbulb className="h-4 w-4" />
                            <span className="truncate">{innovation.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#5A6472]">
                            <MapPin className="h-4 w-4" />
                            <span>{innovation.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#5A6472]">
                            <TrendingUp className="h-4 w-4" />
                            <span>{innovation.votes} votes</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#E1E5EA] flex items-center justify-between">
                          <p className="text-xs text-[#5A6472]">{innovation.organization}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVote(innovation.id)}
                              className="p-2 hover:bg-[#F5F7FA] rounded text-[#5A6472]"
                              aria-label="Vote"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleBookmark(innovation.id)}
                              className={`p-2 hover:bg-[#F5F7FA] rounded ${bookmarkedInnovations.has(innovation.id) ? 'text-[#FF9933]' : 'text-[#5A6472]'}`}
                              aria-label="Bookmark"
                            >
                              <Bookmark className={`h-4 w-4 ${bookmarkedInnovations.has(innovation.id) ? 'fill-[#FF9933]' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Innovations */}
              {!hasActiveFilters && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-[#0B3D91]" />
                    <h2 className="text-lg font-semibold text-[#1F2933]">Recently Submitted</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentInnovations.map((innovation) => (
                      <div
                        key={innovation.id}
                        className="bg-white border border-[#E1E5EA] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="mb-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(innovation.status)}`}>
                            {innovation.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-[#1F2933] mb-2 line-clamp-2">{innovation.title}</h3>
                        <p className="text-sm text-[#5A6472] line-clamp-3 mb-4">{innovation.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-[#5A6472]">
                            <Lightbulb className="h-4 w-4" />
                            <span className="truncate">{innovation.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#5A6472]">
                            <MapPin className="h-4 w-4" />
                            <span>{innovation.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#5A6472]">
                            <TrendingUp className="h-4 w-4" />
                            <span>{innovation.votes} votes</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#E1E5EA] flex items-center justify-between">
                          <p className="text-xs text-[#5A6472]">{innovation.organization}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVote(innovation.id)}
                              className="p-2 hover:bg-[#F5F7FA] rounded text-[#5A6472]"
                              aria-label="Vote"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleBookmark(innovation.id)}
                              className={`p-2 hover:bg-[#F5F7FA] rounded ${bookmarkedInnovations.has(innovation.id) ? 'text-[#FF9933]' : 'text-[#5A6472]'}`}
                              aria-label="Bookmark"
                            >
                              <Bookmark className={`h-4 w-4 ${bookmarkedInnovations.has(innovation.id) ? 'fill-[#FF9933]' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtered Results Header */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-[#5A6472]">
                    {filteredAndSortedInnovations.length} innovation{filteredAndSortedInnovations.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              )}

              {/* Empty State */}
              {filteredAndSortedInnovations.length === 0 && (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#1F2933] mb-2">No innovations found</h3>
                  <p className="text-[#5A6472] mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm font-medium text-[#0B3D91] hover:text-[#FF9933]"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}

              {/* Innovation Grid */}
              {filteredAndSortedInnovations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedInnovations.map((innovation) => (
                    <div
                      key={innovation.id}
                      className="bg-white border border-[#E1E5EA] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="mb-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(innovation.status)}`}>
                          {innovation.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#1F2933] mb-2 line-clamp-2">{innovation.title}</h3>
                      <p className="text-sm text-[#5A6472] line-clamp-3 mb-4">{innovation.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-[#5A6472]">
                          <Lightbulb className="h-4 w-4" />
                          <span className="truncate">{innovation.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5A6472]">
                          <MapPin className="h-4 w-4" />
                          <span>{innovation.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5A6472]">
                          <TrendingUp className="h-4 w-4" />
                          <span>{innovation.votes} votes</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-[#E1E5EA] flex items-center justify-between">
                        <p className="text-xs text-[#5A6472]">{innovation.organization}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(innovation.id)}
                            className="p-2 hover:bg-[#F5F7FA] rounded text-[#5A6472]"
                            aria-label="Vote"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleBookmark(innovation.id)}
                            className={`p-2 hover:bg-[#F5F7FA] rounded ${bookmarkedInnovations.has(innovation.id) ? 'text-[#FF9933]' : 'text-[#5A6472]'}`}
                            aria-label="Bookmark"
                          >
                            <Bookmark className={`h-4 w-4 ${bookmarkedInnovations.has(innovation.id) ? 'fill-[#FF9933]' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Submit Innovation Modal */}
      {showSubmitModal && (
        <SubmitInnovationModal
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleSubmitInnovation}
        />
      )}

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}