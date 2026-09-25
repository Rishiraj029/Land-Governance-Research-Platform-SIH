/**
 * Mock GIS data for PAGE 7 — GIS Map Explorer
 * 
 * IMPORTANT: This is demo/prototype data for frontend development purposes only.
 * Do not use this data for any real research, policy, or government purposes.
 * All coordinates, values, and statistics are representative examples for demonstration.
 * 
 * Geographic coordinates are approximate center points for districts/states.
 * Values are illustrative prototype values, not actual government measurements.
 */

import type { GISFeature, GISLayer, GISDatasetInfo } from "../types/gis";

export const MOCK_GIS_FEATURES: GISFeature[] = [
  {
    id: "1",
    name: "Jodhpur Urban Expansion",
    state: "Rajasthan",
    district: "Jodhpur",
    category: "Urban Expansion",
    theme: "Urbanization",
    latitude: 26.2389,
    longitude: 73.0243,
    value: 34.5,
    unit: "sq km/year",
    description: "Annual urban land expansion rate showing significant growth in peripheral areas.",
    datasetName: "Urban Growth Monitoring Dataset",
    lastUpdated: "2024-03-15"
  },
  {
    id: "2",
    name: "Jaipur Land Disputes",
    state: "Rajasthan",
    district: "Jaipur",
    category: "Land Disputes",
    theme: "Land Disputes",
    latitude: 26.9124,
    longitude: 75.7873,
    value: 127,
    unit: "cases/year",
    description: "Land dispute cases registered in district courts involving title and boundary issues.",
    datasetName: "Land Dispute Tracking System",
    lastUpdated: "2024-02-20"
  },
  {
    id: "3",
    name: "Udaipur Climate Risk",
    state: "Rajasthan",
    district: "Udaipur",
    category: "Climate Risk",
    theme: "Climate & Land",
    latitude: 24.5854,
    longitude: 73.7125,
    value: 67.8,
    unit: "risk index",
    description: "Climate vulnerability index combining water stress, flood risk, and drought susceptibility.",
    datasetName: "Climate Vulnerability Assessment",
    lastUpdated: "2024-01-10"
  },
  {
    id: "4",
    name: "Mumbai Digital Records",
    state: "Maharashtra",
    district: "Mumbai",
    category: "Digital Land Records",
    theme: "Digital Transformation",
    latitude: 19.0760,
    longitude: 72.8777,
    value: 92.3,
    unit: "% digitized",
    description: "Percentage of land records digitized and available in the digital land records system.",
    datasetName: "Digital Land Records Census",
    lastUpdated: "2024-04-05"
  },
  {
    id: "5",
    name: "Pune Land Use Change",
    state: "Maharashtra",
    district: "Pune",
    category: "Land Use",
    theme: "Sustainable Land-Use Planning",
    latitude: 18.5204,
    longitude: 73.8567,
    value: 23.4,
    unit: "% change/year",
    description: "Annual rate of agricultural land conversion to urban and industrial use.",
    datasetName: "Land Use Change Monitoring",
    lastUpdated: "2024-03-01"
  },
  {
    id: "6",
    name: "Ahmedabad Tenure Security",
    state: "Gujarat",
    district: "Ahmedabad",
    category: "Tenure",
    theme: "Tenure Security",
    latitude: 23.0225,
    longitude: 72.5714,
    value: 78.9,
    unit: "security index",
    description: "Tenure security index measuring documentation quality and dispute resolution rates.",
    datasetName: "Tenure Security Assessment",
    lastUpdated: "2024-02-15"
  },
  {
    id: "7",
    name: "Surat Urban Expansion",
    state: "Gujarat",
    district: "Surat",
    category: "Urban Expansion",
    theme: "Urbanization",
    latitude: 21.1702,
    longitude: 72.8311,
    value: 28.7,
    unit: "sq km/year",
    description: "Urban expansion rate along major industrial corridors and riverfront development.",
    datasetName: "Urban Growth Monitoring Dataset",
    lastUpdated: "2024-03-20"
  },
  {
    id: "8",
    name: "Bangalore Land Use",
    state: "Karnataka",
    district: "Bangalore",
    category: "Land Use",
    theme: "Sustainable Land-Use Planning",
    latitude: 12.9716,
    longitude: 77.5946,
    value: 31.2,
    unit: "% change/year",
    description: "Land use change rate showing conversion of peri-urban agricultural land to built-up areas.",
    datasetName: "Land Use Change Monitoring",
    lastUpdated: "2024-04-01"
  },
  {
    id: "9",
    name: "Mysore Digital Records",
    state: "Karnataka",
    district: "Mysore",
    category: "Digital Land Records",
    theme: "Digital Transformation",
    latitude: 12.2958,
    longitude: 76.6394,
    value: 87.5,
    unit: "% digitized",
    description: "Digital land records penetration rate in the district with online access availability.",
    datasetName: "Digital Land Records Census",
    lastUpdated: "2024-02-28"
  },
  {
    id: "10",
    name: "Lucknow Land Disputes",
    state: "Uttar Pradesh",
    district: "Lucknow",
    category: "Land Disputes",
    theme: "Land Disputes",
    latitude: 26.8467,
    longitude: 80.9462,
    value: 145,
    unit: "cases/year",
    description: "Land dispute cases involving inheritance, boundary, and title documentation issues.",
    datasetName: "Land Dispute Tracking System",
    lastUpdated: "2024-03-10"
  },
  {
    id: "11",
    name: "Kanpur Climate Risk",
    state: "Uttar Pradesh",
    district: "Kanpur",
    category: "Climate Risk",
    theme: "Climate & Land",
    latitude: 26.4499,
    longitude: 80.3319,
    value: 58.3,
    unit: "risk index",
    description: "Climate risk assessment focusing on flood vulnerability and industrial pollution impacts.",
    datasetName: "Climate Vulnerability Assessment",
    lastUpdated: "2024-01-25"
  },
  {
    id: "12",
    name: "Indore Urban Expansion",
    state: "Madhya Pradesh",
    district: "Indore",
    category: "Urban Expansion",
    theme: "Urbanization",
    latitude: 22.7196,
    longitude: 75.8577,
    value: 25.6,
    unit: "sq km/year",
    description: "Urban expansion rate driven by industrial development and residential growth on city outskirts.",
    datasetName: "Urban Growth Monitoring Dataset",
    lastUpdated: "2024-03-05"
  },
  {
    id: "13",
    name: "Bhopal Land Use",
    state: "Madhya Pradesh",
    district: "Bhopal",
    category: "Land Use",
    theme: "Sustainable Land-Use Planning",
    latitude: 23.2599,
    longitude: 77.4126,
    value: 19.8,
    unit: "% change/year",
    description: "Land use change rate with focus on peri-urban development and green belt conversion.",
    datasetName: "Land Use Change Monitoring",
    lastUpdated: "2024-02-10"
  },
  {
    id: "14",
    name: "Hyderabad Tenure Security",
    state: "Telangana",
    district: "Hyderabad",
    category: "Tenure",
    theme: "Tenure Security",
    latitude: 17.3850,
    longitude: 78.4867,
    value: 82.1,
    unit: "security index",
    description: "Tenure security index reflecting documentation completeness and dispute resolution efficiency.",
    datasetName: "Tenure Security Assessment",
    lastUpdated: "2024-04-15"
  },
  {
    id: "15",
    name: "Warangal Land Disputes",
    state: "Telangana",
    district: "Warangal",
    category: "Land Disputes",
    theme: "Land Disputes",
    latitude: 18.0004,
    longitude: 79.5844,
    value: 98,
    unit: "cases/year",
    description: "Land dispute cases related to agricultural land acquisition and inheritance disputes.",
    datasetName: "Land Dispute Tracking System",
    lastUpdated: "2024-03-25"
  },
  {
    id: "16",
    name: "Nagpur Climate Risk",
    state: "Maharashtra",
    district: "Nagpur",
    category: "Climate Risk",
    theme: "Climate & Land",
    latitude: 21.1458,
    longitude: 79.0882,
    value: 54.6,
    unit: "risk index",
    description: "Climate vulnerability index focusing on heat stress and water scarcity in urban areas.",
    datasetName: "Climate Vulnerability Assessment",
    lastUpdated: "2024-01-20"
  },
  {
    id: "17",
    name: "Nashik Digital Records",
    state: "Maharashtra",
    district: "Nashik",
    category: "Digital Land Records",
    theme: "Digital Transformation",
    latitude: 19.9975,
    longitude: 73.7898,
    value: 85.7,
    unit: "% digitized",
    description: "Digital land records coverage showing rural and urban area digitization status.",
    datasetName: "Digital Land Records Census",
    lastUpdated: "2024-02-05"
  },
  {
    id: "18",
    name: "Vadodara Land Use",
    state: "Gujarat",
    district: "Vadodara",
    category: "Land Use",
    theme: "Sustainable Land-Use Planning",
    latitude: 22.3107,
    longitude: 73.1812,
    value: 21.3,
    unit: "% change/year",
    description: "Land use change rate with emphasis on industrial corridor development and residential expansion.",
    datasetName: "Land Use Change Monitoring",
    lastUpdated: "2024-03-12"
  },
  {
    id: "19",
    name: "Rajkot Tenure Security",
    state: "Gujarat",
    district: "Rajkot",
    category: "Tenure",
    theme: "Tenure Security",
    latitude: 22.3039,
    longitude: 70.8022,
    value: 76.4,
    unit: "security index",
    description: "Tenure security assessment measuring record accuracy and dispute prevalence.",
    datasetName: "Tenure Security Assessment",
    lastUpdated: "2024-04-10"
  },
  {
    id: "20",
    name: "Bhubaneswar Urban Expansion",
    state: "Odisha",
    district: "Khordha",
    category: "Urban Expansion",
    theme: "Urbanization",
    latitude: 20.2961,
    longitude: 85.8245,
    value: 22.1,
    unit: "sq km/year",
    description: "Urban expansion rate around the capital city with focus on institutional and residential development.",
    datasetName: "Urban Growth Monitoring Dataset",
    lastUpdated: "2024-02-18"
  }
];

export const GIS_CATEGORIES = [
  "Land Use",
  "Urban Expansion", 
  "Land Disputes",
  "Tenure",
  "Climate Risk",
  "Digital Land Records"
] as const;

export const GIS_THEMES = [
  "Climate & Land",
  "Urbanization",
  "Land Disputes",
  "Sustainable Land-Use Planning",
  "Geospatial Governance",
  "Digital Transformation",
  "Tenure Security"
] as const;

export const GIS_STATES = [
  "Rajasthan",
  "Maharashtra",
  "Gujarat",
  "Karnataka",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Telangana",
  "Odisha"
];

export const GIS_DISTRICTS = [
  "Jodhpur",
  "Jaipur",
  "Udaipur",
  "Mumbai",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Bangalore",
  "Mysore",
  "Lucknow",
  "Kanpur",
  "Indore",
  "Bhopal",
  "Hyderabad",
  "Warangal",
  "Nagpur",
  "Nashik",
  "Vadodara",
  "Rajkot",
  "Khordha"
];

export const GIS_DATASETS = [
  "Urban Growth Monitoring Dataset",
  "Land Dispute Tracking System",
  "Climate Vulnerability Assessment",
  "Digital Land Records Census",
  "Land Use Change Monitoring",
  "Tenure Security Assessment"
];

export const GIS_LAYERS: GISLayer[] = [
  {
    id: "land-use",
    name: "Land Use",
    category: "Land Use",
    color: "#138808",
    enabled: true
  },
  {
    id: "urban-expansion",
    name: "Urban Expansion",
    category: "Urban Expansion",
    color: "#FF9933",
    enabled: true
  },
  {
    id: "land-disputes",
    name: "Land Disputes",
    category: "Land Disputes",
    color: "#D64545",
    enabled: true
  },
  {
    id: "tenure",
    name: "Tenure",
    category: "Tenure",
    color: "#0B3D91",
    enabled: false
  },
  {
    id: "climate-risk",
    name: "Climate Risk",
    category: "Climate Risk",
    color: "#E8A33D",
    enabled: false
  },
  {
    id: "digital-records",
    name: "Digital Land Records",
    category: "Digital Land Records",
    color: "#8B5CF6",
    enabled: false
  }
];

export const GIS_DATASET_INFO: GISDatasetInfo = {
  name: "Land Governance GIS Prototype Dataset",
  description: "Prototype geospatial dataset for demonstrating the GIS Explorer functionality. Contains representative features across multiple Indian states showing various land governance indicators.",
  coverage: "8 states, 20 districts",
  featureCount: 20,
  lastUpdated: "2024-04-15",
  source: "Prototype dataset for demonstration"
};
