/**
 * Mock admin data for PAGE 13 — Admin Panel
 * 
 * IMPORTANT: This is demo/fictional data for frontend development purposes only.
 * Do not use this data for any real administration purposes.
 * All users, statistics, and activities are representative examples.
 */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Researcher" | "Government Official" | "Institution Admin" | "Public User";
  status: "Active" | "Inactive" | "Pending";
  institution: string;
  lastActive: string;
  joinedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalDocuments: number;
  pendingDocuments: number;
  totalInnovations: number;
  pendingInnovations: number;
  totalWorkspaces: number;
  activeWorkspaces: number;
  systemStatus: "Operational" | "Degraded" | "Down";
}

export interface SystemActivity {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  category: "User" | "Content" | "System" | "Security";
}

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "user-1",
    name: "Dr. Anita Sharma",
    email: "anita.sharma@nipfp.org",
    role: "Researcher",
    status: "Active",
    institution: "National Institute of Public Finance and Policy",
    lastActive: "2024-09-22T10:30:00",
    joinedAt: "2024-01-15"
  },
  {
    id: "user-2",
    name: "Prof. Rahul Mehta",
    email: "rahul.mehta@iitb.ac.in",
    role: "Researcher",
    status: "Active",
    institution: "Indian Institute of Technology, Bombay",
    lastActive: "2024-09-21T15:45:00",
    joinedAt: "2024-02-01"
  },
  {
    id: "user-3",
    name: "Vikram Singh",
    email: "vikram.singh@rajasthan.gov.in",
    role: "Government Official",
    status: "Active",
    institution: "Rajasthan Revenue Department",
    lastActive: "2024-09-22T09:15:00",
    joinedAt: "2024-01-20"
  },
  {
    id: "user-4",
    name: "Sunita Rao",
    email: "sunita.rao@iitb.ac.in",
    role: "Researcher",
    status: "Active",
    institution: "Indian Institute of Technology, Bombay",
    lastActive: "2024-09-20T14:20:00",
    joinedAt: "2024-02-01"
  },
  {
    id: "user-5",
    name: "Dr. Priya Singh",
    email: "priya.singh@isro.gov.in",
    role: "Government Official",
    status: "Active",
    institution: "ISRO & Ministry of Environment",
    lastActive: "2024-09-22T11:00:00",
    joinedAt: "2024-03-10"
  },
  {
    id: "user-6",
    name: "New Researcher",
    email: "new.researcher@university.edu",
    role: "Researcher",
    status: "Pending",
    institution: "State University",
    lastActive: "Never",
    joinedAt: "2024-09-22"
  },
  {
    id: "user-7",
    name: "Government Officer",
    email: "officer@state.gov.in",
    role: "Government Official",
    status: "Pending",
    institution: "State Revenue Department",
    lastActive: "Never",
    joinedAt: "2024-09-21"
  },
  {
    id: "user-8",
    name: "Public User",
    email: "public.user@gmail.com",
    role: "Public User",
    status: "Active",
    institution: "Individual",
    lastActive: "2024-09-18T16:30:00",
    joinedAt: "2024-04-15"
  }
];

export const MOCK_ADMIN_STATS: AdminStats = {
  totalUsers: 1274,
  activeUsers: 1156,
  pendingUsers: 118,
  totalDocuments: 4892,
  pendingDocuments: 67,
  totalInnovations: 234,
  pendingInnovations: 45,
  totalWorkspaces: 156,
  activeWorkspaces: 142,
  systemStatus: "Operational"
};

export const MOCK_SYSTEM_ACTIVITIES: SystemActivity[] = [
  {
    id: "act-1",
    user: "Dr. Anita Sharma",
    action: "Uploaded document",
    details: "Digital Land Records Implementation: Comparative Study",
    timestamp: "2024-09-22T10:30:00",
    category: "Content"
  },
  {
    id: "act-2",
    user: "Vikram Singh",
    action: "Created workspace",
    details: "Rajasthan Land Records Modernization",
    timestamp: "2024-09-22T09:15:00",
    category: "User"
  },
  {
    id: "act-3",
    user: "System",
    action: "New user registration",
    details: "New Researcher from State University",
    timestamp: "2024-09-22T08:00:00",
    category: "User"
  },
  {
    id: "act-4",
    user: "Prof. Rahul Mehta",
    action: "Submitted innovation",
    details: "AI-Powered Land Dispute Prediction System",
    timestamp: "2024-09-21T15:45:00",
    category: "Content"
  },
  {
    id: "act-5",
    user: "Admin",
    action: "Approved document",
    details: "Climate Vulnerability Assessment of Coastal Land Systems",
    timestamp: "2024-09-21T14:20:00",
    category: "Content"
  },
  {
    id: "act-6",
    user: "System",
    action: "Scheduled backup completed",
    details: "Daily database backup",
    timestamp: "2024-09-21T02:00:00",
    category: "System"
  },
  {
    id: "act-7",
    user: "Dr. Priya Singh",
    action: "Joined workspace",
    details: "Climate-Resilient Land Governance",
    timestamp: "2024-09-20T11:00:00",
    category: "User"
  }
];