import { CHALLENGES } from "@/data/demoData";
import { supabase } from "@/lib/supabase";
import type { Challenge, Domain, EvidenceMetadata, Priority, SubmissionValidation } from "@/types";

const LOCAL_SUBMISSIONS_KEY = "jic-submitted-challenges";

export interface ChallengeSubmission {
  trackingId: string;
  title: string;
  description: string;
  duration: string;
  symptoms: string;
  category: string;
  affectedGroup: string;
  population: number;
  district: string;
  block: string;
  village: string;
  gps: string;
  outcome: string;
  domain: Domain;
  priority: Priority;
  duplicateRisk: SubmissionValidation["duplicateRisk"];
  submittedBy: string;
  validation: SubmissionValidation;
  evidence: EvidenceMetadata[];
}

function toChallenge(record: ChallengeSubmission & { id?: string; created_at?: string }): Challenge {
  return {
    id: record.id ?? record.trackingId,
    trackingId: record.trackingId,
    title: record.title,
    description: record.description,
    currentSituation: record.symptoms,
    desiredOutcome: record.outcome,
    domain: record.domain,
    district: record.district,
    block: record.block || undefined,
    village: record.village || undefined,
    priority: record.priority,
    status: "Submitted",
    affectedPopulation: record.population,
    submittedBy: record.submittedBy,
    submittedDate: record.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    tags: [record.domain],
    image: "community-report",
  };
}

function readLocalSubmissions(): Challenge[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(LOCAL_SUBMISSIONS_KEY) ?? "[]") as (ChallengeSubmission & { id?: string; created_at?: string })[];
    return stored.map(toChallenge);
  } catch {
    return [];
  }
}

export async function listSubmittedChallenges(): Promise<Challenge[]> {
  if (!supabase) return readLocalSubmissions();

  const { data, error } = await supabase
    .from("challenges")
    .select("id, tracking_id, title, description, duration, symptoms, category, affected_group, population, district, block, village, gps, outcome, domain, priority, duplicate_risk, submitted_by, validation, evidence, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Unable to load submitted challenges from Supabase. Using local records.", error.message);
    return readLocalSubmissions();
  }

  return (data ?? []).map((record) => toChallenge({
    id: record.id,
    trackingId: record.tracking_id,
    title: record.title,
    description: record.description,
    duration: record.duration ?? "",
    symptoms: record.symptoms ?? "",
    category: record.category ?? "",
    affectedGroup: record.affected_group ?? "",
    population: record.population ?? 0,
    district: record.district,
    block: record.block ?? "",
    village: record.village ?? "",
    gps: record.gps ?? "",
    outcome: record.outcome ?? "",
    domain: record.domain,
    priority: record.priority,
    duplicateRisk: record.duplicate_risk,
    submittedBy: record.submitted_by ?? "Community reporter",
    validation: record.validation,
    evidence: record.evidence ?? [],
    created_at: record.created_at,
  }));
}

export async function saveChallenge(submission: ChallengeSubmission): Promise<void> {
  if (!supabase) {
    let stored: ChallengeSubmission[] = [];
    try {
      stored = JSON.parse(window.localStorage.getItem(LOCAL_SUBMISSIONS_KEY) ?? "[]") as ChallengeSubmission[];
    } catch {
      stored = [];
    }
    window.localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify([...stored, submission]));
    return;
  }

  const { error } = await supabase.from("challenges").insert({
    tracking_id: submission.trackingId,
    title: submission.title,
    description: submission.description,
    duration: submission.duration,
    symptoms: submission.symptoms,
    category: submission.category,
    affected_group: submission.affectedGroup,
    population: submission.population,
    district: submission.district,
    block: submission.block,
    village: submission.village,
    gps: submission.gps,
    outcome: submission.outcome,
    domain: submission.domain,
    priority: submission.priority,
    duplicate_risk: submission.duplicateRisk,
    submitted_by: submission.submittedBy,
    validation: submission.validation,
    evidence: submission.evidence,
  });

  if (error) throw new Error(`Could not save challenge: ${error.message}`);
}

export async function uploadEvidenceFiles(files: File[], trackingId: string, metadata: EvidenceMetadata[]): Promise<EvidenceMetadata[]> {
  if (!supabase || files.length === 0) return metadata;
  const client = supabase;

  const uploaded = await Promise.all(files.map(async (file, index) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${trackingId}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await client.storage.from("challenge-evidence").upload(storagePath, file, { upsert: false, contentType: file.type || undefined });
    if (error) throw new Error(`Could not upload evidence: ${error.message}`);
    return { ...metadata[index], storagePath };
  }));

  return uploaded;
}

export async function findChallengeByTrackingIdFromServer(trackingId: string): Promise<Challenge | undefined> {
  const normalizedTrackingId = trackingId.trim().toLowerCase();
  if (!supabase) return [...CHALLENGES, ...readLocalSubmissions()].find((challenge) => challenge.trackingId.toLowerCase() === normalizedTrackingId);
  const { data } = await supabase.from("challenges").select("*").eq("tracking_id", trackingId.trim()).maybeSingle();
  if (!data) return CHALLENGES.find((challenge) => challenge.trackingId.toLowerCase() === normalizedTrackingId);
  return toChallenge({
    id: data.id,
    trackingId: data.tracking_id,
    title: data.title,
    description: data.description,
    duration: data.duration ?? "",
    symptoms: data.symptoms ?? "",
    category: data.category ?? "",
    affectedGroup: data.affected_group ?? "",
    population: data.population ?? 0,
    district: data.district,
    block: data.block ?? "",
    village: data.village ?? "",
    gps: data.gps ?? "",
    outcome: data.outcome ?? "",
    domain: data.domain,
    priority: data.priority,
    duplicateRisk: data.duplicate_risk,
    submittedBy: data.submitted_by ?? "Community reporter",
    validation: data.validation,
    evidence: data.evidence ?? [],
    created_at: data.created_at,
  });
}