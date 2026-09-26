import { Database, LockKeyhole, Shield } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const PRIVACY_SECTIONS = [
  {
    title: "Accounts and profiles",
    text: "Authentication is provided through the configured Supabase service. The application profile includes a name, role, and institution, along with account-related timestamps. Sign-in credentials are handled by the authentication service, not displayed in the public profile fields.",
  },
  {
    title: "Repository documents",
    text: "Repository records can include document titles, descriptions, summaries, authorship and institution details, topic and location metadata, access tier, and file information. A document file may be stored in configured Supabase storage. Access depends on the record and the permissions in effect.",
  },
  {
    title: "Workspaces",
    text: "Workspace data can include workspace details, membership and roles, linked documents, research notes, tasks, and activity records. It is used to provide the collaboration features to workspace participants.",
  },
  {
    title: "Saved searches and simulations",
    text: "When you save a search, its query, name, and filters are stored with your account. Saved simulation runs include their scenario name, input parameters, results, and creation time.",
  },
  {
    title: "Innovation submissions",
    text: "An innovation submission can include its title, description, category, location, organization, submitter account reference, status, and timestamps. Support actions are also associated with the account that made them.",
  },
  {
    title: "AI search processing",
    text: "When AI Search is used, the server verifies selected repository records and sends the question plus limited document metadata, descriptions, and summaries to Google's Gemini service to generate a grounded response. The browser does not send repository file contents through this integration. Do not include sensitive personal or confidential information in a search question. The application does not specify Gemini's retention or use policies here.",
  },
  {
    title: "Access and security",
    text: "The application uses authenticated sessions, role-aware access, and database access policies where configured. Supabase provides the configured database and file storage services. Access protections depend on the active application and service configuration; no system can be represented as risk-free. Do not share your account credentials.",
  },
  {
    title: "Scope of this notice",
    text: "This page summarizes data handled by the current application features. It does not specify retention periods, a legal data controller, or a contact channel because those details are not established in the application. Refer to the applicable service settings and notices for information about processing by Supabase and Google.",
  },
];

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-7 w-7 text-[#0B3D91]" aria-hidden="true" />
              <h1 className="text-3xl font-bold text-[#1F2933]">Privacy Information</h1>
            </div>
            <p className="mt-2 text-[#5A6472]">
              A practical summary of information handled by the platform's current features.
            </p>
          </header>
          <div className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex gap-3 border-b border-[#E1E5EA] pb-6">
              <Database className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0B3D91]" aria-hidden="true" />
              <p className="text-sm leading-6 text-[#5A6472]">
                The application stores and processes information to provide account, research, collaboration, and analysis features. The details below describe the data types visible in the current implementation; they do not make promises about retention or third-party service practices.
              </p>
            </div>
            <div className="space-y-6">
              {PRIVACY_SECTIONS.map(({ title, text }) => (
                <section key={title}>
                  <h2 className="text-base font-semibold text-[#1F2933]">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5A6472]">{text}</p>
                </section>
              ))}
            </div>
            <div className="mt-8 flex gap-3 border-t border-[#E1E5EA] pt-6">
              <LockKeyhole className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0B3D91]" aria-hidden="true" />
              <p className="text-sm leading-6 text-[#5A6472]">
                Only submit content you are authorized to provide. Avoid using AI Search with sensitive or confidential material.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}