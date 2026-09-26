/** Database-backed types for public.innovations and public.innovation_support. */
export interface Innovation {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  state: string | null;
  district: string | null;
  status: string | null;
  submittedBy: string | null;
  organization: string | null;
  supportCount: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface InnovationSupport {
  id: string;
  userId: string;
  innovationId: string;
  createdAt: string | null;
}

export interface InnovationFilters {
  category: string;
  state: string;
  district: string;
  status: string;
  search: string;
}

export interface InnovationFilterOptions {
  categories: string[];
  states: string[];
  districts: string[];
  statuses: string[];
}

/** Fields a signed-in user is allowed to supply for an innovation submission. */
export interface CreateInnovationInput {
  title: string;
  description: string;
  category: string;
  state: string;
  district: string;
  organization: string;
}
