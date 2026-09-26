import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { CreateInnovationInput } from '../../types/innovation';

interface SubmitInnovationModalProps {
  onClose: () => void;
  onSubmit: (data: CreateInnovationInput) => Promise<void>;
  submitting: boolean;
  error: string | null;
}

const EMPTY_FORM: CreateInnovationInput = { title: '', description: '', category: '', state: '', district: '', organization: '' };

export default function SubmitInnovationModal({ onClose, onSubmit, submitting, error }: SubmitInnovationModalProps) {
  const [formData, setFormData] = useState<CreateInnovationInput>(EMPTY_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !submitting) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, submitting]);

  const update = (field: keyof CreateInnovationInput, value: string) => setFormData((current) => ({ ...current, [field]: value }));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missing = Object.entries(formData).find(([, value]) => !value.trim());
    if (missing) { setValidationError('Complete all fields before submitting your innovation.'); return; }
    setValidationError(null);
    await onSubmit(Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, value.trim()])) as CreateInnovationInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2933]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="submit-innovation-title">
        <div className="flex items-start justify-between border-b border-[#E1E5EA] p-5">
          <div><h2 id="submit-innovation-title" className="text-xl font-semibold text-[#1F2933]">Submit an innovation</h2><p className="mt-1 text-sm text-[#5A6472]">Your submission will be recorded as Submitted for review.</p></div>
          <button type="button" onClick={onClose} disabled={submitting} className="rounded p-1 text-[#5A6472] hover:bg-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#FF9933]" aria-label="Close submission form"><X className="h-5 w-5" /></button>
        </div>
        <form className="space-y-4 p-5" onSubmit={handleSubmit} noValidate>
          {(validationError || error) && <p className="rounded-md border border-[#D64545]/30 bg-red-50 p-3 text-sm text-[#D64545]" role="alert">{validationError || error}</p>}
          <Field label="Innovation title" value={formData.title} onChange={(value) => update('title', value)} autoFocus />
          <label className="block text-sm font-medium text-[#1F2933]">Description<textarea value={formData.description} onChange={(event) => update('description', event.target.value)} required rows={5} className="mt-1 w-full rounded-md border border-[#E1E5EA] p-3 text-sm focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#FF9933]" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Category" value={formData.category} onChange={(value) => update('category', value)} /><Field label="Organization" value={formData.organization} onChange={(value) => update('organization', value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="State" value={formData.state} onChange={(value) => update('state', value)} /><Field label="District" value={formData.district} onChange={(value) => update('district', value)} /></div>
          <div className="flex flex-col-reverse gap-3 border-t border-[#E1E5EA] pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={submitting} className="rounded-md px-4 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#FF9933]">Cancel</button><button type="submit" disabled={submitting} className="rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#FF9933]">{submitting ? 'Submitting…' : 'Submit innovation'}</button></div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, autoFocus = false }: { label: string; value: string; onChange: (value: string) => void; autoFocus?: boolean }) {
  return <label className="block text-sm font-medium text-[#1F2933]">{label}<input type="text" value={value} onChange={(event) => onChange(event.target.value)} required autoFocus={autoFocus} className="mt-1 w-full rounded-md border border-[#E1E5EA] p-3 text-sm focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#FF9933]" /></label>;
}
