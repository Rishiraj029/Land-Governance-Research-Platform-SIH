import { Settings } from 'lucide-react';
import type { SimulationScenario } from '../../types/simulation';

interface Props {
  scenario: SimulationScenario;
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
}

export default function ParameterPanel({ scenario, values, onChange }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E1E5EA] p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[#F5F7FA] rounded-md">
          <Settings className="h-5 w-5 text-[#0B3D91]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1F2933]">2. Adjust Parameters</h2>
      </div>

      <div className="space-y-6">
        {scenario.parameters.map((param) => (
          <div key={param.id} className="space-y-2">
            <div className="flex justify-between items-end">
              <label htmlFor={param.id} className="block text-sm font-medium text-[#1F2933]">
                {param.name}
              </label>
              <span className="text-sm font-bold text-[#0B3D91] bg-blue-50 px-2 py-1 rounded">
                {values[param.id]} {param.unit}
              </span>
            </div>

            {param.description && (
              <p className="text-xs text-[#5A6472]">{param.description}</p>
            )}

            {param.type === 'slider' && (
              <input
                id={param.id}
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={values[param.id]}
                onChange={(e) => onChange(param.id, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0B3D91]"
                aria-label={param.name}
              />
            )}
            
            {param.type === 'number' && (
              <input
                id={param.id}
                type="number"
                min={param.min}
                max={param.max}
                step={param.step}
                value={values[param.id]}
                onChange={(e) => onChange(param.id, Number(e.target.value))}
                className="w-full bg-[#F5F7FA] border border-[#E1E5EA] rounded-md px-3 py-2 text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                aria-label={param.name}
              />
            )}
            
            <div className="flex justify-between text-xs text-[#5A6472]">
              <span>{param.min}</span>
              <span>{param.max}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
