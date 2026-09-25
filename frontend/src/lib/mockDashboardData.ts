// Mock data for dashboard MVP - to be replaced with Supabase queries when backend is implemented

export const MOCK_STATS = {
  documentsUploaded: 12,
  activeWorkspaces: 3,
  savedSearches: 8,
  simulationsRun: 5,
};

export const MOCK_RECENT_ACTIVITY = [
  {
    id: 1,
    type: "document",
    title: "Impact of Land Ceiling Reforms on Urban Housing Supply",
    subtitle: "Research Paper • National Institute of Public Finance and Policy",
    date: "2 hours ago",
    icon: "📄",
  },
  {
    id: 2,
    type: "dashboard",
    title: "National Land-Use Trend Dashboard",
    subtitle: "Dashboard • Ministry of Rural Development",
    date: "Yesterday",
    icon: "📊",
  },
  {
    id: 3,
    type: "workspace",
    title: "Climate Resilience Research Group",
    subtitle: "Workspace • 5 members • Last active 2 days ago",
    date: "3 days ago",
    icon: "👥",
  },
];

export interface RecommendationItem {
  id: number;
  type: string;
  title: string;
  reason: string;
  institution?: string;
  members?: number;
  tags?: string[];
}

export const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 1,
    type: "document",
    title: "Digital Land Records: A Comparative Study of State Implementations",
    institution: "NITI Aayog",
    tags: ["Digital Transformation", "Land Records"],
    reason: "Based on your interest in digital governance",
  },
  {
    id: 2,
    type: "dataset",
    title: "Satellite Imagery Dataset - Uttar Pradesh Land Use Patterns",
    institution: "ISRO / Bhuvan",
    tags: ["Satellite Data", "Uttar Pradesh"],
    reason: "Popular dataset in your research area",
  },
  {
    id: 3,
    type: "workspace",
    title: "Urban Land Policy Working Group",
    members: 12,
    reason: "Active workspace matching your research interests",
  },
  {
    id: 4,
    type: "dashboard",
    title: "Land Dispute Analytics Dashboard",
    institution: "National Law University",
    reason: "Trending dashboard in land governance",
  },
];

export const MOCK_PENDING_ACTIONS = [
  {
    id: 1,
    type: "workspace_invite",
    title: "Workspace Invitation",
    description: "You've been invited to join 'Sustainable Land-Use Planning Research Group'",
    actionText: "Accept",
    secondaryActionText: "Decline",
  },
  {
    id: 2,
    type: "upload_review",
    title: "Upload Under Review",
    description: "Your document 'Climate Vulnerability Assessment' is pending admin approval",
    actionText: "View Status",
    secondaryActionText: null,
  },
  {
    id: 3,
    type: "innovation_deadline",
    title: "Challenge Deadline Approaching",
    description: "AI-Powered Land Dispute Prediction Challenge deadline in 3 days",
    actionText: "View Challenge",
    secondaryActionText: null,
  },
];