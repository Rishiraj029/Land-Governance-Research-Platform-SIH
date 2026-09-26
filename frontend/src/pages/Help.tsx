import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  FileText,
  FlaskConical,
  FolderKanban,
  Lightbulb,
  Map,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const FEATURES = [
  {
    title: "Dashboard",
    description: "Your signed-in dashboard brings together your uploads, workspaces, saved searches, simulations, innovation submissions, and account settings.",
    path: "/dashboard",
    icon: BriefcaseBusiness,
  },
  {
    title: "Repository",
    description: "Browse and filter land-governance documents by topic, location, language, date, and access tier. Signed-in users can contribute documents where permitted.",
    path: "/repository",
    icon: BookOpen,
  },
  {
    title: "Document Detail",
    description: "Open a repository result to review its description, summary, metadata, and available document access options.",
    path: "/repository",
    icon: FileText,
  },
  {
    title: "AI Search",
    description: "Search repository material with a question in plain language. AI responses are grounded in matching repository records and include supporting documents.",
    path: "/search",
    icon: Search,
  },
  {
    title: "GIS Explorer",
    description: "Explore the geospatial features and map information available in the platform.",
    path: "/gis-explorer",
    icon: Map,
  },
  {
    title: "Dashboards",
    description: "Review available land-governance indicators and visual summaries. Check each source and its context before relying on a value.",
    path: "/dashboards",
    icon: BarChart3,
  },
  {
    title: "Policy Simulation Lab",
    description: "Adjust scenario inputs, run a policy simulation, and review the resulting assumptions, outcomes, methodology, and limitations.",
    path: "/simulation-lab",
    icon: FlaskConical,
  },
  {
    title: "Workspaces",
    description: "Create or join a workspace to organize a research effort with members, repository documents, notes, tasks, and activity.",
    path: "/workspaces",
    icon: FolderKanban,
  },
  {
    title: "Innovation Portal",
    description: "Browse land-governance innovation submissions, use the available filters, and submit or support an idea when signed in.",
    path: "/innovation-portal",
    icon: Lightbulb,
  },
  {
    title: "API Portal",
    description: "Review the API information and available integration resources presented in the developer portal.",
    path: "/api",
    icon: Code2,
  },
];

export default function Help() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      <main className="flex-1">
        <header className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-[#1F2933]">Help Center</h1>
            <p className="mt-2 max-w-3xl text-[#5A6472]">
              Practical introductions to the research and policy tools available on the Land Governance Research Platform.
            </p>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            {FEATURES.map(({ title, description, path, icon: Icon }) => (
              <section key={title} className="flex gap-4 rounded-lg border border-[#E1E5EA] bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0B3D91]/10">
                  <Icon className="h-5 w-5 text-[#0B3D91]" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#1F2933]">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-[#5A6472]">{description}</p>
                  <Link to={path} className="mt-3 inline-block text-sm font-medium text-[#0B3D91] hover:text-[#062A63]">
                    Open {title} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}