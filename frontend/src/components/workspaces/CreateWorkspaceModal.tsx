import { useState } from "react";
import { X } from "lucide-react";
import { RESEARCH_THEMES, ACCESS_LEVELS } from "../../lib/mockWorkspaceData";
import type { CreateWorkspaceFormData, AccessLevel } from "../../types/workspace";

interface CreateWorkspaceModalProps {
  onClose: () => void;
  onSubmit: (data: CreateWorkspaceFormData) => void;
}

export default function CreateWorkspaceModal({ onClose, onSubmit }: CreateWorkspaceModalProps) {
  const [formData, setFormData] = useState<CreateWorkspaceFormData>({
    name: "",
    description: "",
    researchTheme: "",
    accessLevel: "Private",
    objective: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E1E5EA]">
          <h2 className="text-xl font-semibold text-[#1F2933]">Create New Workspace</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F7FA] rounded-full text-[#5A6472]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Workspace Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#1F2933] mb-2">
              Workspace Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="Enter workspace name"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#1F2933] mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="Brief description of the workspace purpose"
            />
          </div>

          {/* Research Theme */}
          <div>
            <label htmlFor="researchTheme" className="block text-sm font-medium text-[#1F2933] mb-2">
              Research Theme <span className="text-red-500">*</span>
            </label>
            <select
              id="researchTheme"
              required
              value={formData.researchTheme}
              onChange={(e) => setFormData({ ...formData, researchTheme: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
            >
              <option value="">Select a research theme</option>
              {RESEARCH_THEMES.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          {/* Access Level */}
          <div>
            <label htmlFor="accessLevel" className="block text-sm font-medium text-[#1F2933] mb-2">
              Access Level <span className="text-red-500">*</span>
            </label>
            <select
              id="accessLevel"
              required
              value={formData.accessLevel}
              onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value as AccessLevel })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
            >
              {ACCESS_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[#5A6472]">
              Private: Only invited members | Institution: Members from your institution | Public Research: Open to all verified researchers
            </p>
          </div>

          {/* Workspace Objective */}
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-[#1F2933] mb-2">
              Workspace Objective <span className="text-red-500">*</span>
            </label>
            <textarea
              id="objective"
              required
              rows={4}
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="What are the main goals and deliverables for this workspace?"
            />
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
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}