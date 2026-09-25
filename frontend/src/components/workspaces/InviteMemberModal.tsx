import { useState } from "react";
import { X } from "lucide-react";
import { MEMBER_PERMISSIONS } from "../../lib/mockWorkspaceData";

interface InviteMemberModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; role: string; permission: string }) => void;
}

export default function InviteMemberModal({ onClose, onSubmit }: InviteMemberModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    permission: "Contributor"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E1E5EA]">
          <h2 className="text-xl font-semibold text-[#1F2933]">Invite Member</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F7FA] rounded-full text-[#5A6472]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#1F2933] mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="Enter member name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1F2933] mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="Enter email address"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-[#1F2933] mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="e.g., Researcher, Analyst, Professor"
            />
          </div>

          {/* Permission */}
          <div>
            <label htmlFor="permission" className="block text-sm font-medium text-[#1F2933] mb-2">
              Permission <span className="text-red-500">*</span>
            </label>
            <select
              id="permission"
              required
              value={formData.permission}
              onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
            >
              {MEMBER_PERMISSIONS.map(permission => (
                <option key={permission} value={permission}>{permission}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[#5A6472]">
              Owner: Full control | Editor: Can edit all content | Contributor: Can add content | Viewer: Read-only access
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E5EA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#0B3D91] hover:bg-[#062A63] rounded-md transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}