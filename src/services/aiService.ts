import type { AIAnalysis, Challenge, Domain, University, IndustryPartner, EvidenceFile } from "@/types";
import { UNIVERSITIES, INDUSTRY_PARTNERS, CHALLENGES } from "@/data/demoData";

const DOMAIN_KEYWORDS: Record<Domain, string[]> = {
  Water: ["water", "pump", "borewell", "irrigation", "groundwater", "drink"],
  Agriculture: ["farm", "crop", "cold storage", "vegetable", "yield", "produce"],
  Healthcare: ["health", "hospital", "medicine", "vaccine", "clinic", "disease"],
  Education: ["school", "student", "attendance", "learning", "teacher"],
  Environment: ["pollution", "air quality", "subsidence", "waste", "ecology"],
  Energy: ["solar", "electricity", "power", "grid", "energy"],
  "Urban Development": ["city", "urban", "municipal", "traffic"],
  Accessibility: ["disability", "accessible", "ramp", "inclusive"],
  "Public Administration": ["record", "grievance", "office", "government service"],
  "Rural Livelihoods": ["livelihood", "skill", "employment", "youth"],
  Sanitation: ["sanitation", "toilet", "sewage", "compost", "hygiene"],
  Infrastructure: ["road", "bridge", "culvert", "construction"],
};

function detectDomain(text: string): Domain {
  const lower = text.toLowerCase();
  let best: Domain = "Public Administration";
  let bestScore = 0;
  (Object.keys(DOMAIN_KEYWORDS) as Domain[]).forEach((domain) => {
    const score = DOMAIN_KEYWORDS[domain].filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; best = domain; }
  });
  return best;
}

function scoreImpact(population: number): number {
  if (population > 8000) return 4.8;
  if (population > 4000) return 4.4;
  if (population > 1500) return 4.0;
  return 3.4;
}

const DOMAIN_DISCIPLINES: Record<Domain, string[]> = {
  Water: ["Civil Engineering", "Environmental Engineering", "Electronics", "Computer Science"],
  Agriculture: ["Agriculture Science", "Mechanical Engineering", "Environmental Science"],
  Healthcare: ["Biomedical Engineering", "Public Health", "Computer Science"],
  Education: ["Computer Science", "Education", "UX Design"],
  Environment: ["Environmental Engineering", "Geoscience", "Data Science"],
  Energy: ["Electrical Engineering", "Renewable Energy", "Mechanical Engineering"],
  "Urban Development": ["Urban Planning", "Civil Engineering", "Data Science"],
  Accessibility: ["Design", "Civil Engineering", "Social Work"],
  "Public Administration": ["Public Policy", "Computer Science", "Public Administration"],
  "Rural Livelihoods": ["Social Work", "Management", "Data Science"],
  Sanitation: ["Environmental Engineering", "Civil Engineering", "Public Health"],
  Infrastructure: ["Civil Engineering", "Structural Engineering", "Geotechnical Engineering"],
};

const DOMAIN_TECH: Record<Domain, string[]> = {
  Water: ["IoT Sensors", "GIS", "Predictive Analytics", "Cloud Monitoring"],
  Agriculture: ["IoT Sensors", "Solar Cold Chain", "Mobile Apps"],
  Healthcare: ["Telemedicine Kiosks", "IoT Sensors", "Cloud Monitoring"],
  Education: ["Offline-first Apps", "Cloud Sync", "Learning Analytics"],
  Environment: ["Sensor Networks", "GIS", "Predictive Analytics"],
  Energy: ["Solar Micro-grids", "IoT Sensors", "Battery Management"],
  "Urban Development": ["GIS", "Traffic Analytics", "Mobile Apps"],
  Accessibility: ["Assistive Hardware", "Mobile Apps", "Route Planning Tools"],
  "Public Administration": ["Workflow Automation", "Cloud Monitoring", "Digital Records"],
  "Rural Livelihoods": ["Mobile Apps", "Matching Algorithms", "Cloud Monitoring"],
  Sanitation: ["IoT Sensors", "Composting Tech", "Mobile Apps"],
  Infrastructure: ["GIS", "Structural Sensors", "Predictive Analytics"],
};

export async function classifyChallenge(input: {
  title: string;
  description: string;
  affectedPopulation: number;
  evidence?: EvidenceFile[];
  location?: { district?: string; block?: string; village?: string; gps?: string };
}): Promise<AIAnalysis> {
  await delay(1200);
  const domain = detectDomain(`${input.title} ${input.description}`);
  const impactScore = scoreImpact(input.affectedPopulation);
  const priority: AIAnalysis["priority"] = impactScore >= 4.6 ? "Critical" : impactScore >= 4.2 ? "High" : impactScore >= 3.8 ? "Medium" : "Low";
  const evidenceQuality = input.evidence?.length ? Math.min(0.98, 0.65 + input.evidence.length * 0.08) : 0.35;
  return {
    domain,
    priority,
    impactScore,
    relatedDomains: relatedDomainsFor(domain),
    potentialSkills: DOMAIN_DISCIPLINES[domain],
    suggestedTechnologies: DOMAIN_TECH[domain],
    duplicateRisk: await duplicateRiskFor(input.title, input.description, input.location),
    problemDetected: Boolean(input.title.trim() && input.description.trim() && input.evidence?.length),
    confidence: Math.min(0.96, 0.58 + evidenceQuality * 0.35),
    evidenceQuality,
  };
}

function relatedDomainsFor(domain: Domain): string[] {
  const map: Partial<Record<Domain, string[]>> = {
    Water: ["IoT", "Civil Engineering", "Environmental Science"],
    Agriculture: ["Renewable Energy", "Supply Chain", "Mechanical Systems"],
    Healthcare: ["Biomedical Devices", "Connectivity", "Public Health"],
    Environment: ["Geoscience", "Sensor Networks", "Policy"],
  };
  return map[domain] ?? ["Systems Engineering", "Data Science", "Public Policy"];
}

async function duplicateRiskFor(title: string, description: string, location?: { district?: string }): Promise<AIAnalysis["duplicateRisk"]> {
  await delay(300);
  const text = `${title} ${description}`.toLowerCase();
  const words = text.split(/\s+/).filter((w) => w.length > 4);
  const matches = CHALLENGES.filter((c) => {
    const sameDistrict = location?.district ? c.district.toLowerCase() === location.district.toLowerCase() : false;
    return sameDistrict && words.some((w) => c.title.toLowerCase().includes(w));
  });
  if (matches.length >= 2) return "High";
  if (matches.length >= 1) return "Medium";
  return "Low";
}

export async function matchInstitutions(domain: Domain, tags: string[]): Promise<University[]> {
  await delay(900);
  const scored = UNIVERSITIES.map((u) => {
    const overlap = u.expertise.filter((e) => tags.some((t) => e.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(e.toLowerCase()))).length;
    const domainBonus = DOMAIN_DISCIPLINES[domain].some((d) => u.departments.includes(d)) ? 12 : 0;
    return { ...u, matchScore: Math.min(97, 60 + overlap * 8 + domainBonus) };
  });
  return scored.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)).slice(0, 4);
}

export async function matchIndustryPartners(domain: Domain): Promise<IndustryPartner[]> {
  await delay(700);
  const relevant: Partial<Record<Domain, string[]>> = {
    Water: ["ind-aquatech", "ind-cmpdi"], Energy: ["ind-jharkhand-solar", "ind-greenrise"], Healthcare: ["ind-healthbridge", "ind-tcs"], Agriculture: ["ind-jharkhand-solar", "ind-startup-agrisense"], Environment: ["ind-cmpdi", "ind-tata-steel"], Education: ["ind-cloudnine-edu", "ind-tcs"],
  };
  const ids = relevant[domain] ?? INDUSTRY_PARTNERS.slice(0, 3).map((p) => p.id);
  return INDUSTRY_PARTNERS.filter((p) => ids.includes(p.id));
}

export async function recommendSolutionDirections(analysis: AIAnalysis): Promise<string[]> {
  await delay(500);
  return [
    `Deploy a ${analysis.suggestedTechnologies[0].toLowerCase()} network for real-time monitoring`,
    `Partner with local ${analysis.potentialSkills[0].toLowerCase()} researchers for field validation`,
    `Pilot in one village/ward cluster before scaling district-wide`,
    `Design for low connectivity and minimal maintenance overhead`,
  ];
}

function delay(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

export function generateTrackingId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(100000 + Math.random() * 899999);
  return `JIC-${year}-${num}`;
}

export function findChallengeByTrackingId(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.trackingId.toLowerCase() === id.trim().toLowerCase());
}
