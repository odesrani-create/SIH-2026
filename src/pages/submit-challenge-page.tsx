import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  MapPin,
  FileText,
  Target,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Copy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/section-heading";
import { DISTRICT_NAMES, DOMAINS } from "@/data/demoData";
import { classifyChallenge, createMultidisciplinaryTeam, generateTrackingId, matchIndustryPartners, matchInstitutions, processEvidenceFiles } from "@/services/aiService";
import { useAppState } from "@/lib/app-state";
import type { AIAnalysis, EvidenceMetadata, SubmissionValidation } from "@/types";
import { cn } from "@/lib/utils";
import { validateSubmission } from "@/services/aiService";
import { saveChallenge, uploadEvidenceFiles } from "@/services/challengeRepository";

const STEPS = ["Problem Description", "Evidence", "Location", "Symptoms", "Duration", "AI Validation", "Outcome", "Review"];

const ANALYSIS_CHECKS = [
  "Understanding problem",
  "Identifying domain",
  "Detecting duplicate challenges",
  "Estimating priority",
  "Finding relevant expertise",
  "Matching institutions",
];

interface FormData {
  title: string;
  description: string;
  duration: string;
  symptoms: string;
  category: string;
  affectedGroup: string;
  population: string;
  district: string;
  block: string;
  village: string;
  gps: string;
  evidenceFiles: File[];
  evidenceMetadata: EvidenceMetadata[];
  outcome: string;
  validation?: SubmissionValidation;
}

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  duration: "",
  symptoms: "",
  category: "",
  affectedGroup: "",
  population: "",
  district: "",
  block: "",
  village: "",
  gps: "",
  evidenceFiles: [],
  evidenceMetadata: [],
  outcome: "",
};

type Phase = "form" | "analyzing" | "success";

export function SubmitChallengePage() {
  const { goTo, user } = useAppState();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [phase, setPhase] = useState<Phase>("form");
  const [checksDone, setChecksDone] = useState(0);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [trackingId, setTrackingId] = useState("");
  const [submissionError, setSubmissionError] = useState("");

  const update = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }));

  const canProceed = () => {
    if (step === 0) return form.title.trim().length > 3 && form.description.trim().length > 10;
    if (step === 2) return form.district.length > 0;
    if (step === 3) return form.symptoms.trim().length > 5;
    if (step === 4) return form.duration.trim().length > 0;
    if (step === 5) return !!form.validation && form.validation.credible && !form.validation.needsMoreEvidence && form.validation.duplicateRisk !== "High";
    if (step === 6) return form.outcome.trim().length > 5;
    return true;
  };

  const runValidation = async () => {
    const result = await validateSubmission({
      title: form.title,
      description: form.description,
      duration: form.duration,
      symptoms: form.symptoms,
      category: form.category,
      affectedGroup: form.affectedGroup,
      location: [form.district, form.block, form.village].filter(Boolean).join(", "),
      gps: form.gps,
      evidenceFiles: form.evidenceFiles,
      evidenceMetadata: form.evidenceMetadata,
    });
    update({ validation: result });
  };

  const submit = async () => {
    if (!form.validation) return;
    setPhase("analyzing");
    setSubmissionError("");
    setChecksDone(0);
    const interval = setInterval(() => {
      setChecksDone((n) => Math.min(n + 1, ANALYSIS_CHECKS.length));
    }, 550);

    try {
      const result = await classifyChallenge({
        title: form.title,
        description: form.description,
        duration: form.duration,
        symptoms: form.symptoms,
        category: form.category,
        affectedGroup: form.affectedGroup,
        location: [form.district, form.block, form.village].filter(Boolean).join(", "),
        gps: form.gps,
        evidenceFiles: form.evidenceFiles,
        expectedOutcome: form.outcome,
        affectedPopulation: Number(form.population) || 500,
        validationConfidence: form.validation.confidence,
      });
      const matchedUniversities = await matchInstitutions(result.domain, result.potentialSkills);
      const matchedIndustryPartners = await matchIndustryPartners(result.domain, result.suggestedTechnologies);
      const nextTrackingId = generateTrackingId();
      const validation = form.validation;
      const evidence = await uploadEvidenceFiles(form.evidenceFiles, nextTrackingId, form.evidenceMetadata);

      await saveChallenge({
        trackingId: nextTrackingId,
        title: form.title,
        description: form.description,
        duration: form.duration,
        symptoms: form.symptoms,
        category: form.category,
        affectedGroup: form.affectedGroup,
        population: Number(form.population) || 500,
        district: form.district,
        block: form.block,
        village: form.village,
        gps: form.gps,
        outcome: form.outcome,
        domain: result.domain,
        priority: result.priority,
        duplicateRisk: validation.duplicateRisk,
        submittedBy: user?.name ?? "Community reporter",
        validation,
        evidence,
      });

      await new Promise((r) => setTimeout(r, ANALYSIS_CHECKS.length * 550 + 300));
      clearInterval(interval);
      setChecksDone(ANALYSIS_CHECKS.length);
      setAnalysis({ ...result, matchedUniversities, matchedIndustryPartners, teamFormation: createMultidisciplinaryTeam(matchedUniversities[0], result.potentialSkills, result.domain) });
      setTrackingId(nextTrackingId);
      setPhase("success");
    } catch (error) {
      clearInterval(interval);
      setSubmissionError(error instanceof Error ? error.message : "The challenge could not be submitted. Please try again.");
      setPhase("form");
    }
  };

  if (phase === "analyzing") return <AnalyzingScreen checksDone={checksDone} />;
  if (phase === "success" && analysis)
    return <SuccessScreen trackingId={trackingId} analysis={analysis} title={form.title} onDone={() => goTo("track")} onLanding={() => goTo("landing")} />;

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border bg-jic-forest-light/30">
        <div className="absolute inset-0 bg-grid-texture opacity-[0.25]" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Submit a Challenge" title="Tell us about the problem in your community" description="It takes about 3 minutes. Our AI will analyse it right after you submit." />
        </div>
      </div>
    <div className="mx-auto max-w-3xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Stepper */}
      <div className="mt-4 overflow-x-auto pb-2 sm:mt-8">
        <div className="flex min-w-[620px] items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  i < step
                    ? "border-jic-forest bg-jic-forest text-white"
                    : i === step
                    ? "border-jic-forest text-jic-forest"
                    : "border-border text-muted-foreground"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-xs font-medium sm:block", i === step ? "text-jic-forest" : "text-muted-foreground")}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className={cn("mx-2 h-0.5 flex-1", i < step ? "bg-jic-forest" : "bg-border")} />}
          </div>
        ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:mt-10 sm:p-8">
        {submissionError && <p className="mb-5 rounded-lg bg-jic-earth-light px-3 py-2 text-sm text-jic-earth">{submissionError}</p>}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
            {step === 0 && <StepProblem form={form} update={update} />}
            {step === 1 && <StepEvidence form={form} update={update} />}
            {step === 2 && <StepLocation form={form} update={update} />}
            {step === 3 && <StepSymptoms form={form} update={update} />}
            {step === 4 && <StepDuration form={form} update={update} />}
            {step === 5 && <StepAIValidation form={form} runValidation={runValidation} onViewChallenge={(id) => goTo("challenge-detail", { id })} />}
            {step === 6 && <StepOutcome form={form} update={update} />}
            {step === 7 && <StepReview form={form} />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5 sm:mt-8 sm:pt-6">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button disabled={!canProceed()} className="gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={() => setStep((s) => s + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={submit}>
              Submit Challenge <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-jic-charcoal">{label}</label>
      {children}
    </div>
  );
}

function StepProblem({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <FileText className="h-3.5 w-3.5" /> Step 1 — Problem
      </p>
      <Field label="Problem title">
        <Input value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Frequent hand pump failures in our village" />
      </Field>
      <Field label="Describe the problem">
        <Textarea rows={5} value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="What is happening? What have you tried already?" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category hint (optional)">
          <Select value={form.category} onValueChange={(v) => update({ category: v })}>
            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
            <SelectContent>
              {DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Who is affected?">
          <Input value={form.affectedGroup} onChange={(e) => update({ affectedGroup: e.target.value })} placeholder="e.g. Farming households, schoolchildren" />
        </Field>
      </div>
      <Field label="Approximate number of people affected">
        <Input type="number" min={0} value={form.population} onChange={(e) => update({ population: e.target.value })} placeholder="e.g. 1200" />
      </Field>
    </div>
  );
}

function StepEvidence({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <Upload className="h-3.5 w-3.5" /> Step 2 — Evidence
      </p>
      <p className="text-sm text-muted-foreground">Add one or more photos, videos, or documents that help prove the problem exists.</p>
      <EvidenceUploader form={form} update={update} />
    </div>
  );
}

function StepLocation({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  const [locationError, setLocationError] = useState("");

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        update({ gps: `${coords.latitude.toFixed(6)}° ${coords.latitude >= 0 ? "N" : "S"}, ${Math.abs(coords.longitude).toFixed(6)}° ${coords.longitude >= 0 ? "E" : "W"}` });
        setLocationError("");
      },
      () => setLocationError("Unable to access your location. Enter GPS coordinates manually."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <MapPin className="h-3.5 w-3.5" /> Step 3 — Location
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="District">
          <Select value={form.district} onValueChange={(v) => update({ district: v })}>
            <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
            <SelectContent>
              {DISTRICT_NAMES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Block">
          <Input value={form.block} onChange={(e) => update({ block: e.target.value })} placeholder="e.g. Bero" />
        </Field>
      </div>
      <Field label="Village / City">
        <Input value={form.village} onChange={(e) => update({ village: e.target.value })} placeholder="e.g. Kathikund" />
      </Field>
      <Field label="GPS location">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input className="min-w-0 flex-1" value={form.gps} onChange={(e) => update({ gps: e.target.value })} placeholder="Lat, Long (optional)" />
            <Button type="button" variant="outline" className="w-full shrink-0 sm:w-auto" onClick={useCurrentLocation}>Use current location</Button>
        </div>
        {locationError && <p className="mt-1.5 text-xs text-destructive">{locationError}</p>}
      </Field>
    </div>
  );
}

function StepSymptoms({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <FileText className="h-3.5 w-3.5" /> Step 4 — Observable Symptoms
      </p>
      <Field label="What symptoms can you observe?">
        <Textarea rows={5} value={form.symptoms} onChange={(e) => update({ symptoms: e.target.value })} placeholder="e.g. pumps stop weekly, queues form, or roads become impassable after rain" />
      </Field>
    </div>
  );
}

function StepDuration({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <FileText className="h-3.5 w-3.5" /> Step 5 — Duration
      </p>
      <Field label="How long has this problem existed?">
        <Input value={form.duration} onChange={(e) => update({ duration: e.target.value })} placeholder="e.g. 2 years, since last monsoon" />
      </Field>
    </div>
  );
}

function StepAIValidation({ form, runValidation, onViewChallenge }: { form: FormData; runValidation: () => Promise<void>; onViewChallenge: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <Sparkles className="h-3.5 w-3.5" /> Step 6 — AI Validation Engine
      </p>

      <div className="rounded-2xl border border-border bg-jic-forest-light/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-jic-forest">AI credibility check</p>
            <p className="mt-1 text-sm text-muted-foreground">Image + text + location + evidence</p>
          </div>
          <Button type="button" onClick={runValidation} className="bg-jic-deep text-jic-cream hover:bg-jic-deep/90">
            {form.validation ? "Re-run validation" : "Run AI validation"}
          </Button>
        </div>

        {form.validation ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-jic-forest/20 bg-white px-3 py-2">
              <span className="text-sm font-medium text-jic-charcoal">Confidence</span>
              <span className={cn("text-sm font-bold", form.validation.credible ? "text-jic-forest" : "text-amber-700")}>
                {form.validation.confidence}%
              </span>
            </div>
            <p className={cn("text-sm", form.validation.credible ? "text-jic-charcoal" : "text-amber-700")}>
              {form.validation.reason}
            </p>
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <span className="rounded-lg bg-white px-3 py-2 text-muted-foreground">Primary domain: <strong className="text-jic-charcoal">{form.validation.primaryDomain}</strong></span>
              <span className="rounded-lg bg-white px-3 py-2 text-muted-foreground">Problem category: <strong className="text-jic-charcoal">{form.validation.problemCategory}</strong></span>
              <span className="rounded-lg bg-white px-3 py-2 text-muted-foreground sm:col-span-2">Related domains: <strong className="text-jic-charcoal">{form.validation.relatedDomains.join(" · ")}</strong></span>
              <span className="rounded-lg bg-white px-3 py-2 text-muted-foreground">Missing information: <strong className="text-jic-charcoal">{form.validation.missingInformation.length || "None"}</strong></span>
              <span className="rounded-lg bg-white px-3 py-2 text-muted-foreground">Sufficient: <strong className="text-jic-charcoal">{form.validation.evidence.sufficient ? "Yes" : "No"}</strong></span>
              <span className="rounded-lg bg-white px-3 py-2 text-muted-foreground">Relevant: <strong className="text-jic-charcoal">{form.validation.evidence.relevant}</strong></span>
              <span className="rounded-lg bg-white px-3 py-2 text-muted-foreground">Clear: <strong className="text-jic-charcoal">{form.validation.evidence.clear}</strong></span>
              <span className="rounded-lg bg-white px-3 py-2 text-muted-foreground">Possible duplicates: <strong className="text-jic-charcoal">{form.validation.evidence.possibleDuplicates}</strong></span>
              <span className="rounded-lg bg-white px-3 py-2 text-muted-foreground sm:col-span-2">Possible manipulation: <strong className="text-jic-charcoal">{form.validation.evidence.possibleManipulation}</strong></span>
            </div>
            <div className="rounded-xl border border-border bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-muted-foreground">Duplicate risk</span>
                <strong className={cn("text-sm", form.validation.duplicateRisk === "High" ? "text-red-700" : form.validation.duplicateRisk === "Medium" ? "text-amber-700" : "text-jic-forest")}>
                  {form.validation.duplicateRisk}
                </strong>
              </div>
              {form.validation.similarChallenges.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.validation.similarChallenges.map((challenge) => (
                    <div key={challenge.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-jic-charcoal">{challenge.title}</p>
                        <p className="text-[11px] text-muted-foreground">{challenge.district} · {challenge.similarity}% similar</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => onViewChallenge(challenge.id)}>Contribute evidence</Button>
                    </div>
                  ))}
                </div>
              )}
              {form.validation.duplicateRisk !== "Low" && <p className="mt-3 text-xs text-amber-700">A similar challenge already exists. Consider contributing evidence to it instead of creating another report.</p>}
            </div>
            {form.validation.missingInformation.length > 0 && (
              <p className="text-xs text-amber-700">Still needed: {form.validation.missingInformation.join(", ")}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {form.validation.duplicateRisk === "High" ? (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Contribute to existing challenge</span>
              ) : form.validation.credible ? (
                <span className="rounded-full bg-jic-forest-light px-3 py-1 text-xs font-medium text-jic-forest">Continue</span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Request more evidence</span>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Run the validation engine to confirm the problem is genuine and credible before continuing.</p>
        )}
      </div>
    </div>
  );
}

function EvidenceUploader({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const documentInput = useRef<HTMLInputElement>(null);
  const addFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const files = [...form.evidenceFiles, ...Array.from(event.target.files)];
      update({ evidenceFiles: files, evidenceMetadata: await processEvidenceFiles(files) });
    }
    event.target.value = "";
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Images", input: imageInput },
          { label: "Videos", input: videoInput },
          { label: "Documents", input: documentInput },
        ].map(({ label, input }) => (
          <button
            key={label}
            type="button"
            onClick={() => input.current?.click()}
            className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-8 text-sm font-medium text-muted-foreground hover:border-jic-forest hover:text-jic-forest"
          >
            <Upload className="h-5 w-5" /> Upload {label}
          </button>
        ))}
      </div>
      <input ref={imageInput} type="file" accept="image/*" multiple className="hidden" onChange={addFiles} />
      <input ref={videoInput} type="file" accept="video/*" multiple className="hidden" onChange={addFiles} />
      <input ref={documentInput} type="file" accept=".pdf,.doc,.docx,.txt" multiple className="hidden" onChange={addFiles} />
      {form.evidenceFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {form.evidenceFiles.map((f) => (
            <span key={`${f.name}-${f.lastModified}`} className="rounded-full bg-jic-forest-light px-3 py-1 text-xs font-medium text-jic-forest">
              {f.name}
            </span>
          ))}
        </div>
      )}
      {form.evidenceMetadata.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-jic-charcoal">Evidence metadata</p>
          {form.evidenceMetadata.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2">
              <span>{item.category} · {item.sizeLabel}{item.width && item.height ? ` · ${item.width}x${item.height}px` : ""}</span>
              <span>{item.relevant} relevance · {item.clear} clarity{item.possibleDuplicate ? " · possible duplicate" : ""}{item.possibleManipulation ? " · review filename" : ""}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function StepOutcome({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <Target className="h-3.5 w-3.5" /> Step 7 — Expected Outcome
      </p>
      <Field label="What kind of solution are you looking for?">
        <Textarea rows={5} value={form.outcome} onChange={(e) => update({ outcome: e.target.value })} placeholder="Describe what success would look like for your community." />
      </Field>
    </div>
  );
}

function StepReview({ form }: { form: FormData }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <ClipboardList className="h-3.5 w-3.5" /> Step 8 — Review
      </p>
      <div className="divide-y divide-border rounded-xl border border-border">
        <ReviewRow label="Title" value={form.title || "—"} />
        <ReviewRow label="Duration" value={form.duration || "—"} />
        <ReviewRow label="Observable symptoms" value={form.symptoms || "—"} />
        <ReviewRow label="Category" value={form.category || "—"} />
        <ReviewRow label="Affected" value={`${form.affectedGroup || "—"} (~${form.population || "0"} people)`} />
        <ReviewRow label="Location" value={[form.village, form.block, form.district].filter(Boolean).join(", ") || "—"} />
        <ReviewRow label="Evidence" value={form.evidenceFiles.length ? `${form.evidenceFiles.length} file(s) attached` : "None attached"} />
        <ReviewRow label="Desired outcome" value={form.outcome || "—"} />
      </div>
      <p className="text-xs text-muted-foreground">By submitting, you confirm this information is accurate to the best of your knowledge.</p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-jic-charcoal sm:max-w-sm sm:text-right">{value}</span>
    </div>
  );
}

function AnalyzingScreen({ checksDone }: { checksDone: number }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-jic-deep text-jic-saffron"
      >
        <Sparkles className="h-7 w-7" />
      </motion.div>
      <h2 className="mt-6 font-display text-2xl font-semibold text-jic-charcoal">Analyzing problem…</h2>
      <p className="mt-1 text-sm text-muted-foreground">Our AI is reading your submission and matching it to the right experts.</p>
      <div className="mt-8 w-full space-y-3 text-left">
        {ANALYSIS_CHECKS.map((label, i) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            {i < checksDone ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-jic-forest" />
            ) : (
              <span className="h-5 w-5 shrink-0 animate-pulse rounded-full border-2 border-border" />
            )}
            <span className={cn("text-sm", i < checksDone ? "text-jic-charcoal" : "text-muted-foreground")}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessScreen({
  trackingId,
  analysis,
  title,
  onDone,
  onLanding,
}: {
  trackingId: string;
  analysis: AIAnalysis;
  title: string;
  onDone: () => void;
  onLanding: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-jic-forest/20 bg-jic-forest-light/40 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-jic-forest text-white">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold text-jic-charcoal">Challenge Submitted Successfully</h2>
        <p className="mt-1 text-sm text-muted-foreground">"{title || "Your challenge"}" is now in the review pipeline.</p>

        <div className="mx-auto mt-6 flex max-w-xs items-center justify-between gap-3 rounded-xl border border-jic-forest/30 bg-white px-4 py-3">
          <div className="text-left">
            <p className="text-[11px] font-medium text-muted-foreground">Tracking ID</p>
            <p className="font-mono text-base font-semibold text-jic-charcoal">{trackingId}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(trackingId);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-jic-forest hover:bg-jic-forest-light"
            aria-label="Copy tracking ID"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-jic-forest" />
          <p className="font-display text-lg font-semibold text-jic-charcoal">AI Recommendation</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MiniStat label="Domain" value={analysis.domain} />
          <MiniStat label="Priority" value={analysis.priority} />
          <MiniStat label="Impact" value={`${analysis.impactScore.toFixed(1)} / 5`} />
          <MiniStat label="Duplicate risk" value={analysis.duplicateRisk} />
        </div>
        <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Priority factors</p>
          <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
            <span>Population: <strong>{analysis.impactFactors.population.toFixed(1)} / 5</strong></span>
            <span>Duration: <strong>{analysis.impactFactors.duration.toFixed(1)} / 5</strong></span>
            <span>Severity: <strong>{analysis.impactFactors.severity.toFixed(1)} / 5</strong></span>
            <span>Essential service: <strong>{analysis.impactFactors.essentialService.toFixed(1)} / 5</strong></span>
            <span>Geographic spread: <strong>{analysis.impactFactors.geographicSpread.toFixed(1)} / 5</strong></span>
            <span>Evidence confidence: <strong>{analysis.impactFactors.evidenceConfidence.toFixed(1)} / 5</strong></span>
            <span>Vulnerable groups: <strong>{analysis.impactFactors.vulnerableGroups.toFixed(1)} / 5</strong></span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground">Required expertise for researchers</p>
          <p className="mt-1 text-sm text-jic-charcoal">{analysis.potentialSkills.join(" · ")}</p>
        </div>
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground">Potential universities</p>
          <div className="mt-2 space-y-2">
            {analysis.matchedUniversities.map((university) => (
              <div key={university.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-jic-charcoal">{university.name}</p>
                  <p className="text-xs text-muted-foreground">{university.district} · {university.expertise.slice(0, 2).join(" · ")}</p>
                </div>
                <span className="shrink-0 rounded-full bg-jic-forest-light px-2.5 py-1 text-xs font-bold text-jic-forest">{university.matchScore}% match</span>
              </div>
            ))}
          </div>
        </div>
        {analysis.teamFormation && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground">Multidisciplinary team</p>
            <p className="mt-1 text-sm font-semibold text-jic-charcoal">{analysis.teamFormation.university}</p>
            <div className="mt-2 rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Faculty mentor</p>
              <p className="mt-0.5 text-sm font-medium text-jic-charcoal">{analysis.teamFormation.facultyMentor.name}</p>
              <p className="text-xs text-muted-foreground">{analysis.teamFormation.facultyMentor.discipline}</p>
              <p className="mt-3 text-xs text-muted-foreground">Student researchers</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {analysis.teamFormation.students.map((student) => (
                  <span key={student.id} className="rounded-full bg-jic-forest-light px-2.5 py-1 text-xs font-medium text-jic-forest">
                    {student.discipline}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground">Relevant industry partners</p>
          <div className="mt-2 space-y-2">
            {analysis.matchedIndustryPartners.map((partner) => (
              <div key={partner.id} className="rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-jic-charcoal">{partner.name}</p>
                  <span className="shrink-0 rounded-full bg-jic-forest-light px-2.5 py-1 text-xs font-bold text-jic-forest">{partner.matchScore}% match</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{partner.technologyArea} · {partner.district}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {partner.support.map((support) => (
                    <span key={support} className="rounded-full bg-white px-2 py-0.5 text-[11px] text-muted-foreground">{support}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground">Suggested technologies</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {analysis.suggestedTechnologies.map((t) => (
              <span key={t} className="rounded-full bg-jic-forest-light px-2.5 py-0.5 text-xs font-medium text-jic-forest">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button className="bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={onDone}>
          Track this challenge
        </Button>
        <Button variant="outline" onClick={onLanding}>
          Back to home
        </Button>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-4 py-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-jic-charcoal">{value}</p>
    </div>
  );
}
