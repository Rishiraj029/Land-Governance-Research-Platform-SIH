import { Link } from "react-router-dom";
import { Search, Map, GitBranch, Users, BarChart3, Lightbulb, FileText, ArrowRight, Calendar, Building2 } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const STATS = [
  { value: "12,400+", label: "Research Documents", path: "/repository" },
  { value: "28", label: "States Covered", path: "/gis-explorer" },
  { value: "150+", label: "Active Workspaces", path: "/workspaces" },
  { value: "40+", label: "Live Policy Dashboards", path: "/dashboards" },
  { value: "1,200+", label: "Registered Institutions", path: "/repository" },
];

const FEATURES = [
  {
    icon: FileText,
    title: "Discover Research",
    description: "Access India's largest collection of land governance research and policy documents",
    path: "/repository",
  },
  {
    icon: Map,
    title: "Visualize Land Data",
    description: "Interactive GIS maps showing land-use patterns, climate risks, and policy impacts",
    path: "/gis-explorer",
  },
  {
    icon: GitBranch,
    title: "Simulate Policy Outcomes",
    description: "Test reform scenarios before implementation with advanced simulation tools",
    path: "/simulation-lab",
  },
  {
    icon: Users,
    title: "Collaborate on Projects",
    description: "Work together in shared spaces with researchers, policymakers, and institutions",
    path: "/workspaces",
  },
  {
    icon: BarChart3,
    title: "Track Programme Performance",
    description: "Real-time dashboards monitoring land governance KPIs and policy effectiveness",
    path: "/dashboards",
  },
  {
    icon: Lightbulb,
    title: "Join Innovation Challenges",
    description: "Participate in hackathons, grants, and pilot projects to drive land governance innovation",
    path: "/innovation-portal",
  },
];

const FEATURED_DOCS = [
  {
    title: "Impact of Land Ceiling Reforms on Urban Housing Supply",
    institution: "National Institute of Public Finance and Policy",
    tags: ["Urbanization", "Housing Policy"],
    thumbnail: "🏙️",
  },
  {
    title: "Climate Vulnerability Assessment of Coastal Land Systems",
    institution: "ISRO & Ministry of Environment",
    tags: ["Climate Resilience", "Coastal Zones"],
    thumbnail: "🌊",
  },
  {
    title: "Digital Land Records: A Comparative Study of State Implementations",
    institution: "NITI Aayog",
    tags: ["Digital Transformation", "Land Records"],
    thumbnail: "📋",
  },
  {
    title: "Land Dispute Resolution Mechanisms: Evidence from District Courts",
    institution: "National Law University, Delhi",
    tags: ["Land Disputes", "Legal Framework"],
    thumbnail: "⚖️",
  },
];

const PARTNERS = [
  { name: "Ministry of Rural Development", logo: "🏛️" },
  { name: "ISRO / Bhuvan", logo: "🛰️" },
  { name: "NITI Aayog", logo: "🏢" },
  { name: "NIC", logo: "💻" },
  { name: "State Land Departments", logo: "🗺️" },
  { name: "Academic Institutions", logo: "🎓" },
];

/** Public entry point of the platform. */
export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0B3D91] via-[#062A63] to-[#0B3D91]">
          {/* Satellite imagery background effect */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)
              `
            }} />
          </div>
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-4">
                Government of India · Research & Policy Innovation
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-6">
                India's National Platform for Land Governance Research & Policy Innovation
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                A secure national platform that connects citizens, researchers, and policymakers with reliable land data, collaborative research tools, and evidence-based policy insights for better land governance.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <Link
                  to="/repository"
                  className="w-full sm:w-auto rounded-full bg-[#FF9933] px-8 py-3 text-center text-base font-semibold text-white hover:bg-[#E88A2E] transition-colors"
                >
                  Explore the Repository
                </Link>
                <Link
                  to="/dashboards"
                  className="w-full sm:w-auto rounded-full border-2 border-white px-8 py-3 text-center text-base font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  See Live Dashboards
                </Link>
              </div>

              {/* Embedded search bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" />
                <input
                  type="text"
                  placeholder="Search research, policy, datasets…"
                  className="w-full rounded-full border-0 bg-white py-3 pl-12 pr-4 text-base text-[#1F2933] placeholder:text-[#5A6472] focus:ring-2 focus:ring-[#FF9933] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Key Stats Strip */}
        <section className="bg-white border-b border-[#E1E5EA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {STATS.map((stat) => (
                <Link
                  key={stat.label}
                  to={stat.path}
                  className="group text-center p-6 rounded-lg border border-[#E1E5EA] hover:border-[#0B3D91] hover:shadow-md transition-all cursor-pointer"
                >
                  <p className="text-3xl font-bold text-[#0B3D91] group-hover:text-[#062A63]">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[#5A6472] mt-2">{stat.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* What You Can Do Here */}
        <section className="py-16 bg-[#F5F7FA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1F2933] mb-4">What You Can Do Here</h2>
              <p className="text-lg text-[#5A6472] max-w-2xl mx-auto">
                Access powerful tools and resources to advance land governance research and policy innovation
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature) => (
                <Link
                  key={feature.title}
                  to={feature.path}
                  className="group bg-white p-6 rounded-lg border border-[#E1E5EA] hover:border-[#0B3D91] hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <feature.icon className="h-8 w-8 text-[#0B3D91] group-hover:text-[#FF9933] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#1F2933] mb-2 group-hover:text-[#0B3D91]">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#5A6472] mb-3">
                        {feature.description}
                      </p>
                      <span className="text-sm font-medium text-[#0B3D91] group-hover:text-[#FF9933] flex items-center gap-1">
                        Learn more <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Research & Policy */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#1F2933] mb-2">Featured Research & Policy</h2>
                <p className="text-[#5A6472]">Recently added and most-viewed documents</p>
              </div>
              <Link
                to="/repository"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#0B3D91] hover:text-[#FF9933]"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_DOCS.map((doc) => (
                <Link
                  key={doc.title}
                  to="/repository"
                  className="group bg-[#F5F7FA] rounded-lg border border-[#E1E5EA] hover:border-[#0B3D91] hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="h-32 bg-gradient-to-br from-[#0B3D91]/10 to-[#FF9933]/10 flex items-center justify-center text-4xl">
                    {doc.thumbnail}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1F2933] text-sm mb-2 line-clamp-2 group-hover:text-[#0B3D91]">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-[#5A6472] mb-3">{doc.institution}</p>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-white border border-[#E1E5EA] rounded text-[#5A6472]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-6 sm:hidden">
              <Link
                to="/repository"
                className="flex items-center justify-center gap-2 text-sm font-medium text-[#0B3D91] hover:text-[#FF9933]"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Live Dashboard Preview */}
        <section className="py-16 bg-[#F5F7FA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1F2933] mb-4">Live Dashboard Preview</h2>
              <p className="text-lg text-[#5A6472] max-w-2xl mx-auto">
                Real-time insights into land-use trends, policy performance, and governance metrics
              </p>
            </div>
            
            <div className="relative bg-white rounded-lg border border-[#E1E5EA] overflow-hidden shadow-lg">
              <div className="aspect-video bg-gradient-to-br from-[#0B3D91]/5 to-[#FF9933]/5 flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-16 w-16 text-[#0B3D91]/30 mx-auto mb-4" />
                  <p className="text-[#5A6472]">National Land-Use Trend Dashboard</p>
                  <p className="text-sm text-[#5A6472]/70">Interactive map visualization</p>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <Link
                  to="/dashboards"
                  className="bg-white text-[#0B3D91] px-6 py-3 rounded-lg font-semibold hover:bg-[#F5F7FA] transition-colors"
                >
                  View Full Interactive Dashboard →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Innovation Portal Teaser */}
        <section className="py-16 bg-gradient-to-r from-[#0B3D91] to-[#062A63]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-6 w-6 text-[#FF9933]" />
                  <span className="text-sm font-semibold text-[#FF9933] uppercase tracking-wider">
                    Open Challenge
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  AI-Powered Land Dispute Prediction Challenge
                </h2>
                <p className="text-white/90 mb-6 max-w-2xl">
                  Develop machine learning models to predict land dispute hotspots using historical records, satellite imagery, and socio-economic data. 
                  Win funding to implement your solution at scale.
                </p>
                <div className="flex items-center gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>Deadline: December 31, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span>Prize Pool: ₹25 Lakhs</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Link
                  to="/innovation-portal"
                  className="inline-flex items-center gap-2 bg-[#FF9933] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#E88A2E] transition-colors"
                >
                  Apply Now <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Partner/Contributor Logos */}
        <section className="py-12 bg-white border-t border-[#E1E5EA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-[#5A6472] mb-8">
              Contributing Partners & Institutions
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {PARTNERS.map((partner) => (
                <div
                  key={partner.name}
                  className="flex items-center gap-2 text-3xl grayscale hover:grayscale-0 transition-all cursor-default"
                  title={partner.name}
                >
                  <span>{partner.logo}</span>
                  <span className="text-sm text-[#5A6472] hidden md:inline">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter (Optional) */}
        <section className="py-12 bg-[#F5F7FA] border-t border-[#E1E5EA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-semibold text-[#1F2933] mb-2">
                Stay Updated with Platform News
              </h3>
              <p className="text-[#5A6472] mb-6">
                Get the latest research publications, policy updates, and innovation opportunities delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                />
                <button className="rounded-md bg-[#0B3D91] px-6 py-2 text-sm font-semibold text-white hover:bg-[#062A63] transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
