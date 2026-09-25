import {
  BookOpen,
  Target,
  Users,
  Database,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  ArrowRight,
  FlaskConical,
  Lightbulb
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-[#1F2933] mb-2">About & Vision</h1>
            <p className="text-[#5A6472] max-w-2xl">
              Learn about the National Digital Platform for Research and Policy Innovation in Land Governance
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Platform Overview */}
          <div className="mb-12">
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-[#0B3D91]" />
                <h2 className="text-2xl font-bold text-[#1F2933]">Platform Overview</h2>
              </div>
              
              <div className="prose prose-lg max-w-none text-[#5A6472] space-y-4">
                <p>
                  The National Digital Platform for Research and Policy Innovation in Land Governance is a comprehensive initiative to transform how India approaches land-related research, policy-making, and governance. This platform serves as a national ecosystem that converts India's land-related data, research, and institutional knowledge into actionable evidence for evidence-based policymaking.
                </p>
                <p>
                  Land is India's most contested and strategic resource, sitting at the intersection of economic growth, food security, urban expansion, environmental sustainability, and social equity. While significant investments have been made in land administration systems over the past two decades, what has been missing is an equally strong research and policy innovation layer.
                </p>
                <p>
                  This platform addresses that gap by providing researchers, policymakers, government departments, academic institutions, and the public with a unified environment to discover research, analyze data, simulate policy outcomes, collaborate on projects, and drive innovation in land governance.
                </p>
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="mb-12">
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-[#FF9933]" />
                <h2 className="text-2xl font-bold text-[#1F2933]">The Challenge</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#0B3D91]/10 rounded-full flex items-center justify-center mt-1">
                      <span className="text-[#0B3D91] text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933] mb-1">Fragmented Research</h3>
                      <p className="text-sm text-[#5A6472]">Land governance research is scattered across universities, think tanks, and government bodies with no common repository.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#0B3D91]/10 rounded-full flex items-center justify-center mt-1">
                      <span className="text-[#0B3D91] text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933] mb-1">Siloed Data</h3>
                      <p className="text-sm text-[#5A6472]">Valuable datasets remain in disconnected departmental systems, rarely linked to research use cases.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#0B3D91]/10 rounded-full flex items-center justify-center mt-1">
                      <span className="text-[#0B3D91] text-xs font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933] mb-1">Risky Policy Implementation</h3>
                      <p className="text-sm text-[#5A6472]">Reforms are often tested by rolling them out live rather than simulated first, which is costly and politically risky.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#0B3D91]/10 rounded-full flex items-center justify-center mt-1">
                      <span className="text-[#0B3D91] text-xs font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933] mb-1">Missing Discovery Layer</h3>
                      <p className="text-sm text-[#5A6472]">Policymakers cannot easily find whether similar reforms or studies have been done elsewhere.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#0B3D91]/10 rounded-full flex items-center justify-center mt-1">
                      <span className="text-[#0B3D91] text-xs font-bold">5</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933] mb-1">Limited Innovation Channel</h3>
                      <p className="text-sm text-[#5A6472]">Students, startups, and researchers lack a dedicated national channel for land governance innovation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#0B3D91]/10 rounded-full flex items-center justify-center mt-1">
                      <span className="text-[#0B3D91] text-xs font-bold">6</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1F2933] mb-1">Evidence Gaps</h3>
                      <p className="text-sm text-[#5A6472]">Decision-makers lack real-time, visual, evidence-backed dashboards for program performance.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-[#0B3D91] to-[#062A63] rounded-lg p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="h-6 w-6 text-[#FF9933]" />
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              
              <p className="text-lg mb-6 text-white/90">
                To build a secure, AI-enabled, national digital ecosystem that converts India's land-related data, research, and institutional knowledge into a continuously usable resource for evidence-based policymaking — enabling faster, safer, and more transparent land governance reforms.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">Research Excellence</h3>
                  <p className="text-xs text-white/80">Enable cutting-edge research with access to comprehensive data and collaboration tools</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">Policy Innovation</h3>
                  <p className="text-xs text-white/80">Test reforms safely through simulation before real-world implementation</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">Data-Driven Governance</h3>
                  <p className="text-xs text-white/80">Transform decision-making with real-time dashboards and spatial analytics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Objectives */}
          <div className="mb-12">
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-[#138808]" />
                <h2 className="text-2xl font-bold text-[#1F2933]">Key Objectives</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5 text-[#0B3D91]" />
                    <h3 className="text-sm font-medium text-[#1F2933]">Centralize Knowledge</h3>
                  </div>
                  <p className="text-xs text-[#5A6472]">One searchable home for research, policy documents, and datasets</p>
                </div>
                <div className="border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-[#0B3D91]" />
                    <h3 className="text-sm font-medium text-[#1F2933]">AI-Powered Discovery</h3>
                  </div>
                  <p className="text-xs text-[#5A6472]">Find relevant resources in seconds using semantic search</p>
                </div>
                <div className="border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="h-5 w-5 text-[#0B3D91]" />
                    <h3 className="text-sm font-medium text-[#1F2933]">Safe Experimentation</h3>
                  </div>
                  <p className="text-xs text-[#5A6472]">Simulate policy outcomes before implementation</p>
                </div>
                <div className="border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-[#0B3D91]" />
                    <h3 className="text-sm font-medium text-[#1F2933]">Spatial Visualization</h3>
                  </div>
                  <p className="text-xs text-[#5A6472]">View every metric on interactive maps, not just spreadsheets</p>
                </div>
                <div className="border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-[#0B3D91]" />
                    <h3 className="text-sm font-medium text-[#1F2933]">Enable Collaboration</h3>
                  </div>
                  <p className="text-xs text-[#5A6472]">Shared workspaces for cross-institutional teams</p>
                </div>
                <div className="border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-[#0B3D91]" />
                    <h3 className="text-sm font-medium text-[#1F2933]">Fuel Innovation</h3>
                  </div>
                  <p className="text-xs text-[#5A6472]">Hackathons, grants, and pilots for grassroots innovators</p>
                </div>
                <div className="border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-[#0B3D91]" />
                    <h3 className="text-sm font-medium text-[#1F2933]">Maintain Trust</h3>
                  </div>
                  <p className="text-xs text-[#5A6472]">Role-based access, audit trails, and data security</p>
                </div>
                <div className="border border-[#E1E5EA] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-[#0B3D91]" />
                    <h3 className="text-sm font-medium text-[#1F2933]">Interoperate, Not Duplicate</h3>
                  </div>
                  <p className="text-xs text-[#5A6472]">Connect to existing systems via APIs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stakeholders */}
          <div className="mb-12">
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-6 w-6 text-[#FF9933]" />
                <h2 className="text-2xl font-bold text-[#1F2933]">Key Stakeholders</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#1F2933] flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#0B3D91] rounded-full" />
                    Researchers / Academics
                  </h3>
                  <p className="text-sm text-[#5A6472]">Access to data, publishing outlet, collaboration tools</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#1F2933] flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#138808] rounded-full" />
                    Policymakers
                  </h3>
                  <p className="text-sm text-[#5A6472]">Evidence, simulations, dashboards for evaluation</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#1F2933] flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#FF9933] rounded-full" />
                    Government Departments
                  </h3>
                  <p className="text-sm text-[#5A6472]">Data sharing, program monitoring, policy evaluation</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#1F2933] flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Academic Institutions
                  </h3>
                  <p className="text-sm text-[#5A6472]">Repository access, grants, student project platform</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#1F2933] flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#E8A33D] rounded-full" />
                    Industry / GIS Experts
                  </h3>
                  <p className="text-sm text-[#5A6472]">API access, innovation challenges, tool development</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#1F2933] flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    General Public
                  </h3>
                  <p className="text-sm text-[#5A6472]">Transparency, awareness, limited search access</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Modules */}
          <div className="mb-12">
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-6 w-6 text-[#0B3D91]" />
                <h2 className="text-2xl font-bold text-[#1F2933]">Platform Modules</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/repository" className="border border-[#E1E5EA] rounded-lg p-4 hover:border-[#0B3D91] hover:bg-[#F5F7FA] transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#1F2933]">Knowledge Repository</h3>
                    <ArrowRight className="h-4 w-4 text-[#5A6472] group-hover:text-[#0B3D91]" />
                  </div>
                  <p className="text-xs text-[#5A6472]">Centralized research papers, policy documents, and datasets</p>
                </Link>
                <Link to="/search" className="border border-[#E1E5EA] rounded-lg p-4 hover:border-[#0B3D91] hover:bg-[#F5F7FA] transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#1F2933]">AI Search</h3>
                    <ArrowRight className="h-4 w-4 text-[#5A6472] group-hover:text-[#0B3D91]" />
                  </div>
                  <p className="text-xs text-[#5A6472]">Semantic search and AI-powered recommendations</p>
                </Link>
                <Link to="/gis-explorer" className="border border-[#E1E5EA] rounded-lg p-4 hover:border-[#0B3D91] hover:bg-[#F5F7FA] transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#1F2933]">GIS Explorer</h3>
                    <ArrowRight className="h-4 w-4 text-[#5A6472] group-hover:text-[#0B3D91]" />
                  </div>
                  <p className="text-xs text-[#5A6472]">Interactive maps and geospatial analysis tools</p>
                </Link>
                <Link to="/dashboards" className="border border-[#E1E5EA] rounded-lg p-4 hover:border-[#0B3D91] hover:bg-[#F5F7FA] transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#1F2933]">Dashboards</h3>
                    <ArrowRight className="h-4 w-4 text-[#5A6472] group-hover:text-[#0B3D91]" />
                  </div>
                  <p className="text-xs text-[#5A6472]">Policy performance and trend indicators</p>
                </Link>
                <Link to="/simulation-lab" className="border border-[#E1E5EA] rounded-lg p-4 hover:border-[#0B3D91] hover:bg-[#F5F7FA] transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#1F2933]">Simulation Lab</h3>
                    <ArrowRight className="h-4 w-4 text-[#5A6472] group-hover:text-[#0B3D91]" />
                  </div>
                  <p className="text-xs text-[#5A6472]">Policy outcome modeling and scenario analysis</p>
                </Link>
                <Link to="/workspaces" className="border border-[#E1E5EA] rounded-lg p-4 hover:border-[#0B3D91] hover:bg-[#F5F7FA] transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#1F2933]">Collaborative Workspaces</h3>
                    <ArrowRight className="h-4 w-4 text-[#5A6472] group-hover:text-[#0B3D91]" />
                  </div>
                  <p className="text-xs text-[#5A6472]">Shared project spaces for research teams</p>
                </Link>
                <Link to="/innovation-portal" className="border border-[#E1E5EA] rounded-lg p-4 hover:border-[#0B3D91] hover:bg-[#F5F7FA] transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#1F2933]">Innovation Portal</h3>
                    <ArrowRight className="h-4 w-4 text-[#5A6472] group-hover:text-[#0B3D91]" />
                  </div>
                  <p className="text-xs text-[#5A6472]">Hackathons, grants, and pilot projects</p>
                </Link>
                <Link to="/api" className="border border-[#E1E5EA] rounded-lg p-4 hover:border-[#0B3D91] hover:bg-[#F5F7FA] transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#1F2933]">Developer Portal</h3>
                    <ArrowRight className="h-4 w-4 text-[#5A6472] group-hover:text-[#0B3D91]" />
                  </div>
                  <p className="text-xs text-[#5A6472]">API documentation and integration resources</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Technology Overview */}
          <div className="mb-12">
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="h-6 w-6 text-[#0B3D91]" />
                <h2 className="text-2xl font-bold text-[#1F2933]">Technology & Data Responsibility</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2933] mb-3">Technology Stack</h3>
                  <p className="text-sm text-[#5A6472] mb-4">
                    The platform is built on modern, scalable technologies including React for the frontend, PostgreSQL with PostGIS for spatial data, and FastAPI for backend services. AI capabilities are powered by open-source models to ensure data sovereignty and control.
                  </p>
                  <ul className="text-sm text-[#5A6472] space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#0B3D91] rounded-full" />
                      React + TypeScript for responsive frontend
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#0B3D91] rounded-full" />
                      PostgreSQL + PostGIS for relational and spatial data
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#0B3D91] rounded-full" />
                      Open-source AI models for semantic search and analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#0B3D91] rounded-full" />
                      OGC-compliant GIS services for geospatial interoperability
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2933] mb-3">Data Responsibility</h3>
                  <p className="text-sm text-[#5A6472] mb-4">
                    The platform is designed with data sovereignty, security, and privacy as foundational principles. All data handling complies with the Digital Personal Data Protection (DPDP) Act, 2023 and follows national data sharing policies.
                  </p>
                  <ul className="text-sm text-[#5A6472] space-y-2">
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#138808]" />
                      Role-based access control and audit trails
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#138808]" />
                      Data classification tiers (Public, Restricted, Government-Only)
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#138808]" />
                      Hosting on government-empanelled cloud or on-premises
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#138808]" />
                      Full provenance tracking for all data and analyses
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Future Roadmap */}
          <div className="mb-12">
            <div className="bg-white border border-[#E1E5EA] rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-6 w-6 text-[#FF9933]" />
                <h2 className="text-2xl font-bold text-[#1F2933]">Future Roadmap</h2>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-[#138808] pl-4">
                  <h3 className="text-sm font-semibold text-[#1F2933] mb-1">Phase 1: Foundation</h3>
                  <p className="text-sm text-[#5A6472]">Core repository, search, GIS explorer, and basic dashboards with initial content and user onboarding.</p>
                </div>
                <div className="border-l-4 border-[#0B3D91] pl-4">
                  <h3 className="text-sm font-semibold text-[#1F2933] mb-1">Phase 2: Collaboration & Innovation</h3>
                  <p className="text-sm text-[#5A6472]">Collaborative workspaces, innovation portal with hackathons, and enhanced AI-powered research tools.</p>
                </div>
                <div className="border-l-4 border-[#FF9933] pl-4">
                  <h3 className="text-sm font-semibold text-[#1F2933] mb-1">Phase 3: Advanced Analytics</h3>
                  <p className="text-sm text-[#5A6472]">Policy simulation lab, advanced dashboards, predictive analytics, and expanded API ecosystem.</p>
                </div>
                <div className="border-l-4 border-gray-300 pl-4">
                  <h3 className="text-sm font-semibold text-[#1F2933] mb-1">Phase 4: Ecosystem Integration</h3>
                  <p className="text-sm text-[#5A6472]">Deep integration with state land portals, real-time data pipelines, and expanded multi-language support.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-lg p-6">
            <p className="text-sm text-[#FF9933]">
              <strong>Important Notice:</strong> This platform is a research and policy innovation tool. It is not a substitute for official government land record systems, legal documentation, or authoritative government statistics. For official land records, please use your state's designated land portal. For legal matters, consult appropriate legal authorities.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}