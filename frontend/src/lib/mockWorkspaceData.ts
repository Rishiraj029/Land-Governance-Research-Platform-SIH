/**
 * Mock workspace data for PAGE 10 — Collaborative Workspace
 * 
 * IMPORTANT: This is demo/fictional data for frontend development purposes only.
 * Do not use this data for any real research, policy, or government purposes.
 * All workspaces, institutions, and statistics are representative examples.
 */

import type {
  Workspace,
  WorkspaceMember,
  WorkspaceDocument,
  ResearchNote,
  WorkspaceTask,
  WorkspaceActivity,
  WorkspaceStatus,
  AccessLevel,
  MemberPermission,
  TaskStatus,
  TaskPriority
} from "../types/workspace";

export const RESEARCH_THEMES = [
  "Climate & Land",
  "Urbanization",
  "Land Disputes",
  "Sustainable Land-Use Planning",
  "Geospatial Governance",
  "Digital Transformation",
  "Tenure Security",
  "Legal Framework"
];

export const WORKSPACE_STATUSES: WorkspaceStatus[] = ["Active", "Draft", "Archived"];
export const ACCESS_LEVELS: AccessLevel[] = ["Private", "Institution", "Public Research"];
export const MEMBER_PERMISSIONS: MemberPermission[] = ["Owner", "Editor", "Contributor", "Viewer"];
export const TASK_STATUSES: TaskStatus[] = ["To Do", "In Progress", "Completed"];
export const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "ws-1",
    name: "Rajasthan Land Records Modernization",
    description: "Comprehensive study of digital land record implementation in Rajasthan with focus on rural property rights and digitization challenges",
    researchTheme: "Digital Transformation",
    objective: "Analyze the effectiveness of digital land record modernization in Rajasthan and identify implementation gaps",
    owner: "Dr. Anita Sharma",
    ownerInstitution: "National Institute of Public Finance and Policy",
    memberCount: 12,
    documentCount: 24,
    lastActivity: "2024-09-20",
    status: "Active",
    accessLevel: "Public Research",
    createdAt: "2024-01-15",
    updatedAt: "2024-09-20"
  },
  {
    id: "ws-2",
    name: "Urban Expansion & Land Use Study",
    description: "Multi-city analysis of urban expansion patterns and agricultural land conversion using satellite imagery and GIS data",
    researchTheme: "Urbanization",
    objective: "Quantify urban expansion rates and agricultural land loss around major Indian cities (2010-2024)",
    owner: "Prof. Rahul Mehta",
    ownerInstitution: "Indian Institute of Technology, Bombay",
    memberCount: 8,
    documentCount: 18,
    lastActivity: "2024-09-18",
    status: "Active",
    accessLevel: "Public Research",
    createdAt: "2024-02-01",
    updatedAt: "2024-09-18"
  },
  {
    id: "ws-3",
    name: "Climate-Resilient Land Governance",
    description: "Research on climate vulnerability assessment and adaptation strategies for coastal and drought-prone regions",
    researchTheme: "Climate & Land",
    objective: "Develop climate-resilient land governance frameworks for vulnerable regions",
    owner: "Dr. Priya Singh",
    ownerInstitution: "ISRO & Ministry of Environment",
    memberCount: 15,
    documentCount: 32,
    lastActivity: "2024-09-22",
    status: "Active",
    accessLevel: "Institution",
    createdAt: "2024-03-10",
    updatedAt: "2024-09-22"
  },
  {
    id: "ws-4",
    name: "Land Dispute Research Initiative",
    description: "Analysis of land dispute patterns, resolution mechanisms, and policy recommendations from district court data",
    researchTheme: "Land Disputes",
    objective: "Identify systemic bottlenecks in land dispute resolution and recommend procedural reforms",
    owner: "Prof. Amitabh Singh",
    ownerInstitution: "National Law University, Delhi",
    memberCount: 6,
    documentCount: 15,
    lastActivity: "2024-09-15",
    status: "Active",
    accessLevel: "Public Research",
    createdAt: "2024-04-05",
    updatedAt: "2024-09-15"
  },
  {
    id: "ws-5",
    name: "Digital Tenure Security Research",
    description: "Study on the relationship between digital land records and tenure security for smallholder farmers",
    researchTheme: "Tenure Security",
    objective: "Evaluate how digital land record systems impact tenure security and agricultural investment",
    owner: "Dr. Meera Krishnan",
    ownerInstitution: "Indian Council of Agricultural Research",
    memberCount: 10,
    documentCount: 21,
    lastActivity: "2024-09-19",
    status: "Active",
    accessLevel: "Public Research",
    createdAt: "2024-02-20",
    updatedAt: "2024-09-19"
  },
  {
    id: "ws-6",
    name: "GIS-Based Land Policy Analysis",
    description: "GIS-based analysis of land policy impacts using spatial data and geospatial tools",
    researchTheme: "Geospatial Governance",
    objective: "Develop GIS-based methodologies for land policy impact assessment",
    owner: "Dr. Rajesh Kumar",
    ownerInstitution: "Bhuvan-ISRO",
    memberCount: 7,
    documentCount: 14,
    lastActivity: "2024-09-21",
    status: "Draft",
    accessLevel: "Institution",
    createdAt: "2024-05-15",
    updatedAt: "2024-09-21"
  }
];

export const MOCK_WORKSPACE_MEMBERS: WorkspaceMember[] = [
  {
    id: "mem-1",
    workspaceId: "ws-1",
    name: "Dr. Anita Sharma",
    email: "anita.sharma@nipfp.org",
    role: "Principal Researcher",
    institution: "National Institute of Public Finance and Policy",
    permission: "Owner",
    joinedAt: "2024-01-15"
  },
  {
    id: "mem-2",
    workspaceId: "ws-1",
    name: "Vikram Singh",
    email: "vikram.singh@rajasthan.gov.in",
    role: "Government Official",
    institution: "Rajasthan Revenue Department",
    permission: "Editor",
    joinedAt: "2024-01-20"
  },
  {
    id: "mem-3",
    workspaceId: "ws-1",
    name: "Sunita Rao",
    email: "sunita.rao@iitb.ac.in",
    role: "Research Associate",
    institution: "Indian Institute of Technology, Bombay",
    permission: "Contributor",
    joinedAt: "2024-02-01"
  },
  {
    id: "mem-4",
    workspaceId: "ws-2",
    name: "Prof. Rahul Mehta",
    email: "rahul.mehta@iitb.ac.in",
    role: "Professor",
    institution: "Indian Institute of Technology, Bombay",
    permission: "Owner",
    joinedAt: "2024-02-01"
  },
  {
    id: "mem-5",
    workspaceId: "ws-2",
    name: "Anand Patel",
    email: "anand.patel@isro.gov.in",
    role: "GIS Specialist",
    institution: "Bhuvan-ISRO",
    permission: "Editor",
    joinedAt: "2024-02-10"
  }
];

export const MOCK_WORKSPACE_DOCUMENTS: WorkspaceDocument[] = [
  {
    id: "wd-1",
    workspaceId: "ws-1",
    documentId: "3",
    title: "Digital Land Records Implementation: Comparative Study of State Experiences",
    type: "Report",
    author: "NITI Aayog Research Team",
    date: "2024-01-10",
    status: "Published",
    tags: ["Digital Transformation", "Tenure Security"],
    addedAt: "2024-01-20"
  },
  {
    id: "wd-2",
    workspaceId: "ws-1",
    documentId: "10",
    title: "Digital Transformation of Land Administration: Implementation Guidelines",
    type: "Policy Document",
    author: "Department of Land Resources",
    date: "2024-04-01",
    status: "Published",
    tags: ["Digital Transformation", "Policy"],
    addedAt: "2024-04-05"
  },
  {
    id: "wd-3",
    workspaceId: "ws-2",
    documentId: "15",
    title: "Urban Expansion and Agricultural Land Loss: Satellite Analysis",
    type: "Research Paper",
    author: "Dr. Sunita Rao",
    date: "2024-03-25",
    status: "Published",
    tags: ["Urbanization", "Climate & Land"],
    addedAt: "2024-03-30"
  },
  {
    id: "wd-4",
    workspaceId: "ws-3",
    documentId: "2",
    title: "Climate Vulnerability Assessment of Coastal Land Systems in Eastern India",
    type: "Research Paper",
    author: "Dr. Rajesh Kumar",
    date: "2024-02-20",
    status: "Published",
    tags: ["Climate & Land", "Geospatial Governance"],
    addedAt: "2024-03-15"
  }
];

export const MOCK_RESEARCH_NOTES: ResearchNote[] = [
  {
    id: "note-1",
    workspaceId: "ws-1",
    title: "Rajasthan Bhulekh System Analysis",
    content: "Initial analysis of Rajasthan's Bhulekh system shows 78% digitization rate but significant gaps in rural areas. Key challenges include inconsistent data quality and limited user awareness.",
    author: "Dr. Anita Sharma",
    createdAt: "2024-03-15",
    updatedAt: "2024-03-15"
  },
  {
    id: "note-2",
    workspaceId: "ws-1",
    title: "Field Survey Methodology",
    content: "Proposed methodology for field surveys in 3 districts: Jaipur, Jodhpur, and Udaipur. Sample size of 500 households per district with focus on user experience and satisfaction.",
    author: "Vikram Singh",
    createdAt: "2024-04-01",
    updatedAt: "2024-04-05"
  },
  {
    id: "note-3",
    workspaceId: "ws-2",
    title: "Satellite Imagery Sources",
    content: "Using Sentinel-2 and Landsat 8 imagery for urban expansion analysis. Time series from 2010-2024 with 10m resolution for Sentinel-2 and 30m for Landsat.",
    author: "Prof. Rahul Mehta",
    createdAt: "2024-04-10",
    updatedAt: "2024-04-10"
  }
];

export const MOCK_WORKSPACE_TASKS: WorkspaceTask[] = [
  {
    id: "task-1",
    workspaceId: "ws-1",
    title: "Complete Bhulekh System Analysis",
    description: "Finish comprehensive analysis of Rajasthan Bhulekh system including technical assessment and user feedback",
    assignee: "Dr. Anita Sharma",
    priority: "High",
    status: "In Progress",
    dueDate: "2024-10-15",
    createdAt: "2024-09-01",
    updatedAt: "2024-09-20"
  },
  {
    id: "task-2",
    workspaceId: "ws-1",
    title: "Conduct Field Surveys",
    description: "Conduct field surveys in 3 districts with 500 households per district",
    assignee: "Vikram Singh",
    priority: "High",
    status: "To Do",
    dueDate: "2024-11-30",
    createdAt: "2024-09-05",
    updatedAt: "2024-09-20"
  },
  {
    id: "task-3",
    workspaceId: "ws-1",
    title: "Draft Policy Recommendations",
    description: "Draft policy recommendations based on analysis findings",
    assignee: "Sunita Rao",
    priority: "Medium",
    status: "To Do",
    dueDate: "2024-12-15",
    createdAt: "2024-09-10",
    updatedAt: "2024-09-20"
  },
  {
    id: "task-4",
    workspaceId: "ws-2",
    title: "Process Satellite Imagery",
    description: "Process Sentinel-2 and Landsat imagery for urban expansion analysis",
    assignee: "Anand Patel",
    priority: "High",
    status: "In Progress",
    dueDate: "2024-10-30",
    createdAt: "2024-09-01",
    updatedAt: "2024-09-18"
  },
  {
    id: "task-5",
    workspaceId: "ws-2",
    title: "Literature Review",
    description: "Complete literature review on urban expansion and land use change",
    assignee: "Prof. Rahul Mehta",
    priority: "Medium",
    status: "Completed",
    dueDate: "2024-09-10",
    createdAt: "2024-08-15",
    updatedAt: "2024-09-10"
  }
];

export const MOCK_WORKSPACE_ACTIVITIES: WorkspaceActivity[] = [
  {
    id: "act-1",
    workspaceId: "ws-1",
    user: "Dr. Anita Sharma",
    action: "added a research document",
    objectType: "document",
    objectId: "wd-2",
    objectName: "Digital Transformation of Land Administration: Implementation Guidelines",
    timestamp: "2024-09-20T10:30:00"
  },
  {
    id: "act-2",
    workspaceId: "ws-1",
    user: "Vikram Singh",
    action: "updated the workspace objective",
    objectType: "workspace",
    objectId: "ws-1",
    objectName: "Rajasthan Land Records Modernization",
    timestamp: "2024-09-19T14:45:00"
  },
  {
    id: "act-3",
    workspaceId: "ws-1",
    user: "Priya Singh",
    action: "completed a task",
    objectType: "task",
    objectId: "task-5",
    objectName: "Literature Review",
    timestamp: "2024-09-18T16:20:00"
  },
  {
    id: "act-4",
    workspaceId: "ws-1",
    user: "Dr. Anita Sharma",
    action: "invited 3 new members",
    objectType: "member",
    objectId: "",
    objectName: "3 new members",
    timestamp: "2024-09-15T09:00:00"
  },
  {
    id: "act-5",
    workspaceId: "ws-2",
    user: "Prof. Rahul Mehta",
    action: "created a research note",
    objectType: "note",
    objectId: "note-3",
    objectName: "Satellite Imagery Sources",
    timestamp: "2024-09-18T11:30:00"
  },
  {
    id: "act-6",
    workspaceId: "ws-2",
    user: "Anand Patel",
    action: "added a research document",
    objectType: "document",
    objectId: "wd-3",
    objectName: "Urban Expansion and Agricultural Land Loss: Satellite Analysis",
    timestamp: "2024-09-17T15:45:00"
  },
  {
    id: "act-7",
    workspaceId: "ws-3",
    user: "Dr. Priya Singh",
    action: "updated task priority",
    objectType: "task",
    objectId: "task-1",
    objectName: "Complete Bhulekh System Analysis",
    timestamp: "2024-09-22T13:15:00"
  }
];

// Helper functions for localStorage management
const WORKSPACE_STORAGE_KEY = "land_governance_workspaces";
const NOTES_STORAGE_KEY = "land_governance_notes";
const TASKS_STORAGE_KEY = "land_governance_tasks";
const MEMBERS_STORAGE_KEY = "land_governance_members";

export const getStoredWorkspaces = (): Workspace[] => {
  if (typeof window === "undefined") return MOCK_WORKSPACES;
  try {
    const stored = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(MOCK_WORKSPACES));
    return MOCK_WORKSPACES;
  } catch (error) {
    console.error("Error loading workspaces from localStorage:", error);
    return MOCK_WORKSPACES;
  }
};

export const setStoredWorkspaces = (workspaces: Workspace[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspaces));
  } catch (error) {
    console.error("Error saving workspaces to localStorage:", error);
  }
};

export const getStoredNotes = (workspaceId: string): ResearchNote[] => {
  if (typeof window === "undefined") return MOCK_RESEARCH_NOTES.filter(n => n.workspaceId === workspaceId);
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      const allNotes = JSON.parse(stored);
      return allNotes.filter((n: ResearchNote) => n.workspaceId === workspaceId);
    }
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(MOCK_RESEARCH_NOTES));
    return MOCK_RESEARCH_NOTES.filter(n => n.workspaceId === workspaceId);
  } catch (error) {
    console.error("Error loading notes from localStorage:", error);
    return MOCK_RESEARCH_NOTES.filter(n => n.workspaceId === workspaceId);
  }
};

export const setStoredNotes = (notes: ResearchNote[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Error saving notes to localStorage:", error);
  }
};

export const getStoredTasks = (workspaceId: string): WorkspaceTask[] => {
  if (typeof window === "undefined") return MOCK_WORKSPACE_TASKS.filter(t => t.workspaceId === workspaceId);
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      const allTasks = JSON.parse(stored);
      return allTasks.filter((t: WorkspaceTask) => t.workspaceId === workspaceId);
    }
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(MOCK_WORKSPACE_TASKS));
    return MOCK_WORKSPACE_TASKS.filter(t => t.workspaceId === workspaceId);
  } catch (error) {
    console.error("Error loading tasks from localStorage:", error);
    return MOCK_WORKSPACE_TASKS.filter(t => t.workspaceId === workspaceId);
  }
};

export const setStoredTasks = (tasks: WorkspaceTask[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks to localStorage:", error);
  }
};

export const getStoredMembers = (workspaceId: string): WorkspaceMember[] => {
  if (typeof window === "undefined") return MOCK_WORKSPACE_MEMBERS.filter(m => m.workspaceId === workspaceId);
  try {
    const stored = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (stored) {
      const allMembers = JSON.parse(stored);
      return allMembers.filter((m: WorkspaceMember) => m.workspaceId === workspaceId);
    }
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(MOCK_WORKSPACE_MEMBERS));
    return MOCK_WORKSPACE_MEMBERS.filter(m => m.workspaceId === workspaceId);
  } catch (error) {
    console.error("Error loading members from localStorage:", error);
    return MOCK_WORKSPACE_MEMBERS.filter(m => m.workspaceId === workspaceId);
  }
};

export const setStoredMembers = (members: WorkspaceMember[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch (error) {
    console.error("Error saving members to localStorage:", error);
  }
};