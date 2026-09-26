import { supabase } from './supabase';
import type { RepositoryDocument, ContentType, Theme, AccessTier } from '../types/repository';

// Database row interface matching public.repository_documents table
interface RepositoryDocumentRow {
  id: string;
  title: string;
  content_type: ContentType;
  description: string;
  summary: string;
  theme: string;
  author: string;
  institution: string;
  state: string;
  district: string | null;
  language: string;
  access_tier: AccessTier;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  published_at: string;
  // Nullable: the seeded government records were imported without an owner.
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Translate PostgREST/Postgres failures into user-facing copy. */
function describeRepositoryError(code: string | undefined, message: string): string {
  if (code === '42501' || message.includes('permission denied')) {
    return 'Your account does not have permission to read these repository records.';
  }
  if (code === 'PGRST205') {
    return 'The repository_documents table is not available in the database schema.';
  }
  return message || 'The request could not be completed. Please try again.';
}

// Convert database row to RepositoryDocument format
function rowToDocument(row: RepositoryDocumentRow): RepositoryDocument {
  return {
    id: row.id,
    title: row.title,
    contentType: row.content_type,
    description: row.description,
    summary: row.summary,
    author: row.author,
    institution: row.institution,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    theme: row.theme as Theme,
    state: row.state,
    district: row.district || undefined,
    language: row.language,
    accessTier: row.access_tier,
    filePath: row.file_path || undefined,
    fileName: row.file_name || undefined,
    fileSize: row.file_size || undefined,
    mimeType: row.mime_type || undefined,
    createdBy: row.created_by || undefined,
    // NOTE: repository_documents has no views/downloads/citations columns, so those
    // UI-only counters are intentionally left undefined instead of being faked as 0.
  };
}

/**
 * Strip characters that would break PostgREST's `or=(...)` filter syntax.
 * Commas separate conditions, parentheses group them, and `%`/`_` are LIKE wildcards,
 * so they must not be taken verbatim from user input.
 */
function sanitizeSearchTerm(term: string): string {
  return term
    .replace(/[,()%_:*"\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Load repository documents from Supabase
 * @param filters - Optional filters for content types, themes, states, etc.
 * @param searchQuery - Optional search query for title, author, institution, description
 * @param sortBy - Sort option (Relevance, Most Recent)
 * @param page - Page number for pagination
 * @param pageSize - Number of items per page
 * @returns Promise with documents, total count, and error
 */
export async function loadRepositoryDocuments(
  filters?: {
    contentTypes?: ContentType[];
    themes?: Theme[];
    states?: string[];
    districts?: string[];
    dateRange?: { from: string; to: string };
    languages?: string[];
    accessTiers?: AccessTier[];
  },
  searchQuery?: string,
  sortBy: 'Relevance' | 'Most Recent' = 'Relevance',
  page: number = 1,
  pageSize: number = 8
): Promise<{ documents: RepositoryDocument[]; totalCount: number; error: string | null }> {
  try {
    let query = supabase
      .from('repository_documents')
      .select('*', { count: 'exact' });

    // Apply search query against the real text columns of repository_documents.
    // The term is sanitized first so that punctuation typed by a user (for example
    // "Rights (FRA)" or "Act, 2013") cannot break the PostgREST or() expression.
    const searchTerm = searchQuery ? sanitizeSearchTerm(searchQuery) : '';
    if (searchTerm) {
      const pattern = `%${searchTerm}%`;
      query = query.or(
        [
          `title.ilike.${pattern}`,
          `content_type.ilike.${pattern}`,
          `theme.ilike.${pattern}`,
          `state.ilike.${pattern}`,
          `district.ilike.${pattern}`,
          `language.ilike.${pattern}`,
          `author.ilike.${pattern}`,
          `institution.ilike.${pattern}`,
          `description.ilike.${pattern}`,
          `summary.ilike.${pattern}`,
        ].join(',')
      );
    }

    // Apply content type filter
    if (filters?.contentTypes && filters.contentTypes.length > 0) {
      query = query.in('content_type', filters.contentTypes);
    }

    // Apply theme filter (theme is a single text column)
    if (filters?.themes && filters.themes.length > 0) {
      query = query.in('theme', filters.themes);
    }

    // Apply geography filter (state)
    if (filters?.states && filters.states.length > 0) {
      query = query.in('state', filters.states);
    }

    // Apply district filter
    if (filters?.districts && filters.districts.length > 0) {
      query = query.in('district', filters.districts);
    }

    // Apply date range filter
    if (filters?.dateRange?.from) {
      query = query.gte('published_at', filters.dateRange.from);
    }
    if (filters?.dateRange?.to) {
      query = query.lte('published_at', filters.dateRange.to);
    }

    // Apply language filter
    if (filters?.languages && filters.languages.length > 0) {
      query = query.in('language', filters.languages);
    }

    // Apply access tier filter
    if (filters?.accessTiers && filters.accessTiers.length > 0) {
      query = query.in('access_tier', filters.accessTiers);
    }

    // Apply sorting. A secondary key keeps offset pagination stable: without it,
    // rows that share the same primary sort value can come back in a different
    // order on each request and "Load more" would repeat or skip documents.
    switch (sortBy) {
      case 'Most Recent':
        query = query
          .order('published_at', { ascending: false })
          .order('title', { ascending: true });
        break;
      case 'Relevance':
      default:
        // repository_documents has no relevance/rank column, so the fallback order is
        // newest-ingested first, then title.
        query = query
          .order('created_at', { ascending: false })
          .order('title', { ascending: true });
        break;
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error loading repository documents:', error);
      return { documents: [], totalCount: 0, error: error.message };
    }

    const documents = (data || []).map(rowToDocument);
    return { documents, totalCount: count || 0, error: null };
  } catch (error) {
    console.error('Unexpected error loading repository documents:', error);
    return { documents: [], totalCount: 0, error: 'Failed to load documents' };
  }
}

/**
 * Load the repository documents contributed by one user.
 *
 * `created_by` is nullable — the seeded government records were imported without an owner —
 * so `eq('created_by', userId)` matches only rows this user actually uploaded. The filter
 * runs on the server: an earlier version downloaded a page of documents and filtered in the
 * browser against a field the row mapper never populated, so "My Uploads" always looked empty.
 */
export async function loadMyRepositoryDocuments(
  userId: string,
  limit: number = 100
): Promise<{ documents: RepositoryDocument[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('repository_documents')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error loading the signed-in user\'s repository documents:', error);
      return { documents: [], error: describeRepositoryError(error.code, error.message) };
    }

    return { documents: (data || []).map(rowToDocument), error: null };
  } catch (error) {
    console.error('Unexpected error loading the signed-in user\'s repository documents:', error);
    return { documents: [], error: 'Could not load your uploads. Please try again.' };
  }
}

const SEARCH_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'for', 'from', 'in', 'is', 'of', 'on', 'or', 'the', 'to', 'what', 'which', 'with',
]);

/** Search meaningful query words against repository metadata, then rank by coverage. */
export async function searchRepositoryDocuments(
  filters: Parameters<typeof loadRepositoryDocuments>[0],
  searchQuery: string,
  limit = 100
): Promise<{ documents: RepositoryDocument[]; totalCount: number; error: string | null }> {
  const terms = [...new Set(searchQuery.match(/[\p{L}\p{N}]+/gu) ?? [])]
    .filter((term) => term.length > 1 && !SEARCH_STOP_WORDS.has(term.toLowerCase()))
    .slice(0, 6);

  if (terms.length === 0) {
    return { documents: [], totalCount: 0, error: null };
  }

  const results = await Promise.all(
    terms.map((term) => loadRepositoryDocuments(filters, term, 'Relevance', 1, limit))
  );
  const failedResult = results.find((result) => result.error);
  if (failedResult?.error) {
    return { documents: [], totalCount: 0, error: failedResult.error };
  }

  const documentsById = new Map<string, RepositoryDocument>();
  for (const result of results) {
    for (const document of result.documents) documentsById.set(document.id, document);
  }

  const documents = [...documentsById.values()]
    .map((document) => {
      const text = [
        document.title,
        document.description,
        document.summary,
        document.contentType,
        document.theme,
        document.state,
        document.district,
        document.language,
        document.author,
        document.institution,
      ].filter(Boolean).join(' ').toLowerCase();
      const score = terms.reduce((total, term) => total + (text.includes(term.toLowerCase()) ? 1 : 0), 0);
      return { document, score };
    })
    .sort((left, right) =>
      right.score - left.score ||
      right.document.publishedAt.localeCompare(left.document.publishedAt) ||
      left.document.title.localeCompare(right.document.title)
    )
    .slice(0, limit)
    .map(({ document }) => document);

  return { documents, totalCount: documents.length, error: null };
}

/** Load filter values from real repository rows visible to the current Supabase client. */
export async function loadRepositorySearchOptions(): Promise<{
  options: {
    contentTypes: string[];
    themes: string[];
    states: string[];
    districts: string[];
    districtsByState: Record<string, string[]>;
    languages: string[];
    accessTiers: string[];
    years: string[];
  };
  error: string | null;
}> {
  const emptyOptions = {
    contentTypes: [], themes: [], states: [], districts: [], districtsByState: {}, languages: [], accessTiers: [], years: [],
  };

  try {
    const { data, error } = await supabase
      .from('repository_documents')
      .select('content_type, theme, state, district, language, access_tier, published_at')
      .order('id', { ascending: true })
      .limit(1000);

    if (error) return { options: emptyOptions, error: error.message };

    const rows = data ?? [];
    const uniqueSorted = (values: (string | null)[]) =>
      [...new Set(values.filter((value): value is string => Boolean(value?.trim())))].sort((a, b) => a.localeCompare(b));
    const districtsByState = rows.reduce<Record<string, string[]>>((districts, row) => {
      if (row.state && row.district) {
        districts[row.state] ??= [];
        districts[row.state].push(row.district);
      }
      return districts;
    }, {});

    return {
      options: {
        contentTypes: uniqueSorted(rows.map((row) => row.content_type)),
        themes: uniqueSorted(rows.map((row) => row.theme)),
        states: uniqueSorted(rows.map((row) => row.state)),
        districts: uniqueSorted(rows.map((row) => row.district)),
        districtsByState: Object.fromEntries(
          Object.entries(districtsByState).map(([state, values]) => [state, uniqueSorted(values)])
        ),
        languages: uniqueSorted(rows.map((row) => row.language)),
        accessTiers: uniqueSorted(rows.map((row) => row.access_tier)),
        years: uniqueSorted(rows.map((row) => row.published_at?.slice(0, 4) ?? null)).reverse(),
      },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error loading repository search options:', error);
    return { options: emptyOptions, error: 'Failed to load repository filters' };
  }
}

/**
 * Upload a file to Supabase Storage and insert document metadata
 * @param file - File to upload
 * @param metadata - Document metadata
 * @param userId - Authenticated user ID
 * @returns Promise with document ID and error
 */
export async function uploadRepositoryDocument(
  file: File,
  metadata: {
    contentType: ContentType;
    title: string;
    description: string;
    theme: Theme;
    state: string;
    district?: string;
    accessTier: AccessTier;
    language?: string;
    author?: string;
    institution?: string;
    summary?: string;
  },
  userId: string
): Promise<{ documentId: string | null; error: string | null }> {
  try {
    // Generate a unique document ID
    const documentId = crypto.randomUUID();
    
    // Get file extension
    const fileExtension = file.name.split('.').pop() || '';
    
    // Storage object name INSIDE the private `documents` bucket:
    //   {user-id}/{document-id}.{extension}
    // Full storage path: documents/{user-id}/{document-id}.{extension}
    //
    // The bucket name must NOT be repeated inside the object name. The "own folder"
    // storage policy authorises an insert only when the FIRST path segment is the
    // caller's own id (storage.foldername(name)[1] = auth.uid()), so a leading
    // literal "documents/" segment made foldername(name)[1] = 'documents' and
    // Storage rejected the row with "new row violates row-level security policy" (HTTP 400).
    const storagePath = `${userId}/${documentId}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Error uploading file to Storage:', uploadError);
      return { documentId: null, error: uploadError.message };
    }

    // Insert document metadata into repository_documents table
    const documentRow: Partial<RepositoryDocumentRow> = {
      id: documentId,
      title: metadata.title,
      content_type: metadata.contentType,
      description: metadata.description,
      summary: metadata.summary || metadata.description.substring(0, 200),
      author: metadata.author || 'Unknown',
      institution: metadata.institution || 'Unknown',
      theme: metadata.theme,
      state: metadata.state,
      district: metadata.district || null,
      language: metadata.language || 'English',
      access_tier: metadata.accessTier,
      file_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      published_at: new Date().toISOString().split('T')[0],
      created_by: userId,
    };

    const { error: insertError } = await supabase
      .from('repository_documents')
      .insert(documentRow);

    if (insertError) {
      console.error('Error inserting document metadata:', insertError);
      // If insert fails, try to clean up the uploaded file
      await supabase.storage.from('documents').remove([storagePath]);
      return { documentId: null, error: insertError.message };
    }

    return { documentId, error: null };
  } catch (error) {
    console.error('Unexpected error uploading document:', error);
    return { documentId: null, error: 'Failed to upload document' };
  }
}

/**
 * Resolve a usable, authorised URL for a document file.
 *
 * - A full http(s) URL (the verified government PDFs) is returned unchanged.
 * - A Supabase Storage object path is turned into a SHORT-LIVED SIGNED URL. The
 *   `documents` bucket is private, so `getPublicUrl()` cannot be used: Supabase
 *   answers the public route (/object/public/...) for a private bucket with
 *   `{"statusCode":"404","error":"Bucket not found","code":"NoSuchBucket"}`.
 * - Returns null when the caller may not read the object (signed-out visitor, or a
 *   file owned by another user), so the UI can show "file not available" instead
 *   of opening a URL that would fail.
 *
 * @param filePath - Storage object path (`{user-id}/{document-id}.{ext}`) or full URL
 * @param expiresInSeconds - Signed URL lifetime (default 1 hour)
 */
export async function resolveDocumentFileUrl(
  filePath: string | null,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  if (!filePath) return null;

  // If it's already a full URL (http/https), return it as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // Otherwise, treat it as a path in the private `documents` bucket and sign it.
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) {
    console.error('Error creating signed URL for document file:', error);
    return null;
  }

  return data?.signedUrl ?? null;
}

/**
 * Load a single repository document by ID from Supabase
 * @param documentId - The UUID of the document to load
 * @returns Promise with document data or null if not found, and error
 */
export async function loadRepositoryDocumentById(
  documentId: string
): Promise<{ document: RepositoryDocument | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('repository_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Error loading document by ID:', error);
      // PGRST116: no matching row came back — either it genuinely does not exist or
      // RLS filtered it out. Report "not found" in both cases so the UI never leaks
      // the existence of rows the caller cannot read.
      if (error.code === 'PGRST116') {
        return { document: null, error: null };
      }
      // 42501: row exists but the current role may not select it.
      if (error.code === '42501' || error.message.includes('permission denied')) {
        return { document: null, error: 'You do not have permission to access this document' };
      }
      return { document: null, error: error.message };
    }

    if (!data) {
      return { document: null, error: null };
    }

    const document = rowToDocument(data as RepositoryDocumentRow);
    return { document, error: null };
  } catch (error) {
    console.error('Unexpected error loading document by ID:', error);
    return { document: null, error: 'Failed to load document' };
  }
}

/**
 * Load related documents from Supabase based on theme, content type, or state
 * @param currentDocumentId - The ID of the current document to exclude
 * @param theme - Optional theme to match
 * @param contentType - Optional content type to match
 * @param state - Optional state to match
 * @param limit - Maximum number of related documents to return
 * @returns Promise with related documents and error
 */
export async function loadRelatedDocuments(
  currentDocumentId: string,
  theme?: string,
  contentType?: ContentType,
  state?: string,
  limit: number = 4
): Promise<{ documents: RepositoryDocument[]; error: string | null }> {
  try {
    let query = supabase
      .from('repository_documents')
      .select('*')
      .neq('id', currentDocumentId);

    // Build OR condition for related documents. Values are sanitized so that
    // punctuation inside a theme/state name cannot break the or(...) expression.
    const conditions: string[] = [];
    
    if (theme) {
      conditions.push(`theme.eq.${sanitizeSearchTerm(theme)}`);
    }
    if (contentType) {
      conditions.push(`content_type.eq.${contentType}`);
    }
    if (state) {
      conditions.push(`state.eq.${sanitizeSearchTerm(state)}`);
    }

    if (conditions.length > 0) {
      query = query.or(conditions.join(','));
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error loading related documents:', error);
      return { documents: [], error: error.message };
    }

    const documents = (data || []).map(rowToDocument);
    return { documents, error: null };
  } catch (error) {
    console.error('Unexpected error loading related documents:', error);
    return { documents: [], error: 'Failed to load related documents' };
  }
}

/**
 * public.document_bookmarks row shape.
 * Verified against the live schema: id uuid, user_id uuid, document_id uuid
 * (references repository_documents.id), created_at timestamptz.
 */
interface DocumentBookmarkRow {
  id: string;
  user_id: string;
  document_id: string;
  created_at: string;
}

/** Translate raw Postgres/PostgREST errors into user-readable copy. */
function describeBookmarkError(message: string, action: 'load' | 'add' | 'remove'): string {
  if (message.includes('permission denied')) {
    return 'You do not have permission to save documents';
  }
  if (message.includes('duplicate key')) {
    return 'This document is already saved';
  }
  if (action === 'load') return 'Could not load your saved documents';
  if (action === 'add') return 'Could not save this document. Please try again';
  return 'Could not remove this document. Please try again';
}

/**
 * Load the IDs of the documents the signed-in user has bookmarked.
 * @param userId - Authenticated user ID (document_bookmarks.user_id)
 */
export async function loadBookmarkedDocumentIds(
  userId: string
): Promise<{ ids: string[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('document_bookmarks')
      .select('document_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading bookmarks:', error);
      return { ids: [], error: describeBookmarkError(error.message, 'load') };
    }

    const ids = (data || [])
      .map((row: Pick<DocumentBookmarkRow, 'document_id'>) => row.document_id)
      .filter((id): id is string => Boolean(id));

    return { ids, error: null };
  } catch (error) {
    console.error('Unexpected error loading bookmarks:', error);
    return { ids: [], error: 'Could not load your saved documents' };
  }
}

/**
 * Bookmark a repository document for the signed-in user.
 * Inserts into public.document_bookmarks only (RLS keeps each row private to its owner).
 */
export async function addDocumentBookmark(
  userId: string,
  documentId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('document_bookmarks').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      document_id: documentId,
    });

    if (error) {
      console.error('Error adding bookmark:', error);
      return { error: describeBookmarkError(error.message, 'add') };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error adding bookmark:', error);
    return { error: 'Could not save this document. Please try again' };
  }
}

/**
 * Remove a bookmark from the signed-in user's saved documents.
 * `select('id')` is used to detect a DELETE that RLS silently blocked (zero rows).
 */
export async function removeDocumentBookmark(
  userId: string,
  documentId: string
): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('document_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('document_id', documentId)
      .select('id');

    if (error) {
      console.error('Error removing bookmark:', error);
      return { error: describeBookmarkError(error.message, 'remove') };
    }

    if (!data || data.length === 0) {
      return { error: 'Could not remove this document. Please try again' };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error removing bookmark:', error);
    return { error: 'Could not remove this document. Please try again' };
  }
}
