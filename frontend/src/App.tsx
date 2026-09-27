import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import { AuthProvider } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Help from "./pages/Help";
import Repository from "./pages/Repository";
import DocumentDetail from "./pages/DocumentDetail";
import GISExplorer from "./pages/GISExplorer";
import Dashboards from "./pages/Dashboards";
import SimulationLab from "./pages/SimulationLab";
import InnovationPortal from "./pages/InnovationPortal";
import ApiPortal from "./pages/ApiPortal";
import Workspaces from "./pages/Workspaces";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import SearchResults from "./pages/SearchResults";
import MyUploads from "./pages/dashboard/MyUploads";
import MyWorkspaces from "./pages/dashboard/MyWorkspaces";
import SavedSearches from "./pages/dashboard/SavedSearches";
import MySimulations from "./pages/dashboard/MySimulations";
import InnovationSubmissions from "./pages/dashboard/InnovationSubmissions";
import Settings from "./pages/dashboard/Settings";
import DepartmentData from "./pages/dashboard/DepartmentData";
import AdminPanel from "./pages/dashboard/AdminPanel";

export default function App() {
  const hasAuthError = new URLSearchParams(window.location.hash.slice(1)).has("error_code");

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={hasAuthError ? <Auth /> : <Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/repository" element={<Repository />} />
          <Route path="/repository/:id" element={<DocumentDetail />} />
          <Route path="/gis-explorer" element={<GISExplorer />} />
          <Route path="/dashboards" element={<Dashboards />} />
          <Route path="/simulation-lab" element={<SimulationLab />} />
          <Route path="/innovation-portal" element={<InnovationPortal />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/workspaces/:id" element={<WorkspaceDetail />} />
          <Route path="/api" element={<ApiPortal />} />
          <Route path="/search" element={<SearchResults />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="uploads" element={<MyUploads />} />
            <Route path="workspaces" element={<MyWorkspaces />} />
            <Route path="saved-searches" element={<SavedSearches />} />
            <Route path="simulations" element={<MySimulations />} />
            <Route path="innovation" element={<InnovationSubmissions />} />
            <Route path="settings" element={<Settings />} />
            <Route path="department-data" element={<DepartmentData />} />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
          </Route>
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
