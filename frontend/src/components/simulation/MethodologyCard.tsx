import { Info } from 'lucide-react';

export default function MethodologyCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
      <div className="flex items-start space-x-3">
        <div className="mt-0.5 text-[#0B3D91]">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1F2933] mb-2">Methodology & Limitations</h3>
          <ul className="list-disc list-outside ml-4 text-sm text-[#5A6472] space-y-1">
            <li>This is a frontend prototype intended to demonstrate the platform's Simulation Lab workflow.</li>
            <li>Results are generated using deterministic local calculations, not live backend data.</li>
            <li>Values and outcomes shown are illustrative and for demonstration purposes only.</li>
            <li>The model is not an official government forecasting system.</li>
            <li>A real-world implementation would require validated datasets, statistical/econometric models, domain expertise, and secure backend computation.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
