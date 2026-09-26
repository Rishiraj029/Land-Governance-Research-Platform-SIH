import { AlertTriangle, FileText } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const TERMS_SECTIONS = [
  {
    title: "Acceptable use and account responsibility",
    text: "Use the platform lawfully and for research, information, collaboration, or policy-innovation purposes. Keep your account credentials secure, provide accurate information where requested, and take responsibility for activity performed through your account. Do not access information or features without authorization.",
  },
  {
    title: "Uploaded and submitted content",
    text: "You are responsible for the documents, data, workspace material, and innovation submissions you provide. Submit only material you have permission to use and share, and do not include unlawful, misleading, confidential, or harmful content. You are responsible for removing personal or sensitive information that you are not authorized to disclose.",
  },
  {
    title: "Repository and document use",
    text: "Repository access does not transfer ownership or grant rights beyond the document's stated access conditions and applicable law. Check the source, attribution, license, and any restrictions before copying, distributing, or relying on a document.",
  },
  {
    title: "AI output limitations",
    text: "AI output is informational and research assistance based on available repository material. It can be incomplete or incorrect and should be checked against its sources. It is not authoritative legal, governmental, or professional advice and should not automatically be treated as such.",
  },
  {
    title: "GIS, dashboards, and simulations",
    text: "Maps, indicators, and simulated outcomes depend on the available data, assumptions, and methods. They may be incomplete, outdated, generalized, or uncertain and are provided to support exploration and research, not as official records, verified measurements, or predictions of actual outcomes. Verify important findings with authoritative sources and qualified professionals.",
  },
  {
    title: "Innovation submissions",
    text: "You are responsible for the accuracy of an innovation submission and for having the rights and permissions needed to submit its content. Submission or support does not guarantee selection, funding, adoption, or any other outcome.",
  },
  {
    title: "Intellectual property and prohibited misuse",
    text: "Respect intellectual-property, privacy, and access rights belonging to other users and content owners. Do not infringe those rights, disrupt platform operation, attempt unauthorized access, introduce malicious code, abuse the service, or use the platform to violate applicable law.",
  },
  {
    title: "Availability and changes",
    text: "Features and content may change, be interrupted, or become unavailable. These terms may also be updated as the platform changes; the current version on this page applies to use of the platform. Review it periodically.",
  },
];

export default function Terms() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6">
            <div className="flex items-center gap-3">
              <FileText className="h-7 w-7 text-[#0B3D91]" aria-hidden="true" />
              <h1 className="text-3xl font-bold text-[#1F2933]">Terms of Use</h1>
            </div>
            <p className="mt-2 text-[#5A6472]">
              Guidelines for using the Land Governance Research Platform.
            </p>
          </header>
          <div className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex gap-3 rounded-md border border-[#E1E5EA] bg-[#F5F7FA] p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#B66B00]" aria-hidden="true" />
              <p className="text-sm leading-6 text-[#5A6472]">
                This is a research and policy-innovation platform, not an official Government of India service or a substitute for official land records.
              </p>
            </div>
            <div className="space-y-6">
              {TERMS_SECTIONS.map(({ title, text }) => (
                <section key={title}>
                  <h2 className="text-base font-semibold text-[#1F2933]">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5A6472]">{text}</p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}