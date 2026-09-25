/**
 * Workspace types for PAGE 10 — Collaborative Workspace
 * 
 * These types are designed to map cleanly to Supabase tables in the future.
 * The current implementation uses mock data and localStorage, but the structure is database-ready.
 */

export type WorkspaceStatus = "Active" | "Draft" | "Archived";
export type AccessLevel = "Private" | "Institution" | "Public Research";
export type MemberPermission = "Owner" | "Editor" | "Contributor" | "Viewer";
export type TaskStatus = "To Do" | "In Progress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";
export type WorkspaceTab = "overview" | "documents" | "notes" | "tasks" | "members" | "activity";

export interface Workspace {
  id: string;
  name: string;
  description: string;
  researchTheme: string;
  objective: string;
  owner: string;
  ownerInstitution: string;
  memberCount: number;
  documentCount: number;
  lastActivity: string;
  status: WorkspaceStatus;
  accessLevel: AccessLevel;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: string;
  institution: string;
  permission: MemberPermission;
  joinedAt: string;
}

export interface WorkspaceDocument {
  id: string;
  workspaceId: string;
  documentId: string; // Reference to repository document
  title: string;
  type: string;
  author: string;
  date: string;
  status: string;
  tags: string[];
  addedAt: string;
}

export interface ResearchNote {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceTask {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceActivity {
  id: string;
  workspaceId: string;
  user: string;
  action: string;
  objectType: string;
  objectId: string;
  objectName: string;
  timestamp: string;
}

export interface WorkspaceFilters {
  status: WorkspaceStatus[];
  accessLevel: AccessLevel[];
  researchTheme: string[];
}

export type WorkspaceSortOption = "Recently Updated" | "Recently Created" | "Most Members" | "Most Documents";
export type WorkspaceViewMode = "grid" | "list";

export interface CreateWorkspaceFormData {
  name: string;
  description: string;
  researchTheme: string;
  accessLevel: AccessLevel;
  objective: string;
}

export interface InviteMemberFormData {
  name: string;
  email: string;
  role: string;
  permission: MemberPermission;
}