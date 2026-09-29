/**
 * RiskSignals — Land Governance Risk Signals component.
 * 
 * Displays rule-based trend signals derived from dashboard indicator data.
 * These are data-derived trend signals, NOT predictions or official risk assessments.
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Database,
  ExternalLink,
  HelpCircle,
  Map as MapIcon,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { DashboardIndicator } from "../../types/dashboard";
import {
  generateRiskSignals,
  getTrendLabel,
  getTrendColor,
  type RiskSignal,
} from "../../lib/supabaseDashboards";

interface Props {
  /** All loaded dashboard indicators */
  indicators: DashboardIndicator[];
}

export default function RiskSignals({ indicators }: Props) {
  const signals = useMemo(() => generateRiskSignals(indicators), [indicators]);
  
  // Filter out insufficient data signals for the main display
  const actionableSignals = signals.filter(s => s.trend !== 'insufficient-data');
  const insufficientSignals = signals.filter(s => s.trend === 'insufficient-data');
  
  // Get unique geographies and indicators for quick navigation
  const geographies = [...new Set(signals.map(s => s.geography))].sort();
  const uniqueIndicators = [...new Set(signals.map(s => s.indicator))].sort();

  const renderTrendIcon = (trend: RiskSignal['trend']) => {
    const iconMap: Record<RiskSignal['trend'], React.ReactNode> = {
      increasing: <TrendingUp className="h-4 w-4" />,
      decreasing: <TrendingDown className="h-4 w-4" />,
      stable: <Minus className="h-4 w-4" />,
      'unusual-change': <AlertTriangle className="h-4 w-4" />,
      'insufficient-data': <HelpCircle className="h-4 w-4" />,
    };
    return iconMap[trend] || <Minus className="h-4 w-4" />;
  };

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-6 w-6 text-[#0B3D91]" />
            <h2 className="text-xl font-bold font-poppins text-[#1F2933]">
              Land Governance Risk Signals
            </h2>
          </div>
          <p className="text-sm text-[#5A6472] max-w-2xl">
            Data-derived trend signals based on the available dashboard dataset. 
            These are rule-based historical trend classifications, not forecasts or official risk assessments.
          </p>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-[#FF9933]/10 border border-[#FF9933]/30 rounded-md p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#FF9933] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#D67C22] text-sm mb-1">
              Important: Data-derived trend signals
            </p>
            <p className="text-xs text-[#5A6472] leading-relaxed">
              These signals are based on the available dashboard dataset only and identify notable historical/current trends. 
              They are NOT predictions of future land disputes, official risk assessments, or government recommendations. 
              Always investigate further using the repository documents, dashboards, and GIS Explorer before drawing conclusions.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#F5F7FA] rounded-md p-3">
          <p className="text-xs text-[#5A6472] mb-1">Total Signals</p>
          <p className="text-lg font-semibold text-[#1F2933]">{signals.length}</p>
        </div>
        <div className="bg-[#D64545]/10 rounded-md p-3">
          <p className="text-xs text-[#5A6472] mb-1">Increasing</p>
          <p className="text-lg font-semibold text-[#D64545]">
            {signals.filter(s => s.trend === 'increasing').length}
          </p>
        </div>
        <div className="bg-[#138808]/10 rounded-md p-3">
          <p className="text-xs text-[#5A6472] mb-1">Decreasing</p>
          <p className="text-lg font-semibold text-[#138808]">
            {signals.filter(s => s.trend === 'decreasing').length}
          </p>
        </div>
        <div className="bg-[#FF9933]/10 rounded-md p-3">
          <p className="text-xs text-[#5A6472] mb-1">Unusual Changes</p>
          <p className="text-lg font-semibold text-[#FF9933]">
            {signals.filter(s => s.trend === 'unusual-change').length}
          </p>
        </div>
      </div>

      {/* Actionable Signals */}
      {actionableSignals.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#1F2933]">
            Notable Trends ({actionableSignals.length})
          </h3>
          
          <div className="space-y-3">
            {actionableSignals.map((signal, index) => (
              <div
                key={`${signal.geography}-${signal.indicator}-${index}`}
                className="border border-[#E1E5EA] rounded-md p-4 hover:border-[#0B3D91] transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Signal Header */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-[#1F2933]">{signal.geography}</span>
                      <span className="text-[#E1E5EA]">•</span>
                      <span className="text-sm text-[#5A6472]">{signal.indicator}</span>
                      {signal.category && (
                        <>
                          <span className="text-[#E1E5EA]">•</span>
                          <span className="text-xs px-2 py-0.5 bg-[#F5F7FA] rounded text-[#5A6472]">
                            {signal.category}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTrendColor(signal.trend)}`}
                      >
                        {renderTrendIcon(signal.trend)}
                        {getTrendLabel(signal.trend)}
                      </span>
                      <span className="text-xs text-[#5A6472]">Period: {signal.period}</span>
                    </div>
                    
                    {/* Data Quality Note */}
                    <p className="text-xs text-[#5A6472] mb-3">{signal.confidenceNote}</p>
                    
                    {/* Data Points Summary */}
                    <div className="text-xs text-[#5A6472] mb-3">
                      <span className="font-medium">Data points:</span>{' '}
                      {signal.dataPoints.map((dp, i) => (
                        <span key={i}>
                          {dp.year}: {dp.value}{dp.unit ? ` ${dp.unit}` : ''}
                          {i < signal.dataPoints.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                    
                    {/* Source */}
                    {signal.source && (
                      <p className="text-xs text-[#5A6472]">
                        <span className="font-medium">Source:</span> {signal.source}
                      </p>
                    )}
                  </div>
                  
                  {/* Investigate Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[160px]">
                    <Link
                      to="/repository"
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#0B3D91] bg-[#F0F5FC] rounded-md hover:bg-[#0B3D91] hover:text-white transition-colors"
                    >
                      <Database className="h-4 w-4" />
                      Repository
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Link
                      to="/dashboards"
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#0B3D91] bg-[#F0F5FC] rounded-md hover:bg-[#0B3D91] hover:text-white transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Dashboard
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Link
                      to="/gis-explorer"
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#0B3D91] bg-[#F0F5FC] rounded-md hover:bg-[#0B3D91] hover:text-white transition-colors"
                    >
                      <MapIcon className="h-4 w-4" />
                      GIS Explorer
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-[#E1E5EA] mx-auto mb-3" />
          <p className="text-sm text-[#5A6472]">
            No actionable trend signals detected. More data points are needed for trend analysis.
          </p>
        </div>
      )}

      {/* Insufficient Data Section */}
      {insufficientSignals.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[#E1E5EA]">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <h3 className="text-sm font-semibold text-[#5A6472]">
                Insufficient Data ({insufficientSignals.length})
              </h3>
              <ArrowRight className="h-4 w-4 text-[#5A6472] group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 space-y-2">
              {insufficientSignals.map((signal, index) => (
                <div
                  key={`${signal.geography}-${signal.indicator}-${index}`}
                  className="text-xs text-[#5A6472] bg-[#F5F7FA] rounded p-2"
                >
                  <span className="font-medium">{signal.geography}</span> – {signal.indicator}: {signal.confidenceNote}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="mt-6 pt-6 border-t border-[#E1E5EA]">
        <h3 className="text-sm font-semibold text-[#1F2933] mb-3">Quick Navigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#5A6472] mb-2">By Geography:</p>
            <div className="flex flex-wrap gap-2">
              {geographies.slice(0, 6).map(geo => (
                <span
                  key={geo}
                  className="text-xs px-2 py-1 bg-[#F5F7FA] rounded text-[#5A6472]"
                >
                  {geo}
                </span>
              ))}
              {geographies.length > 6 && (
                <span className="text-xs px-2 py-1 bg-[#F5F7FA] rounded text-[#5A6472]">
                  +{geographies.length - 6} more
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#5A6472] mb-2">By Indicator:</p>
            <div className="flex flex-wrap gap-2">
              {uniqueIndicators.slice(0, 4).map(indicator => (
                <span
                  key={indicator}
                  className="text-xs px-2 py-1 bg-[#F5F7FA] rounded text-[#5A6472]"
                >
                  {indicator}
                </span>
              ))}
              {uniqueIndicators.length > 4 && (
                <span className="text-xs px-2 py-1 bg-[#F5F7FA] rounded text-[#5A6472]">
                  +{uniqueIndicators.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}