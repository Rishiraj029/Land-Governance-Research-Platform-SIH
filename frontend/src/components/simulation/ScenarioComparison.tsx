import { Trash2, Download, Table2, Layers } from 'lucide-react';
import type { SavedScenario } from '../../types/simulation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  scenarios: SavedScenario[];
  onRemove: (id: string) => void;
  onExport: () => void;
}

export default function ScenarioComparison({ scenarios, onRemove, onExport }: Props) {
  if (scenarios.length === 0) return null;

  // Prepare data for the comparison chart
  const chartData = scenarios.map(s => ({
    name: s.name,
    Baseline: s.result.baseline,
    Projected: s.result.projected,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E1E5EA] p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#F5F7FA] rounded-md">
            <Layers className="h-5 w-5 text-[#0B3D91]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1F2933]">Scenario Comparison</h2>
        </div>
        <button
          onClick={onExport}
          className="flex items-center space-x-2 text-sm font-medium text-[#0B3D91] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7FA] text-[#5A6472]">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-md">Scenario Name</th>
              <th className="px-4 py-3 font-semibold">Policy Type</th>
              <th className="px-4 py-3 font-semibold text-right">Baseline</th>
              <th className="px-4 py-3 font-semibold text-right">Projected</th>
              <th className="px-4 py-3 font-semibold text-right">Change</th>
              <th className="px-4 py-3 font-semibold text-center">Period (Yrs)</th>
              <th className="px-4 py-3 font-semibold text-right rounded-tr-md">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E5EA]">
            {scenarios.map((scenario) => {
              const isPositive = scenario.result.changePercentage > 0;
              return (
                <tr key={scenario.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1F2933]">{scenario.name}</td>
                  <td className="px-4 py-3 text-[#5A6472]">{scenario.scenarioTitle}</td>
                  <td className="px-4 py-3 text-right text-[#5A6472]">
                    {scenario.result.baseline.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#1F2933]">
                    {scenario.result.projected.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${isPositive ? 'text-amber-600' : 'text-green-600'}`}>
                    {isPositive ? '+' : ''}{scenario.result.changePercentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center text-[#5A6472]">{scenario.result.implementationPeriod}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onRemove(scenario.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Remove scenario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {scenarios.length > 1 && (
        <div className="mt-6 border-t border-[#E1E5EA] pt-6">
          <div className="flex items-center space-x-2 mb-4 text-[#5A6472]">
            <Table2 className="h-4 w-4" />
            <h3 className="font-medium">Visual Comparison</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E5EA" />
                <XAxis dataKey="name" stroke="#5A6472" tick={{ fill: '#5A6472', fontSize: 12 }} />
                <YAxis stroke="#5A6472" tick={{ fill: '#5A6472', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E1E5EA' }}
                />
                <Legend />
                <Bar dataKey="Baseline" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Projected" fill="#0B3D91" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
