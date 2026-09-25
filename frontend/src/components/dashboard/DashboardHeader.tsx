import { Link } from "react-router-dom";
import { Menu, X, Bell, LogOut, Home } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  citizen: "Citizen",
  researcher: "Verified Researcher",
  policymaker: "Government Official",
  admin: "Administrator",
};

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void;
  showMobileMenu: boolean;
}

export default function DashboardHeader({ onMobileMenuToggle, showMobileMenu }: DashboardHeaderProps) {
  const { user, signOut } = useAuth();
  
  const fullName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const appMetadataRole = typeof user?.app_metadata?.role === "string" ? user.app_metadata.role : null;
  const userMetadataRole = typeof user?.user_metadata?.role === "string" ? user.user_metadata.role : null;
  const role = (appMetadataRole ?? userMetadataRole) as UserRole | null;
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
          {role && (
            <p className="truncate text-xs text-[#138808]">{ROLE_LABELS[role] || role}</p>
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