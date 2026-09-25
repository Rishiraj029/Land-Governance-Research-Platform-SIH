import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  FileText,
  Clock,
  Share2,
  Edit,
  LogOut,
  Building2,
  CheckCircle,
  Circle,
  Plus,
  X,
  ExternalLink,
  Loader2
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
  loadWorkspaceById,
  loadWorkspaceMembers,
  loadWorkspaceDocuments,
  loadResearchNotes,
  loadWorkspaceTasks,
  loadWorkspaceActivity,
  addWorkspaceMember,
  findUserByEmail,
  addWorkspaceDocument,
  createResearchNote,
  deleteResearchNote,
  createWorkspaceTask,
  updateWorkspaceTask,
  getWorkspaceMemberCount,
  getWorkspaceDocumentCount
} from "../lib/supabaseWorkspace";
import type {
  Workspace,
  WorkspaceTab,
  ResearchNote,
  WorkspaceTask,
  WorkspaceMember,
  WorkspaceActivity,
  WorkspaceDocument
} from "../types/workspace";
import InviteMemberModal from "../components/workspaces/InviteMemberModal";
import AddNoteModal from "../components/workspaces/AddNoteModal";
import AddTaskModal from "../components/workspaces/AddTaskModal";
import AddDocumentModal from "../components/workspaces/AddDocumentModal";
import Toast from "../components/ui/Toast";
import { useAuth } from "../hooks/useAuth";

export default function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Local data state
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [activities, setActivities] = useState<WorkspaceActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workspace data from Supabase
  useEffect(() => {
    const loadWorkspaceData = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Load workspace
        const workspaceResult = await loadWorkspaceById(id!);
        if (workspaceResult.error || !workspaceResult.workspace) {
          setError(workspaceResult.error || "Workspace not found");
          setIsLoading(false);
          return;
        }
        setWorkspace(workspaceResult.workspace);

        // Load counts
        const [memberCountResult, documentCountResult] = await Promise.all([
          getWorkspaceMemberCount(id!),
          getWorkspaceDocumentCount(id!)
        ]);

        if (!memberCountResult.error && workspaceResult.workspace) {
          setWorkspace({ ...workspaceResult.workspace, memberCount: memberCountResult.count });
        }

        if (!documentCountResult.error && workspaceResult.workspace) {
          setWorkspace(prev => prev ? { ...prev, documentCount: documentCountResult.count } : null);
        }

        // Load members
        const membersResult = await loadWorkspaceMembers(id!);
        if (!membersResult.error) {
          setMembers(membersResult.members);
        }

        // Load documents
        const documentsResult = await loadWorkspaceDocuments(id!);
        if (!documentsResult.error) {
          setDocuments(documentsResult.documents);
        }

        // Load notes
        const notesResult = await loadResearchNotes(id!);
        if (!notesResult.error) {
          setNotes(notesResult.notes);
        }

        // Load tasks
        const tasksResult = await loadWorkspaceTasks(id!);
        if (!tasksResult.error) {
          setTasks(tasksResult.tasks);
        }

        // Load activity
        const activityResult = await loadWorkspaceActivity(id!);
        if (!activityResult.error) {
          setActivities(activityResult.activities);
        }

      } catch (err) {
        console.error("Error loading workspace data:", err);
        setError("Failed to load workspace data");
      }

      setIsLoading(false);
    };

    loadWorkspaceData();
  }, [id]);

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#138808]/10 text-[#138808] border-[#138808]/20";
      case "Draft":
        return "bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/20";
      case "Archived":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Access level badge color
  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "Private":
        return "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20";
      case "Institution":
        return "bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]/20";
      case "Public Research":
        return "bg-[#138808]/10 text-[#138808] border-[#138808]/20";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Permission badge color
  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "Owner":
        return "bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]/20";
      case "Editor":
        return "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20";
      case "Contributor":
        return "bg-[#138808]/10 text-[#138808] border-[#138808]/20";
      case "Viewer":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Task status color
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-[#138808]/10 text-[#138808] border-[#138808]/20";
      case "In Progress":
        return "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20";
      case "To Do":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/20";
      case "Low":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Share workspace
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/workspaces/${id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: workspace?.name,
          text: workspace?.description,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage("Workspace link copied to clipboard");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // Handle invite member
  const handleInviteMember = async (data: { name: string; email: string; role: string; permission: string }) => {
    if (!id || !user) return;

    try {
      // Find user by email
      const userResult = await findUserByEmail(data.email);
      if (userResult.error || !userResult.userId) {
        setToastMessage(`Failed to find user: ${userResult.error || "User not found"}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      // Add member to workspace
      const addResult = await addWorkspaceMember(id!, userResult.userId, data.role, user.id);
      if (addResult.error) {
        setToastMessage(`Failed to add member: ${addResult.error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      // Reload members and count
      const [membersResult, memberCountResult] = await Promise.all([
        loadWorkspaceMembers(id!),
        getWorkspaceMemberCount(id!)
      ]);

      if (!membersResult.error) {
        setMembers(membersResult.members);
      }

      if (!memberCountResult.error && workspace) {
        setWorkspace({ ...workspace, memberCount: memberCountResult.count });
      }

      setShowInviteModal(false);
      setToastMessage("Member invited successfully");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error inviting member:", error);
      setToastMessage("Failed to invite member");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Handle add note
  const handleAddNote = async (data: { title: string; content: string }) => {
    if (!id || !user) return;

    try {
      const result = await createResearchNote(id, user.id, data.title, data.content);
      if (result.error) {
        setToastMessage(`Failed to create note: ${result.error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      // Reload notes
      const notesResult = await loadResearchNotes(id!);
      if (!notesResult.error) {
        setNotes(notesResult.notes);
      }

      setShowAddNoteModal(false);
      setToastMessage("Note created successfully");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error creating note:", error);
      setToastMessage("Failed to create note");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Handle delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!id) return;

    try {
      const result = await deleteResearchNote(noteId);
      if (result.error) {
        setToastMessage(`Failed to delete note: ${result.error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      // Reload notes
      const notesResult = await loadResearchNotes(id!);
      if (!notesResult.error) {
        setNotes(notesResult.notes);
      }

      setToastMessage("Note deleted successfully");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error deleting note:", error);
      setToastMessage("Failed to delete note");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Handle add task
  const handleAddTask = async (data: { title: string; description: string; assignee: string; priority: string; dueDate: string }) => {
    if (!id || !user) return;

    try {
      // For MVP, we'll use null for assignee if it's not a specific user
      // In production, you'd need to resolve the assignee email to a user ID
      const assigneeId = data.assignee === "Unassigned" ? null : user.id; // Simplified for MVP

      const result = await createWorkspaceTask(
        id!,
        assigneeId,
        data.title,
        data.description,
        data.dueDate || null,
        user.id
      );

      if (result.error) {
        setToastMessage(`Failed to create task: ${result.error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      // Reload tasks
      const tasksResult = await loadWorkspaceTasks(id!);
      if (!tasksResult.error) {
        setTasks(tasksResult.tasks);
      }

      setShowAddTaskModal(false);
      setToastMessage("Task created successfully");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error creating task:", error);
      setToastMessage("Failed to create task");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Handle update task status
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!id) return;

    try {
      const result = await updateWorkspaceTask(taskId, newStatus);
      if (result.error) {
        setToastMessage(`Failed to update task: ${result.error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      // Reload tasks
      const tasksResult = await loadWorkspaceTasks(id!);
      if (!tasksResult.error) {
        setTasks(tasksResult.tasks);
      }

      setToastMessage("Task status updated");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error updating task:", error);
      setToastMessage("Failed to update task");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!id) return;

    try {
      // Note: delete task function not implemented in service layer yet
      // For now, we'll just update status to completed
      const result = await updateWorkspaceTask(taskId, "Completed");
      if (result.error) {
        setToastMessage(`Failed to delete task: ${result.error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      // Reload tasks
      const tasksResult = await loadWorkspaceTasks(id!);
      if (!tasksResult.error) {
        setTasks(tasksResult.tasks);
      }

      setToastMessage("Task marked as completed");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error deleting task:", error);
      setToastMessage("Failed to delete task");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Handle add document
  const handleAddDocument = async (documentId: string) => {
    if (!id || !user) return;

    try {
      const result = await addWorkspaceDocument(id!, documentId, user.id);
      if (result.error) {
        setToastMessage(`Failed to add document: ${result.error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      // Reload documents and count
      const [documentsResult, documentCountResult] = await Promise.all([
        loadWorkspaceDocuments(id!),
        getWorkspaceDocumentCount(id!)
      ]);

      if (!documentsResult.error) {
        setDocuments(documentsResult.documents);
      }

      if (!documentCountResult.error && workspace) {
        setWorkspace({ ...workspace, documentCount: documentCountResult.count });
      }

      setShowAddDocumentModal(false);
      setToastMessage("Document added to workspace");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error adding document:", error);
      setToastMessage("Failed to add document");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Handle remove document
  const handleRemoveDocument = async (_documentId: string) => {
    try {
      // Note: remove document function not implemented in service layer yet
      // For now, we'll just show a message
      setToastMessage("Document removal not implemented yet");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error removing document:", error);
      setToastMessage("Failed to remove document");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-[#0B3D91] animate-spin mx-auto mb-4" />
            <p className="text-[#5A6472]">Loading workspace...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Workspace not found"}</p>
            <button
              onClick={() => navigate("/workspaces")}
              className="text-[#0B3D91] hover:text-[#FF9933]"
            >
              Back to Workspaces
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate metrics
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const todoTasks = tasks.filter(t => t.status === "To Do").length;

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        {/* Workspace Header */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Back Button */}
            <button
              onClick={() => navigate("/workspaces")}
              className="flex items-center gap-2 text-sm text-[#5A6472] hover:text-[#0B3D91] mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Workspaces
            </button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[#1F2933]">{workspace.name}</h1>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(workspace.status)}`}>
                    {workspace.status}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getAccessLevelColor(workspace.accessLevel)}`}>
                    {workspace.accessLevel}
                  </span>
                </div>
                <p className="text-[#5A6472] mb-4">{workspace.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#5A6472]">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{workspace.researchTheme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{workspace.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{workspace.documentCount} documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated {workspace.lastActivity}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm font-medium text-[#1F2933] hover:bg-[#F5F7FA] transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm font-medium text-[#1F2933] hover:bg-[#F5F7FA] transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-8 overflow-x-auto">
              {[
                { id: "overview" as WorkspaceTab, label: "Overview" },
                { id: "documents" as WorkspaceTab, label: "Documents" },
                { id: "notes" as WorkspaceTab, label: "Research Notes" },
                { id: "tasks" as WorkspaceTab, label: "Tasks" },
                { id: "members" as WorkspaceTab, label: "Members" },
                { id: "activity" as WorkspaceTab, label: "Activity" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#FF9933] text-[#0B3D91]"
                      : "border-transparent text-[#5A6472] hover:text-[#0B3D91]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Workspace Objective */}
              <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-3">Workspace Objective</h2>
                <p className="text-[#5A6472]">{workspace.objective}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-[#0B3D91]" />
                    <span className="text-sm font-medium text-[#5A6472]">Documents</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F2933]">{workspace.documentCount}</p>
                </div>
                <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-[#0B3D91]" />
                    <span className="text-sm font-medium text-[#5A6472]">Research Notes</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F2933]">{notes.length}</p>
                </div>
                <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-[#0B3D91]" />
                    <span className="text-sm font-medium text-[#5A6472]">Open Tasks</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F2933]">{tasks.filter(t => t.status !== "Completed").length}</p>
                </div>
                <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-[#0B3D91]" />
                    <span className="text-sm font-medium text-[#5A6472]">Members</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F2933]">{workspace.memberCount}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-[#E1E5EA] last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#0B3D91]/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-[#0B3D91]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#1F2933]">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-[#5A6472] mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Members Preview */}
              <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#1F2933]">Team Members</h2>
                  <button
                    onClick={() => setActiveTab("members")}
                    className="text-sm text-[#0B3D91] hover:text-[#FF9933]"
                  >
                    View all
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.slice(0, 6).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#0B3D91]/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#0B3D91]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1F2933] truncate">{member.name}</p>
                        <p className="text-xs text-[#5A6472] truncate">{member.institution}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getPermissionColor(member.permission)}`}>
                        {member.permission}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Research */}
              <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-4">Related Research</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/repository"
                    className="flex items-start gap-3 p-4 border border-[#E1E5EA] rounded-lg hover:bg-[#F5F7FA] transition-colors"
                  >
                    <FileText className="h-5 w-5 text-[#0B3D91] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1F2933]">Browse Knowledge Repository</p>
                      <p className="text-xs text-[#5A6472] mt-1">Find related research papers and documents</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#5A6472] flex-shrink-0" />
                  </Link>
                  <Link
                    to="/gis-explorer"
                    className="flex items-start gap-3 p-4 border border-[#E1E5EA] rounded-lg hover:bg-[#F5F7FA] transition-colors"
                  >
                    <Building2 className="h-5 w-5 text-[#0B3D91] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1F2933]">GIS Map Explorer</p>
                      <p className="text-xs text-[#5A6472] mt-1">Explore geospatial data and layers</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#5A6472] flex-shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1F2933]">Workspace Documents</h2>
                <button
                  onClick={() => setShowAddDocumentModal(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add from Repository
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12 bg-white border border-[#E1E5EA] rounded-lg">
                  <FileText className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#1F2933] mb-2">No documents yet</h3>
                  <p className="text-[#5A6472] mb-4">
                    Add documents from the repository to get started
                  </p>
                  <button
                    onClick={() => setShowAddDocumentModal(true)}
                    className="text-sm font-medium text-[#0B3D91] hover:text-[#FF9933]"
                  >
                    Add your first document
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-[#E1E5EA] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#F5F7FA] border-b border-[#E1E5EA]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Date Added
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E5EA]">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-[#F5F7FA]">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-[#0B3D91]" />
                              <div>
                                <p className="text-sm font-medium text-[#1F2933]">{doc.title}</p>
                                {doc.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {doc.tags.map((tag, idx) => (
                                      <span key={idx} className="inline-flex items-center rounded-full bg-[#F5F7FA] px-2 py-0.5 text-xs text-[#5A6472]">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#1F2933]">{doc.type}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#1F2933]">{doc.author}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#5A6472]">{doc.addedAt}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/repository/${doc.documentId}`}
                                className="text-sm text-[#0B3D91] hover:text-[#FF9933]"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleRemoveDocument(doc.id)}
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Research Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1F2933]">Research Notes</h2>
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Note
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-12 bg-white border border-[#E1E5EA] rounded-lg">
                  <FileText className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#1F2933] mb-2">No research notes yet</h3>
                  <p className="text-[#5A6472] mb-4">
                    Create your first research note to document your findings
                  </p>
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="text-sm font-medium text-[#0B3D91] hover:text-[#FF9933]"
                  >
                    Create your first note
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-[#1F2933] line-clamp-2">{note.title}</h3>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                          aria-label="Delete note"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-[#5A6472] line-clamp-3 mb-4">{note.content}</p>
                      <div className="flex items-center justify-between text-xs text-[#5A6472]">
                        <span>{note.author}</span>
                        <span>{note.updatedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1F2933]">Tasks</h2>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
              </div>

              {/* Task Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Circle className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-[#5A6472]">To Do</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F2933]">{todoTasks}</p>
                </div>
                <div className="bg-white border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-4 border-2 border-[#0B3D91] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium text-[#5A6472]">In Progress</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F2933]">{inProgressTasks}</p>
                </div>
                <div className="bg-white border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-[#138808]" />
                    <span className="text-sm font-medium text-[#5A6472]">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F2933]">{completedTasks}</p>
                </div>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12 bg-white border border-[#E1E5EA] rounded-lg">
                  <CheckCircle className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#1F2933] mb-2">No tasks yet</h3>
                  <p className="text-[#5A6472] mb-4">
                    Create tasks to track your research progress
                  </p>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="text-sm font-medium text-[#0B3D91] hover:text-[#FF9933]"
                  >
                    Create your first task
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#1F2933]">{task.title}</h3>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getTaskStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          <p className="text-sm text-[#5A6472] mb-3">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-[#5A6472]">
                            <span>Assignee: {task.assignee}</span>
                            <span>Due: {task.dueDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className="text-sm border border-[#E1E5EA] rounded-md px-2 py-1 focus:border-[#0B3D91] focus:outline-none"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-600"
                            aria-label="Delete task"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1F2933]">Team Members</h2>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Invite Member
                </button>
              </div>

              <div className="bg-white border border-[#E1E5EA] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA] border-b border-[#E1E5EA]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                        Institution
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                        Permission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6472] uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EA]">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-[#F5F7FA]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-[#0B3D91]/10 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-[#0B3D91]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1F2933]">{member.name}</p>
                              {member.email && (
                                <p className="text-xs text-[#5A6472]">{member.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#1F2933]">{member.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#1F2933]">{member.institution}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getPermissionColor(member.permission)}`}>
                            {member.permission}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#5A6472]">{member.joinedAt}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#1F2933]">Activity Feed</h2>

              <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
                <div className="space-y-6">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-6 border-b border-[#E1E5EA] last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#0B3D91]/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#0B3D91]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#1F2933]">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                          {activity.objectName && (
                            <span className="text-[#0B3D91]"> "{activity.objectName}"</span>
                          )}
                        </p>
                        <p className="text-xs text-[#5A6472] mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInviteMember}
        />
      )}

      {showAddNoteModal && (
        <AddNoteModal
          onClose={() => setShowAddNoteModal(false)}
          onSubmit={handleAddNote}
        />
      )}

      {showAddTaskModal && (
        <AddTaskModal
          onClose={() => setShowAddTaskModal(false)}
          onSubmit={handleAddTask}
        />
      )}

      {showAddDocumentModal && (
        <AddDocumentModal
          onClose={() => setShowAddDocumentModal(false)}
          onSubmit={handleAddDocument}
        />
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