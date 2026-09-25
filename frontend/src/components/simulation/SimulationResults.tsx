import { Activity, TrendingDown, TrendingUp, Clock, FileCheck } from 'lucide-react';
import type { SimulationResult, SimulationScenario } from '../../types/simulation';

interface Props {
  scenario: SimulationScenario;
  result: SimulationResult;
}

export default function SimulationResults({ scenario, result }: Props) {
  const isPositiveChange = result.changePercentage > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E1E5EA] p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#F5F7FA] rounded-md">
            <Activity className="h-5 w-5 text-[#0B3D91]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1F2933]">3. Projected Outcomes</h2>
        </div>
        <div className="text-sm text-[#5A6472] bg-blue-50 px-3 py-1 rounded-full text-[#0B3D91] border border-blue-100 font-medium">
          Prototype Calculation
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Core Metrics */}
        <div className="bg-[#F5F7FA] rounded-lg p-4 border border-[#E1E5EA]">
          <p className="text-sm text-[#5A6472] mb-1">Baseline Value</p>
          <div className="text-2xl font-bold text-[#1F2933]">
            {result.baseline.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
          <p className="text-xs text-[#5A6472] mt-1">{scenario.baselineLabel}</p>
        </div>

        <div className="bg-[#0B3D91] rounded-lg p-4 text-white shadow-sm">
          <p className="text-sm text-blue-100 mb-1">Projected Value</p>
          <div className="text-2xl font-bold">
            {result.projected.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
          <p className="text-xs text-blue-200 mt-1">After {result.implementationPeriod} Years</p>
        </div>

        <div className={`rounded-lg p-4 border ${isPositiveChange ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-sm mb-1 ${isPositiveChange ? 'text-amber-700' : 'text-green-700'}`}>
            Estimated Change
          </p>
          <div className="flex items-center">
            {isPositiveChange ? (
              <TrendingUp className="h-5 w-5 mr-1 text-amber-600" />
            ) : (
              <TrendingDown className="h-5 w-5 mr-1 text-green-600" />
            )}
            <span className={`text-2xl font-bold ${isPositiveChange ? 'text-amber-700' : 'text-green-700'}`}>
              {Math.abs(result.changePercentage).toFixed(1)}%
            </span>
          </div>
          <p className={`text-xs mt-1 ${isPositiveChange ? 'text-amber-600/80' : 'text-green-600/80'}`}>
            {isPositiveChange ? '+' : ''}{result.changeAbsolute.toLocaleString(undefined, { maximumFractionDigits: 1 })} Absolute
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="flex items-center space-x-3 p-3 border border-[#E1E5EA] rounded-md">
          <Clock className="h-8 w-8 text-[#5A6472] p-1.5 bg-[#F5F7FA] rounded" />
          <div>
            <p className="text-xs text-[#5A6472]">Implementation Period</p>
            <p className="text-sm font-semibold text-[#1F2933]">{result.implementationPeriod} Years</p>
          </div>
        </div>
        
        {scenario.metrics.map((metric) => (
          <div key={metric.key} className="flex items-center space-x-3 p-3 border border-[#E1E5EA] rounded-md">
            <FileCheck className="h-8 w-8 text-[#5A6472] p-1.5 bg-[#F5F7FA] rounded" />
            <div>
              <p className="text-xs text-[#5A6472]">{metric.label}</p>
              <p className="text-sm font-semibold text-[#1F2933]">
                {result.metrics[metric.key]}
                {metric.isPercentage ? '%' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-[#E1E5EA]">
        <h4 className="text-sm font-medium text-[#1F2933] mb-2">How this prototype calculation works:</h4>
        <p className="text-xs text-[#5A6472] leading-relaxed">
          Projected values are calculated using a local deterministic formula combining the selected baseline with weighted parameter inputs. This calculation model is intended only to demonstrate the simulation workflow and interface. It does not represent an official government forecast or verified statistical prediction.
        </p>
      </div>
    </div>
  );
}
