import type { EvidenceFile } from "@/types";

export interface SubmissionAIInput {
  title: string;
  description: string;
  affectedPopulation: number;
  duration: string;
  visibleSymptoms: string;
  evidence: EvidenceFile[];
  location: {
    district: string;
    block: string;
    village: string;
    gps: string;
  };
}

/**
 * Step 1 adapter: normalizes citizen input into a multimodal-ready payload.
 * The next AI step can send this shape to a secure backend/VLM service.
 */
export function buildSubmissionAIInput(input: SubmissionAIInput): SubmissionAIInput {
  return {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    duration: input.duration.trim(),
    visibleSymptoms: input.visibleSymptoms.trim(),
    location: {
      district: input.location.district.trim(),
      block: input.location.block.trim(),
      village: input.location.village.trim(),
      gps: input.location.gps.trim(),
    },
    evidence: input.evidence.map((file) => ({
      ...file,
      name: file.name.trim(),
    })),
  };
}
