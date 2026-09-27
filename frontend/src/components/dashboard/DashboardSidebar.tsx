import { Link, useLocation } from "react-router-dom";
import { Landmark, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { PLATFORM_NAV_ITEMS, getDashboardNavItems } from "./dashboardNav";
import { getDashboardRoleLabel } from "./dashboardRoles";

export default function DashboardSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  // Role comes from public.profiles (see useProfile), never from client-editable metadata.
  const { profile, role } = useProfile();

  const metadataName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const fullName = profile?.full_name ?? metadataName;
  const email = user?.email ?? "Unknown email";
  const initials = (fullName?.trim() || email)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("").toUpperCase();

  // Dashboard-facing label, so the sidebar agrees with the header and the overview heading.
  const roleName = getDashboardRoleLabel(role);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const availableNavItems = getDashboardNavItems(role);

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
            {roleName && (
              <span className="inline-flex items-center text-xs font-medium text-[#138808]">
                {roleName}
              </span>
            )}
            {profile?.institution && (
              <p className="text-xs text-[#5A6472] truncate">{profile.institution}</p>
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