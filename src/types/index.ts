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

export interface AIAnalysis {
  domain: Domain;
  priority: Priority;
  impactScore: number;
  relatedDomains: string[];
  potentialSkills: string[];
  suggestedTechnologies: string[];
  duplicateRisk: "Low" | "Medium" | "High";
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
