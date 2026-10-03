export type ScreenId =
  | 'talent-map'
  | 'value-map'
  | 'dashboard-ejecutivo'
  | 'puestos'
  | 'empleados'
  | 'reclutamiento'
  | 'evaluacion-desempeno'
  | 'capacitacion-upskilling'
  | 'reportes-metricas';

export interface TalentPerson {
  id: string;
  name: string;
  role: string;
  squad: string;
  location: string;
  avatar: string;
  criticality: number;
  skills: Array<{
    name: string;
    /** Nombre técnico original, se muestra como referencia secundaria. */
    technicalName?: string;
    level: number;
    dna: string;
    verified: boolean;
  }>;
  activities: Array<{
    title: string;
    description: string;
  }>;
  riskStatus: 'optimal' | 'moderate' | 'spof';
}

export interface EmployeeProfile {
  id: string;
  empId: string;
  name: string;
  role: string;
  area: string;
  tenure: string;
  avatar: string;
  email: string;
  phone: string;
  contract: string;
  location: string;
  salaryBand: string;
  percentile: string;
  supervisor: {
    name: string;
    role: string;
    avatar: string;
  };
  roleMatch: number;
  gFactor: number;
  status: string;
  badge: string;
  spectrumSkills: Array<{
    label: string;
    value: number; // 0-100
    category: 'hard' | 'soft' | 'gap';
  }>;
  hardSkills: Array<{
    name: string;
    /** Nombre técnico original, se muestra como referencia secundaria. */
    technicalName?: string;
    actual: number;
    required: number;
    gap: number;
    statusText: string;
  }>;
  softSkills: Array<{
    name: string;
    actual: number;
    required: number;
    gap: number;
    statusText: string;
  }>;
  recommendedTraining: {
    title: string;
    hours: string;
    description: string;
    perks: string[];
    gapTarget: string;
  };
  reviews: Array<{
    author: string;
    role: string;
    timeAgo: string;
    comment: string;
    avatar: string;
    scores?: { [key: string]: number };
  }>;
  projects: string[];
}

export interface JobPosition {
  code: string;
  title: string;
  department: string;
  status: 'critical' | 'operational';
  activeIncumbentsCount: number;
  complianceRate: number;
  isCalibrated: boolean;
  division: string;
  reportsTo: string;
  supervises: string;
  salaryBand: string;
  incumbents: Array<{
    name: string;
    avatar: string;
  }>;
  mission: string;
  purposeLink: string;
  internalRelations: string;
  externalRelations: string;
  formalAuthority: string;
  responsibilities: Array<{
    number: string;
    title: string;
    description: string;
    standard: string;
  }>;
  workingConditions: {
    modality: string;
    tools: string;
    mobility: string;
  };
  techSkills: Array<{
    name: string;
    /** Nombre técnico original, se muestra como referencia secundaria. */
    technicalName?: string;
    description: string;
    level: number;
    observedBehavior: string;
  }>;
  softSkills: Array<{
    name: string;
    description: string;
    level: number;
    observedBehavior: string;
  }>;
}

export interface Candidate {
  id: string;
  rank: number;
  name: string;
  title: string;
  experience: string;
  avatar: string;
  matchScore: number;
  matchLabel: string;
  techScore: number;
  softScore: number;
  strengths: string;
  notes?: string;
  radarScores: {
    kubernetes: number;
    zeroTrust: number;
    commExec: number;
    negotiation: number;
    finOps: number;
  };
}

export interface PorterActivity {
  id: number;
  step: string;
  name: string;
  subname: string;
  coverage: number;
  coverageStatus: 'optimal' | 'alert' | 'high';
  keyRoles: string[];
  topSkills: string;
  description: string;
  headcount: number;
  costEfficiency: string;
  rolesList: Array<{
    name: string;
    count: string;
    impact: string;
    icon: string;
  }>;
  topTalent: Array<{
    name: string;
    role: string;
    match: string;
    avatar: string;
    tag: string;
    impactText: string;
  }>;
  skillsMatrix: Array<{
    name: string;
    /** Nombre técnico original, se muestra como referencia secundaria. */
    technicalName?: string;
    actual: number;
    expected: number;
    note: string;
    status: 'optimal' | 'gap' | 'high';
  }>;
  aiRecommendation: string;
}
