import { ArrowRight, BookOpen, FlaskConical, Map, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const CAPABILITIES = [
  { title: "Research repository", path: "/repository", icon: BookOpen },
  { title: "AI-assisted discovery", path: "/search", icon: Search },
  { title: "Geospatial exploration", path: "/gis-explorer", icon: Map },
  { title: "Policy scenarios", path: "/simulation-lab", icon: FlaskConical },
  { title: "Shared workspaces", path: "/workspaces", icon: Users },
];

export default function About() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      <main className="flex-1">
        <header className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold text-[#0B3D91]">About &amp; Vision</p>
            <h1 className="mt-1 max-w-4xl text-3xl font-bold text-[#1F2933]">
              National Digital Platform for Research and Policy Innovation in Land Governance
            </h1>
            <p className="mt-3 max-w-3xl text-[#5A6472]">
              A research and policy innovation platform concept focused on making land-governance evidence easier to discover, examine, and use.
            </p>
          </div>
        </header>
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1F2933]">Vision</h2>
            <p className="mt-3 max-w-4xl leading-7 text-[#5A6472]">
              Build a secure, AI-enabled digital ecosystem that brings land-related research, data, and institutional knowledge into closer reach, supporting evidence-informed research and policy discussion and more transparent land-governance reform.
            </p>
          </section>

          <section className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1F2933]">The problem</h2>
            <p className="mt-3 max-w-4xl leading-7 text-[#5A6472]">
              Research and useful datasets are spread across organizations and systems. This makes it difficult to find comparable studies, connect evidence to policy questions, collaborate across teams, and understand how land-related conditions vary across places. The platform is intended to address this discovery and research gap; it is not an official Government of India service or a replacement for land administration systems.
            </p>
          </section>

          <section className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1F2933]">Objectives</h2>
            <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm leading-6 text-[#5A6472] md:grid-cols-2">
              <li>Bring land-governance research and documents into a searchable collection.</li>
              <li>Improve discovery of relevant evidence and related research.</li>
              <li>Support spatial analysis and exploration of available indicators.</li>
              <li>Enable scenario-based policy research before implementation.</li>
              <li>Make collaboration across research teams easier to organize.</li>
              <li>Provide a place to surface innovation submissions and ideas.</li>
            </ul>
          </section>

          <section className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1F2933]">Who it is for</h2>
            <p className="mt-3 max-w-4xl leading-7 text-[#5A6472]">
              The intended users include researchers and academics, policy analysts and policymakers, public-sector teams, academic institutions, GIS and technology practitioners, and people interested in land-governance research. Available features and records can depend on sign-in and access permissions.
            </p>
          </section>

          <section className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1F2933]">Research and policy innovation</h2>
            <p className="mt-3 max-w-4xl leading-7 text-[#5A6472]">
              The platform brings together tools for finding research, reviewing documents, exploring maps and dashboards, examining modeled scenarios, collaborating in workspaces, and sharing innovation ideas. These capabilities are intended to support inquiry and discussion; they do not replace source verification or formal policy processes.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map(({ title, path, icon: Icon }) => (
                <Link key={title} to={path} className="flex items-center justify-between gap-3 rounded-md border border-[#E1E5EA] p-4 text-sm font-medium text-[#1F2933] hover:border-[#0B3D91] hover:bg-[#F5F7FA]">
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[#0B3D91]" aria-hidden="true" />
                    {title}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#5A6472]" aria-hidden="true" />
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm text-[#5A6472]">
              Other available areas include Dashboards, the Innovation Portal, and the API Portal.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}