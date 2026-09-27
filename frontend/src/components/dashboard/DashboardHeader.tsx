import { Link } from "react-router-dom";
import { Menu, X, Bell, LogOut, Home } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { getDashboardRoleLabel } from "./dashboardRoles";

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void;
  showMobileMenu: boolean;
}

export default function DashboardHeader({ onMobileMenuToggle, showMobileMenu }: DashboardHeaderProps) {
  const { user, signOut } = useAuth();
  // Role comes from public.profiles (see useProfile), never from client-editable metadata.
  const { profile, role } = useProfile();

  const metadataName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const fullName = profile?.full_name ?? metadataName;
  const roleName = getDashboardRoleLabel(role);
  const email = user?.email ?? "";
  const initials = (fullName?.trim() || email.trim() || "U")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    window.location.href = "/auth";
  }

  return (
    <header className="lg:hidden flex items-center justify-between border-b border-[#E1E5EA] bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-md p-2 text-[#5A6472] hover:bg-[#F5F7FA]"
        >
          {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0B3D91] text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#1F2933]">{fullName || "User"}</p>
          {roleName && (
            <p className="truncate text-xs text-[#138808]">{roleName}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Link
          to="/"
          aria-label="Back to home page"
          title="Back to home page"
          className="rounded-md p-2 text-[#5A6472] hover:bg-[#F5F7FA] hover:text-[#0B3D91]"
        >
          <Home className="h-5 w-5" />
        </Link>
        <button className="relative rounded-md p-2 text-[#5A6472] hover:bg-[#F5F7FA]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FF9933]" />
        </button>
        <button
          onClick={handleSignOut}
          className="rounded-md p-2 text-[#5A6472] hover:bg-[#F5F7FA] hover:text-[#D64545]"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}