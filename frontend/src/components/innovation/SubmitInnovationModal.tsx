import { useState } from "react";
import { X } from "lucide-react";
import { INNOVATION_CATEGORIES, INNOVATION_STATES } from "../../lib/mockInnovationData";
import type { CreateInnovationFormData } from "../../types/innovation";

interface SubmitInnovationModalProps {
  onClose: () => void;
  onSubmit: (data: CreateInnovationFormData) => void;
}

export default function SubmitInnovationModal({ onClose, onSubmit }: SubmitInnovationModalProps) {
  const [formData, setFormData] = useState<CreateInnovationFormData>({
    title: "",
    description: "",
    category: "Digital Governance",
    problem: "",
    solution: "",
    location: "Other",
    organization: "",
    team: "",
    contact: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E1E5EA]">
          <div>
            <h2 className="text-xl font-semibold text-[#1F2933]">Submit Innovation</h2>
            <p className="text-sm text-[#5A6472] mt-1">Share your land governance innovation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F7FA] rounded-full text-[#5A6472]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Innovation Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#1F2933] mb-2">
              Innovation Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="Enter a descriptive title for your innovation"
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
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="Describe your innovation in detail..."
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[#1F2933] mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
            >
              {INNOVATION_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Problem Addressed */}
          <div>
            <label htmlFor="problem" className="block text-sm font-medium text-[#1F2933] mb-2">
              Problem Addressed <span className="text-red-500">*</span>
            </label>
            <textarea
              id="problem"
              required
              rows={3}
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="What specific land governance problem does your innovation address?"
            />
          </div>

          {/* Proposed Solution */}
          <div>
            <label htmlFor="solution" className="block text-sm font-medium text-[#1F2933] mb-2">
              Proposed Solution <span className="text-red-500">*</span>
            </label>
            <textarea
              id="solution"
              required
              rows={3}
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="How does your innovation solve this problem?"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-[#1F2933] mb-2">
              Location/State <span className="text-red-500">*</span>
            </label>
            <select
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
            >
              {INNOVATION_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Organization */}
          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-[#1F2933] mb-2">
              Organization/Institution <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="organization"
              required
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="Your organization or institution"
            />
          </div>

          {/* Team */}
          <div>
            <label htmlFor="team" className="block text-sm font-medium text-[#1F2933] mb-2">
              Team Members <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="team"
              required
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="Team member names (comma-separated)"
            />
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-[#1F2933] mb-2">
              Contact Information <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="contact"
              required
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              placeholder="Email address for communication"
            />
          </div>

          {/* Prototype Notice */}
          <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-lg p-4">
            <p className="text-sm text-[#FF9933]">
              <strong>Prototype Notice:</strong> This is a frontend prototype submission. No data will be sent to a backend server. Your submission will be stored locally for demonstration purposes only.
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
              Submit Innovation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}