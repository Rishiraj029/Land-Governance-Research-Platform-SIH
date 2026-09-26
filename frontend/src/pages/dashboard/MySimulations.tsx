import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, Loader2, AlertCircle, Calendar, ArrowRight, FlaskConical } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { loadSimulationRuns } from "../../lib/supabaseSimulation";
import type { SimulationRun } from "../../types/simulation";

export default function MySimulations() {
  const { user } = useAuth();
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return undefined;

    const load = async () => {
      setLoading(true);
      setError(null);
      const { runs: loaded, error: loadErr } = await loadSimulationRuns(user.id);
      if (loadErr) {
        setError(loadErr);
      } else {
        setRuns(loaded);
      }
      setLoading(false);
    };

    load();
  }, [user]);

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1F2933]">My Simulations</h1>
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-8 shadow-sm text-center">
          <AlertCircle className="h-10 w-10 text-[#D64545] mx-auto mb-3" />
          <p className="text-[#1F2933] font-medium">Sign in to view your saved simulations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2933]">My Simulations</h1>
          <p className="text-[#5A6472] mt-1">
            Policy simulation runs you have saved from the Simulation Lab.
          </p>
        </div>
        <Link
          to="/simulation-lab"
          className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63] transition-colors"
        >
          <FlaskConical className="h-4 w-4" />
          Open Simulation Lab
        </Link>
      </div>

      {loading && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-10 shadow-sm flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91]" />
          <p className="text-sm text-[#5A6472]">Loading your simulations…</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-8 shadow-sm flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-[#D64545]" />
          <p className="text-sm font-medium text-[#1F2933]">Could not load simulations</p>
          <p className="text-xs text-[#5A6472]">{error}</p>
        </div>
      )}

      {!loading && !error && runs.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] p-10 shadow-sm flex flex-col items-center gap-3 text-center">
          <Activity className="h-12 w-12 text-[#0B3D91]/30 mb-2" />
          <p className="text-sm font-medium text-[#1F2933]">No saved simulations yet</p>
          <p className="text-xs text-[#5A6472] max-w-xs">
            Run a policy scenario in the Simulation Lab and save it to track outcomes over time.
          </p>
          <Link
            to="/simulation-lab"
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63] transition-colors"
          >
            <FlaskConical className="h-4 w-4" />
            Go to Simulation Lab
          </Link>
        </div>
      )}

      {!loading && !error && runs.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E1E5EA] shadow-sm overflow-hidden">
          <div className="divide-y divide-[#E1E5EA]">
            {runs.map((run) => (
              <div key={run.id} className="p-4 hover:bg-[#F5F7FA] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-[#0B3D91]/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-[#0B3D91]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F2933] truncate">{run.scenarioName}</p>
                    {run.results?.keyResult && (
                      <p className="text-xs text-[#5A6472] mt-0.5 line-clamp-2">
                        {run.results.keyResult}
                      </p>
                    )}
                    <p className="text-xs text-[#5A6472] flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(run.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Link
                    to="/simulation-lab"
                    className="flex-shrink-0 p-1 text-[#5A6472] hover:text-[#0B3D91]"
                    title="Open Simulation Lab"
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