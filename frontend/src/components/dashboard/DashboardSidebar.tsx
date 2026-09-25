import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  FolderKanban,
  Search,
  Activity,
  Lightbulb,
  Settings,
  LogOut,
  Database,
  Shield,
  Landmark,
  BookOpen,
  Map as MapIcon,
  BarChart3,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  citizen: "Citizen",
  researcher: "Verified Researcher",
  policymaker: "Government Official",
  admin: "Administrator",
};

interface NavItem {
  name: string;
  path: string;
  icon: any;
  requiredRoles?: UserRole[];
}

const BASE_NAV_ITEMS: NavItem[] = [
  { name: "Overview", path: "/dashboard", icon: Home },
  { name: "My Uploads", path: "/dashboard/uploads", icon: Upload },
  { name: "My Workspaces", path: "/dashboard/workspaces", icon: FolderKanban },
  { name: "Saved Searches", path: "/dashboard/saved-searches", icon: Search },
  { name: "My Simulations", path: "/dashboard/simulations", icon: Activity },
  { name: "Innovation Submissions", path: "/dashboard/innovation", icon: Lightbulb },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

/** Public platform sections, so signed-in users can navigate the whole site. */
export const PLATFORM_NAV_ITEMS: NavItem[] = [
  { name: "Home", path: "/", icon: Landmark },
  { name: "Knowledge Repository", path: "/repository", icon: BookOpen },
  { name: "GIS Explorer", path: "/gis-explorer", icon: MapIcon },
  { name: "Dashboards", path: "/dashboards", icon: BarChart3 },
  { name: "Simulation Lab", path: "/simulation-lab", icon: FlaskConical },
  { name: "Innovation Portal", path: "/innovation-portal", icon: Lightbulb },
];

const ROLE_SPECIFIC_NAV_ITEMS: NavItem[] = [
  { 
    name: "Department/Institution Data", 
    path: "/dashboard/department-data", 
    icon: Database,
    requiredRoles: ["policymaker", "admin"] 
  },
  { 
    name: "Admin Panel", 
    path: "/dashboard/admin", 
    icon: Shield,
    requiredRoles: ["admin"] 
  },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  // Get user role from metadata
  const appMetadataRole = typeof user?.app_metadata?.role === "string" ? user.app_metadata.role : null;
  const userMetadataRole = typeof user?.user_metadata?.role === "string" ? user.user_metadata.role : null;
  const role = (appMetadataRole ?? userMetadataRole) as UserRole | null;
  
  const fullName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const email = user?.email ?? "Unknown email";
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : email[0].toUpperCase();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  // Filter nav items based on user role
  const availableNavItems = [
    ...BASE_NAV_ITEMS,
    ...ROLE_SPECIFIC_NAV_ITEMS.filter(item => 
      !item.requiredRoles || (role && item.requiredRoles.includes(role))
    )
  ];

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:border-r lg:border-[#E1E5EA] lg:bg-white">
      {/* Brand — returns to the public home page */}
      <Link
        to="/"
        className="flex h-16 flex-shrink-0 items-center gap-2 border-b border-[#E1E5EA] px-4"
      >
        <Landmark className="h-6 w-6 text-[#0B3D91]" aria-hidden="true" />
        <span className="text-sm font-semibold text-[#0B3D91]">Land Governance Platform</span>
      </Link>

      {/* User Profile Section */}
      <div className="p-6 border-b border-[#E1E5EA]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B3D91] text-white font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1F2933] truncate">
              {fullName || "User"}
            </p>
            <p className="text-xs text-[#5A6472] truncate">{email}</p>
            {role && (
              <span className="inline-flex items-center text-xs font-medium text-[#138808]">
                {ROLE_LABELS[role] || role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {availableNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-[#0B3D91]/10 text-[#0B3D91]"
                      : "text-[#5A6472] hover:bg-[#F5F7FA] hover:text-[#0B3D91]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Public platform sections */}
        <div className="mt-6 border-t border-[#E1E5EA] pt-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[#5A6472]">
            Explore the platform
          </p>
          <ul className="space-y-1">
            {PLATFORM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "bg-[#0B3D91]/10 text-[#0B3D91]"
                        : "text-[#5A6472] hover:bg-[#F5F7FA] hover:text-[#0B3D91]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#E1E5EA]">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] hover:text-[#D64545] transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}