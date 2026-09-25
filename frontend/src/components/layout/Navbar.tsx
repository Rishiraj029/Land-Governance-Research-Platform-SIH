import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Globe,
  Landmark,
  Menu,
  X,
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const NAV_LINKS = [
  { name: "Repository", path: "/repository" },
  { name: "GIS Explorer", path: "/gis-explorer" },
  { name: "Dashboards", path: "/dashboards" },
  { name: "Simulation Lab", path: "/simulation-lab" },
  { name: "Innovation Portal", path: "/innovation-portal" },
  { name: "Workspaces", path: "/workspaces" },
];

/** Initials for the account avatar, e.g. "Rishiraj Singh" -> "RS". */
function getInitials(fullName: string | null, email: string): string {
  const source = fullName?.trim() || email.trim();
  if (!source) return "U";

  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]);
  return letters.join("").toUpperCase();
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const fullName =
    typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const email = user?.email ?? "";
  const displayName = fullName || (email ? email.split("@")[0] : "Account");
  const initials = getInitials(fullName, email);

  function closeMenus() {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }

  async function handleSignOut() {
    closeMenus();
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo and platform name */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-[#0B3D91]" aria-hidden="true" />
              <span className="hidden font-semibold text-[#0B3D91] sm:block">
                Land Governance Research Platform
              </span>
            </Link>
          </div>

          {/* Center-left: Primary nav links (desktop) */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-[#0B3D91]"
                    : "text-[#5A6472] hover:text-[#0B3D91]"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9933]" />
                )}
              </Link>
            ))}
          </div>

          {/* Center-right: Search bar */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:px-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6472]" />
              <input
                type="text"
                placeholder="Search research, policy, datasets…"
                className="w-full rounded-full border border-[#E1E5EA] bg-[#F5F7FA] py-2 pl-10 pr-4 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-[#E1E5EA] bg-white p-2 shadow-lg">
                  <p className="px-3 py-2 text-xs text-[#5A6472]">
                    Top 5 matching results would appear here
                  </p>
                  <Link
                    to="/search"
                    className="block rounded px-3 py-2 text-sm font-medium text-[#0B3D91] hover:bg-[#F5F7FA]"
                  >
                    See all results →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Language, notifications, user menu */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <button className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-[#5A6472] hover:bg-[#F5F7FA]">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">EN</span>
            </button>

            {/* Notifications */}
            <button className="relative rounded-full p-2 text-[#5A6472] hover:bg-[#F5F7FA]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FF9933]" />
            </button>

            {/* User menu: avatar once signed in, auth links otherwise */}
            {loading ? null : user ? (
              <div
                className="relative"
                onKeyDown={(event) => {
                  if (event.key === "Escape") setUserMenuOpen(false);
                }}
              >
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label={`Account menu for ${displayName}`}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-[#F5F7FA] sm:pr-3"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B3D91] text-sm font-semibold text-white"
                    aria-hidden="true"
                  >
                    {initials}
                  </span>
                  <span className="hidden max-w-[10rem] truncate text-sm font-medium text-[#1F2933] sm:block">
                    {displayName}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    {/* Click-away layer */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      role="menu"
                      aria-label="Account menu"
                      className="absolute right-0 z-50 mt-2 w-60 rounded-lg border border-[#E1E5EA] bg-white p-2 shadow-lg"
                    >
                      <div className="mb-1 border-b border-[#E1E5EA] px-3 py-2">
                        <p className="truncate text-sm font-medium text-[#1F2933]">{displayName}</p>
                        {email && <p className="truncate text-xs text-[#5A6472]">{email}</p>}
                      </div>
                      <Link
                        to="/dashboard"
                        role="menuitem"
                        onClick={closeMenus}
                        className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] hover:text-[#0B3D91]"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/workspaces"
                        role="menuitem"
                        onClick={closeMenus}
                        className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] hover:text-[#0B3D91]"
                      >
                        <FolderKanban className="h-4 w-4" />
                        My Workspaces
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        role="menuitem"
                        onClick={closeMenus}
                        className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] hover:text-[#0B3D91]"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <div className="my-1 border-t border-[#E1E5EA]" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm font-medium text-[#D64545] hover:bg-[#F5F7FA]"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex sm:items-center sm:gap-2">
                <Link
                  to="/auth"
                  state={{ from: location.pathname }}
                  className="rounded-md px-4 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                >
                  Log In
                </Link>
                <Link
                  to="/auth"
                  state={{ from: location.pathname }}
                  className="rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-medium text-white hover:bg-[#062A63]"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="rounded-md p-2 text-[#5A6472] hover:bg-[#F5F7FA] md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E1E5EA] bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(link.path)
                    ? "bg-[#F5F7FA] text-[#0B3D91]"
                    : "text-[#5A6472] hover:bg-[#F5F7FA]"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-[#E1E5EA] pt-3">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6472]" />
                <input
                  type="text"
                  placeholder="Search research, policy, datasets…"
                  className="w-full rounded-full border border-[#E1E5EA] bg-[#F5F7FA] py-2 pl-10 pr-4 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none"
                />
              </div>

              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0B3D91] text-sm font-semibold text-white"
                      aria-hidden="true"
                    >
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1F2933]">{displayName}</p>
                      {email && <p className="truncate text-xs text-[#5A6472]">{email}</p>}
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                    onClick={closeMenus}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/workspaces"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                    onClick={closeMenus}
                  >
                    <FolderKanban className="h-4 w-4" />
                    My Workspaces
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#D64545] hover:bg-[#F5F7FA]"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/auth"
                    state={{ from: location.pathname }}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/auth"
                    state={{ from: location.pathname }}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-[#0B3D91] hover:bg-[#F5F7FA]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
