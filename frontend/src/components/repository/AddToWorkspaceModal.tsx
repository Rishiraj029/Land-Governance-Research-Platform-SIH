import { useState, useEffect } from "react";
import { X, Folder, Loader2, AlertCircle } from "lucide-react";
import { loadWorkspaces, addWorkspaceDocument } from "../../lib/supabaseWorkspace";
import type { Workspace } from "../../types/workspace";
import { useAuth } from "../../hooks/useAuth";

interface AddToWorkspaceModalProps {
  documentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddToWorkspaceModal({ documentId, onClose, onSuccess }: AddToWorkspaceModalProps) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) {
      setError("Please sign in to add to a workspace");
      setLoading(false);
      return;
    }

    const fetchWorkspaces = async () => {
      setLoading(true);
      const { workspaces: fetchedWorkspaces, error: loadError } = await loadWorkspaces(user.id);
      if (loadError) {
        setError(loadError);
      } else {
        setWorkspaces(fetchedWorkspaces);
      }
      setLoading(false);
    };

    fetchWorkspaces();
  }, [user]);

  const handleAdd = async () => {
    if (!selectedWorkspace || !user) return;
    
    setAdding(true);
    const { error: addError } = await addWorkspaceDocument(selectedWorkspace, documentId, user.id);
    setAdding(false);

    if (addError) {
      setError(addError);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#E1E5EA]">
          <h2 className="text-lg font-semibold text-[#1F2933]">Add to Workspace</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F5F7FA] rounded-full text-[#5A6472]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91] mb-2" />
              <p className="text-sm text-[#5A6472]">Loading your workspaces...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-[#D64545] mb-2" />
              <p className="text-sm text-[#D64545]">{error}</p>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Folder className="h-10 w-10 text-[#5A6472] mb-3 opacity-50" />
              <p className="text-sm font-medium text-[#1F2933] mb-1">No workspaces found</p>
              <p className="text-xs text-[#5A6472]">Create a workspace first to save this document.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {workspaces.map(workspace => (
                <div
                  key={workspace.id}
                  onClick={() => setSelectedWorkspace(workspace.id)}
                  className={`p-3 border rounded-md cursor-pointer transition-colors flex items-center gap-3 ${
                    selectedWorkspace === workspace.id 
                      ? "border-[#0B3D91] bg-[#0B3D91]/5" 
                      : "border-[#E1E5EA] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <Folder className={`h-5 w-5 ${selectedWorkspace === workspace.id ? "text-[#0B3D91]" : "text-[#5A6472]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F2933] truncate">{workspace.name}</p>
                    <p className="text-xs text-[#5A6472] truncate">{workspace.description || "No description"}</p>
                  </div>
                  {selectedWorkspace === workspace.id && (
                    <div className="w-4 h-4 bg-[#0B3D91] rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#E1E5EA] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] rounded-md"
            disabled={adding}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedWorkspace || adding || workspaces.length === 0}
            className="flex items-center justify-center min-w-[80px] px-4 py-2 text-sm font-medium text-white bg-[#0B3D91] hover:bg-[#062A63] rounded-md disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
