import { getStoredSession, isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase";

export interface CreateChallengeInput {
  trackingId: string;
  title: string;
  description: string;
  currentSituation?: string;
  desiredOutcome: string;
  domain?: string;
  district: string;
  block?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  affectedPopulation: number;
  tags?: string[];
  aiAnalysis?: unknown;
}

export async function createChallenge(input: CreateChallengeInput) {
  if (!isSupabaseConfigured) return null;
  const session = getStoredSession();
  if (!session) throw new Error("Please sign in before submitting a challenge.");

  const response = await fetch(`${SUPABASE_URL}/rest/v1/challenges`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      tracking_id: input.trackingId,
      title: input.title,
      description: input.description,
      current_situation: input.currentSituation || null,
      desired_outcome: input.desiredOutcome,
      domain: input.domain || null,
      district: input.district,
      block: input.block || null,
      village: input.village || null,
      latitude: input.latitude,
      longitude: input.longitude,
      priority: input.priority,
      affected_population: input.affectedPopulation,
      submitted_by: session.user.id,
      tags: input.tags || [],
      ai_analysis: input.aiAnalysis || null,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.details || "Challenge could not be saved.");
  return data?.[0] ?? null;
}
