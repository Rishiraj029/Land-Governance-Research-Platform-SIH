import { useEffect, useMemo, useState } from 'react';
import { Lightbulb, LoaderCircle, MapPin, Search, ThumbsUp, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SubmitInnovationModal from '../components/innovation/SubmitInnovationModal';
import Toast from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import {
  buildInnovationFilterOptions, EMPTY_INNOVATION_FILTERS, filterInnovations,
  loadInnovations, loadSupportedInnovationIds, submitInnovation, supportInnovation, unsupportInnovation,
} from '../lib/supabaseInnovations';
import type { CreateInnovationInput, Innovation, InnovationFilters } from '../types/innovation';

const dateFormat = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });
const display = (value: string | null) => value?.trim() || 'Not specified';
const formatDate = (value: string | null) => { if (!value) return 'Not specified'; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : dateFormat.format(date); };

export default function InnovationPortal() {
  const { user, loading: authLoading } = useAuth();
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [filters, setFilters] = useState<InnovationFilters>(EMPTY_INNOVATION_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supportedIds, setSupportedIds] = useState<Set<string>>(new Set());
  const [supportingId, setSupportingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Innovation | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true); setError(null);
    const result = await loadInnovations();
    setInnovations(result.innovations); setError(result.error); setLoading(false);
  };
  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    let active = true;
    if (!user) {
      const timer = window.setTimeout(() => { if (active) setSupportedIds(new Set()); }, 0);
      return () => { active = false; window.clearTimeout(timer); };
    }
    void loadSupportedInnovationIds(user.id).then((result) => {
      if (!active) return;
      if (result.error) setToast(result.error); else setSupportedIds(new Set(result.ids));
    });
    return () => { active = false; };
  }, [user]);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', closeOnEscape); return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const options = useMemo(() => buildInnovationFilterOptions(innovations, filters), [innovations, filters]);
  const visible = useMemo(() => filterInnovations(innovations, filters), [innovations, filters]);
  const hasActiveFilters = Object.values(filters).some(Boolean);
  const updateFilters = (next: Partial<InnovationFilters>) => setFilters((current) => {
    const updated = { ...current, ...next };
    if (Object.hasOwn(next, 'state') && current.district && current.state !== next.state) updated.district = '';
    return updated;
  });

  const replaceInnovation = (innovation: Innovation) => {
    setInnovations((current) => current.map((item) => item.id === innovation.id ? innovation : item));
    setSelected((current) => current?.id === innovation.id ? innovation : current);
  };
  const handleSupport = async (innovation: Innovation) => {
    if (!user) { setToast('Please log in to support an innovation.'); return; }
    setSupportingId(innovation.id);
    const supported = supportedIds.has(innovation.id);
    const result = supported ? await unsupportInnovation(innovation.id, user.id) : await supportInnovation(innovation.id, user.id);
    setSupportingId(null);
    if (result.error) { setToast(result.error); return; }
    if (result.innovation) replaceInnovation(result.innovation);
    setSupportedIds((current) => { const next = new Set(current); if (supported) next.delete(innovation.id); else next.add(innovation.id); return next; });
    setToast(supported ? 'Support removed.' : 'Your support was recorded.');
  };
  const handleSubmit = async (input: CreateInnovationInput) => {
    if (!user) { setSubmissionError('Please log in before submitting an innovation.'); return; }
    setSubmitting(true); setSubmissionError(null);
    const result = await submitInnovation(input, user.id);
    setSubmitting(false);
    if (result.error) { setSubmissionError(result.error); return; }
    if (result.innovation) setInnovations((current) => [result.innovation as Innovation, ...current]);
    setShowSubmit(false); setToast('Innovation submitted successfully.');
  };

  return <div className="flex min-h-screen flex-col bg-[#F5F7FA]"><Navbar /><main className="flex-1">
    <header className="border-b border-[#E1E5EA] bg-white"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-3xl font-bold text-[#1F2933]">Innovation Portal</h1><p className="mt-2 max-w-2xl text-[#5A6472]">Discover and support land governance innovation submissions from the platform’s data source.</p></div><button onClick={() => { setSubmissionError(null); setShowSubmit(true); }} disabled={authLoading} className="rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]">Submit innovation</button></div>
      <div className="relative mt-6 max-w-2xl"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" /><input aria-label="Search innovations" value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} placeholder="Search title, description, category, location, or organization" className="w-full rounded-full border border-[#E1E5EA] bg-[#F5F7FA] py-3 pl-12 pr-4 text-sm focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#FF9933]" /></div>
    </div></header>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]"><aside className="rounded-lg border border-[#E1E5EA] bg-white p-4 lg:h-fit"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-[#1F2933]">Filters</h2>{hasActiveFilters && <button onClick={() => setFilters(EMPTY_INNOVATION_FILTERS)} className="text-sm font-medium text-[#0B3D91] hover:text-[#062A63] focus:outline-none focus:ring-2 focus:ring-[#FF9933]">Clear filters</button>}</div><Filter label="Category" value={filters.category} options={options.categories} onChange={(value) => updateFilters({ category: value })} /><Filter label="State" value={filters.state} options={options.states} onChange={(value) => updateFilters({ state: value })} /><Filter label="District" value={filters.district} options={options.districts} disabled={!options.districts.length} onChange={(value) => updateFilters({ district: value })} /><Filter label="Status" value={filters.status} options={options.statuses} onChange={(value) => updateFilters({ status: value })} /></aside>
        <section aria-live="polite">{loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={() => void refresh()} /> : innovations.length === 0 ? <EmptyState title="No innovations have been submitted yet" text="When an innovation is submitted, it will appear here." /> : <><p className="mb-4 text-sm text-[#5A6472]">{visible.length} innovation{visible.length === 1 ? '' : 's'} found</p>{visible.length === 0 ? <EmptyState title="No innovations match these filters" text="Try clearing filters or changing the search terms." /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visible.map((innovation) => <InnovationCard key={innovation.id} innovation={innovation} supported={supportedIds.has(innovation.id)} busy={supportingId === innovation.id} onOpen={() => setSelected(innovation)} onSupport={() => void handleSupport(innovation)} />)}</div>}</>}</section>
      </div>
    </div>
  </main><Footer />{showSubmit && <SubmitInnovationModal onClose={() => setShowSubmit(false)} onSubmit={handleSubmit} submitting={submitting} error={submissionError} />}{selected && <InnovationDetail innovation={selected} supported={supportedIds.has(selected.id)} busy={supportingId === selected.id} onClose={() => setSelected(null)} onSupport={() => void handleSupport(selected)} />}{toast && <Toast message={toast} onClose={() => setToast(null)} />}</div>;
}

function Filter({ label, value, options, onChange, disabled = false }: { label: string; value: string; options: string[]; onChange: (value: string) => void; disabled?: boolean }) { return <label className="mb-4 block text-sm font-medium text-[#1F2933]">{label}<select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="mt-1 w-full rounded-md border border-[#E1E5EA] bg-white p-2 text-sm disabled:bg-[#F5F7FA] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"><option value="">All {label.toLowerCase()}s</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function InnovationCard({ innovation, supported, busy, onOpen, onSupport }: { innovation: Innovation; supported: boolean; busy: boolean; onOpen: () => void; onSupport: () => void }) { return <article className="flex min-w-0 flex-col rounded-lg border border-[#E1E5EA] bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2">{innovation.status && <span className="rounded-full bg-[#0B3D91]/10 px-2.5 py-1 text-xs font-medium text-[#0B3D91]">{innovation.status}</span>}</div><button onClick={onOpen} className="mt-4 text-left text-lg font-semibold text-[#1F2933] hover:text-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#FF9933]">{display(innovation.title)}</button><p className="mt-2 line-clamp-3 text-sm text-[#5A6472]">{display(innovation.description)}</p><dl className="mt-4 space-y-1 text-sm text-[#5A6472]"><div><dt className="sr-only">Category</dt><dd>{display(innovation.category)}</dd></div><div className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" /><dd>{[innovation.district, innovation.state].filter(Boolean).join(', ') || 'Not specified'}</dd></div><div><dt className="sr-only">Organization</dt><dd>{display(innovation.organization)}</dd></div><div><dt className="sr-only">Submission date</dt><dd>Submitted {formatDate(innovation.createdAt)}</dd></div></dl><div className="mt-5 flex items-center justify-between border-t border-[#E1E5EA] pt-4"><button onClick={onOpen} className="text-sm font-semibold text-[#0B3D91] hover:text-[#062A63] focus:outline-none focus:ring-2 focus:ring-[#FF9933]">View details</button><button onClick={onSupport} disabled={busy} aria-pressed={supported} className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9933] ${supported ? 'bg-[#0B3D91] text-white' : 'text-[#0B3D91] hover:bg-[#0B3D91]/10'} disabled:opacity-60`}><ThumbsUp className="h-4 w-4" aria-hidden="true" />{busy ? 'Saving…' : `${innovation.supportCount ?? 0}`}</button></div></article>; }
function InnovationDetail({ innovation, supported, busy, onClose, onSupport }: { innovation: Innovation; supported: boolean; busy: boolean; onClose: () => void; onSupport: () => void }) { const details: [string, string][] = [['Category', display(innovation.category)], ['State', display(innovation.state)], ['District', display(innovation.district)], ['Status', display(innovation.status)], ['Organization', display(innovation.organization)], ['Submitted by', display(innovation.submittedBy)], ['Support count', String(innovation.supportCount ?? 0)], ['Created', formatDate(innovation.createdAt)], ['Last updated', formatDate(innovation.updatedAt)]]; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2933]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="innovation-detail-title" className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"><div className="flex justify-between gap-4"><h2 id="innovation-detail-title" className="text-2xl font-bold text-[#1F2933]">{display(innovation.title)}</h2><button onClick={onClose} className="h-fit rounded p-1 text-[#5A6472] hover:bg-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#FF9933]" aria-label="Close innovation details"><X className="h-5 w-5" /></button></div><p className="mt-5 whitespace-pre-wrap text-[#5A6472]">{display(innovation.description)}</p><dl className="mt-6 grid gap-4 border-t border-[#E1E5EA] pt-5 sm:grid-cols-2">{details.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-[#5A6472]">{label}</dt><dd className="mt-1 text-sm text-[#1F2933] break-words">{value}</dd></div>)}</dl><div className="mt-6 flex justify-end"><button onClick={onSupport} disabled={busy} aria-pressed={supported} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF9933] ${supported ? 'bg-[#0B3D91] text-white' : 'border border-[#0B3D91] text-[#0B3D91]'} disabled:opacity-60`}><ThumbsUp className="h-4 w-4" />{busy ? 'Saving…' : supported ? 'Remove support' : 'Support innovation'}</button></div></section></div>; }
function LoadingState() { return <div className="flex min-h-64 flex-col items-center justify-center text-[#5A6472]"><LoaderCircle className="h-7 w-7 animate-spin text-[#0B3D91]" /><p className="mt-3">Loading innovation records…</p></div>; }
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) { return <div className="rounded-lg border border-[#D64545]/30 bg-white p-6"><h2 className="font-semibold text-[#1F2933]">Innovation records could not be loaded</h2><p className="mt-2 text-sm text-[#D64545]">{error}</p><button onClick={onRetry} className="mt-4 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]">Retry</button></div>; }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="rounded-lg border border-[#E1E5EA] bg-white p-10 text-center"><Lightbulb className="mx-auto h-10 w-10 text-[#0B3D91]" /><h2 className="mt-3 font-semibold text-[#1F2933]">{title}</h2><p className="mt-1 text-sm text-[#5A6472]">{text}</p></div>; }
