import {
  Shield,
  Lock,
  Eye,
  Database,
  FileText,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-[#0B3D91]" />
              <h1 className="text-3xl font-bold text-[#1F2933]">Privacy Policy</h1>
            </div>
            <p className="text-[#5A6472]">
              Last updated: September 2024 | Effective date: September 2024
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#E1E5EA] p-8 shadow-sm space-y-8">
            {/* Notice */}
            <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-lg p-4">
              <p className="text-sm text-[#FF9933]">
                <strong>Prototype Notice:</strong> This privacy policy describes the intended privacy practices for the National Digital Platform for Research and Policy Innovation in Land Governance. This is currently a frontend prototype, and no actual data collection or processing is occurring.
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
                  The National Digital Platform for Research and Policy Innovation in Land Governance ("the Platform") is committed to protecting the privacy and security of personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
                </p>
                <p>
                  This policy applies to all users of the Platform, including researchers, government officials, institutions, and public users. By accessing or using the Platform, you agree to this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-[#0B3D91]" />
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-2">Account Information</h3>
                  <p className="text-sm text-[#5A6472]">
                    When you create an account, we collect: name, email address, institutional affiliation, role (researcher, government official, institution, public user), and other information you provide during registration.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-2">Usage Information</h3>
                  <p className="text-sm text-[#5A6472]">
                    We automatically collect information about your use of the Platform, including: pages visited, features used, search queries, documents accessed, and IP address.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-2">Content Information</h3>
                  <p className="text-sm text-[#5A6472]">
                    When you contribute content, we collect: documents, datasets, research notes, innovation submissions, and associated metadata you provide.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#0B3D91]" />
                How We Use Your Information
              </h2>
              <div className="space-y-3">
                <p className="text-sm text-[#5A6472]">We use your information for the following purposes:</p>
                <ul className="text-sm text-[#5A6472] space-y-2 list-disc list-inside">
                  <li>Providing and improving the Platform's services</li>
                  <li>Authenticating users and managing access permissions</li>
                  <li>Facilitating research collaboration and workspaces</li>
                  <li>Processing and reviewing content submissions</li>
                  <li>Generating analytics and insights for platform improvement</li>
                  <li>Communicating with you about platform updates and relevant research</li>
                  <li>Complying with legal obligations and government requirements</li>
                </ul>
              </div>
            </section>

            {/* Data Sharing and Disclosure */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#0B3D91]" />
                Data Sharing and Disclosure
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-[#5A6472]">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-[#1F2933] mb-1">With Your Consent</h3>
                    <p className="text-sm text-[#5A6472]">
                      We may share information when you explicitly consent, such as when you choose to make your research profile or contributions publicly visible.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#1F2933] mb-1">For Platform Operations</h3>
                    <p className="text-sm text-[#5A6472]">
                      Within your workspace or collaboration team, relevant information is shared with team members to facilitate collaboration.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#1F2933] mb-1">Legal Requirements</h3>
                    <p className="text-sm text-[#5A6472]">
                      We may disclose information when required by law, court order, or government request, or to protect our rights, property, or safety.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#1F2933] mb-1">Service Providers</h3>
                    <p className="text-sm text-[#5A6472]">
                      We may share information with trusted third-party service providers who assist in operating the Platform, subject to strict confidentiality obligations.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#0B3D91]" />
                Data Security
              </h2>
              <div className="space-y-3">
                <p className="text-sm text-[#5A6472]">
                  We implement appropriate technical and organizational measures to protect your information, including:
                </p>
                <ul className="text-sm text-[#5A6472] space-y-2 list-disc list-inside">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Role-based access control and authentication systems</li>
                  <li>Regular security assessments and updates</li>
                  <li>Secure data hosting on government-empanelled or on-premises infrastructure</li>
                  <li>Audit logging and monitoring of system access</li>
                </ul>
                <p className="text-sm text-[#5A6472]">
                  However, no method of transmission over the internet is completely secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Data Retention</h2>
              <p className="text-sm text-[#5A6472]">
                We retain your information for as long as necessary to provide the Platform's services, comply with legal obligations, resolve disputes, and enforce our agreements. Specific retention periods vary based on the type of information and applicable legal requirements.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Your Rights</h2>
              <div className="space-y-3">
                <p className="text-sm text-[#5A6472]">
                  Subject to applicable law, you have the right to:
                </p>
                <ul className="text-sm text-[#5A6472] space-y-2 list-disc list-inside">
                  <li>Access and review your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt out of certain data collection and processing</li>
                  <li>Object to or restrict processing of your information</li>
                  <li>Withdraw consent where consent is the legal basis for processing</li>
                </ul>
                <p className="text-sm text-[#5A6472]">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </div>
            </section>

            {/* Compliance */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Legal Compliance</h2>
              <p className="text-sm text-[#5A6472]">
                This Privacy Policy is designed to comply with the Digital Personal Data Protection (DPDP) Act, 2023, and other applicable Indian data protection laws. We regularly review and update our practices to ensure continued compliance.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Children's Privacy</h2>
              <p className="text-sm text-[#5A6472]">
                The Platform is not intended for children under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child under 18, we will take steps to delete such information.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Changes to This Privacy Policy</h2>
              <p className="text-sm text-[#5A6472]">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on the Platform and updating the "Last updated" date. Your continued use of the Platform after such changes constitutes your acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-[#1F2933] mb-4">Contact Us</h2>
              <p className="text-sm text-[#5A6472]">
                If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us through the Platform's help center or the contact information provided in the footer.
              </p>
            </section>

            {/* Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#E8A33D] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-[#1F2933] mb-1">Important Disclaimer</h3>
                  <p className="text-sm text-[#5A6472]">
                    This Platform is a research and policy innovation tool. This Privacy Policy describes intended practices for the fully operational platform. The current prototype implementation does not collect, process, or store any personal data. All data used in the prototype is mock/local data for demonstration purposes only.
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