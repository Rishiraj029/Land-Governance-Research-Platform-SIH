/**
 * Mock innovation data for PAGE 11 — Innovation Portal
 * 
 * IMPORTANT: This is demo/fictional data for frontend development purposes only.
 * Do not use this data for any real research, policy, or government purposes.
 * All innovations, organizations, and submissions are representative examples.
 */

import type {
  Innovation,
  InnovationCategory,
  InnovationStatus,
  InnovationState
} from "../types/innovation";

export const INNOVATION_CATEGORIES: InnovationCategory[] = [
  "GIS & Mapping",
  "Land Records",
  "Climate & Sustainability",
  "Legal & Dispute Resolution",
  "Rural Development",
  "Urban Planning",
  "Digital Governance"
];

export const INNOVATION_STATUSES: InnovationStatus[] = [
  "Submitted",
  "Under Review",
  "Shortlisted",
  "Selected",
  "Not Selected"
];

export const INNOVATION_STATES: InnovationState[] = [
  "Andhra Pradesh",
  "Bihar",
  "Gujarat",
  "Jharkhand",
  "Karnataka",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Delhi",
  "Other"
];

export const MOCK_INNOVATIONS: Innovation[] = [
  {
    id: "inv-1",
    title: "AI-Powered Land Dispute Prediction System",
    description: "Machine learning model that predicts potential land disputes based on historical patterns and socio-economic indicators, enabling proactive intervention.",
    category: "Legal & Dispute Resolution",
    problem: "Land disputes take years to resolve and cause significant economic and social costs. Current systems are reactive rather than preventive.",
    solution: "Our system analyzes court records, land registry data, and socio-economic indicators to identify high-risk areas and flag potential disputes before they escalate.",
    location: "Karnataka",
    organization: "Indian Institute of Technology, Bangalore",
    team: "Dr. Priya Sharma, Rahul Kumar, Ananya Singh",
    contact: "landdispute@iitb.ac.in",
    status: "Shortlisted",
    votes: 127,
    submittedAt: "2024-08-15",
    updatedAt: "2024-09-10",
    featured: true
  },
  {
    id: "inv-2",
    title: "Mobile-Based Land Record Verification for Farmers",
    description: "A simple mobile application that allows farmers to verify land records, check ownership status, and receive alerts about any changes to their land holdings.",
    category: "Land Records",
    problem: "Rural farmers often lack access to land record information and are vulnerable to fraud and illegal transfers.",
    solution: "Our app provides vernacular language support, offline functionality, and integration with state land record portals to empower farmers with real-time land information.",
    location: "Maharashtra",
    organization: "Pune University",
    team: "Prof. Amit Patil, Sunita Deshmukh, Vikram Jadhav",
    contact: "farmland@unipune.ac.in",
    status: "Selected",
    votes: 203,
    submittedAt: "2024-07-20",
    updatedAt: "2024-09-05",
    featured: true
  },
  {
    id: "inv-3",
    title: "Climate-Resilient Land Use Planning Tool",
    description: "GIS-based tool that helps planners assess climate vulnerability and recommend sustainable land use patterns for rural and semi-urban areas.",
    category: "Climate & Sustainability",
    problem: "Climate change is increasing flood and drought risks, but land use planning rarely incorporates climate projections.",
    solution: "Our tool integrates climate models, satellite imagery, and local data to generate climate-resilient land use recommendations with visual maps and actionable insights.",
    location: "Odisha",
    organization: "Bhubaneswar University",
    team: "Dr. Rajesh Mohanty, Priyanka Das, Bikash Rout",
    contact: "climateland@uou.ac.in",
    status: "Under Review",
    votes: 89,
    submittedAt: "2024-08-25",
    updatedAt: "2024-09-12",
    featured: false
  },
  {
    id: "inv-4",
    title: "Blockchain-Based Land Registry Pilot",
    description: "Proof-of-concept implementation using blockchain technology to create an immutable, transparent land registry system for urban properties.",
    category: "Digital Governance",
    problem: "Land registry fraud and tampering remain significant issues despite digitization efforts.",
    solution: "Our blockchain pilot ensures that once a land transaction is recorded, it cannot be altered or deleted, providing enhanced security and trust in the system.",
    location: "Telangana",
    organization: "International Institute of Information Technology, Hyderabad",
    team: "Prof. Venkatesh Iyer, Meghana Reddy, Karthik Sharma",
    contact: "blockchain@iiith.ac.in",
    status: "Under Review",
    votes: 156,
    submittedAt: "2024-08-10",
    updatedAt: "2024-09-08",
    featured: true
  },
  {
    id: "inv-5",
    title: "Satellite-Based Crop Pattern Mapping for Land Records",
    description: "Automated system that uses satellite imagery to map crop patterns and correlate with land record data to identify discrepancies and improve record accuracy.",
    category: "GIS & Mapping",
    problem: "Land records often contain outdated or incorrect information about land use and crop patterns, leading to inefficiencies in planning and subsidy distribution.",
    solution: "Our system processes multi-temporal satellite imagery to classify land use and crop patterns, then cross-references with land records to flag inconsistencies for verification.",
    location: "Punjab",
    organization: "Punjab Agricultural University",
    team: "Dr. Harpreet Singh, Gurpreet Kaur, Amritpal Singh",
    contact: "satland@pau.edu",
    status: "Shortlisted",
    votes: 112,
    submittedAt: "2024-08-05",
    updatedAt: "2024-09-15",
    featured: false
  },
  {
    id: "inv-6",
    title: "Community Land Rights Documentation Platform",
    description: "Digital platform for documenting and preserving community land rights, particularly for tribal and indigenous communities with traditional land holdings.",
    category: "Rural Development",
    problem: "Many tribal and indigenous communities lack formal documentation of their traditional land rights, making them vulnerable to displacement.",
    solution: "Our platform combines participatory mapping, digital documentation, and legal awareness tools to help communities secure recognition of their traditional land rights.",
    location: "Jharkhand",
    organization: "Ranchi University",
    team: "Dr. Sunita Kumari, Rajesh Oraon, Anita Toppo",
    contact: "communityland@ranchiuniv.ac.in",
    status: "Submitted",
    votes: 67,
    submittedAt: "2024-09-01",
    updatedAt: "2024-09-01",
    featured: false
  },
  {
    id: "inv-7",
    title: "Urban Expansion Monitoring System",
    description: "Real-time monitoring system that tracks urban expansion and its impact on agricultural land using satellite data and machine learning.",
    category: "Urban Planning",
    problem: "Unplanned urban expansion is consuming valuable agricultural land, but monitoring is often delayed and reactive.",
    solution: "Our system provides near real-time monitoring of urban growth patterns, identifies unauthorized developments, and helps planners make data-driven decisions about urban expansion.",
    location: "Uttar Pradesh",
    organization: "Indian Institute of Technology, Kanpur",
    team: "Prof. Arun Kumar, Neha Gupta, Vikas Singh",
    contact: "urbanmonitor@iitk.ac.in",
    status: "Selected",
    votes: 178,
    submittedAt: "2024-07-15",
    updatedAt: "2024-09-02",
    featured: true
  },
  {
    id: "inv-8",
    title: "Mobile Court for Land Dispute Resolution",
    description: "Mobile application that facilitates alternative dispute resolution for land conflicts through mediation, arbitration, and simplified legal procedures.",
    category: "Legal & Dispute Resolution",
    problem: "Land dispute resolution is slow, expensive, and inaccessible for rural communities.",
    solution: "Our app provides mobile courts, mediation services, and simplified legal procedures to make dispute resolution faster, cheaper, and more accessible.",
    location: "Gujarat",
    organization: "Gujarat National Law University",
    team: "Prof. Meera Patel, Jayesh Shah, Pooja Joshi",
    contact: "mobilecourt@gnlu.ac.in",
    status: "Under Review",
    votes: 94,
    submittedAt: "2024-08-20",
    updatedAt: "2024-09-11",
    featured: false
  }
];

// Helper functions for localStorage management
const INNOVATION_STORAGE_KEY = "land_governance_innovations";

export const getStoredInnovations = (): Innovation[] => {
  if (typeof window === "undefined") return MOCK_INNOVATIONS;
  try {
    const stored = localStorage.getItem(INNOVATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(INNOVATION_STORAGE_KEY, JSON.stringify(MOCK_INNOVATIONS));
    return MOCK_INNOVATIONS;
  } catch (error) {
    console.error("Error loading innovations from localStorage:", error);
    return MOCK_INNOVATIONS;
  }
};

export const setStoredInnovations = (innovations: Innovation[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INNOVATION_STORAGE_KEY, JSON.stringify(innovations));
  } catch (error) {
    console.error("Error saving innovations to localStorage:", error);
  }
};