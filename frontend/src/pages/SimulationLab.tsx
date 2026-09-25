import { useState, useEffect } from 'react';
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";
import { ChevronRight, Save, RotateCcw, Play, Loader2, Beaker } from 'lucide-react';

import { scenarios } from '../lib/mockSimulationData';
import type { SimulationResult, SavedScenario } from '../types/simulation';

import ScenarioSelector from '../components/simulation/ScenarioSelector';
import ParameterPanel from '../components/simulation/ParameterPanel';
import SimulationResults from '../components/simulation/SimulationResults';
import ProjectionChart from '../components/simulation/ProjectionChart';
import ScenarioComparison from '../components/simulation/ScenarioComparison';
import MethodologyCard from '../components/simulation/MethodologyCard';

export default function SimulationLab() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

  // Find the selected scenario object
  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) || null;

  // Update parameter defaults when scenario changes
  useEffect(() => {
    if (selectedScenario) {
      const defaults: Record<string, any> = {};
      selectedScenario.parameters.forEach(p => {
        defaults[p.id] = p.defaultValue;
      });
      setParameterValues(defaults);
      setResult(null); // Clear previous results
    }
  }, [selectedScenarioId]);

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
  };

  const handleParameterChange = (id: string, value: any) => {
    setParameterValues(prev => ({ ...prev, [id]: value }));
  };

  const handleRunSimulation = () => {
    if (!selectedScenario) return;
    
    setIsSimulating(true);
    
    // Fake loading delay for better UX
    setTimeout(() => {
      const simResult = selectedScenario.calculate(parameterValues, selectedScenario.baselineValue);
      setResult(simResult);
      setIsSimulating(false);
    }, 800);
  };

  const handleSaveScenario = () => {
    if (!selectedScenario || !result) return;
    
    const scenarioName = `${selectedScenario.title} - ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    const newSaved: SavedScenario = {
      id: Math.random().toString(36).substring(7),
      name: scenarioName,
      scenarioId: selectedScenario.id,
      scenarioTitle: selectedScenario.title,
      parameters: { ...parameterValues },
      result: { ...result },
      timestamp: Date.now()
    };
    
    setSavedScenarios(prev => [...prev, newSaved]);
  };

  const handleRemoveScenario = (id: string) => {
    setSavedScenarios(prev => prev.filter(s => s.id !== id));
  };

  const handleReset = () => {
    setSelectedScenarioId(null);
    setParameterValues({});
    setResult(null);
    // Note: We don't clear saved scenarios on general reset
  };

  const handleExport = () => {
    if (savedScenarios.length === 0) return;

    // Build CSV content
    const headers = ['Scenario Name', 'Policy Type', 'Baseline', 'Projected', 'Change (%)', 'Implementation Period (Yrs)'];
    const rows = savedScenarios.map(s => [
      `"${s.name}"`,
      `"${s.scenarioTitle}"`,
      s.result.baseline,
      s.result.projected,
      s.result.changePercentage.toFixed(2),
      s.result.implementationPeriod
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'simulation_scenarios_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-[#0B3D91] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex text-sm text-blue-200 mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <ChevronRight className="h-4 w-4" />
              </li>
              <li className="text-white font-medium" aria-current="page">
                Simulation Lab
              </li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold font-poppins">Policy Simulation Lab</h1>
                <span className="bg-saffron text-white text-xs font-bold px-2 py-1 rounded shadow-sm bg-[#FF9933]">
                  Prototype
                </span>
              </div>
              <p className="text-lg text-blue-100 max-w-3xl">
                Experiment with land governance policy scenarios and examine their projected outcomes.
              </p>
              <div className="mt-4 inline-flex items-center space-x-2 bg-blue-800/50 rounded p-2.5 border border-blue-700/50">
                <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                <p className="text-sm text-blue-100">
                  <span className="font-semibold text-white">Note:</span> Results shown here are illustrative prototype calculations and are not official government forecasts.
                </p>
              </div>
            </div>
            
            <div className="flex shrink-0">
              <button 
                onClick={handleReset}
                className="flex items-center space-x-2 text-sm font-medium text-white border border-blue-400/30 bg-blue-800/30 hover:bg-blue-700/50 px-4 py-2 rounded-md transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset Simulation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Controls */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <ScenarioSelector 
              scenarios={scenarios}
              selectedId={selectedScenarioId}
              onSelect={handleSelectScenario}
            />

            {selectedScenario && (
              <>
                <ParameterPanel 
                  scenario={selectedScenario}
                  values={parameterValues}
                  onChange={handleParameterChange}
                />

                <div className="bg-white rounded-lg shadow-sm border border-[#E1E5EA] p-6">
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="w-full flex items-center justify-center space-x-2 bg-[#0B3D91] hover:bg-[#062A63] text-white px-6 py-4 rounded-md font-semibold text-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isSimulating ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Running prototype simulation...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-6 w-6" />
                        <span>Run Simulation</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-[#5A6472] mt-3">
                    {result ? "Simulation completed." : "Configure parameters and run the simulation."}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            {!selectedScenario && (
              <div className="bg-white rounded-lg shadow-sm border border-[#E1E5EA] p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                  <Beaker className="h-10 w-10 text-[#0B3D91]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2933] mb-2">Configure a policy scenario to begin</h3>
                <p className="text-[#5A6472] max-w-md">
                  Select a policy scenario from the left panel and adjust its parameters to view illustrative projections.
                </p>
              </div>
            )}

            {selectedScenario && result && !isSimulating && (
              <>
                <SimulationResults 
                  scenario={selectedScenario}
                  result={result}
                />
                
                <ProjectionChart 
                  scenario={selectedScenario}
                  result={result}
                />

                <div className="flex justify-end mb-2">
                  <button
                    onClick={handleSaveScenario}
                    className="flex items-center space-x-2 bg-white border border-[#E1E5EA] hover:bg-gray-50 text-[#0B3D91] font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Scenario</span>
                  </button>
                </div>
              </>
            )}
            
            {/* Show a placeholder if a scenario is selected but not yet run */}
            {selectedScenario && !result && !isSimulating && (
               <div className="bg-white rounded-lg shadow-sm border border-dashed border-[#CBD5E1] p-12 flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Play className="h-8 w-8 text-[#94A3B8]" />
                  </div>
                  <h3 className="text-lg font-medium text-[#1F2933] mb-1">Ready to Simulate</h3>
                  <p className="text-[#5A6472]">
                    Adjust your parameters and click "Run Simulation" to see the projected outcomes.
                  </p>
               </div>
            )}

            {/* Scenario Comparison Table */}
            {savedScenarios.length > 0 && (
              <div className="mt-8">
                <ScenarioComparison 
                  scenarios={savedScenarios}
                  onRemove={handleRemoveScenario}
                  onExport={handleExport}
                />
              </div>
            )}
            
            <MethodologyCard />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}