import { useState } from "react";
import {
  Search,
  Book,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  Map,
  LayoutGrid,
  FlaskConical,
  Users,
  Lightbulb,
  Code
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Toast from "../components/ui/Toast";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    category: "Getting Started",
    question: "How do I create an account?",
    answer: "Click the 'Sign Up' button on the landing page and select your role (Individual Researcher, Government Official, Institution, or Public User). Fill in the required information and submit. For Government Official and Institution roles, additional verification may be required before full access is granted."
  },
  {
    id: "faq-2",
    category: "Getting Started",
    question: "What are the different user roles?",
    answer: "The platform supports several roles: Individual Researcher (full access to research tools), Government Official (enhanced access to policy dashboards and government data), Institution Admin (manage institutional members and submissions), and Public User (limited access to public content and dashboards)."
  },
  {
    id: "faq-3",
    category: "Repository",
    question: "How do I search the repository?",
    answer: "Use the search bar on the Repository page to search by title, author, institution, or keywords. You can also use the filter panel on the left to narrow results by content type, research theme, geography, date range, and access tier. The search supports both exact keyword matching and semantic AI-powered search."
  },
  {
    id: "faq-4",
    category: "Repository",
    question: "How do I contribute documents to the repository?",
    answer: "Click the '+ Contribute' button on the Repository page (visible when logged in). Select the content type, upload your file, and provide metadata such as title, description, themes, and geography. Your submission will go through a review process before becoming publicly searchable."
  },
  {
    id: "faq-5",
    category: "GIS Explorer",
    question: "How does the GIS Explorer work?",
    answer: "The GIS Explorer provides interactive maps with multiple layers including satellite imagery, administrative boundaries, land-use classification, climate risk zones, and infrastructure projects. You can toggle layers, use the time slider to view changes over time, draw areas of interest, and export map views. Note that some layers may require additional permissions."
  },
  {
    id: "faq-6",
    category: "GIS Explorer",
    question: "Can I export GIS data?",
    answer: "Yes, you can export map views as images or PDFs with legends and attribution. For researchers with appropriate permissions, you may also access downloadable GIS datasets in standard formats (GeoTIFF, Shapefile) from the Repository."
  },
  {
    id: "faq-7",
    category: "Dashboards",
    question: "Are dashboard values official government statistics?",
    answer: "Dashboard values are based on publicly available government data, research studies, and official statistics where possible. However, this is a research platform and dashboard values should be used for analytical and policy research purposes. For official government statistics, please refer to the original source agencies."
  },
  {
    id: "faq-8",
    category: "Dashboards",
    question: "How often are dashboards updated?",
    answer: "Dashboard update frequency varies by data source. Some indicators update in near real-time, while others may have monthly, quarterly, or annual updates depending on the underlying data source. Each dashboard indicates the last update timestamp."
  },
  {
    id: "faq-9",
    category: "Simulation Lab",
    question: "How does the Policy Simulation Lab work?",
    answer: "The Policy Simulation Lab allows you to model the likely outcomes of proposed policy reforms before implementation. You can define scenarios, adjust parameters, and compare multiple options. The system uses statistical models, system dynamics, or agent-based simulations to provide outcome ranges with confidence bands. Results are for research and planning purposes only."
  },
  {
    id: "faq-10",
    category: "Simulation Lab",
    question: "Can simulation results be used for actual policy decisions?",
    answer: "Simulation results are intended to inform policy research and planning discussions. They should be considered as one input among many in the decision-making process. Actual policy decisions should consider additional factors, stakeholder input, and real-world constraints beyond what can be modeled."
  },
  {
    id: "faq-11",
    category: "Workspaces",
    question: "How do I create a workspace?",
    answer: "Navigate to the Collaborative Workspaces page and click '+ Create Workspace'. Provide a name, description, research theme, access level, and objective. You can then invite members, add documents from the repository, create research notes, set up tasks, and track activity within your workspace."
  },
  {
    id: "faq-12",
    category: "Workspaces",
    question: "What are the different workspace permissions?",
    answer: "Workspace permissions include: Owner (full control), Editor (can edit all content), Contributor (can add content but not delete), and Viewer (read-only access). These permissions help manage collaboration while protecting workspace integrity."
  },
  {
    id: "faq-13",
    category: "Innovation Portal",
    question: "How do I submit an innovation?",
    answer: "Visit the Innovation Portal and click 'Submit Innovation'. Provide details about your innovation including title, description, category, problem addressed, proposed solution, location, organization, team, and contact information. Your submission will be reviewed by the evaluation committee."
  },
  {
    id: "faq-14",
    category: "Innovation Portal",
    question: "What happens after I submit an innovation?",
    answer: "After submission, your innovation enters a review process. It will be evaluated based on criteria such as innovation, impact, feasibility, and alignment with land governance challenges. You can track the status (Submitted, Under Review, Shortlisted, Selected, Not Selected) on the Innovation Portal."
  },
  {
    id: "faq-15",
    category: "Developer/API",
    question: "How can I access API documentation?",
    answer: "Visit the Developer Portal (/api) to explore available API endpoints, view documentation, and test API calls. The portal provides endpoints for repository access, GIS data, dashboard indicators, workspaces, and innovations. API keys and authentication information are available for registered developers."
  },
  {
    id: "faq-16",
    category: "Account & Access",
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page and enter your registered email address. You will receive a password reset link. Follow the instructions in the email to create a new password. If you don't receive the email within a few minutes, check your spam folder or contact support."
  }
];

const FAQ_CATEGORIES = ["Getting Started", "Repository", "GIS Explorer", "Dashboards", "Simulation Lab", "Workspaces", "Innovation Portal", "Developer/API", "Account & Access"];

const HELP_SECTIONS = [
  {
    icon: Book,
    title: "Getting Started",
    description: "Learn the basics of using the platform",
    link: "#getting-started"
  },
  {
    icon: FileText,
    title: "Repository",
    description: "Search and contribute research documents",
    link: "#repository"
  },
  {
    icon: Map,
    title: "GIS Explorer",
    description: "Interactive maps and geospatial analysis",
    link: "#gis-explorer"
  },
  {
    icon: LayoutGrid,
    title: "Dashboards",
    description: "Policy performance and trend indicators",
    link: "#dashboards"
  },
  {
    icon: FlaskConical,
    title: "Simulation Lab",
    description: "Policy outcome modeling and scenarios",
    link: "#simulation-lab"
  },
  {
    icon: Users,
    title: "Workspaces",
    description: "Collaborative research environments",
    link: "#workspaces"
  },
  {
    icon: Lightbulb,
    title: "Innovation Portal",
    description: "Submit and discover innovations",
    link: "#innovation-portal"
  },
  {
    icon: Code,
    title: "Developer/API",
    description: "API documentation and integration",
    link: "#developer-api"
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const filteredFaqs = FAQ_ITEMS.filter(faq => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage("Support request submitted successfully");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setShowContactForm(false);
    setContactFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[#1F2933]">Help Center</h1>
                </div>
                <p className="text-[#5A6472] max-w-2xl">
                  Find answers to common questions, learn how to use platform features, and get support when you need it.
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" />
              <input
                type="text"
                placeholder="Search for help articles, FAQs, and topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[#E1E5EA] bg-[#F5F7FA] py-3 pl-12 pr-4 text-base text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Help Sections */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-[#1F2933] mb-6">Browse by Topic</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {HELP_SECTIONS.map((section) => (
                <a
                  key={section.title}
                  href={section.link}
                  className="bg-white border border-[#E1E5EA] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-[#0B3D91]/10 rounded-lg flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-[#0B3D91]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#1F2933] mb-1">{section.title}</h3>
                    <p className="text-xs text-[#5A6472]">{section.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="flex gap-8">
            {/* Left Sidebar - FAQ Categories */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <h2 className="text-sm font-semibold text-[#1F2933]">FAQ Categories</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === "All" ? "bg-[#0B3D91] text-white" : "text-[#5A6472] hover:bg-[#F5F7FA]"
                    }`}
                  >
                    All Questions
                  </button>
                  {FAQ_CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category ? "bg-[#0B3D91] text-white" : "text-[#5A6472] hover:bg-[#F5F7FA]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-[#E1E5EA]">
                  <h3 className="text-xs font-medium text-[#5A6472] mb-3">Still need help?</h3>
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#0B3D91] text-white px-4 py-2 rounded-md text-sm hover:bg-[#062A63] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact Support
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* FAQ Section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#1F2933]">Frequently Asked Questions</h2>
                  <p className="text-sm text-[#5A6472]">
                    {filteredFaqs.length} question{filteredFaqs.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-[#E1E5EA] rounded-lg">
                    <HelpCircle className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#1F2933] mb-2">No FAQs found</h3>
                    <p className="text-[#5A6472]">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFaqs.map((faq) => (
                      <div key={faq.id} className="bg-white border border-[#E1E5EA] rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#F5F7FA] transition-colors"
                        >
                          <div className="flex-1">
                            <span className="inline-flex items-center rounded-full bg-[#0B3D91]/10 px-2 py-0.5 text-xs font-medium text-[#0B3D91] mr-3">
                              {faq.category}
                            </span>
                            <span className="text-sm font-medium text-[#1F2933]">{faq.question}</span>
                          </div>
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="h-5 w-5 text-[#5A6472]" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#5A6472]" />
                          )}
                        </button>
                        {expandedFaq === faq.id && (
                          <div className="px-6 pb-4 pt-2 border-t border-[#E1E5EA]">
                            <p className="text-sm text-[#5A6472] leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Getting Started Guide */}
              <div className="mb-12">
                <h2 className="text-lg font-semibold text-[#1F2933] mb-6">Getting Started Guide</h2>
                <div className="bg-white border border-[#E1E5EA] rounded-lg p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#0B3D91] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#1F2933] mb-1">Create Your Account</h3>
                        <p className="text-sm text-[#5A6472]">Sign up with your institutional email or government ID to get verified access to research tools and datasets.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#0B3D91] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#1F2933] mb-1">Explore the Repository</h3>
                        <p className="text-sm text-[#5A6472]">Search thousands of research papers, policy documents, and datasets using AI-powered search and smart filters.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#0B3D91] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#1F2933] mb-1">Use Interactive Tools</h3>
                        <p className="text-sm text-[#5A6472]">Visualize data with GIS Explorer, run policy simulations, and create dashboards for your research needs.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#0B3D91] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        4
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#1F2933] mb-1">Collaborate with Others</h3>
                        <p className="text-sm text-[#5A6472]">Join or create workspaces to collaborate with researchers, policymakers, and institutions on shared projects.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prototype Notice */}
              <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-[#FF9933]">
                  <strong>Prototype Notice:</strong> This is a frontend prototype help center. Some features described may not yet be fully implemented. Contact forms and support requests are for demonstration purposes only.
                </p>
              </div>

              {/* Mobile Contact Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0B3D91] text-white px-4 py-3 rounded-md text-sm hover:bg-[#062A63] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Contact Support Modal */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E1E5EA]">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-[#0B3D91]" />
                <h2 className="text-xl font-semibold text-[#1F2933]">Contact Support</h2>
              </div>
              <button
                onClick={() => setShowContactForm(false)}
                className="p-2 hover:bg-[#F5F7FA] rounded-full text-[#5A6472]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1F2933] mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={contactFormData.name}
                  onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                  className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1F2933] mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={contactFormData.email}
                  onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                  className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#1F2933] mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={contactFormData.subject}
                  onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
                  className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#1F2933] mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={contactFormData.message}
                  onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                  className="w-full rounded-md border border-[#E1E5EA] bg-white px-4 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                  placeholder="Describe your issue or question in detail..."
                />
              </div>

              <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-lg p-4">
                <p className="text-sm text-[#FF9933]">
                  <strong>Prototype Notice:</strong> This form is for demonstration purposes only. No actual support tickets will be created or emails sent.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E5EA]">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5A6472] hover:bg-[#F5F7FA] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0B3D91] hover:bg-[#062A63] rounded-md transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
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