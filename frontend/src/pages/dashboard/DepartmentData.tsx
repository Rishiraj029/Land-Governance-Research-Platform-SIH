import { Link } from "react-router-dom";
import { Database, FileText, Info } from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
import { roleLabel } from "../../lib/roles";

/**
 * Department/Institution Data.
 *
 * No department-contributed dataset layer exists in the database yet, so this page states
 * that plainly instead of rendering an empty table that implies data is coming from
 * somewhere. When an institution-dataset table is added, the real list belongs here.
 */
export default function DepartmentData() {
  const { profile, role } = useProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2933]">Department/Institution Data</h1>
        <p className="mt-1 text-[#5A6472]">
          Datasets and documents contributed under your organisation&apos;s name.
        </p>
      </div>

      <div className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#E8A33D]/10">
            <Database className="h-6 w-6 text-[#E8A33D]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#1F2933]">Department datasets are not connected yet</h2>
            <p className="mt-1 text-sm text-[#5A6472]">
              There is no organisation-attribution table in the platform database, so no
              department dataset can be listed or counted here. This page is intentionally
              empty rather than showing sample figures.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-md border border-[#E1E5EA] bg-[#F5F7FA] p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0B3D91]" aria-hidden="true" />
              <p className="text-xs text-[#5A6472]">
                {profile?.institution
                  ? `Your profile lists your institution as “${profile.institution}”.`
                  : "Add your institution on the Settings page so it can be shown here."}
                {role ? ` Your platform role is ${roleLabel(role)}.` : ""}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/repository"
                className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#062A63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Browse the Knowledge Repository
              </Link>
              <Link
                to="/dashboard/settings"
                className="inline-flex items-center gap-2 rounded-md border border-[#D0D5DD] px-4 py-2 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
              >
                Update your institution
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
