import type { AIAnalysis, Challenge, Domain, University, IndustryPartner, SubmissionValidation, EvidenceMetadata, TeamFormation } from "@/types";
import { UNIVERSITIES, INDUSTRY_PARTNERS, CHALLENGES } from "@/data/demoData";
import { listSubmittedChallenges } from "@/services/challengeRepository";

/**
 * AI service layer — mocked for the prototype.
 *
 * Every function below is written to the shape a real call would take
 * (async, plain-object in / out) so that swapping the mock body for a
 * fetch() to an LLM/API endpoint later requires no change to callers.
 * No API keys live here or anywhere in frontend code — a real integration
 * would proxy through a backend route (e.g. POST /api/ai/classify).
 */

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
    if (score > bestScore) {
      bestScore = score;
      best = domain;
    }
  });
  return best;
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

export async function processEvidenceFiles(files: File[]): Promise<EvidenceMetadata[]> {
  const metadata = await Promise.all(files.map(async (file, index) => {
    const category = file.type.startsWith("image/")
      ? "Image"
      : file.type.startsWith("video/")
      ? "Video"
      : file.type.includes("pdf") || file.type.includes("document") || file.type.includes("text")
      ? "Document"
      : "Other";
    const dimensions = category === "Image" ? await readImageDimensions(file) : {};
    const sizeLabel = file.size < 1024 * 1024
      ? `${Math.max(1, Math.round(file.size / 1024))} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    return {
      id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
      name: file.name,
      type: file.type || "application/octet-stream",
      category,
      sizeBytes: file.size,
      sizeLabel,
      ...dimensions,
      relevant: category === "Other" ? "Unclear" : "Likely",
      clear: category === "Image" && ((dimensions.width ?? 0) < 320 || (dimensions.height ?? 0) < 240) ? "Unclear" : "Likely",
      possibleDuplicate: false,
      possibleManipulation: file.name.toLowerCase().includes("edited") || file.name.toLowerCase().includes("modified"),
    } satisfies EvidenceMetadata;
  }));

  return metadata.map((item, index) => ({
    ...item,
    possibleDuplicate: metadata.some((other, otherIndex) => otherIndex !== index && other.sizeBytes === item.sizeBytes && other.type === item.type),
  }));
}

function readImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    image.src = url;
  });
}

export async function validateSubmission(input: {
  title: string;
  description: string;
  duration?: string;
  symptoms?: string;
  category?: string;
  affectedGroup?: string;
  location?: string;
  gps?: string;
  evidenceFiles?: File[];
  evidenceMetadata?: EvidenceMetadata[];
}): Promise<SubmissionValidation> {
  await delay(600);

  const text = [
    input.title,
    input.description,
    input.duration,
    input.symptoms,
    input.affectedGroup,
    input.location,
    input.gps,
  ].filter(Boolean).join(" ");
  const primaryDomain = detectDomain(text);
  const relatedDomains = relatedDomainsFor(primaryDomain);
  const similarChallenges = findSimilarChallenges(text, primaryDomain, input.location, await listSubmittedChallenges());
  const topSimilarity = similarChallenges[0]?.similarity ?? 0;
  const duplicateRisk: SubmissionValidation["duplicateRisk"] = topSimilarity >= 70
    ? "High"
    : topSimilarity >= 42
    ? "Medium"
    : "Low";

  const hasText = text.trim().length > 40;
  const hasLocation = Boolean(input.location?.trim() || input.gps?.trim());
  const evidenceCount = input.evidenceFiles?.length ?? 0;
  const hasEvidence = evidenceCount > 0;
  const evidenceMetadata = input.evidenceMetadata ?? [];
  const possibleDuplicates = evidenceMetadata.filter((item) => item.possibleDuplicate).length;
  const possibleManipulation = evidenceMetadata.filter((item) => item.possibleManipulation).length;
  const clearEvidence = evidenceMetadata.filter((item) => item.clear === "Likely").length;
  const sufficientEvidence = evidenceMetadata.length > 0 && clearEvidence > 0 && possibleManipulation === 0;
  const hasImageEvidence = evidenceMetadata.some((item) => item.category === "Image");
  const hasMeasuredImage = evidenceMetadata.some((item) => item.category === "Image" && item.width && item.height);
  const missingInformation = [
    !input.gps?.trim() ? "GPS coordinates" : "",
    !input.location?.split(",").slice(1).some(Boolean) ? "Block or village detail" : "",
    !input.affectedGroup?.trim() ? "Who is affected" : "",
    !sufficientEvidence ? "Clear supporting evidence" : "",
  ].filter(Boolean);

  const qualitySignal = [hasText, hasLocation, hasEvidence].filter(Boolean).length;
  const completenessScore = qualitySignal * 10;
  const evidenceScore = sufficientEvidence ? 25 : hasEvidence ? 12 : 0;
  const imageScore = hasMeasuredImage ? 8 : hasImageEvidence ? 3 : 0;
  const score = Math.min(85, 20 + completenessScore + evidenceScore + imageScore - possibleManipulation * 15 - possibleDuplicates * 5);
  const confidence = Math.round(score);
  const credible = confidence >= 55 && hasText && hasLocation;

  if (!credible) {
    return {
      credible: false,
      confidence: Math.max(18, confidence),
      reason: "This initial screening cannot verify that the problem is genuine. The report needs clearer details and stronger, reviewable evidence before it can continue."
      ,
      primaryDomain,
      relatedDomains,
      duplicateRisk,
      similarChallenges,
      problemCategory: primaryDomain,
      missingInformation,
      needsMoreEvidence: true,
      evidence: {
        sufficient: sufficientEvidence,
        relevant: evidenceMetadata.some((item) => item.relevant === "Likely") ? "Likely" : "Unclear",
        clear: clearEvidence > 0 ? "Likely" : "Unclear",
        possibleDuplicates,
        possibleManipulation,
      },
    };
  }

  const reason = sufficientEvidence
    ? "Initial screening found a clear report, location, and reviewable file metadata. This is a confidence estimate, not proof; a human or server-side review is still required."
    : "The report is readable and located, but the available evidence is not sufficient for a strong credibility estimate.";

  return {
    credible: true,
    confidence,
    reason,
    primaryDomain,
    relatedDomains,
    duplicateRisk,
    similarChallenges,
    problemCategory: primaryDomain,
    missingInformation,
    needsMoreEvidence: !sufficientEvidence,
    evidence: {
      sufficient: sufficientEvidence,
      relevant: evidenceMetadata.some((item) => item.relevant === "Likely") ? "Likely" : "Unclear",
      clear: clearEvidence > 0 ? "Likely" : "Unclear",
      possibleDuplicates,
      possibleManipulation,
    },
  };
}

function findSimilarChallenges(text: string, domain: Domain, location?: string, submittedChallenges: Challenge[] = []): SubmissionValidation["similarChallenges"] {
  const newWords = tokenize(text);
  const normalizedLocation = location?.toLowerCase() ?? "";
  const knownChallenges = [...CHALLENGES, ...submittedChallenges];

  return knownChallenges.map((challenge) => {
    const existingText = [challenge.title, challenge.description, challenge.currentSituation, challenge.desiredOutcome].join(" ");
    const existingWords = tokenize(existingText);
    const sharedWords = Array.from(existingWords).filter((word) => newWords.has(word));
    const wordScore = Math.min(60, sharedWords.length * 12);
    const domainScore = challenge.domain === domain ? 20 : 0;
    const challengeLocation = [challenge.district, challenge.block, challenge.village].filter(Boolean).join(" ").toLowerCase();
    const locationScore = normalizedLocation && challengeLocation && normalizedLocation.split(",").some((part) => part.trim().length > 2 && challengeLocation.includes(part.trim().toLowerCase())) ? 20 : 0;
    const similarity = Math.min(99, wordScore + domainScore + locationScore);

    return {
      id: challenge.id,
      title: challenge.title,
      trackingId: challenge.trackingId,
      district: challenge.district,
      similarity,
    };
  }).filter((challenge) => challenge.similarity >= 30).sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}

function tokenize(text: string): Set<string> {
  const stopWords = new Set(["about", "after", "again", "being", "from", "have", "that", "the", "this", "with", "working"]);
  return new Set(text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 3 && !stopWords.has(word)));
}

export async function classifyChallenge(input: {
  title: string;
  description: string;
  duration?: string;
  symptoms?: string;
  category?: string;
  affectedGroup?: string;
  location?: string;
  gps?: string;
  evidenceFiles?: File[];
  expectedOutcome?: string;
  affectedPopulation: number;
  validationConfidence?: number;
}): Promise<AIAnalysis> {
  await delay(1200);
  const domain = detectDomain(`${input.title} ${input.description}`);
  const impactFactors = scoreImpactFactors({
    population: input.affectedPopulation,
    duration: input.duration,
    symptoms: input.symptoms,
    domain,
    location: input.location,
    affectedGroup: input.affectedGroup,
    evidenceConfidence: input.validationConfidence,
  });
  const impactScore = Number((
    impactFactors.population * 0.25 +
    impactFactors.duration * 0.15 +
    impactFactors.severity * 0.15 +
    impactFactors.essentialService * 0.15 +
    impactFactors.geographicSpread * 0.10 +
    impactFactors.evidenceConfidence * 0.10 +
    impactFactors.vulnerableGroups * 0.10
  ).toFixed(1));
  const priority: AIAnalysis["priority"] =
    impactScore >= 4.5 ? "Critical" : impactScore >= 3.5 ? "High" : impactScore >= 2.5 ? "Medium" : "Low";

  return {
    domain,
    priority,
    impactScore,
    impactFactors,
    relatedDomains: relatedDomainsFor(domain),
    potentialSkills: requiredExpertise(`${input.title} ${input.description} ${input.symptoms ?? ""}`, domain),
    suggestedTechnologies: DOMAIN_TECH[domain],
    duplicateRisk: await duplicateRiskFor(input.title),
    matchedUniversities: [],
    matchedIndustryPartners: [],
    teamFormation: null,
  };
}

export function createMultidisciplinaryTeam(university: University | undefined, expertise: string[], domain: Domain): TeamFormation | null {
  if (!university) return null;

  const disciplines = [...new Set([...expertise, ...university.departments])].slice(0, 4);
  return {
    university: university.name,
    facultyMentor: {
      id: `${university.id}-faculty-mentor`,
      name: `Faculty mentor, ${disciplines[0] ?? domain}`,
      role: "Faculty Mentor",
      discipline: disciplines[0] ?? domain,
    },
    students: disciplines.map((discipline, index) => ({
      id: `${university.id}-student-${index}`,
      name: `${discipline} student researcher`,
      role: "Student",
      discipline,
    })),
  };
}

function requiredExpertise(text: string, domain: Domain): string[] {
  const lower = text.toLowerCase();
  const expertise = [...DOMAIN_DISCIPLINES[domain]];

  const additions: Record<string, string[]> = {
    groundwater: ["Hydrology", "Environmental Engineering", "Data Science"],
    borewell: ["Hydrology", "Environmental Engineering"],
    contaminated: ["Environmental Engineering", "Public Health", "Hydrology"],
    pollution: ["Environmental Engineering", "Chemistry", "Data Science"],
    sensor: ["IoT", "Electronics", "Data Science"],
    repeated: ["Reliability Engineering", "Data Science"],
    flood: ["Hydrology", "Civil Engineering", "GIS"],
    crop: ["Agronomy", "Agriculture Science", "Data Science"],
    hospital: ["Public Health", "Healthcare Engineering"],
    school: ["Education", "UX Design", "Computer Science"],
    road: ["Civil Engineering", "Structural Engineering", "GIS"],
  };

  Object.entries(additions).forEach(([keyword, skills]) => {
    if (lower.includes(keyword)) expertise.push(...skills);
  });

  if (domain === "Water" && lower.includes("groundwater")) expertise.push("IoT", "Data Science");
  return [...new Set(expertise)];
}

function scoreImpactFactors(input: {
  population: number;
  duration?: string;
  symptoms?: string;
  domain: Domain;
  location?: string;
  affectedGroup?: string;
  evidenceConfidence?: number;
}): AIAnalysis["impactFactors"] {
  const duration = input.duration?.toLowerCase() ?? "";
  const durationScore = duration.includes("year")
    ? Math.min(5, 3 + (parseNumber(duration) >= 2 ? 2 : 1))
    : duration.includes("month")
    ? Math.min(4, 1 + Math.ceil(parseNumber(duration) / 6))
    : duration.includes("week")
    ? 1.5
    : 1;
  const severityText = `${input.symptoms ?? ""} ${input.affectedGroup ?? ""}`.toLowerCase();
  const severityScore = ["daily", "unsafe", "dead", "failure", "blocked", "emergency", "disease", "outage"].filter((word) => severityText.includes(word)).length;
  const vulnerableScore = ["child", "children", "elderly", "elder", "disability", "pregnant", "patient", "tribal", "farmer"].filter((word) => severityText.includes(word)).length;
  const locationText = input.location?.toLowerCase() ?? "";
  const geographicSpread = /state|district-wide|multiple villages|several villages|region|block-wide/.test(`${locationText} ${severityText}`)
    ? 5
    : /village|block|ward|city/.test(locationText)
    ? 3
    : 1;
  const essentialService = ["Water", "Healthcare", "Energy", "Sanitation"].includes(input.domain) ? 5 : 2.5;

  return {
    population: input.population > 8000 ? 5 : input.population > 4000 ? 4.5 : input.population > 1500 ? 4 : input.population > 500 ? 3 : 1.5,
    duration: durationScore,
    severity: Math.min(5, 1.5 + severityScore),
    essentialService,
    geographicSpread,
    evidenceConfidence: Math.min(5, Math.max(1, (input.evidenceConfidence ?? 60) / 20)),
    vulnerableGroups: Math.min(5, 1 + vulnerableScore),
  };
}

function parseNumber(value: string): number {
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 1;
}

function relatedDomainsFor(domain: Domain): string[] {
  const map: Partial<Record<Domain, string[]>> = {
    Water: ["Civil Engineering", "Environmental Science", "IoT", "Infrastructure"],
    Agriculture: ["Renewable Energy", "Supply Chain", "Mechanical Systems"],
    Healthcare: ["Biomedical Devices", "Connectivity", "Public Health"],
    Environment: ["Geoscience", "Sensor Networks", "Policy"],
  };
  return map[domain] ?? ["Systems Engineering", "Data Science", "Public Policy"];
}

async function duplicateRiskFor(title: string): Promise<AIAnalysis["duplicateRisk"]> {
  const submittedChallenges = await listSubmittedChallenges();
  const matches = findSimilarChallenges(title, detectDomain(title), undefined, submittedChallenges);
  if (matches.some((match) => match.similarity >= 70)) return "High";
  if (matches.some((match) => match.similarity >= 42)) return "Medium";
  return "Low";
}

export async function matchInstitutions(domain: Domain, tags: string[]): Promise<University[]> {
  await delay(900);
  const scored = UNIVERSITIES.map((u) => {
    const overlap = u.expertise.filter((e) =>
      tags.some((t) => e.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(e.toLowerCase()))
    ).length;
    const departmentOverlap = u.departments.filter((department) => tags.some((tag) => department.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(department.toLowerCase()))).length;
    const domainBonus = DOMAIN_DISCIPLINES[domain].some((d) => u.departments.includes(d)) ? 12 : 0;
    return { ...u, matchScore: Math.min(97, 50 + overlap * 8 + departmentOverlap * 6 + domainBonus) };
  });
  return scored.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)).slice(0, 4);
}

export async function matchIndustryPartners(domain: Domain, technologies: string[] = []): Promise<IndustryPartner[]> {
  await delay(700);
  const relevant: Partial<Record<Domain, string[]>> = {
    Water: ["ind-aquatech", "ind-cmpdi"],
    Energy: ["ind-jharkhand-solar", "ind-greenrise"],
    Healthcare: ["ind-healthbridge", "ind-tcs"],
    Agriculture: ["ind-jharkhand-solar", "ind-startup-agrisense"],
    Environment: ["ind-cmpdi", "ind-tata-steel"],
    Education: ["ind-cloudnine-edu", "ind-tcs"],
  };
  const ids = relevant[domain] ?? INDUSTRY_PARTNERS.slice(0, 3).map((p) => p.id);
  return INDUSTRY_PARTNERS.filter((p) => ids.includes(p.id))
    .map((partner) => {
      const technologyMatch = technologies.filter((technology) =>
        partner.technologyArea.toLowerCase().includes(technology.toLowerCase()) ||
        technology.toLowerCase().includes(partner.technologyArea.toLowerCase())
      ).length;
      const supportMatch = partner.support.filter((support) => technologies.some((technology) => technology.toLowerCase().includes(support.toLowerCase()))).length;
      return { ...partner, matchScore: Math.min(98, 70 + technologyMatch * 12 + supportMatch * 5) };
    })
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateTrackingId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(100000 + Math.random() * 899999);
  return `JIC-${year}-${num}`;
}

export function findChallengeByTrackingId(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.trackingId.toLowerCase() === id.trim().toLowerCase());
}
