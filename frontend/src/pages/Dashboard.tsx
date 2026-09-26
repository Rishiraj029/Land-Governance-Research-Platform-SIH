import { useEffect, useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { AlertCircle, LogOut } from "lucide-react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { PLATFORM_NAV_ITEMS, getDashboardNavItems } from "../components/dashboard/dashboardNav";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCards from "../components/dashboard/StatsCards";
import RecentActivity from "../components/dashboard/RecentActivity";
import RecentlyAdded from "../components/dashboard/RecentlyAdded";
import PendingItems from "../components/dashboard/PendingItems";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { loadDashboardOverview, type DashboardOverview } from "../lib/supabaseDashboard";
import { roleLabel } from "../lib/roles";

/**
 * Signed-in area shell.
 *
 * The overview numbers, recent items and pending items all come from real tables via
 * loadDashboardOverview(). Nothing on this page is a placeholder total: metrics the account
 * cannot read are omitted, and tables that fail to load surface a visible warning.
 */
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { profile, role } = useProfile();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const displayName = profile?.full_name || (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null);
  const email = user?.email ?? "";
  const initials = (displayName?.trim() || email.trim() || "U")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const roleName = roleLabel(role);

  const isOverview = location.pathname === "/dashboard";

  useEffect(() => {
    // Nothing to load when the route is only rendering a nested dashboard page.
    if (!user || !isOverview) return undefined;
    let current = true;

    // Re-count whenever the user returns to the overview, so an upload made in another tab is
    // reflected without a full page reload.
    loadDashboardOverview(user.id)
      .then((result) => {
        if (current) setOverview(result);
      })
      .finally(() => {
        if (current) setLoadingOverview(false);
      });

    return () => {
      current = false;
    };
  }, [user, isOverview]);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  const navItems = getDashboardNavItems(role);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA] lg:flex-row">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Mobile Header */}
      <DashboardHeader
        onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        showMobileMenu={showMobileMenu}
      />

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="fixed bottom-0 left-0 top-0 w-64 overflow-y-auto bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-[#E1E5EA] p-4">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0B3D91] text-sm font-semibold text-white"
                aria-hidden="true"
              >
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#1F2933]">{displayName || "User"}</p>
                {roleName && <p className="truncate text-xs text-[#138808]">{roleName}</p>}
              </div>
            </div>

            <nav className="p-4">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setShowMobileMenu(false)}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                          location.pathname === item.path
                            ? "bg-[#0B3D91]/10 text-[#0B3D91]"
                            : "text-[#5A6472] hover:bg-[#F5F7FA]"
                        }`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
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
                          onClick={() => setShowMobileMenu(false)}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <button
                onClick={handleSignOut}
                className="mt-6 flex w-full items-center gap-3 rounded-md border-t border-[#E1E5EA] px-3 py-2 pt-4 text-sm font-medium text-[#5A6472] hover:text-[#D64545]"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Log Out
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-4 lg:ml-64 lg:p-8">
        {isOverview ? (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div>
              <h1 className="text-2xl font-bold text-[#1F2933]">
                {displayName ? `Welcome back, ${displayName}` : "Welcome back"}
              </h1>
              <p className="mt-1 text-[#5A6472]">
                Your personalized research and policy workspace for land governance innovation
              </p>
              {(roleName || profile?.institution) && (
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  {roleName && (
                    <span className="inline-flex items-center rounded-full border border-[#138808]/20 bg-[#138808]/10 px-2.5 py-0.5 text-xs font-medium text-[#138808]">
                      {roleName}
                    </span>
                  )}
                  {profile?.institution && <span className="text-[#5A6472]">{profile.institution}</span>}
                </p>
              )}
            </div>

            {/* Warnings for tables this account cannot read */}
            {overview && overview.warnings.length > 0 && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-lg border border-[#E8A33D]/30 bg-[#E8A33D]/10 p-4 text-sm text-[#8A5A12]"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Some sections could not be loaded</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
                    {overview.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <StatsCards metrics={overview?.metrics ?? []} loading={loadingOverview} />

            {/* Recent Activity */}
            <RecentActivity items={overview?.recentItems ?? []} loading={loadingOverview} />

            {/* Recently added repository content (real, public read) */}
            <RecentlyAdded />

            {/* Real, status-derived pending items */}
            {!loadingOverview && <PendingItems items={overview?.pendingItems ?? []} />}
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
