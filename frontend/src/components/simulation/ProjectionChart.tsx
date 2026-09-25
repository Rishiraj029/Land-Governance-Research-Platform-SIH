import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import type { SimulationResult, SimulationScenario } from '../../types/simulation';
import { BarChart2 } from 'lucide-react';

interface Props {
  scenario: SimulationScenario;
  result: SimulationResult;
}

export default function ProjectionChart({ scenario, result }: Props) {
  // Use yearly projection data
  const data = result.yearlyProjection;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E1E5EA] p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[#F5F7FA] rounded-md">
          <BarChart2 className="h-5 w-5 text-[#0B3D91]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#1F2933]">Projected Scenario Outcome</h2>
          <p className="text-sm text-[#5A6472]">Illustrative prototype projection over {result.implementationPeriod} years</p>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E5EA" />
            <XAxis dataKey="year" stroke="#5A6472" tick={{ fill: '#5A6472', fontSize: 12 }} />
            <YAxis 
              stroke="#5A6472" 
              tick={{ fill: '#5A6472', fontSize: 12 }}
              label={{ value: scenario.baselineLabel.replace(/\(.*\)/, '').substring(0, 15) + '...', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#5A6472', fontSize: 12 } }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E1E5EA', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              labelStyle={{ color: '#1F2933', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ fontSize: '14px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Line 
              type="monotone" 
              name="Baseline Scenario (No Change)" 
              dataKey="baseline" 
              stroke="#5A6472" 
              strokeWidth={2}
              strokeDasharray="5 5" 
              dot={false}
              activeDot={{ r: 4 }}
            />
            
            <Area
              type="monotone"
              dataKey="projected"
              fill="#0B3D91"
              fillOpacity={0.1}
              stroke="none"
            />
            
            <Line 
              type="monotone" 
              name="Projected Outcome" 
              dataKey="projected" 
              stroke="#0B3D91" 
              strokeWidth={3}
              activeDot={{ r: 6, fill: '#0B3D91', stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
