import { supabase } from './supabase';

/**
 * Client for the backend AI endpoint (POST /api/ai/search).
 *
 * Shared by Repository Search (`/search`) and Document Detail (`/repository/:id`) so the
 * request contract, the friendly error copy, and the Gemini key boundary live in one place.
 * The browser only ever sends a question plus repository document IDs — the Gemini API key
 * stays on the server.
 */

export interface AiSupportingDocument {
  id: string;
  title: string;
  contentType: string | null;
  theme: string | null;
  state: string | null;
  author: string | null;
  institution: string | null;
}

export interface AiAnswer {
  answer: string;
  disclaimer: string;
  supportingDocuments: AiSupportingDocument[];
  model: string | null;
}

interface AiSearchResponse {
  answer?: string;
  model?: string;
  disclaimer?: string;
  supportingDocuments?: AiSupportingDocument[];
  error?: string;
}

const DEFAULT_DISCLAIMER = 'AI-generated response based on repository documents. Not official government advice.';

/**
 * Requests go to the relative `/api` path so the Vite dev proxy (and any same-origin
 * production deployment) forwards them to the Express backend. Override with
 * VITE_BACKEND_URL only when the API lives on a different origin.
 */
const BACKEND_BASE_URL = String(import.meta.env.VITE_BACKEND_URL ?? '').replace(/\/$/, '');

/** Must stay in step with MAX_CONTEXT_DOCUMENTS on the server. */
export const MAX_AI_CONTEXT_DOCUMENTS = 10;

/**
 * Ask Gemini a question grounded in specific repository documents.
 *
 * Throws an Error carrying user-facing copy when the query is empty, the backend is
 * unreachable, the server is not configured, or Gemini fails — callers show that message
 * alongside the repository content that still works.
 */
export async function askRepositoryAi(query: string, documentIds: string[]): Promise<AiAnswer> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new Error('Enter a question or choose an analysis action.');
  }

  const ids = [...new Set(documentIds.filter(Boolean))].slice(0, MAX_AI_CONTEXT_DOCUMENTS);
  if (ids.length === 0) {
    throw new Error('No relevant repository documents were found for this query.');
  }

  // Forwarding the caller's token lets the server verify the IDs under that user's RLS.
  let accessToken: string | undefined;
  try {
    const { data } = await supabase.auth.getSession();
    accessToken = data.session?.access_token;
  } catch {
    // Signed-out visitors simply fall back to the server's public anon key.
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_BASE_URL}/api/ai/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ query: cleanQuery, documentIds: ids }),
    });
  } catch {
    throw new Error(
      'The AI service could not be reached. Start the backend API (npm run dev in backend/) to enable AI analysis.'
    );
  }

  // A proxy or gateway failure can answer with HTML, so parsing is guarded.
  const result = (await response.json().catch(() => ({}))) as AiSearchResponse;

  if (!response.ok || result.error) {
    // The server appends its own reassurance sentence; callers render their own context,
    // so drop it here to avoid showing the same line twice.
    const message = (result.error || `AI request failed (${response.status}).`).replace(
      /\s*You can still review the matching repository documents\.?$/i,
      ''
    );
    throw new Error(message);
  }

  if (!result.answer) {
    throw new Error('The AI service returned no answer for these documents.');
  }

  return {
    answer: result.answer,
    disclaimer: result.disclaimer ?? DEFAULT_DISCLAIMER,
    supportingDocuments: result.supportingDocuments ?? [],
    model: result.model ?? null,
  };
}
