import { useState } from "react";
import { Check, Clipboard, Download, FilePlus2, LoaderCircle, Sparkles, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { askRepositoryAi } from "../../lib/aiSearch";
import { createResearchNote, createWorkspace, loadWorkspaces } from "../../lib/supabaseWorkspace";
import type { RepositoryDocument } from "../../types/repository";
import type { CreateWorkspaceFormData, Workspace } from "../../types/workspace";
import CreateWorkspaceModal from "../workspaces/CreateWorkspaceModal";

const UNAVAILABLE = "Not available in the selected evidence.";

const PROPOSAL_SECTIONS = [
  { id: "researchFinding", title: "Research Finding" },
  { id: "problemIdentified", title: "Problem Identified" },
  { id: "affectedGeography", title: "Affected Geography" },
  { id: "existingPolicyContext", title: "Existing Policy Context" },
  { id: "proposedIntervention", title: "Proposed Intervention" },
  { id: "expectedOutcomes", title: "Expected Outcomes" },
  { id: "risksAndTradeoffs", title: "Risks and Trade-offs" },
  { id: "evidence", title: "Evidence" },
  { id: "dataAndMethodology", title: "Data/Methodology" },
  { id: "questionsForResearch", title: "Questions for Further Research" },
] as const;

type ProposalSectionId = (typeof PROPOSAL_SECTIONS)[number]["id"];
type ProposalSections = Record<ProposalSectionId, string>;

interface SavedProposalDraft {
  documentId: string;
  documentTitle: string;
  sections: ProposalSections;
  updatedAt: string;
}

interface PolicyProposalWorkspaceProps {
  document: RepositoryDocument;
  onClose: () => void;
}

function emptySections(): ProposalSections {
  return Object.fromEntries(PROPOSAL_SECTIONS.map(({ id }) => [id, ""])) as ProposalSections;
}

function proposalStorageKey(documentId: string): string {
  return `land-governance:policy-proposal:v1:${documentId}`;
}

function loadSavedDraft(documentId: string): ProposalSections {
  try {
    const serialized = localStorage.getItem(proposalStorageKey(documentId));
    if (!serialized) return emptySections();
    const saved = JSON.parse(serialized) as Partial<SavedProposalDraft>;
    if (saved.documentId !== documentId || !saved.sections || typeof saved.sections !== "object") return emptySections();
    return Object.fromEntries(PROPOSAL_SECTIONS.map(({ id }) => [
      id,
      typeof saved.sections?.[id] === "string" ? saved.sections[id] : "",
    ])) as ProposalSections;
  } catch {
    return emptySections();
  }
}

function hasSavedDraft(documentId: string): boolean {
  try {
    const serialized = localStorage.getItem(proposalStorageKey(documentId));
    if (!serialized) return false;
    const saved = JSON.parse(serialized) as Partial<SavedProposalDraft>;
    return saved.documentId === documentId && Boolean(saved.sections && typeof saved.sections === "object");
  } catch {
    return false;
  }
}

function buildProposalPrompt(document: RepositoryDocument): string {
  const title = document.title.slice(0, 120);
  return [
    `Draft a policy proposal from the one verified repository record titled "${title}".`,
    "Use only its verified metadata, description, and summary. Do not assume you read an attached file.",
    "No outside facts, laws, statistics, sources, or invented evidence/citations. This is not an official recommendation.",
    `For unsupported sections write exactly: "${UNAVAILABLE}".`,
    "Return plain text with exactly these headings:",
    ...PROPOSAL_SECTIONS.map(({ title }, index) => `${index + 1}. ${title}:`),
    "Do not write Evidence or add citation numbers; the application fills Evidence from the selected record.",
    "Separate findings from suggestions and mark uncertainty instead of filling gaps.",
  ].join("\n");
}

function parseProposalSections(answer: string, document: RepositoryDocument): ProposalSections {
  const sections = emptySections();
  const lines = answer.replace(/```(?:text|markdown)?/gi, "").split(/\r?\n/);
  let activeSection: ProposalSectionId | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^\s{0,3}(?:#{1,6}\s*)?(?:\d+[.)]\s*)?(?:\*\*)?([^:*]+?)(?:\*\*)?\s*:\s*(.*)$/);
    if (headingMatch) {
      const normalizedHeading = headingMatch[1].trim().toLocaleLowerCase();
      const section = PROPOSAL_SECTIONS.find(({ title }) => title.toLocaleLowerCase() === normalizedHeading);
      if (section) {
        activeSection = section.id;
        if (activeSection !== "evidence" && headingMatch[2].trim()) {
          sections[activeSection] = headingMatch[2].trim();
        }
        continue;
      }
    }
    if (activeSection && activeSection !== "evidence") {
      const content = line.trim();
      if (content) sections[activeSection] = [sections[activeSection], content].filter(Boolean).join("\n");
    }
  }

  for (const { id } of PROPOSAL_SECTIONS) {
    if (id !== "evidence" && !sections[id].trim()) sections[id] = UNAVAILABLE;
  }

  const geography = [document.district, document.state].filter(Boolean).join(", ");
  const source = [document.institution, document.author].filter(Boolean).join("; ");
  const year = document.publishedAt ? new Date(document.publishedAt).getFullYear() : null;
  sections.evidence = [
    `Selected repository document: ${document.title}`,
    `Document ID: ${document.id}`,
    source ? `Source recorded: ${source}` : `Source: ${UNAVAILABLE}`,
    year && Number.isFinite(year) ? `Publication year: ${year}` : `Publication year: ${UNAVAILABLE}`,
    geography ? `Geography recorded: ${geography}` : `Geography: ${UNAVAILABLE}`,
  ].join("\n");

  return sections;
}

function formatProposal(document: RepositoryDocument, sections: ProposalSections): string {
  return [
    "AI-generated draft — requires researcher validation.",
    `Source document: ${document.title}`,
    `Document ID: ${document.id}`,
    "",
    ...PROPOSAL_SECTIONS.flatMap(({ id, title }) => [title, sections[id] || UNAVAILABLE, ""]),
  ].join("\n");
}

export default function PolicyProposalWorkspace({ document, onClose }: PolicyProposalWorkspaceProps) {
  const { user } = useAuth();
  const [sections, setSections] = useState<ProposalSections>(() => loadSavedDraft(document.id));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(() => hasSavedDraft(document.id));
  const [copyMessage, setCopyMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [showWorkspacePicker, setShowWorkspacePicker] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [isAddingToWorkspace, setIsAddingToWorkspace] = useState(false);

  const updateSection = (id: ProposalSectionId, value: string) => {
    setSections((current) => ({ ...current, [id]: value }));
    setIsSaved(false);
    setCopyMessage("");
  };

  const generateProposal = async () => {
    setIsGenerating(true);
    setError(null);
    setIsSaved(false);
    try {
      const answer = await askRepositoryAi(buildProposalPrompt(document), [document.id]);
      if (!answer.supportingDocuments.some((supportingDocument) => supportingDocument.id === document.id)) {
        throw new Error("The selected document could not be verified as AI evidence. No proposal was generated.");
      }
      setSections(parseProposalSections(answer.answer, document));
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate a proposal draft.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDraft = () => {
    try {
      const savedDraft: SavedProposalDraft = {
        documentId: document.id,
        documentTitle: document.title,
        sections,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(proposalStorageKey(document.id), JSON.stringify(savedDraft));
      setIsSaved(true);
      setError(null);
    } catch {
      setError("The draft could not be saved in this browser. Copy or export your work before leaving.");
    }
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(formatProposal(document, sections));
      setCopyMessage("Proposal copied.");
    } catch {
      setCopyMessage("Clipboard access is unavailable. Use Export .txt instead.");
    }
  };

  const exportDraft = () => {
    const blob = new Blob([formatProposal(document, sections)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${document.title.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "policy-proposal"}.txt`;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const openWorkspacePicker = async () => {
    setError(null);
    if (!user) {
      setError("Sign in to add this proposal to a workspace.");
      return;
    }
    setShowWorkspacePicker(true);
    setIsLoadingWorkspaces(true);
    const result = await loadWorkspaces(user.id);
    setWorkspaces(result.workspaces);
    setError(result.error);
    setIsLoadingWorkspaces(false);
  };

  const addToWorkspace = async () => {
    if (!user || !selectedWorkspaceId) return;
    setIsAddingToWorkspace(true);
    setError(null);
    const title = `${document.title} — Policy Proposal Draft`;
    const result = await createResearchNote(selectedWorkspaceId, user.id, title, formatProposal(document, sections));
    setIsAddingToWorkspace(false);
    if (result.error || !result.note) {
      setError(result.error || "The proposal could not be added to this workspace.");
      return;
    }
    setShowWorkspacePicker(false);
    setCopyMessage("Proposal added to the selected workspace as a research note.");
  };

  const handleCreateWorkspace = async (formData: CreateWorkspaceFormData) => {
    if (!user) {
      setError("Sign in to create a workspace.");
      return;
    }
    setError(null);
    const result = await createWorkspace(
      formData.name,
      formData.description,
      user.id,
      formData.researchTheme,
      formData.accessLevel,
      formData.objective,
    );
    if (result.error) {
      setError(result.error);
      return;
    }

    let createdWorkspace = result.workspace;
    if (!createdWorkspace) {
      const refreshed = await loadWorkspaces(user.id);
      if (refreshed.error) {
        setError(refreshed.error);
        return;
      }
      createdWorkspace = refreshed.workspaces.find((workspace) => workspace.name === formData.name) ?? null;
      if (!createdWorkspace) {
        setError("Workspace created, but it could not be loaded. Close this panel and try again.");
        return;
      }
    }

    setWorkspaces((current) => [createdWorkspace!, ...current.filter((workspace) => workspace.id !== createdWorkspace!.id)]);
    setSelectedWorkspaceId(createdWorkspace.id);
    setShowCreateWorkspaceModal(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-[#1F2933]/55 p-3 sm:p-6" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="policy-proposal-title" className="mx-auto my-3 max-w-5xl overflow-hidden rounded-md border border-[#D9E0E8] bg-[#F5F7FA] shadow-xl sm:my-6">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#D9E0E8] bg-white px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 rounded-md bg-[#E8F0FB] p-2 text-[#0B3D91]"><FilePlus2 className="h-5 w-5" aria-hidden="true" /></span>
            <div className="min-w-0">
              <h2 id="policy-proposal-title" className="font-poppins text-lg font-semibold text-[#1F2933] sm:text-xl">Policy Proposal Draft</h2>
              <p className="mt-1 truncate text-sm text-[#5A6472]" title={document.title}>{document.title}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#D0D5DD] bg-white px-3 text-sm font-medium text-[#344054] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">
            <X className="h-4 w-4" aria-hidden="true" />
            Back to Document
          </button>
        </header>

        <div className="space-y-5 p-4 sm:p-6">
          <div className="rounded-md border border-[#B9CCE9] bg-[#F0F5FC] p-4">
            <p className="font-semibold text-[#244C82]">AI-generated draft — requires researcher validation.</p>
            <p className="mt-1 text-sm leading-6 text-[#244C82]">This is not an official government recommendation. Generation uses the selected repository record’s verified metadata, description, and summary; the attached file itself is not read by this AI request.</p>
            <p className="mt-2 text-xs leading-5 text-[#52606D]">Evidence is populated from this record’s stored fields only. Unsupported sections are marked “{UNAVAILABLE}” for researcher completion.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void generateProposal()} disabled={isGenerating} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] disabled:cursor-wait disabled:opacity-60">
              {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
              {isGenerating ? "Generating draft…" : "Generate Proposal Draft"}
            </button>
            <button type="button" onClick={saveDraft} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#0B3D91] bg-white px-4 py-2 text-sm font-semibold text-[#0B3D91] hover:bg-[#F0F5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">
              {isSaved ? <Check className="h-4 w-4" aria-hidden="true" /> : null}{isSaved ? "Draft Saved" : "Save Draft"}
            </button>
            <button type="button" onClick={() => void copyDraft()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm font-medium text-[#344054] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">
              <Clipboard className="h-4 w-4" aria-hidden="true" />Copy Draft
            </button>
            <button type="button" onClick={exportDraft} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm font-medium text-[#344054] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">
              <Download className="h-4 w-4" aria-hidden="true" />Export .txt
            </button>
            <button type="button" onClick={() => void openWorkspacePicker()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm font-medium text-[#344054] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]">
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />Add to Workspace
            </button>
          </div>

          {error && <p role="alert" className="rounded-md border border-[#F1C6C3] bg-[#FFF7F6] px-3 py-2 text-sm text-[#9E2A22]">{error}</p>}
          {copyMessage && <p role="status" className="text-sm text-[#138808]">{copyMessage}</p>}

          {showWorkspacePicker && (
            <section className="rounded-md border border-[#D9E0E8] bg-white p-4" aria-labelledby="proposal-workspace-heading">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id="proposal-workspace-heading" className="font-semibold text-[#1F2933]">Add proposal as a research note</h3>
                <button type="button" onClick={() => setShowWorkspacePicker(false)} className="rounded p-1 text-[#667085] hover:bg-[#F2F4F7]" aria-label="Close workspace picker"><X className="h-4 w-4" aria-hidden="true" /></button>
              </div>
              {isLoadingWorkspaces ? <p role="status" className="mt-3 text-sm text-[#667085]">Loading your workspaces…</p> : error ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#9E2A22]">{error}</p><button type="button" onClick={() => void openWorkspacePicker()} className="text-sm font-semibold text-[#0B3D91] underline">Retry</button></div> : workspaces.length === 0 ? <div className="mt-3 rounded-md border border-dashed border-[#D9E0E8] bg-[#F8FAFC] p-4"><p className="text-sm text-[#475467]">You don’t have a workspace yet. Create one to add this proposal as a research note.</p><button type="button" onClick={() => setShowCreateWorkspaceModal(true)} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63]">Create Workspace</button></div> : <>
                <label htmlFor="proposal-workspace-select" className="mt-3 block text-sm font-medium text-[#344054]">Workspace</label>
                <select id="proposal-workspace-select" value={selectedWorkspaceId} onChange={(event) => setSelectedWorkspaceId(event.target.value)} className="mt-1.5 min-h-10 w-full rounded-md border border-[#D0D5DD] bg-white px-3 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20">
                  <option value="">Select a workspace</option>
                  {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
                </select>
                <button type="button" onClick={() => void addToWorkspace()} disabled={!selectedWorkspaceId || isAddingToWorkspace} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-[#138808] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0E6806] disabled:cursor-not-allowed disabled:opacity-50">
                  {isAddingToWorkspace && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  Add Note
                </button>
              </>}
            </section>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {PROPOSAL_SECTIONS.map(({ id, title }) => (
              <section key={id} className={`rounded-md border border-[#D9E0E8] bg-white p-4 ${id === "evidence" ? "md:col-span-2" : ""}`}>
                <label htmlFor={`proposal-${id}`} className="block text-sm font-semibold text-[#1F2933]">{title}</label>
                {id === "evidence" && <p className="mt-1 text-xs leading-5 text-[#667085]">Prefilled from the selected repository record. Verify before editing; do not add unsupported evidence.</p>}
                <textarea id={`proposal-${id}`} rows={id === "evidence" ? 5 : 4} value={sections[id]} onChange={(event) => updateSection(id, event.target.value)} placeholder={UNAVAILABLE} className="mt-2 w-full resize-y rounded-md border border-[#D0D5DD] bg-white px-3 py-2.5 text-sm leading-6 text-[#1F2933] outline-none focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20" />
              </section>
            ))}
          </div>
        </div>
      </section>
      {showCreateWorkspaceModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateWorkspaceModal(false)}
          onSubmit={(formData) => void handleCreateWorkspace(formData)}
        />
      )}
    </div>
  );
}