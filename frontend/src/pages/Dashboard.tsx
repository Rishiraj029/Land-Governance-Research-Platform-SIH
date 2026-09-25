import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import DashboardSidebar, { PLATFORM_NAV_ITEMS } from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCards from "../components/dashboard/StatsCards";
import RecentActivity from "../components/dashboard/RecentActivity";
import Recommendations from "../components/dashboard/Recommendations";
import PendingActions from "../components/dashboard/PendingActions";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  citizen: "Citizen",
  researcher: "Verified Researcher",
  policymaker: "Government Official",
  admin: "Administrator",
};

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const fullName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const email = user?.email ?? "";
  const initials = (fullName?.trim() || email.trim() || "U")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const appMetadataRole = typeof user?.app_metadata?.role === "string" ? user.app_metadata.role : null;
  const userMetadataRole = typeof user?.user_metadata?.role === "string" ? user.user_metadata.role : null;
  const role = (appMetadataRole ?? userMetadataRole) as UserRole | null;

  const isOverview = location.pathname === "/dashboard";

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Mobile Header */}
      <DashboardHeader 
        onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        showMobileMenu={showMobileMenu}
      />

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-[#E1E5EA]">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0B3D91] text-sm font-semibold text-white"
                aria-hidden="true"
              >
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#1F2933]">{fullName || "User"}</p>
                {role && (
                  <p className="truncate text-xs text-[#138808]">{ROLE_LABELS[role] || role}</p>
                )}
              </div>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#0B3D91] bg-[#0B3D91]/10"
                  >
                    Overview
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/uploads"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                  >
                    My Uploads
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/workspaces"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                  >
                    My Workspaces
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/saved-searches"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                  >
                    Saved Searches
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/simulations"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                  >
                    My Simulations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/innovation"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                  >
                    Innovation Submissions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                  >
                    Settings
                  </Link>
                </li>
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
                          onClick={() => setShowMobileMenu(false)}
                          className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
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
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        {isOverview ? (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div>
              <h1 className="text-2xl font-bold text-[#1F2933]">
                {fullName ? `Welcome back, ${fullName}` : "Welcome back"}
              </h1>
              <p className="text-[#5A6472] mt-1">
                Your personalized research and policy workspace for land governance innovation
              </p>
            </div>

            {/* Stats Cards */}
            <StatsCards />

            {/* Recent Activity */}
            <RecentActivity />

            {/* Recommendations */}
            <Recommendations />

            {/* Pending Actions */}
            <PendingActions />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
