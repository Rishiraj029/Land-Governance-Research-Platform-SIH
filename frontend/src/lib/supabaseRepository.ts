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
  created_by: string;
  created_at: string;
  updated_at: string;
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
    // UI-only fields with default values
    views: 0,
    downloads: 0,
    citations: 0,
    featured: false,
  };
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

    // Apply search query
    if (searchQuery && searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      // Using Supabase text search with OR conditions
      query = query.or(`title.ilike.%${queryLower}%,author.ilike.%${queryLower}%,institution.ilike.%${queryLower}%,description.ilike.%${queryLower}%,summary.ilike.%${queryLower}%`);
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

    // Apply sorting
    switch (sortBy) {
      case 'Most Recent':
        query = query.order('published_at', { ascending: false });
        break;
      case 'Relevance':
      default:
        // For relevance, sort by created_at as fallback
        query = query.order('created_at', { ascending: false });
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
    
    // Create storage path: documents/{user-id}/{document-id}.{extension}
    const storagePath = `documents/${userId}/${documentId}.${fileExtension}`;

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
 * Get a public URL for a document file
 * @param filePath - Storage path of the file or public URL
 * @returns Public URL for the file
 */
export function getDocumentPublicUrl(filePath: string | null): string | null {
  if (!filePath) return null;
  
  // If it's already a full URL (http/https), return it as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Otherwise, treat it as a Supabase Storage path
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
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

    // Build OR condition for related documents
    const conditions: string[] = [];
    
    if (theme) {
      conditions.push(`theme.eq.${theme}`);
    }
    if (contentType) {
      conditions.push(`content_type.eq.${contentType}`);
    }
    if (state) {
      conditions.push(`state.eq.${state}`);
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
