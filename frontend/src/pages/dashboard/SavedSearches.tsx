import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Clock, ExternalLink, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  createSavedSearch,
  deleteSavedSearch,
  loadMySavedSearches,
  type SavedSearch,
} from "../../lib/supabaseSavedSearches";

/**
 * Saved Searches.
 *
 * Backed by public.saved_searches (`id, user_id, name, query, filters, created_at`) — this
 * page previously read a localStorage key that nothing in the app ever wrote, so it could
 * never show or keep anything. Each row links into the existing /search page to re-run the
 * query rather than duplicating search logic here.
 */
export default function SavedSearches() {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formQuery, setFormQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!user) return undefined;
    let current = true;

    loadMySavedSearches(user.id)
      .then((result) => {
        if (!current) return;
        if (result.error) {
          setError(result.error);
        } else {
          setSearches(result.searches);
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

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving) return;

    setFormError(null);
    setStatusMessage("");
    setSaving(true);
    const result = await createSavedSearch(user.id, formName, formQuery);
    setSaving(false);

    if (result.error || !result.search) {
      setFormError(result.error ?? "Could not save this search.");
      return;
    }
    setSearches((current) => [result.search as SavedSearch, ...current]);
    setFormName("");
    setFormQuery("");
    setStatusMessage("Search saved.");
  }

  async function handleDelete(search: SavedSearch) {
    setFormError(null);
    setStatusMessage("");
    const result = await deleteSavedSearch(search.id);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setSearches((current) => current.filter((item) => item.id !== search.id));
    setStatusMessage("Search removed.");
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1F2933]">Saved Searches</h1>
        <div className="rounded-lg border border-[#E1E5EA] bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-[#D64545]" aria-hidden="true" />
          <p className="font-medium text-[#1F2933]">Sign in to view your saved searches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2933]">Saved Searches</h1>
        <p className="mt-1 text-[#5A6472]">
          Queries you keep so you can re-run them against the repository later.
        </p>
      </div>

      {/* Save a search */}
      <form onSubmit={handleSave} className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1F2933]">Save a search</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="saved-search-query" className="mb-1.5 block text-sm font-medium text-[#344054]">
              Query <span className="text-[#D64545]">*</span>
            </label>
            <input
              id="saved-search-query"
              type="text"
              required
              maxLength={500}
              value={formQuery}
              onChange={(event) => setFormQuery(event.target.value)}
              placeholder="e.g. land acquisition policies in Rajasthan"
              className="min-h-11 w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#1F2933] outline-none placeholder:text-[#98A2B3] focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="saved-search-name" className="mb-1.5 block text-sm font-medium text-[#344054]">
              Name <span className="text-[#5A6472]">(optional)</span>
            </label>
            <input
              id="saved-search-name"
              type="text"
              maxLength={120}
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
              placeholder="e.g. Rajasthan land acquisition"
              className="min-h-11 w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#1F2933] outline-none placeholder:text-[#98A2B3] focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20"
            />
          </div>
        </div>

        {formError && (
          <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-[#9E2A22]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        )}
        {statusMessage && (
          <p role="status" className="mt-3 text-sm text-[#138808]">
            {statusMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#062A63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          Save search
        </button>
      </form>

      {/* List */}
      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E1E5EA] bg-white p-10 shadow-sm" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91]" aria-hidden="true" />
          <p className="text-sm text-[#5A6472]">Loading saved searches…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E1E5EA] bg-white p-8 text-center shadow-sm" role="alert">
          <AlertCircle className="h-8 w-8 text-[#D64545]" aria-hidden="true" />
          <p className="text-sm font-medium text-[#1F2933]">Could not load saved searches</p>
          <p className="max-w-lg text-xs text-[#5A6472]">{error}</p>
        </div>
      )}

      {!loading && !error && searches.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E1E5EA] bg-white p-10 text-center shadow-sm">
          <Search className="mb-2 h-12 w-12 text-[#0B3D91]/30" aria-hidden="true" />
          <p className="text-sm font-medium text-[#1F2933]">No saved searches yet</p>
          <p className="max-w-xs text-xs text-[#5A6472]">
            Use the form above to keep a query, or run a search and save what worked.
          </p>
          <Link
            to="/search"
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#062A63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Go to Search
          </Link>
        </div>
      )}

      {!loading && !error && searches.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[#E1E5EA] bg-white shadow-sm">
          <ul className="divide-y divide-[#E1E5EA]">
            {searches.map((search) => (
              <li key={search.id} className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-[#F5F7FA]">
                <Search className="h-4 w-4 flex-shrink-0 text-[#0B3D91]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1F2933]">{search.name}</p>
                  <p className="truncate text-xs text-[#5A6472]">{search.query}</p>
                  {search.createdAt && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[#5A6472]">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      Saved{" "}
                      {new Date(search.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <Link
                  to={`/search?q=${encodeURIComponent(search.query)}`}
                  className="flex-shrink-0 rounded p-1.5 text-[#5A6472] hover:text-[#0B3D91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                  title={`Re-run "${search.query}"`}
                  aria-label={`Re-run saved search ${search.name}`}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(search)}
                  className="flex-shrink-0 rounded p-1.5 text-[#5A6472] hover:text-[#D64545] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64545]"
                  title="Remove saved search"
                  aria-label={`Remove saved search ${search.name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
