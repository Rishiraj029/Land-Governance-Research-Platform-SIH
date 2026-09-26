import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  FileText,
  Info,
  Lightbulb,
  Loader2,
  Shield,
  Users,
} from "lucide-react";
import { loadAdminInnovations, loadAdminOverview, loadAdminProfiles, type AdminOverview } from "../../lib/supabaseAdmin";
import { loadRepositoryDocuments } from "../../lib/supabaseRepository";
import { ROLE_LABELS } from "../../lib/roles";
import type { Profile } from "../../types/auth";
import type { RepositoryDocument } from "../../types/repository";

type AdminTab = "overview" | "repository" | "innovations" | "users";

const TABS: { id: AdminTab; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "repository", label: "Repository Content", icon: FileText },
  { id: "innovations", label: "Innovations", icon: Lightbulb },
  { id: "users", label: "Users", icon: Users },
];

const INNOVATION_STATUS_STYLES: Record<string, string> = {
  Submitted: "bg-[#E8A33D]/10 text-[#8A5A12] border-[#E8A33D]/20",
  "Under Review": "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20",
  Approved: "bg-[#138808]/10 text-[#138808] border-[#138808]/20",
  Rejected: "bg-[#D64545]/10 text-[#D64545] border-[#D64545]/20",
};

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#1F2933]">{title}</h2>
      {children}
    </section>
  );
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-6 text-sm text-[#5A6472]" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-[#0B3D91]" aria-hidden="true" />
      {label}
    </div>
  );
}

function ErrorRow({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-[#F1C6C3] bg-[#FFF7F6] p-4 text-sm text-[#9E2A22]" role="alert">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#C9D2DC] px-5 py-8 text-center">
      <p className="text-sm text-[#5A6472]">{message}</p>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Admin Panel.
 *
 * Read-only and entirely data-backed: every figure comes from a real table queried with the
 * administrator's own session. There are no approve/reject/deactivate controls because no RLS
 * policy on these tables grants those writes, so such buttons could never succeed.
 */
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  const [innovations, setInnovations] = useState<Awaited<ReturnType<typeof loadAdminInnovations>>["innovations"]>([]);
  const [innovationsLoading, setInnovationsLoading] = useState(true);
  const [innovationsError, setInnovationsError] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;

    loadAdminOverview()
      .then((result) => {
        if (!current) return;
        setOverview(result);
        setOverviewError(null);
      })
      .finally(() => {
        if (current) setOverviewLoading(false);
      });

    // Newest-ingested first ('Relevance' is the repository service's chronological ordering).
    loadRepositoryDocuments(undefined, undefined, "Relevance", 1, 25)
      .then((result) => {
        if (!current) return;
        if (result.error) setDocumentsError(result.error);
        else {
          setDocuments(result.documents);
          setDocumentsError(null);
        }
      })
      .finally(() => {
        if (current) setDocumentsLoading(false);
      });

    loadAdminInnovations(100)
      .then((result) => {
        if (!current) return;
        if (result.error) setInnovationsError(result.error);
        else {
          setInnovations(result.innovations);
          setInnovationsError(null);
        }
      })
      .finally(() => {
        if (current) setInnovationsLoading(false);
      });

    loadAdminProfiles(50)
      .then((result) => {
        if (!current) return;
        if (result.error) setProfilesError(result.error);
        else {
          setProfiles(result.profiles);
          setProfilesError(null);
        }
      })
      .finally(() => {
        if (current) setProfilesLoading(false);
      });

    return () => {
      current = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#0B3D91]" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-[#1F2933]">Admin Panel</h1>
          </div>
          <p className="mt-1 text-sm text-[#5A6472]">
            Platform overview and read-only content views, built from live database records.
          </p>
        </div>
      </div>

      {/* Data-scope notice */}
      <div className="flex items-start gap-3 rounded-lg border border-[#DCE2E8] bg-[#F0F5FB] p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#0B3D91]" aria-hidden="true" />
        <p className="text-sm text-[#344054]">
          <strong className="font-semibold">Read-only.</strong> Content moderation, user
          suspension and role changes are not offered here because no row-level security policy
          on these tables permits them — the interface only shows what your session may read.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E1E5EA]">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Admin sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] ${
                activeTab === tab.id
                  ? "border-[#0B3D91] text-[#0B3D91]"
                  : "border-transparent text-[#5A6472] hover:text-[#0B3D91]"
              }`}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {overviewLoading && <LoadingRow label="Loading platform statistics" />}
          {!overviewLoading && overviewError && <ErrorRow message={overviewError} />}
          {!overviewLoading && overview && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {overview.metrics
                  .filter((metric) => metric.value !== null)
                  .map((metric) => (
                    <div key={metric.key} className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
                      <p className="text-sm text-[#5A6472]">{metric.label}</p>
                      <p className="mt-1 text-2xl font-bold text-[#1F2933]">{metric.value?.toLocaleString()}</p>
                      <p className="mt-1 text-xs text-[#5A6472]">{metric.hint}</p>
                    </div>
                  ))}
              </div>

              {overview.metrics.every((metric) => metric.value === null) && (
                <EmptyRow message="No platform statistics are readable by this account." />
              )}

              {overview.unavailable.length > 0 && (
                <div className="rounded-lg border border-[#E8A33D]/30 bg-[#E8A33D]/10 p-4">
                  <p className="text-sm font-medium text-[#8A5A12]">Not shown, and why</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-[#8A5A12]">
                    {overview.unavailable.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Panel title="Newest repository records">
                {overview.recentDocuments.length === 0 ? (
                  <EmptyRow message="No repository documents are readable by this account." />
                ) : (
                  <ul className="divide-y divide-[#E1E5EA]">
                    {overview.recentDocuments.map((document) => (
                      <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                        <div className="min-w-0">
                          <Link
                            to={`/repository/${document.id}`}
                            className="truncate text-sm font-medium text-[#0B3D91] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                          >
                            {document.title}
                          </Link>
                          <p className="text-xs text-[#5A6472]">
                            {[document.contentType, document.state, formatDate(document.createdAt)]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <span className="text-xs text-[#5A6472]">
                          {document.hasOwner ? "Uploaded by a user" : "Imported record"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel title="Newest innovation submissions">
                {overview.recentInnovations.length === 0 ? (
                  <EmptyRow message="No innovation submissions have been recorded yet." />
                ) : (
                  <ul className="divide-y divide-[#E1E5EA]">
                    {overview.recentInnovations.map((innovation) => (
                      <li key={innovation.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#1F2933]">{innovation.title}</p>
                          <p className="text-xs text-[#5A6472]">
                            {[innovation.organization, formatDate(innovation.createdAt)].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        {innovation.status && (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                              INNOVATION_STATUS_STYLES[innovation.status] ??
                              "border-gray-200 bg-gray-100 text-gray-600"
                            }`}
                          >
                            {innovation.status}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </>
          )}
        </div>
      )}

      {/* Repository content */}
      {activeTab === "repository" && (
        <Panel title="Repository documents (newest 25)">
          {documentsLoading && <LoadingRow label="Loading repository documents" />}
          {!documentsLoading && documentsError && <ErrorRow message={documentsError} />}
          {!documentsLoading && !documentsError && documents.length === 0 && (
            <EmptyRow message="The repository has no documents." />
          )}
          {!documentsLoading && !documentsError && documents.length > 0 && (
            <>
              <ul className="divide-y divide-[#E1E5EA]">
                {documents.map((document) => (
                  <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0">
                      <Link
                        to={`/repository/${document.id}`}
                        className="truncate text-sm font-medium text-[#0B3D91] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                      >
                        {document.title}
                      </Link>
                      <p className="text-xs text-[#5A6472]">
                        {[document.contentType, document.theme, document.state, document.institution]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span className="text-xs text-[#5A6472]">
                      {document.createdBy ? "Uploaded by a user" : "Imported record"}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/repository"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#D0D5DD] px-4 py-2 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
              >
                Open the full repository
              </Link>
            </>
          )}
        </Panel>
      )}

      {/* Innovations */}
      {activeTab === "innovations" && (
        <Panel title="Innovation submissions (newest 100)">
          {innovationsLoading && <LoadingRow label="Loading innovation submissions" />}
          {!innovationsLoading && innovationsError && <ErrorRow message={innovationsError} />}
          {!innovationsLoading && !innovationsError && innovations.length === 0 && (
            <EmptyRow message="No innovation submissions have been recorded yet." />
          )}
          {!innovationsLoading && !innovationsError && innovations.length > 0 && (
            <ul className="divide-y divide-[#E1E5EA]">
              {innovations.map((innovation) => (
                <li key={innovation.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1F2933]">{innovation.title}</p>
                    <p className="text-xs text-[#5A6472]">
                      {[innovation.organization, formatDate(innovation.createdAt)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {innovation.status && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          INNOVATION_STATUS_STYLES[innovation.status] ?? "border-gray-200 bg-gray-100 text-gray-600"
                        }`}
                      >
                        {innovation.status}
                      </span>
                    )}
                    <Link
                      to="/innovation-portal"
                      className="text-xs font-medium text-[#0B3D91] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                    >
                      Open portal
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <Panel title="Registered profiles">
          {profilesLoading && <LoadingRow label="Loading profiles" />}
          {!profilesLoading && profilesError && <ErrorRow message={profilesError} />}
          {!profilesLoading && !profilesError && profiles.length === 0 && (
            <EmptyRow message="No profile rows are readable by this account." />
          )}
          {!profilesLoading && !profilesError && profiles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left">
                <thead className="border-b border-[#E1E5EA] bg-[#F5F7FA]">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#5A6472]">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#5A6472]">
                      Role
                    </th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#5A6472]">
                      Institution
                    </th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#5A6472]">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5EA]">
                  {profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-4 py-3 text-sm font-medium text-[#1F2933]">
                        {profile.full_name || "Unnamed profile"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#5A6472]">
                        {ROLE_LABELS[profile.role] ?? profile.role}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#5A6472]">{profile.institution || "—"}</td>
                      <td className="px-4 py-3 text-sm text-[#5A6472]">{formatDate(profile.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
