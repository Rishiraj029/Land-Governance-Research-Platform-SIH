import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Users,
  FileText,
  Clock,
  X,
  Building2,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
  RESEARCH_THEMES,
  WORKSPACE_STATUSES,
  ACCESS_LEVELS
} from "../lib/mockWorkspaceData";
import type {
  Workspace,
  WorkspaceFilters,
  WorkspaceSortOption,
  WorkspaceViewMode,
  CreateWorkspaceFormData
} from "../types/workspace";
import { loadWorkspaces, createWorkspace } from "../lib/supabaseWorkspace";
import { useAuth } from "../hooks/useAuth";
import CreateWorkspaceModal from "../components/workspaces/CreateWorkspaceModal";
import Toast from "../components/ui/Toast";

export default function Workspaces() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<WorkspaceSortOption>("Recently Updated");
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<WorkspaceFilters>({
    status: [],
    accessLevel: [],
    researchTheme: []
  });

  // Load workspaces from Supabase on mount
  useEffect(() => {
    const loadWorkspacesData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const result = await loadWorkspaces(user.id);

      if (result.error) {
        setError(result.error);
        setWorkspaces([]);
      } else {
        setWorkspaces(result.workspaces);
      }

      setIsLoading(false);
    };

    loadWorkspacesData();
  }, [user]);

  // Visitors who asked to create a workspace are sent to sign in first and returned here
  // with this flag, so the create dialog opens straight away.
  useEffect(() => {
    const state = location.state as { createWorkspace?: boolean } | null;
    if (!state?.createWorkspace || authLoading) return;

    // Only signed-in users can create, so wait for the session to resolve first.
    if (user) {
      setShowCreateModal(true);
    }
    // Clear the flag so a refresh does not reopen the dialog.
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, user, authLoading]);

  // Filter and search logic
  const filteredAndSortedWorkspaces = useMemo(() => {
    let filtered = [...workspaces];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ws =>
        ws.name.toLowerCase().includes(query) ||
        ws.description.toLowerCase().includes(query) ||
        ws.researchTheme.toLowerCase().includes(query) ||
        ws.owner.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(ws => filters.status.includes(ws.status));
    }

    // Apply access level filter
    if (filters.accessLevel.length > 0) {
      filtered = filtered.filter(ws => filters.accessLevel.includes(ws.accessLevel));
    }

    // Apply research theme filter
    if (filters.researchTheme.length > 0) {
      filtered = filtered.filter(ws => filters.researchTheme.includes(ws.researchTheme));
    }

    // Apply sorting
    switch (sortBy) {
      case "Recently Updated":
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "Recently Created":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "Most Members":
        filtered.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case "Most Documents":
        filtered.sort((a, b) => b.documentCount - a.documentCount);
        break;
    }

    return filtered;
  }, [workspaces, searchQuery, filters, sortBy]);

  // Filter handlers
  const toggleFilter = <T extends string>(
    category: keyof WorkspaceFilters,
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
      status: [],
      accessLevel: [],
      researchTheme: []
    });
    setSearchQuery("");
  };

  const hasActiveFilters = Object.values(filters).some(
    value => Array.isArray(value) && value.length > 0
  ) || searchQuery.trim().length > 0;

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#138808]/10 text-[#138808] border-[#138808]/20";
      case "Draft":
        return "bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/20";
      case "Archived":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Access level badge color
  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "Private":
        return "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20";
      case "Institution":
        return "bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]/20";
      case "Public Research":
        return "bg-[#138808]/10 text-[#138808] border-[#138808]/20";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Handle workspace click
  const handleWorkspaceClick = (workspaceId: string) => {
    navigate(`/workspaces/${workspaceId}`);
  };

  // Opens the create dialog for signed-in users; anonymous visitors are sent to sign in
  // first and are returned here with the dialog already open.
  const startCreateWorkspace = () => {
    if (!user) {
      navigate('/auth', { state: { from: '/workspaces', createWorkspace: true } });
      return;
    }
    setShowCreateModal(true);
  };

  // Handle create workspace
  const handleCreateWorkspace = async (data: CreateWorkspaceFormData) => {
    if (!user) {
      setToastMessage("You must be logged in to create a workspace");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const result = await createWorkspace(
      data.name, 
      data.description, 
      user.id,
      data.researchTheme,
      data.accessLevel,
      data.objective
    );

    if (result.error) {
      setToastMessage(`Failed to create workspace: ${result.error}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (result.workspace) {
      setWorkspaces([...workspaces, result.workspace]);
    } else {
      // The row was created but the follow-up read returned nothing; refresh the list.
      const refreshed = await loadWorkspaces(user.id);
      if (!refreshed.error) {
        setWorkspaces(refreshed.workspaces);
      }
    }

    setShowCreateModal(false);
    setToastMessage("Workspace created successfully");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[#1F2933]">Collaborative Workspaces</h1>
                  <span className="inline-flex items-center rounded-full bg-[#FF9933]/10 px-2.5 py-0.5 text-xs font-medium text-[#FF9933] border border-[#FF9933]/20">
                    MVP
                  </span>
                </div>
                <p className="text-[#5A6472] max-w-2xl">
                  Bring research, datasets, documents, policy analysis, and collaborators together in one shared workspace.
                </p>
              </div>
              
              {user ? (
                <button
                  onClick={startCreateWorkspace}
                  className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </button>
              ) : (
                <button
                  onClick={startCreateWorkspace}
                  title="Sign in first — you will be brought back here to create your workspace"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63] transition-colors"
                >
                  Sign In to Create
                </button>
              )}
            </div>

            {/* Workspace Search Bar */}
            <div className="mt-6 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" />
              <input
                type="text"
                placeholder="Search workspaces by name, description, theme, or owner..."
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

                {/* Status Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Status</h3>
                  <div className="space-y-2">
                    {WORKSPACE_STATUSES.map(status => (
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

                {/* Access Level Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Access Level</h3>
                  <div className="space-y-2">
                    {ACCESS_LEVELS.map(level => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.accessLevel.includes(level)}
                          onChange={() => toggleFilter("accessLevel", level)}
                          className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-[#1F2933]">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Research Theme Filter */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Research Theme</h3>
                  <div className="space-y-2">
                    {RESEARCH_THEMES.map(theme => (
                      <label key={theme} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.researchTheme.includes(theme)}
                          onChange={() => toggleFilter("researchTheme", theme)}
                          className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-[#1F2933]">{theme}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sorting */}
                <div>
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as WorkspaceSortOption)}
                    className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                  >
                    <option value="Recently Updated">Recently Updated</option>
                    <option value="Recently Created">Recently Created</option>
                    <option value="Most Members">Most Members</option>
                    <option value="Most Documents">Most Documents</option>
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
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Status</h3>
                      <div className="space-y-2">
                        {WORKSPACE_STATUSES.map(status => (
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
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Access Level</h3>
                      <div className="space-y-2">
                        {ACCESS_LEVELS.map(level => (
                          <label key={level} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.accessLevel.includes(level)}
                              onChange={() => toggleFilter("accessLevel", level)}
                              className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                            />
                            <span className="text-sm text-[#1F2933]">{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Research Theme</h3>
                      <div className="space-y-2">
                        {RESEARCH_THEMES.map(theme => (
                          <label key={theme} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.researchTheme.includes(theme)}
                              onChange={() => toggleFilter("researchTheme", theme)}
                              className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                            />
                            <span className="text-sm text-[#1F2933]">{theme}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-medium text-[#5A6472] mb-3">Sort By</h3>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as WorkspaceSortOption)}
                        className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                      >
                        <option value="Recently Updated">Recently Updated</option>
                        <option value="Recently Created">Recently Created</option>
                        <option value="Most Members">Most Members</option>
                        <option value="Most Documents">Most Documents</option>
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
              {/* View Toggle and Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[#5A6472]">
                  {isLoading ? 'Loading...' : `${filteredAndSortedWorkspaces.length} workspace${filteredAndSortedWorkspaces.length !== 1 ? 's' : ''} found`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md ${
                      viewMode === "grid" ? "bg-[#0B3D91] text-white" : "bg-white text-[#5A6472] hover:bg-[#F5F7FA]"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md ${
                      viewMode === "list" ? "bg-[#0B3D91] text-white" : "bg-white text-[#5A6472] hover:bg-[#F5F7FA]"
                    }`}
                    aria-label="List view"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91] mx-auto mb-4" />
                  <p className="text-[#5A6472]">Loading workspaces...</p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-[#D64545] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#1F2933] mb-2">Error loading workspaces</h3>
                  <p className="text-[#5A6472] mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-medium text-[#0B3D91] hover:text-[#FF9933]"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && filteredAndSortedWorkspaces.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#1F2933] mb-2">No workspaces found</h3>
                  <p className="text-[#5A6472] mb-4">
                    {hasActiveFilters ? 'Try adjusting your filters or search terms' : 'Create your first workspace to get started'}
                  </p>
                  {!hasActiveFilters && (
                    <button
                      onClick={startCreateWorkspace}
                      className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      {user ? "Create Workspace" : "Sign In to Create Workspace"}
                    </button>
                  )}
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

              {/* Grid View */}
              {viewMode === "grid" && filteredAndSortedWorkspaces.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedWorkspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      onClick={() => handleWorkspaceClick(workspace.id)}
                      className="bg-white border border-[#E1E5EA] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#1F2933] mb-2 line-clamp-2">
                            {workspace.name}
                          </h3>
                          <p className="text-sm text-[#5A6472] line-clamp-2 mb-3">
                            {workspace.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(workspace.status)}`}>
                          {workspace.status}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getAccessLevelColor(workspace.accessLevel)}`}>
                          {workspace.accessLevel}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-[#5A6472]">
                          <Building2 className="h-4 w-4" />
                          <span className="truncate">{workspace.researchTheme}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5A6472]">
                          <Users className="h-4 w-4" />
                          <span>{workspace.memberCount} members</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5A6472]">
                          <FileText className="h-4 w-4" />
                          <span>{workspace.documentCount} documents</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5A6472]">
                          <Clock className="h-4 w-4" />
                          <span>Updated {workspace.lastActivity}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#E1E5EA]">
                        <p className="text-xs text-[#5A6472]">
                          Owned by {workspace.owner}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && filteredAndSortedWorkspaces.length > 0 && (
                <div className="bg-white border border-[#E1E5EA] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#F5F7FA] border-b border-[#E1E5EA]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Workspace
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Theme
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Access
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Members
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Documents
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Last Activity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E5EA]">
                      {filteredAndSortedWorkspaces.map((workspace) => (
                        <tr
                          key={workspace.id}
                          onClick={() => handleWorkspaceClick(workspace.id)}
                          className="hover:bg-[#F5F7FA] cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-[#1F2933]">{workspace.name}</div>
                              <div className="text-sm text-[#5A6472] line-clamp-1">{workspace.description}</div>
                              <div className="text-xs text-[#5A6472] mt-1">{workspace.owner}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#1F2933]">{workspace.researchTheme}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(workspace.status)}`}>
                              {workspace.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getAccessLevelColor(workspace.accessLevel)}`}>
                              {workspace.accessLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-[#1F2933]">
                              <Users className="h-4 w-4 text-[#5A6472]" />
                              {workspace.memberCount}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-[#1F2933]">
                              <FileText className="h-4 w-4 text-[#5A6472]" />
                              {workspace.documentCount}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-[#5A6472]">
                              <Calendar className="h-4 w-4" />
                              {workspace.lastActivity}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateWorkspace}
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