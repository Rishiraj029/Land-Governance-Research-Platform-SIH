import { ChevronDown, Beaker } from 'lucide-react';
import type { SimulationScenario } from '../../types/simulation';

interface Props {
  scenarios: SimulationScenario[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ScenarioSelector({ scenarios, selectedId, onSelect }: Props) {
  const selectedScenario = scenarios.find(s => s.id === selectedId);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E1E5EA] p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-[#F5F7FA] rounded-md">
          <Beaker className="h-5 w-5 text-[#0B3D91]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1F2933]">1. Select Policy Scenario</h2>
      </div>
      
      <div className="relative">
        <select
          className="w-full appearance-none bg-[#F5F7FA] border border-[#E1E5EA] text-[#1F2933] py-3 px-4 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:border-transparent transition-colors"
          value={selectedId || ''}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="" disabled>Select a scenario to configure...</option>
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.title}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#5A6472]">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {selectedScenario && (
        <div className="mt-4 p-4 bg-[#F5F7FA] rounded-md border border-[#E1E5EA]">
          <h3 className="font-medium text-[#1F2933] mb-1">Objective</h3>
          <p className="text-sm text-[#5A6472]">{selectedScenario.objective}</p>
          <p className="text-sm text-[#5A6472] mt-2">{selectedScenario.description}</p>
          <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-[#0B3D91]">
            Baseline: {selectedScenario.baselineValue} {selectedScenario.baselineLabel.replace(/\(.*\)/, '')}
          </div>
        </div>
      )}
    </div>
  );
}
