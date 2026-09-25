import { useState } from "react";
import {
  Users,
  FileText,
  Lightbulb,
  LayoutGrid,
  Activity,
  Settings,
  Shield,
  Clock
} from "lucide-react";
import {
  MOCK_ADMIN_USERS,
  MOCK_ADMIN_STATS,
  MOCK_SYSTEM_ACTIVITIES
} from "../../lib/mockAdminData";
import type { AdminUser } from "../../lib/mockAdminData";
import Toast from "../../components/ui/Toast";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "content" | "system">("overview");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [users, setUsers] = useState<AdminUser[]>(MOCK_ADMIN_USERS);

  const handleUserStatusChange = (userId: string, newStatus: "Active" | "Inactive") => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    );
    setUsers(updatedUsers);
    setToastMessage(`User status updated to ${newStatus}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#138808]/10 text-[#138808] border-[#138808]/20";
      case "Inactive":
        return "bg-red-100 text-red-600 border-red-200";
      case "Pending":
        return "bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/20";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getActivityIcon = (category: string) => {
    switch (category) {
      case "User":
        return <Users className="h-4 w-4" />;
      case "Content":
        return <FileText className="h-4 w-4" />;
      case "System":
        return <Settings className="h-4 w-4" />;
      case "Security":
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2933]">Admin Panel</h1>
          <p className="text-sm text-[#5A6472] mt-1">
            Platform administration and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-[#138808] rounded-full animate-pulse" />
            <span className="text-[#138808] font-medium">System Operational</span>
          </div>
        </div>
      </div>

      {/* Prototype Notice */}
      <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-lg p-4">
        <p className="text-sm text-[#FF9933]">
          <strong>Prototype Notice:</strong> This is a frontend prototype admin interface. All actions are local and mock-based. No actual backend, database, or authentication changes are made.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E1E5EA]">
        <nav className="flex gap-8">
          {[
            { id: "overview" as const, label: "Overview", icon: LayoutGrid },
            { id: "users" as const, label: "User Management", icon: Users },
            { id: "content" as const, label: "Content Management", icon: FileText },
            { id: "system" as const, label: "System Activity", icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#FF9933] text-[#0B3D91]"
                  : "border-transparent text-[#5A6472] hover:text-[#0B3D91]"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-[#0B3D91]" />
                <span className="text-sm font-medium text-[#5A6472]">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-[#1F2933]">{MOCK_ADMIN_STATS.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-[#5A6472] mt-1">{MOCK_ADMIN_STATS.activeUsers} active</p>
            </div>
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-[#0B3D91]" />
                <span className="text-sm font-medium text-[#5A6472]">Documents</span>
              </div>
              <p className="text-2xl font-bold text-[#1F2933]">{MOCK_ADMIN_STATS.totalDocuments.toLocaleString()}</p>
              <p className="text-xs text-[#5A6472] mt-1">{MOCK_ADMIN_STATS.pendingDocuments} pending review</p>
            </div>
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="h-5 w-5 text-[#0B3D91]" />
                <span className="text-sm font-medium text-[#5A6472]">Innovations</span>
              </div>
              <p className="text-2xl font-bold text-[#1F2933]">{MOCK_ADMIN_STATS.totalInnovations}</p>
              <p className="text-xs text-[#5A6472] mt-1">{MOCK_ADMIN_STATS.pendingInnovations} pending review</p>
            </div>
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <LayoutGrid className="h-5 w-5 text-[#0B3D91]" />
                <span className="text-sm font-medium text-[#5A6472]">Workspaces</span>
              </div>
              <p className="text-2xl font-bold text-[#1F2933]">{MOCK_ADMIN_STATS.totalWorkspaces}</p>
              <p className="text-xs text-[#5A6472] mt-1">{MOCK_ADMIN_STATS.activeWorkspaces} active</p>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1F2933]">Pending Actions</h2>
              <span className="inline-flex items-center rounded-full bg-[#E8A33D]/10 px-2.5 py-0.5 text-xs font-medium text-[#E8A33D] border border-[#E8A33D]/20">
                {MOCK_ADMIN_STATS.pendingUsers + MOCK_ADMIN_STATS.pendingDocuments + MOCK_ADMIN_STATS.pendingInnovations} items
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#F5F7FA] rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#0B3D91]" />
                  <div>
                    <p className="text-sm font-medium text-[#1F2933]">Pending User Approvals</p>
                    <p className="text-xs text-[#5A6472]">Users awaiting verification</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-[#1F2933]">{MOCK_ADMIN_STATS.pendingUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5F7FA] rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#0B3D91]" />
                  <div>
                    <p className="text-sm font-medium text-[#1F2933]">Document Reviews</p>
                    <p className="text-xs text-[#5A6472]">Documents awaiting moderation</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-[#1F2933]">{MOCK_ADMIN_STATS.pendingDocuments}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5F7FA] rounded-lg">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-[#0B3D91]" />
                  <div>
                    <p className="text-sm font-medium text-[#1F2933]">Innovation Reviews</p>
                    <p className="text-xs text-[#5A6472]">Submissions awaiting evaluation</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-[#1F2933]">{MOCK_ADMIN_STATS.pendingInnovations}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Recent System Activity</h2>
            <div className="space-y-4">
              {MOCK_SYSTEM_ACTIVITIES.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-[#E1E5EA] last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#0B3D91]/10 rounded-full flex items-center justify-center text-[#0B3D91]">
                    {getActivityIcon(activity.category)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#1F2933]">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-[#5A6472] mt-1">{activity.details}</p>
                    <p className="text-xs text-[#5A6472] mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E1E5EA] rounded-lg overflow-hidden">
            <div className="p-6 border-b border-[#E1E5EA]">
              <h2 className="text-lg font-semibold text-[#1F2933]">User Management</h2>
              <p className="text-sm text-[#5A6472] mt-1">
                Manage platform users and their access levels
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F7FA] border-b border-[#E1E5EA]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                      Institution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5EA]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#F5F7FA]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#1F2933]">{user.name}</p>
                          <p className="text-xs text-[#5A6472]">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          user.role === "Admin" ? "bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]/20" :
                          user.role === "Government Official" ? "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20" :
                          user.role === "Researcher" ? "bg-[#138808]/10 text-[#138808] border-[#138808]/20" :
                          user.role === "Institution Admin" ? "bg-purple-100 text-purple-600 border-purple-200" :
                          "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#1F2933]">{user.institution}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#5A6472]">
                          {user.lastActive === "Never" ? "Never" : new Date(user.lastActive).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.status === "Active" ? (
                            <button
                              onClick={() => handleUserStatusChange(user.id, "Inactive")}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserStatusChange(user.id, "Active")}
                              className="text-xs text-[#138808] hover:text-green-700"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Content Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[#E1E5EA] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-5 w-5 text-[#0B3D91]" />
                  <h3 className="text-sm font-medium text-[#1F2933]">Repository Documents</h3>
                </div>
                <p className="text-2xl font-bold text-[#1F2933] mb-2">{MOCK_ADMIN_STATS.totalDocuments.toLocaleString()}</p>
                <p className="text-xs text-[#5A6472]">{MOCK_ADMIN_STATS.pendingDocuments} pending review</p>
                <button className="mt-3 text-sm text-[#0B3D91] hover:text-[#FF9933]">
                  Review Pending →
                </button>
              </div>
              <div className="border border-[#E1E5EA] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Lightbulb className="h-5 w-5 text-[#0B3D91]" />
                  <h3 className="text-sm font-medium text-[#1F2933]">Innovation Submissions</h3>
                </div>
                <p className="text-2xl font-bold text-[#1F2933] mb-2">{MOCK_ADMIN_STATS.totalInnovations}</p>
                <p className="text-xs text-[#5A6472]">{MOCK_ADMIN_STATS.pendingInnovations} pending review</p>
                <button className="mt-3 text-sm text-[#0B3D91] hover:text-[#FF9933]">
                  Review Pending →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Content Moderation Queue</h2>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
              <p className="text-sm text-[#5A6472]">
                Content moderation interface would be implemented here in the full version.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1F2933] mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-[#F5F7FA] rounded-lg">
                <div className="w-3 h-3 bg-[#138808] rounded-full" />
                <div>
                  <p className="text-sm font-medium text-[#1F2933]">API Services</p>
                  <p className="text-xs text-[#5A6472]">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#F5F7FA] rounded-lg">
                <div className="w-3 h-3 bg-[#138808] rounded-full" />
                <div>
                  <p className="text-sm font-medium text-[#1F2933]">Database</p>
                  <p className="text-xs text-[#5A6472]">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#F5F7FA] rounded-lg">
                <div className="w-3 h-3 bg-[#138808] rounded-full" />
                <div>
                  <p className="text-sm font-medium text-[#1F2933]">Storage</p>
                  <p className="text-xs text-[#5A6472]">Operational</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#1F2933] mb-4">System Activity Log</h2>
            <div className="space-y-4">
              {MOCK_SYSTEM_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-[#E1E5EA] last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#0B3D91]/10 rounded-full flex items-center justify-center text-[#0B3D91]">
                    {getActivityIcon(activity.category)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#1F2933]">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-[#5A6472] mt-1">{activity.details}</p>
                    <p className="text-xs text-[#5A6472] mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    activity.category === "Security" ? "bg-red-100 text-red-600 border-red-200" :
                    activity.category === "System" ? "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20" :
                    "bg-gray-100 text-gray-600 border-gray-200"
                  }`}>
                    {activity.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}