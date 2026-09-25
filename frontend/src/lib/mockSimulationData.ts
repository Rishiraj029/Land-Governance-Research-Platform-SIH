import type { SimulationScenario } from '../types/simulation';

export const scenarios: SimulationScenario[] = [
  {
    id: 'land-record-digitization',
    title: 'Land Record Digitization',
    description: 'Model the impact of increasing digital land record coverage on administrative efficiency and dispute reduction.',
    objective: 'Estimate how improved digital land-record coverage could affect administrative efficiency.',
    baselineValue: 45, // days to process
    baselineLabel: 'Average Processing Time (Days)',
    parameters: [
      {
        id: 'digitalCoverage',
        name: 'Digital Record Coverage',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 60,
        unit: '%',
      },
      {
        id: 'processingImprovement',
        name: 'Processing Efficiency Improvement',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 25,
        unit: '%',
      },
      {
        id: 'implementationPeriod',
        name: 'Implementation Period',
        type: 'number',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 3,
        unit: 'Years',
      }
    ],
    metrics: [
      { label: 'Policy Coverage', key: 'digitalCoverage', isPercentage: true },
      { label: 'Efficiency Gain', key: 'processingImprovement', isPercentage: true },
      { label: 'Scenario Impact Index', key: 'impactIndex' }
    ],
    calculate: (params, baseline) => {
      const coverage = params.digitalCoverage as number;
      const efficiency = params.processingImprovement as number;
      const years = params.implementationPeriod as number;
      
      const impactFactor = (coverage / 100) * (efficiency / 100);
      const projected = Math.max(1, baseline * (1 - impactFactor));
      
      const changeAbsolute = projected - baseline;
      const changePercentage = (changeAbsolute / baseline) * 100;
      
      const yearlyProjection = [];
      for (let i = 0; i <= years; i++) {
        const progress = i / years;
        yearlyProjection.push({
          year: `Year ${i}`,
          baseline: baseline,
          projected: baseline - (baseline - projected) * progress
        });
      }

      return {
        baseline,
        projected,
        changeAbsolute,
        changePercentage,
        implementationPeriod: years,
        metrics: {
          digitalCoverage: coverage,
          processingImprovement: efficiency,
          impactIndex: (impactFactor * 10).toFixed(1)
        },
        yearlyProjection
      };
    }
  },
  {
    id: 'urban-expansion-management',
    title: 'Urban Expansion Management',
    description: 'Analyze how controlled urban expansion influences land-use pressure and infrastructure demand.',
    objective: 'Explore how controlled urban expansion could influence land-use pressure.',
    baselineValue: 120, // Hectares lost per year
    baselineLabel: 'Agricultural Land Conversion Rate (Ha/Yr)',
    parameters: [
      {
        id: 'urbanControl',
        name: 'Urban Expansion Control',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 40,
        unit: '%',
      },
      {
        id: 'planningCompliance',
        name: 'Planning Compliance',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 50,
        unit: '%',
      },
      {
        id: 'implementationPeriod',
        name: 'Implementation Period',
        type: 'number',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
        unit: 'Years',
      }
    ],
    metrics: [
      { label: 'Expansion Control', key: 'urbanControl', isPercentage: true },
      { label: 'Compliance Rate', key: 'planningCompliance', isPercentage: true },
      { label: 'Scenario Impact Index', key: 'impactIndex' }
    ],
    calculate: (params, baseline) => {
      const control = params.urbanControl as number;
      const compliance = params.planningCompliance as number;
      const years = params.implementationPeriod as number;
      
      const impactFactor = (control / 100) * (compliance / 100) * 0.8;
      const projected = baseline * (1 - impactFactor);
      
      const changeAbsolute = projected - baseline;
      const changePercentage = (changeAbsolute / baseline) * 100;
      
      const yearlyProjection = [];
      for (let i = 0; i <= years; i++) {
        const progress = i / years;
        yearlyProjection.push({
          year: `Year ${i}`,
          baseline: baseline,
          projected: baseline - (baseline - projected) * progress
        });
      }

      return {
        baseline,
        projected,
        changeAbsolute,
        changePercentage,
        implementationPeriod: years,
        metrics: {
          urbanControl: control,
          planningCompliance: compliance,
          impactIndex: (impactFactor * 10).toFixed(1)
        },
        yearlyProjection
      };
    }
  },
  {
    id: 'land-dispute-reduction',
    title: 'Land Dispute Reduction',
    description: 'Simulate the impact of mediation and legal awareness on reducing land dispute backlogs.',
    objective: 'Estimate potential reduction in court backlog through alternative dispute resolution.',
    baselineValue: 5000, // Pending cases
    baselineLabel: 'Pending Land Disputes',
    parameters: [
      {
        id: 'mediationCoverage',
        name: 'Mediation Coverage',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 30,
        unit: '%',
      },
      {
        id: 'caseProcessingImprovement',
        name: 'Case Processing Improvement',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 20,
        unit: '%',
      },
      {
        id: 'legalAwareness',
        name: 'Legal Awareness Coverage',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 40,
        unit: '%',
      },
      {
        id: 'implementationPeriod',
        name: 'Implementation Period',
        type: 'number',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 4,
        unit: 'Years',
      }
    ],
    metrics: [
      { label: 'Mediation Coverage', key: 'mediationCoverage', isPercentage: true },
      { label: 'Awareness Reach', key: 'legalAwareness', isPercentage: true },
      { label: 'Scenario Impact Index', key: 'impactIndex' }
    ],
    calculate: (params, baseline) => {
      const mediation = params.mediationCoverage as number;
      const processing = params.caseProcessingImprovement as number;
      const awareness = params.legalAwareness as number;
      const years = params.implementationPeriod as number;
      
      const impactFactor = ((mediation * 0.5) + (processing * 0.3) + (awareness * 0.2)) / 100;
      const projected = Math.max(0, baseline * (1 - impactFactor));
      
      const changeAbsolute = projected - baseline;
      const changePercentage = (changeAbsolute / baseline) * 100;
      
      const yearlyProjection = [];
      for (let i = 0; i <= years; i++) {
        const progress = i / years;
        yearlyProjection.push({
          year: `Year ${i}`,
          baseline: baseline,
          projected: baseline - (baseline - projected) * progress
        });
      }

      return {
        baseline,
        projected,
        changeAbsolute,
        changePercentage,
        implementationPeriod: years,
        metrics: {
          mediationCoverage: mediation,
          legalAwareness: awareness,
          impactIndex: (impactFactor * 10).toFixed(1)
        },
        yearlyProjection
      };
    }
  },
  {
    id: 'climate-resilient-land-use',
    title: 'Climate-Resilient Land Use',
    description: 'Model the adoption of resilient land-use practices and its effect on climate risk reduction.',
    objective: 'Assess how resilient farming and land management reduces economic risk from climate events.',
    baselineValue: 85, // Risk index
    baselineLabel: 'Climate Vulnerability Index',
    parameters: [
      {
        id: 'resilientAdoption',
        name: 'Resilient Land Adoption',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 25,
        unit: '%',
      },
      {
        id: 'climateRiskReduction',
        name: 'Climate Risk Reduction Efficacy',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 30,
        unit: '%',
      },
      {
        id: 'implementationPeriod',
        name: 'Implementation Period',
        type: 'number',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
        unit: 'Years',
      }
    ],
    metrics: [
      { label: 'Adoption Rate', key: 'resilientAdoption', isPercentage: true },
      { label: 'Reduction Efficacy', key: 'climateRiskReduction', isPercentage: true },
      { label: 'Scenario Impact Index', key: 'impactIndex' }
    ],
    calculate: (params, baseline) => {
      const adoption = params.resilientAdoption as number;
      const efficacy = params.climateRiskReduction as number;
      const years = params.implementationPeriod as number;
      
      const impactFactor = (adoption / 100) * (efficacy / 100);
      const projected = Math.max(10, baseline * (1 - impactFactor));
      
      const changeAbsolute = projected - baseline;
      const changePercentage = (changeAbsolute / baseline) * 100;
      
      const yearlyProjection = [];
      for (let i = 0; i <= years; i++) {
        const progress = i / years;
        yearlyProjection.push({
          year: `Year ${i}`,
          baseline: baseline,
          projected: baseline - (baseline - projected) * progress
        });
      }

      return {
        baseline,
        projected,
        changeAbsolute,
        changePercentage,
        implementationPeriod: years,
        metrics: {
          resilientAdoption: adoption,
          climateRiskReduction: efficacy,
          impactIndex: (impactFactor * 10).toFixed(1)
        },
        yearlyProjection
      };
    }
  },
  {
    id: 'tenure-security',
    title: 'Tenure Security Improvement',
    description: 'Calculate the socio-economic benefits of increasing formal land tenure registration.',
    objective: 'Estimate how improving secure tenure access enhances overall tenure security scores.',
    baselineValue: 42, // Secure tenure %
    baselineLabel: 'Secure Tenure Coverage (%)',
    parameters: [
      {
        id: 'registrationAccess',
        name: 'Registration Accessibility',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 50,
        unit: '%',
      },
      {
        id: 'administrativeImprovement',
        name: 'Administrative Improvement',
        type: 'slider',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 40,
        unit: '%',
      },
      {
        id: 'implementationPeriod',
        name: 'Implementation Period',
        type: 'number',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 4,
        unit: 'Years',
      }
    ],
    metrics: [
      { label: 'Access to Reg.', key: 'registrationAccess', isPercentage: true },
      { label: 'Admin Quality', key: 'administrativeImprovement', isPercentage: true },
      { label: 'Scenario Impact Index', key: 'impactIndex' }
    ],
    calculate: (params, baseline) => {
      const access = params.registrationAccess as number;
      const admin = params.administrativeImprovement as number;
      const years = params.implementationPeriod as number;
      
      // For coverage %, impact increases it rather than reducing it
      const impactFactor = (access / 100) * (admin / 100) * 0.5; // Max 50% increase relative to remaining gap
      const remainingGap = 100 - baseline;
      const projected = Math.min(100, baseline + (remainingGap * impactFactor));
      
      const changeAbsolute = projected - baseline;
      const changePercentage = (changeAbsolute / baseline) * 100;
      
      const yearlyProjection = [];
      for (let i = 0; i <= years; i++) {
        const progress = i / years;
        yearlyProjection.push({
          year: `Year ${i}`,
          baseline: baseline,
          projected: baseline + (projected - baseline) * progress
        });
      }

      return {
        baseline,
        projected,
        changeAbsolute,
        changePercentage,
        implementationPeriod: years,
        metrics: {
          registrationAccess: access,
          administrativeImprovement: admin,
          impactIndex: (impactFactor * 10).toFixed(1)
        },
        yearlyProjection
      };
    }
  }
];
