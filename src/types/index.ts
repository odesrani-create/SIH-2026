export type Priority = "Low" | "Medium" | "High" | "Critical";

export type ChallengeStatus =
  | "Submitted"
  | "Under Review"
  | "Validated"
  | "University Assigned"
  | "Research Started"
  | "Prototype"
  | "Pilot"
  | "Implemented";

export type Domain =
  | "Education"
  | "Agriculture"
  | "Healthcare"
  | "Water"
  | "Environment"
  | "Energy"
  | "Urban Development"
  | "Accessibility"
  | "Public Administration"
  | "Rural Livelihoods"
  | "Sanitation"
  | "Infrastructure";

export interface District {
  name: string;
  challenges: number;
  activeProjects: number;
  universities: number;
  solutions: number;
  impact: string;
}

export interface Challenge {
  id: string;
  trackingId: string;
  title: string;
  description: string;
  currentSituation: string;
  desiredOutcome: string;
  domain: Domain;
  district: string;
  block?: string;
  village?: string;
  priority: Priority;
  status: ChallengeStatus;
  affectedPopulation: number;
  submittedBy: string;
  submittedDate: string;
  tags: string[];
  image: string;
  assignedUniversity?: string;
  matchScore?: number;
}

export interface ChallengeContribution {
  id: string;
  challengeId: string;
  name: string;
  role: "Student" | "Teacher" | "University";
  organization: string;
  contribution: string;
  stars: number;
}

export interface AIAnalysis {
  domain: Domain;
  priority: Priority;
  impactScore: number;
  impactFactors: {
    population: number;
    duration: number;
    severity: number;
    essentialService: number;
    geographicSpread: number;
    evidenceConfidence: number;
    vulnerableGroups: number;
  };
  relatedDomains: string[];
  potentialSkills: string[];
  suggestedTechnologies: string[];
  duplicateRisk: "Low" | "Medium" | "High";
  matchedUniversities: University[];
  matchedIndustryPartners: IndustryPartner[];
  teamFormation: TeamFormation | null;
}

export interface SubmissionValidation {
  credible: boolean;
  confidence: number;
  reason: string;
  primaryDomain: Domain;
  relatedDomains: string[];
  duplicateRisk: "Low" | "Medium" | "High";
  similarChallenges: {
    id: string;
    title: string;
    trackingId: string;
    district: string;
    similarity: number;
  }[];
  problemCategory: string;
  missingInformation: string[];
  needsMoreEvidence: boolean;
  evidence: {
    sufficient: boolean;
    relevant: "Likely" | "Unclear";
    clear: "Likely" | "Unclear";
    possibleDuplicates: number;
    possibleManipulation: number;
  };
}

export interface EvidenceMetadata {
  id: string;
  name: string;
  type: string;
  category: "Image" | "Video" | "Document" | "Other";
  sizeBytes: number;
  sizeLabel: string;
  width?: number;
  height?: number;
  relevant: "Likely" | "Unclear";
  clear: "Likely" | "Unclear";
  possibleDuplicate: boolean;
  possibleManipulation: boolean;
}

export interface University {
  id: string;
  name: string;
  district: string;
  departments: string[];
  expertise: string[];
  matchScore?: number;
  assignedChallenges: number;
  activeProjects: number;
  studentResearchers: number;
  industryCollaborations: number;
  logo: string;
}

export interface IndustryPartner {
  id: string;
  name: string;
  technologyArea: string;
  support: string[];
  district: string;
  activeCollaborations: number;
  logo: string;
  matchScore?: number;
}

export interface Milestone {
  id: string;
  label: string;
  status: "done" | "active" | "upcoming";
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  discipline: string;
}

export interface TeamFormation {
  university: string;
  facultyMentor: TeamMember;
  students: TeamMember[];
}

export interface Project {
  id: string;
  title: string;
  challengeId: string;
  university: string;
  district: string;
  domain: Domain;
  status: string;
  progress: number;
  team: TeamMember[];
  industryPartners: string[];
  milestones: Milestone[];
  documents: { name: string; type: string; date: string }[];
}

export interface ImpactStory {
  id: string;
  title: string;
  district: string;
  before: string;
  solution: string;
  impactPoints: string[];
  image: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "status" | "assignment" | "team" | "industry" | "milestone" | "approval" | "pilot";
}

export type UserRole = "citizen" | "university" | "student" | "faculty" | "industry" | "government";

export interface DemoUser {
  name: string;
  role: UserRole;
  organization?: string;
}
