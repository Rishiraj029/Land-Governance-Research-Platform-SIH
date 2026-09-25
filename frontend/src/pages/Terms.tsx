import {
  FileText,
  AlertTriangle,
  Shield,
  Users,
  Gavel,
  Clock
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function Terms() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Gavel className="h-8 w-8 text-[#0B3D91]" />
              <h1 className="text-3xl font-bold text-[#1F2933]">Terms of Use</h1>
            </div>
            <p className="text-[#5A6472]">
              Last updated: September 2024 | Effective date: September 2024
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#E1E5EA] p-8 shadow-sm space-y-8">
            {/* Notice */}
            <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-lg p-4">
              <p className="text-sm text-[#FF9933]">
                <strong>Prototype Notice:</strong> These terms describe the intended terms of use for the National Digital Platform for Research and Policy Innovation in Land Governance. This is currently a frontend prototype, and these terms are for demonstration purposes only.
              </p>
            </div>

            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0B3D91]" />
                Introduction
              </h2>
              <div className="prose prose-sm max-w-none text-[#5A6472] space-y-3">
                <p>
                  Welcome to the National Digital Platform for Research and Policy Innovation in Land Governance ("the Platform"). These Terms of Use govern your access to and use of the Platform, including all features, functionalities, and content provided.
                </p>
                <p>
                  By accessing or using the Platform, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please do not use the Platform.
                </p>
              </div>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Acceptance of Terms</h2>
              <p className="text-sm text-[#5A6472]">
                By creating an account and using the Platform, you represent that you are at least 18 years old and have the legal capacity to enter into these terms. You agree to comply with all applicable laws and regulations in your use of the Platform.
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0B3D91]" />
                User Accounts and Responsibilities
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-2">Account Registration</h3>
                  <p className="text-sm text-[#5A6472]">
                    To access certain features, you must create an account and provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-2">User Responsibilities</h3>
                  <p className="text-sm text-[#5A6472]">
                    As a user, you agree to: use the Platform only for lawful purposes; not attempt to gain unauthorized access; not interfere with the Platform's operation; not introduce viruses or malicious code; and not use the Platform to harass, abuse, or harm others.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-2">Role-Based Access</h3>
                  <p className="text-sm text-[#5A6472]">
                    Different user roles (Researcher, Government Official, Institution, Public User) have different access levels and permissions. You must only access features and data appropriate to your assigned role and authorization level.
                  </p>
                </div>
              </div>
            </section>

            {/* Content and Contributions */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Content and Contributions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-2">Platform Content</h3>
                  <p className="text-sm text-[#5A6472]">
                    The Platform contains research papers, policy documents, datasets, and other content contributed by users and institutions. This content is protected by copyright and other intellectual property laws. You may not use content beyond what is permitted by these terms or applicable law.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-2">User Contributions</h3>
                  <p className="text-sm text-[#5A6472]">
                    By submitting content to the Platform, you represent that you have the right to do so and that the content does not violate any third-party rights. You grant the Platform a non-exclusive, royalty-free license to use, display, and distribute your content for the Platform's purposes.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-2">Content Standards</h3>
                  <p className="text-sm text-[#5A6472]">
                    All content must be accurate, not misleading, and not defamatory. Content that is illegal, harmful, threatening, abusive, or otherwise objectionable may be removed without notice.
                  </p>
                </div>
              </div>
            </section>

            {/* Research and Policy Use */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Research and Policy Use</h2>
              <div className="space-y-3">
                <p className="text-sm text-[#5A6472]">
                  The Platform is designed for research, policy analysis, and innovation purposes. Important limitations apply:
                </p>
                <ul className="text-sm text-[#5A6472] space-y-2 list-disc list-inside">
                  <li>Platform data and analytics are for research and planning purposes only</li>
                  <li>This is not a substitute for official government land record systems</li>
                  <li>Simulation results are not guarantees of real-world outcomes</li>
                  <li>For legal matters, consult appropriate legal authorities</li>
                  <li>For official land records, use your state's designated land portal</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Intellectual Property</h2>
              <div className="space-y-3">
                <p className="text-sm text-[#5A6472]">
                  The Platform, including its design, features, and content, is owned by the Platform operators and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without prior written permission.
                </p>
                <p className="text-sm text-[#5A6472]">
                  User contributions remain the property of their respective owners, but users grant the Platform the rights necessary to operate and provide the Platform's services.
                </p>
              </div>
            </section>

            {/* Privacy and Data Protection */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#0B3D91]" />
                Privacy and Data Protection
              </h2>
              <p className="text-sm text-[#5A6472]">
                Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. By using the Platform, you consent to such collection and use in accordance with the Privacy Policy.
              </p>
            </section>

            {/* Disclaimers and Limitations */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#0B3D91]" />
                Disclaimers and Limitations
              </h2>
              <div className="space-y-3">
                <p className="text-sm text-[#5A6472]">
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p className="text-sm text-[#5A6472]">
                  We do not guarantee that the Platform will be uninterrupted, secure, or error-free. We are not responsible for any damage or loss resulting from your use of the Platform or inability to access the Platform.
                </p>
                <p className="text-sm text-[#5A6472]">
                  Research findings, policy simulations, and analytics provided through the Platform are for informational and research purposes only. They should not be used as the sole basis for official decisions without appropriate verification and consultation with relevant authorities.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Limitation of Liability</h2>
              <p className="text-sm text-[#5A6472]">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, profits, or business opportunities, arising from your use of the Platform.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Indemnification</h2>
              <p className="text-sm text-[#5A6472]">
                You agree to indemnify and hold harmless the Platform operators, their affiliates, and their respective officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Platform or violation of these terms.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#0B3D91]" />
                Termination
              </h2>
              <p className="text-sm text-[#5A6472]">
                We reserve the right to suspend or terminate your access to the Platform at any time, with or without cause, with or without notice. Upon termination, your right to use the Platform immediately ceases.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Governing Law and Dispute Resolution</h2>
              <p className="text-sm text-[#5A6472]">
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in [appropriate jurisdiction].
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Changes to Terms</h2>
              <p className="text-sm text-[#5A6472]">
                We may modify these terms at any time. We will notify users of significant changes by posting the updated terms on the Platform. Your continued use of the Platform after such changes constitutes acceptance of the updated terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Contact Information</h2>
              <p className="text-sm text-[#5A6472]">
                For questions about these Terms of Use, please contact us through the Platform's help center or the contact information provided in the footer.
              </p>
            </section>

            {/* Important Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#E8A33D] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-1">Important Disclaimer</h3>
                  <p className="text-sm text-[#5A6472]">
                    This Platform is a research and policy innovation tool, not an official government service. These Terms of Use describe intended practices for the fully operational platform. The current prototype implementation does not provide actual services, and these terms are for demonstration purposes only. This is not a substitute for official government systems, legal documentation, or authoritative government services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}