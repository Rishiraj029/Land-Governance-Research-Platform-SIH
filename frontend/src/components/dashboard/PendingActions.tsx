import { MOCK_PENDING_ACTIONS } from "../../lib/mockDashboardData";

export default function PendingActions() {
  return (
    <div className="bg-white rounded-lg border border-[#E1E5EA] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Pending actions</h2>
      <div className="space-y-3">
        {MOCK_PENDING_ACTIONS.map((action) => (
          <div
            key={action.id}
            className="p-4 rounded-lg border border-[#E1E5EA] bg-[#F5F7FA]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1F2933] mb-1">{action.title}</p>
                <p className="text-xs text-[#5A6472]">{action.description}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="text-xs font-medium text-[#0B3D91] hover:text-[#FF9933]">
                {action.actionText}
              </button>
              {action.secondaryActionText && (
                <button className="text-xs font-medium text-[#5A6472] hover:text-[#D64545]">
                  {action.secondaryActionText}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}