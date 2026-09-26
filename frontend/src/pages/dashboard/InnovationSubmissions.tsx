import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, Loader2, AlertCircle, Calendar, Tag, MapPin, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { loadInnovations } from "../../lib/supabaseInnovations";
import type { Innovation } from "../../types/innovation";

const STATUS_COLORS: Record<string, string> = {
  Submitted: "bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/20",
  "Under Review": "bg-[#0B3D91]/10 text-[#0B3D91] border-[#0B3D91]/20",
  Approved: "bg-[#138808]/10 text-[#138808] border-[#138808]/20",
  Rejected: "bg-[#D64545]/10 text-[#D64545] border-[#D64545]/20",
};

export default function InnovationSubmissions() {
  const { user } = useAuth();
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return undefined;

    const load = async () => {
      setLoading(true);
      setError(null);
      const { innovations: all, error: loadErr } = await loadInnovations();
      if (loadErr) {
        setError(loadErr);
      } else {
        // Filter to this user's own submissions
        setInnovations(all.filter((inn) => inn.submittedBy === user.id));
      }
      setLoading(false);
    };

    load();
  }, [user]);

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1F2933]">Innovation Submissions</h1>
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-8 shadow-sm text-center">
          <AlertCircle className="h-10 w-10 text-[#D64545] mx-auto mb-3" />
          <p className="text-[#1F2933] font-medium">Sign in to view your innovation submissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2933]">Innovation Submissions</h1>
          <p className="text-[#5A6472] mt-1">
            Ideas and solutions you have submitted to the Innovation Portal.
          </p>
        </div>
        <Link
          to="/innovation-portal"
          className="inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
        >
          <Lightbulb className="h-4 w-4" />
          Submit an Innovation
        </Link>
      </div>

      {loading && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-10 shadow-sm flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91]" />
          <p className="text-sm text-[#5A6472]">Loading your submissions…</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-8 shadow-sm flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-[#D64545]" />
          <p className="text-sm font-medium text-[#1F2933]">Could not load submissions</p>
          <p className="text-xs text-[#5A6472]">{error}</p>
        </div>
      )}

      {!loading && !error && innovations.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-10 shadow-sm flex flex-col items-center gap-3 text-center">
          <Lightbulb className="h-12 w-12 text-[#FF9933]/30 mb-2" />
          <p className="text-sm font-medium text-[#1F2933]">No innovations submitted yet</p>
          <p className="text-xs text-[#5A6472] max-w-xs">
            Share your ideas for improving land governance in India through the Innovation Portal.
          </p>
          <Link
            to="/innovation-portal"
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-[#FF9933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E88A2E] transition-colors"
          >
            <Lightbulb className="h-4 w-4" />
            Go to Innovation Portal
          </Link>
        </div>
      )}

      {!loading && !error && innovations.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] shadow-sm overflow-hidden">
          <div className="divide-y divide-[#E1E5EA]">
            {innovations.map((inn) => (
              <div key={inn.id} className="p-4 hover:bg-[#F5F7FA] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-[#FF9933]/10 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-[#FF9933]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F2933] line-clamp-1">{inn.title}</p>
                    {inn.description && (
                      <p className="text-xs text-[#5A6472] mt-0.5 line-clamp-2">{inn.description}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#5A6472]">
                      {inn.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {inn.category}
                        </span>
                      )}
                      {inn.state && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {inn.state}
                        </span>
                      )}
                      {inn.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(inn.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    {inn.status && (
                      <span
                        className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[inn.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                      >
                        {inn.status}
                      </span>
                    )}
                  </div>
                  <Link
                    to="/innovation-portal"
                    className="flex-shrink-0 p-1 text-[#5A6472] hover:text-[#0B3D91]"
                    title="View in Innovation Portal"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}