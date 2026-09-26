import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  Bookmark,
  CalendarDays,
  FileText,
  FilterX,
  LoaderCircle,
  MapPin,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../hooks/useAuth";
import {
  addDocumentBookmark,
  loadBookmarkedDocumentIds,
  loadRepositorySearchOptions,
  removeDocumentBookmark,
  searchRepositoryDocuments,
} from "../lib/supabaseRepository";
import { askRepositoryAi, MAX_AI_CONTEXT_DOCUMENTS, type AiSupportingDocument } from "../lib/aiSearch";
import type { RepositoryDocument } from "../types/repository";

interface SearchFilters {
  contentType: string;
  theme: string;
  state: string;
  district: string;
  language: string;
  accessTier: string;
  year: string;
}

interface SearchOptions {
  contentTypes: string[];
  themes: string[];
  states: string[];
  districtsByState: Record<string, string[]>;
  languages: string[];
  accessTiers: string[];
  years: string[];
}

const EMPTY_FILTERS: SearchFilters = {
  contentType: "",
  theme: "",
  state: "",
  district: "",
  language: "",
  accessTier: "",
  year: "",
};

const EMPTY_OPTIONS: SearchOptions = {
  contentTypes: [],
  themes: [],
  states: [],
  districtsByState: {},
  languages: [],
  accessTiers: [],
  years: [],
};

function filtersForSearch(filters: SearchFilters) {
  const yearFrom = filters.year ? `${filters.year}-01-01` : "";
  const yearTo = filters.year ? `${filters.year}-12-31` : "";
  return {
    contentTypes: filters.contentType ? [filters.contentType as RepositoryDocument["contentType"]] : [],
    themes: filters.theme ? [filters.theme as RepositoryDocument["theme"]] : [],
    states: filters.state ? [filters.state] : [],
    districts: filters.district ? [filters.district] : [],
    languages: filters.language ? [filters.language] : [],
    accessTiers: filters.accessTier ? [filters.accessTier as RepositoryDocument["accessTier"]] : [],
    dateRange: { from: yearFrom, to: yearTo },
  };
}

function SelectFilter({
  id,
  label,
  value,
  options,
  disabled = false,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block min-w-0 text-sm font-medium text-[#344054]">
      {label}
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 block min-h-11 w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#1F2933] outline-none focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 disabled:bg-[#F5F7FA] disabled:text-[#98A2B3]"
      >
        <option value="">All</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const initialQuery = searchParams.get("q") ?? "";
  const skipUrlTriggeredSearch = useRef<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [options, setOptions] = useState<SearchOptions>(EMPTY_OPTIONS);
  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);
  const [bookmarkState, setBookmarkState] = useState<{ userId: string; ids: Set<string> }>({ userId: "", ids: new Set() });
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [searching, setSearching] = useState(Boolean(initialQuery.trim()));
  const [generatingAi, setGeneratingAi] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery.trim()));
  const [searchError, setSearchError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [supportingDocuments, setSupportingDocuments] = useState<AiSupportingDocument[]>([]);
  const [bookmarkMessage, setBookmarkMessage] = useState("");
  const savedIds = bookmarkState.userId === user?.id ? bookmarkState.ids : new Set<string>();

  useEffect(() => {
    let current = true;
    loadRepositorySearchOptions().then((result) => {
      if (!current) return;
      if (result.error) setSearchError("Repository filters could not be loaded. Search may still be available.");
      setOptions({ ...EMPTY_OPTIONS, ...result.options });
      setLoadingOptions(false);
    });
    return () => { current = false; };
  }, []);

  useEffect(() => {
    let current = true;
    if (!user) return () => { current = false; };
    loadBookmarkedDocumentIds(user.id).then((result) => {
      if (current && !result.error) setBookmarkState({ userId: user.id, ids: new Set(result.ids) });
    });
    return () => { current = false; };
  }, [user]);

  useEffect(() => {
    if (skipUrlTriggeredSearch.current === initialQuery) {
      skipUrlTriggeredSearch.current = null;
      return;
    }
    if (!initialQuery.trim()) return;
    let current = true;
    searchRepositoryDocuments(filtersForSearch(EMPTY_FILTERS), initialQuery).then((result) => {
      if (!current) return;
      setDocuments(result.documents);
      setSearchError(result.error);
      setSearching(false);
    });
    return () => { current = false; };
  }, [initialQuery]);

  const districts = useMemo(
    () => filters.state ? (options.districtsByState[filters.state] ?? []) : [],
    [filters.state, options.districtsByState],
  );

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanQuery = query.trim();
    setAnswer("");
    setDisclaimer("");
    setSupportingDocuments([]);
    setAiError(null);
    if (!cleanQuery) {
      setDocuments([]);
      setHasSearched(false);
      setSearchError("Enter a research question or keywords to search the repository.");
      return;
    }

    setSearchError(null);
    setHasSearched(true);
    setSearching(true);
    if (initialQuery !== cleanQuery) {
      skipUrlTriggeredSearch.current = cleanQuery;
      setSearchParams({ q: cleanQuery });
    }
    const result = await searchRepositoryDocuments(filtersForSearch(filters), cleanQuery);
    setDocuments(result.documents);
    setSearchError(result.error);
    setSearching(false);
  }

  async function generateSummary() {
    if (!query.trim() || documents.length === 0) return;
    setGeneratingAi(true);
    setAiError(null);
    setAnswer("");
    setSupportingDocuments([]);

    try {
      const result = await askRepositoryAi(
        query.trim(),
        documents.slice(0, MAX_AI_CONTEXT_DOCUMENTS).map((document) => document.id)
      );
      setAnswer(result.answer);
      setDisclaimer(result.disclaimer);
      setSupportingDocuments(result.supportingDocuments);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI summary is currently unavailable.");
    } finally {
      setGeneratingAi(false);
    }
  }

  async function toggleBookmark(documentId: string) {
    if (!user) {
      setBookmarkMessage("Sign in to save repository documents.");
      return;
    }
    const isSaved = savedIds.has(documentId);
    const result = isSaved
      ? await removeDocumentBookmark(user.id, documentId)
      : await addDocumentBookmark(user.id, documentId);
    if (result.error) {
      setBookmarkMessage(result.error);
      return;
    }
    setBookmarkState((current) => {
      const next = new Set(current.userId === user.id ? current.ids : []);
      if (isSaved) next.delete(documentId);
      else next.add(documentId);
      return { userId: user.id, ids: next };
    });
    setBookmarkMessage(isSaved ? "Document removed from saved items." : "Document saved.");
  }

  function updateFilter(key: keyof SearchFilters, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "state" ? { district: "" } : {}),
    }));
  }

  async function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setAnswer("");
    setDisclaimer("");
    setSupportingDocuments([]);
    setAiError(null);
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    const result = await searchRepositoryDocuments(filtersForSearch(EMPTY_FILTERS), query.trim());
    setDocuments(result.documents);
    setSearchError(result.error);
    setSearching(false);
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1F2933]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-7 border-b border-[#DCE2E8] pb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0B3D91]">Research discovery</p>
          <h1 className="text-2xl font-semibold text-[#1F2933] sm:text-3xl">Repository Search</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5A6472]">
            Find research and policy material in the platform repository using keywords or a natural-language question.
          </p>
        </header>

        <form onSubmit={handleSearch} className="rounded-md border border-[#DCE2E8] bg-white p-4 shadow-sm sm:p-6">
          <label htmlFor="repository-search" className="mb-2 block text-sm font-semibold text-[#344054]">Search repository documents</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" aria-hidden="true" />
              <input
                id="repository-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. land acquisition policies in Rajasthan"
                className="min-h-12 w-full rounded-md border border-[#D0D5DD] bg-white py-3 pl-11 pr-4 text-base outline-none placeholder:text-[#98A2B3] focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20"
              />
            </div>
            <button type="submit" disabled={searching} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0B3D91] px-5 py-3 text-sm font-semibold text-white hover:bg-[#062A63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70">
              {searching ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
              Search
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SelectFilter id="filter-content-type" label="Content Type" value={filters.contentType} options={options.contentTypes} onChange={(value) => updateFilter("contentType", value)} />
            <SelectFilter id="filter-theme" label="Theme" value={filters.theme} options={options.themes} onChange={(value) => updateFilter("theme", value)} />
            <SelectFilter id="filter-state" label="State" value={filters.state} options={options.states} onChange={(value) => updateFilter("state", value)} />
            <SelectFilter id="filter-district" label="District" value={filters.district} options={districts} disabled={!filters.state} onChange={(value) => updateFilter("district", value)} />
            <SelectFilter id="filter-language" label="Language" value={filters.language} options={options.languages} onChange={(value) => updateFilter("language", value)} />
            <SelectFilter id="filter-access-tier" label="Access Tier" value={filters.accessTier} options={options.accessTiers} onChange={(value) => updateFilter("accessTier", value)} />
            <SelectFilter id="filter-year" label="Published Year" value={filters.year} options={options.years} onChange={(value) => updateFilter("year", value)} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EAECF0] pt-4">
            <p className="inline-flex items-center gap-2 text-xs text-[#667085]" aria-live="polite">
              <span className="h-2 w-2 rounded-full bg-[#138A5B]" aria-hidden="true" />
              {loadingOptions ? "Loading repository filters" : "Keyword search across repository metadata"}
            </p>
            <button type="button" onClick={clearFilters} disabled={activeFilterCount === 0 || searching} className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-[#344054] hover:bg-[#F2F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] disabled:cursor-not-allowed disabled:opacity-50">
              <FilterX className="h-4 w-4" aria-hidden="true" />
              Clear filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>
        </form>

        {searchError && (
          <div role="alert" className="mt-5 flex items-start gap-3 rounded-md border border-[#F1C6C3] bg-[#FFF7F6] p-4 text-sm text-[#9E2A22]">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{searchError}</p>
          </div>
        )}

        {hasSearched && !searchError && (
          <section aria-labelledby="search-results-heading" className="mt-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="search-results-heading" className="text-lg font-semibold">Matching repository documents</h2>
                <p className="mt-1 text-sm text-[#667085]" aria-live="polite">
                  {searching ? "Searching repository..." : `${documents.length} ${documents.length === 1 ? "document" : "documents"} found`}
                </p>
              </div>
              {documents.length > 0 && (
                <button type="button" onClick={generateSummary} disabled={generatingAi} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#0B3D91] bg-white px-4 py-2 text-sm font-semibold text-[#0B3D91] hover:bg-[#F0F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] disabled:cursor-wait disabled:opacity-60">
                  {generatingAi ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                  {generatingAi ? "Generating summary" : "Generate AI research summary"}
                </button>
              )}
            </div>

            {(answer || generatingAi || aiError) && (
              <section aria-labelledby="ai-summary-heading" className="mb-5 rounded-md border border-[#D7E2F3] bg-[#F0F5FB] p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#0B3D91]" aria-hidden="true" />
                  <h3 id="ai-summary-heading" className="text-base font-semibold">AI Research Summary</h3>
                </div>
                {generatingAi && <p role="status" className="mt-3 text-sm text-[#475467]">Preparing a summary from the matching repository documents...</p>}
                {aiError && (
                  <div role="status" className="mt-3">
                    <p className="text-sm text-[#9E2A22]">{aiError}</p>
                    <p className="mt-1 text-xs text-[#667085]">Basic keyword search is unaffected. You can still review the matching repository documents listed below.</p>
                  </div>
                )}
                {answer && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#344054]">{answer}</p>}
                {disclaimer && answer && <p className="mt-3 border-t border-[#D7E2F3] pt-3 text-xs text-[#667085]">{disclaimer}</p>}
                {supportingDocuments.length > 0 && (
                  <div className="mt-4 border-t border-[#D7E2F3] pt-4">
                    <h4 className="mb-2 text-sm font-semibold">Supporting Documents</h4>
                    <ul className="space-y-2">
                      {supportingDocuments.map((document) => (
                        <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#DCE2E8] bg-white px-3 py-2">
                          <Link to={`/repository/${document.id}`} className="min-w-0 text-sm font-medium text-[#0B3D91] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">{document.title}</Link>
                          <span className="text-xs text-[#667085]">{[document.contentType, document.state].filter(Boolean).join(" · ")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {bookmarkMessage && <p role="status" className="mb-3 text-sm text-[#475467]">{bookmarkMessage}</p>}
            {searching ? (
              <div role="status" className="flex min-h-40 items-center justify-center gap-3 rounded-md border border-[#DCE2E8] bg-white text-sm text-[#475467]">
                <LoaderCircle className="h-5 w-5 animate-spin text-[#0B3D91]" aria-hidden="true" /> Searching repository documents
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#C9D2DC] bg-white px-5 py-12 text-center">
                <FileText className="mx-auto h-9 w-9 text-[#98A2B3]" aria-hidden="true" />
                <h3 className="mt-3 text-base font-semibold">No relevant repository documents were found for this query.</h3>
                <p className="mt-1 text-sm text-[#667085]">Try different keywords or clear one or more filters.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {documents.map((document) => (
                  <li key={document.id} className="rounded-md border border-[#DCE2E8] bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/repository/${document.id}`} className="text-base font-semibold text-[#0B3D91] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">
                          {document.title}
                        </Link>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#475467]">{document.summary || document.description || "No description provided."}</p>
                      </div>
                      <button type="button" onClick={() => void toggleBookmark(document.id)} aria-label={savedIds.has(document.id) ? `Remove ${document.title} from bookmarks` : `Bookmark ${document.title}`} title={user ? "Bookmark document" : "Sign in to bookmark"} className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] ${savedIds.has(document.id) ? "border-[#0B3D91] bg-[#F0F5FF] text-[#0B3D91]" : "border-[#D0D5DD] text-[#667085] hover:bg-[#F9FAFB]"}`}>
                        <Bookmark className="h-4 w-4" fill={savedIds.has(document.id) ? "currentColor" : "none"} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#EAECF0] pt-3 text-xs text-[#667085]">
                      <span className="rounded-sm bg-[#F2F4F7] px-2 py-1 font-medium text-[#344054]">{document.contentType}</span>
                      {document.theme && <span>{document.theme}</span>}
                      {(document.state || document.district) && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{[document.district, document.state].filter(Boolean).join(", ")}</span>}
                      {(document.author || document.institution) && <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" aria-hidden="true" />{[document.author, document.institution].filter(Boolean).join(" · ")}</span>}
                      {document.publishedAt && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{new Date(document.publishedAt).toLocaleDateString()}</span>}
                      <Link to={`/repository/${document.id}`} className="ml-auto min-h-8 rounded px-2 py-1 font-semibold text-[#0B3D91] hover:bg-[#F0F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">Open document</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}