import {
  Activity,
  BarChart3,
  BookOpen,
  Database,
  FlaskConical,
  FolderKanban,
  Lightbulb,
  Map as MapIcon,
  Search,
  Shield,
} from "lucide-react";
import type { UserRole } from "../../types/auth";

/**
 * Role-aware *presentation* for the signed-in dashboard.
 *
 * This file only decides how the existing dashboard reads and what it leads with: a heading,
 * a role label, a one-line subtitle, an ordering of quick actions, and which existing stat
 * cards come first. Every quick action points at a route that already exists, and no role
 * gains access to anything — permissions still live in `public.profiles.role`, RLS and the
 * protected routes.
 *
 * Deliberately separate from `lib/roles.ts`: that module's labels are used by other pages
 * (Admin Panel, Settings, Department/Institution Data), which this change must not alter.
 */
export interface DashboardQuickAction {
  name: string;
  path: string;
  icon: typeof BookOpen;
}

export interface DashboardRoleView {
  /** Heading shown on the overview, e.g. "Researcher Dashboard". */
  heading: string;
  /** Short role name for the profile badge. */
  label: string;
  /** One-line description of what this role's dashboard is for. */
  subtitle: string;
  /** Existing destinations this role reaches most often, most prominent first. */
  quickActions: DashboardQuickAction[];
  /** Existing stat-card keys to lead with. Cards are reordered, never hidden. */
  emphasizedMetrics: string[];
}

export const DASHBOARD_ROLE_VIEWS: Record<UserRole, DashboardRoleView> = {
  citizen: {
    heading: "Citizen Dashboard",
    label: "Citizen",
    subtitle: "Explore public land governance documents, maps and community innovation",
    quickActions: [
      { name: "Public Documents", path: "/repository", icon: BookOpen },
      { name: "GIS Explorer", path: "/gis-explorer", icon: MapIcon },
      { name: "Innovations", path: "/innovation-portal", icon: Lightbulb },
      { name: "Saved Items", path: "/dashboard/saved-searches", icon: Search },
    ],
    emphasizedMetrics: ["saved-searches", "innovations", "uploads", "workspaces"],
  },
  researcher: {
    heading: "Researcher Dashboard",
    label: "Researcher",
    subtitle: "Your research workspace for documents, evidence and collaborative analysis",
    quickActions: [
      { name: "Research Documents", path: "/repository", icon: BookOpen },
      { name: "AI Search", path: "/search", icon: Search },
      { name: "Saved Searches", path: "/dashboard/saved-searches", icon: Search },
      { name: "Workspaces", path: "/dashboard/workspaces", icon: FolderKanban },
      { name: "GIS Explorer", path: "/gis-explorer", icon: MapIcon },
    ],
    emphasizedMetrics: ["uploads", "saved-searches", "workspaces", "simulations", "innovations"],
  },
  policymaker: {
    heading: "Policymaker Dashboard",
    label: "Policymaker",
    subtitle: "Policy indicators, analytics and simulation for land governance decisions",
    quickActions: [
      { name: "Policy Indicators", path: "/dashboards", icon: BarChart3 },
      { name: "Analytics", path: "/dashboards", icon: Activity },
      { name: "GIS Explorer", path: "/gis-explorer", icon: MapIcon },
      { name: "Policy Simulation", path: "/simulation-lab", icon: FlaskConical },
      { name: "Research", path: "/repository", icon: BookOpen },
    ],
    emphasizedMetrics: ["simulations", "uploads", "workspaces", "saved-searches", "innovations"],
  },
  admin: {
    heading: "Administrator Dashboard",
    label: "Administrator",
    subtitle: "Platform oversight of accounts, content and department data",
    quickActions: [
      { name: "Admin Panel", path: "/dashboard/admin", icon: Shield },
      { name: "Department/Institution Data", path: "/dashboard/department-data", icon: Database },
      { name: "Knowledge Repository", path: "/repository", icon: BookOpen },
      { name: "Dashboards", path: "/dashboards", icon: BarChart3 },
    ],
    emphasizedMetrics: ["uploads", "workspaces", "saved-searches", "simulations", "innovations"],
  },
};

/**
 * The role-specific view, or null when the profile role is unknown.
 *
 * Returning null (rather than a default) is deliberate: a dashboard that cannot read the role
 * falls back to the existing generic presentation instead of claiming the user is a citizen.
 */
export function getDashboardRoleView(role: UserRole | null): DashboardRoleView | null {
  return role ? DASHBOARD_ROLE_VIEWS[role] ?? null : null;
}

/** Short dashboard label for a role, or null when it is unknown. */
export function getDashboardRoleLabel(role: UserRole | null): string | null {
  return getDashboardRoleView(role)?.label ?? null;
}

/** Sort key that puts a role's emphasised stat cards first without dropping the rest. */
export function metricEmphasisRank(view: DashboardRoleView | null, key: string): number {
  if (!view) return 0;
  const index = view.emphasizedMetrics.indexOf(key);
  return index === -1 ? view.emphasizedMetrics.length : index;
}
