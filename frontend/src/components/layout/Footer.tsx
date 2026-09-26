import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E1E5EA] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-4">
            {/* Column 1: About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Landmark className="h-5 w-5 text-[#0B3D91]" />
                <span className="font-semibold text-[#0B3D91]">
                  Land Governance Platform
                </span>
              </div>
              <p className="text-sm text-[#5A6472] mb-4">
                Research and policy innovation for land governance.
              </p>
              <Link
                to="/about"
                className="text-sm font-medium text-[#0B3D91] hover:text-[#062A63]"
              >
                About & Vision →
              </Link>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="font-semibold text-[#1F2933] mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/repository"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Repository
                  </Link>
                </li>
                <li>
                  <Link
                    to="/gis-explorer"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    GIS Explorer
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboards"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Dashboards
                  </Link>
                </li>
                <li>
                  <Link
                    to="/simulation-lab"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Simulation Lab
                  </Link>
                </li>
                <li>
                  <Link
                    to="/innovation-portal"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Innovation Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h3 className="font-semibold text-[#1F2933] mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/api-docs"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    API Developer Portal
                  </Link>
                </li>
                <li>
                  <Link
                    to="/data-standards"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Data Standards & Licensing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Help / FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h3 className="font-semibold text-[#1F2933] mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link
                    to="/accessibility"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Accessibility Statement
                  </Link>
                </li>
                <li>
                  <Link
                    to="/data-sharing"
                    className="text-sm text-[#5A6472] hover:text-[#0B3D91]"
                  >
                    Data Sharing Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E1E5EA] py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-[#5A6472]">
              © {currentYear} National Digital Platform for Research and Policy Innovation in Land Governance.
            </p>
            <p className="text-xs text-[#5A6472]">
              Research and policy information; verify source data before use.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}