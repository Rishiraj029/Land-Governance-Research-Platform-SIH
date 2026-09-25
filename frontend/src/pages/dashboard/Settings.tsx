import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  citizen: "Citizen",
  researcher: "Verified Researcher",
  policymaker: "Government Official",
  admin: "Administrator",
};

export default function Settings() {
  const { user } = useAuth();
  
  const fullName = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const email = user?.email ?? "Unknown email";
  const appMetadataRole = typeof user?.app_metadata?.role === "string" ? user.app_metadata.role : null;
  const userMetadataRole = typeof user?.user_metadata?.role === "string" ? user.user_metadata.role : null;
  const role = (appMetadataRole ?? userMetadataRole) as UserRole | null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1F2933]">Settings</h1>
      
      <div className="bg-white rounded-lg border border-[#E1E5EA] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2933] mb-1">Full Name</label>
            <p className="text-[#5A6472]">{fullName || "Not set"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2933] mb-1">Email</label>
            <p className="text-[#5A6472]">{email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2933] mb-1">Role</label>
            <p className="text-[#138808]">{role ? (ROLE_LABELS[role] || role) : "Not assigned"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E1E5EA] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Notification Preferences</h2>
        <p className="text-[#5A6472]">
          This section is under development. Full notification management will be added in a future update.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#E1E5EA] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Security</h2>
        <p className="text-[#5A6472]">
          This section is under development. Password management and MFA will be added in a future update.
        </p>
      </div>
    </div>
  );
}