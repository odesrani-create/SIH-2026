import { useState } from "react";
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
import { classifyChallenge, generateTrackingId } from "@/services/aiService";
import { useAppState } from "@/lib/app-state";
import type { AIAnalysis } from "@/types";
import { cn } from "@/lib/utils";

const STEPS = ["Problem", "Location", "Evidence", "Outcome", "Review"];

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
  category: string;
  affectedGroup: string;
  population: string;
  district: string;
  block: string;
  village: string;
  gps: string;
  evidenceFiles: string[];
  outcome: string;
}

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  category: "",
  affectedGroup: "",
  population: "",
  district: "",
  block: "",
  village: "",
  gps: "",
  evidenceFiles: [],
  outcome: "",
};

type Phase = "form" | "analyzing" | "success";

export function SubmitChallengePage() {
  const { goTo } = useAppState();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [phase, setPhase] = useState<Phase>("form");
  const [checksDone, setChecksDone] = useState(0);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [trackingId, setTrackingId] = useState("");

  const update = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }));

  const canProceed = () => {
    if (step === 0) return form.title.trim().length > 3 && form.description.trim().length > 10 && form.category;
    if (step === 1) return form.district.length > 0;
    if (step === 3) return form.outcome.trim().length > 5;
    return true;
  };

  const submit = async () => {
    setPhase("analyzing");
    setChecksDone(0);
    const interval = setInterval(() => {
      setChecksDone((n) => Math.min(n + 1, ANALYSIS_CHECKS.length));
    }, 550);

    const result = await classifyChallenge({
      title: form.title,
      description: form.description,
      affectedPopulation: Number(form.population) || 500,
    });

    await new Promise((r) => setTimeout(r, ANALYSIS_CHECKS.length * 550 + 300));
    clearInterval(interval);
    setChecksDone(ANALYSIS_CHECKS.length);
    setAnalysis(result);
    setTrackingId(generateTrackingId());
    setPhase("success");
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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Stepper */}
      <div className="mt-8 flex items-center justify-between">
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

      <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
            {step === 0 && <StepProblem form={form} update={update} />}
            {step === 1 && <StepLocation form={form} update={update} />}
            {step === 2 && <StepEvidence form={form} update={update} />}
            {step === 3 && <StepOutcome form={form} update={update} />}
            {step === 4 && <StepReview form={form} />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
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
        <Textarea rows={5} value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="What is happening? How long has this been a problem? What have you tried already?" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category">
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

function StepLocation({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <MapPin className="h-3.5 w-3.5" /> Step 2 — Location
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
        <div className="flex gap-2">
          <Input value={form.gps} onChange={(e) => update({ gps: e.target.value })} placeholder="Lat, Long (optional)" />
          <Button type="button" variant="outline" onClick={() => update({ gps: "23.6102° N, 85.2799° E" })}>
            Use current location
          </Button>
        </div>
      </Field>
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
        Map selector — tap to drop a pin (preview)
      </div>
    </div>
  );
}

function StepEvidence({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  const addMock = (kind: string) => update({ evidenceFiles: [...form.evidenceFiles, `${kind}_${form.evidenceFiles.length + 1}`] });
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <Upload className="h-3.5 w-3.5" /> Step 3 — Evidence
      </p>
      <p className="text-sm text-muted-foreground">Add photos, videos or documents that help explain the problem. This step is optional but strengthens your submission.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Images", "Videos", "Documents"].map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => addMock(kind)}
            className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-8 text-sm font-medium text-muted-foreground hover:border-jic-forest hover:text-jic-forest"
          >
            <Upload className="h-5 w-5" /> Upload {kind}
          </button>
        ))}
      </div>
      {form.evidenceFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {form.evidenceFiles.map((f) => (
            <span key={f} className="rounded-full bg-jic-forest-light px-3 py-1 text-xs font-medium text-jic-forest">
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StepOutcome({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest">
        <Target className="h-3.5 w-3.5" /> Step 4 — Expected Outcome
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
        <ClipboardList className="h-3.5 w-3.5" /> Step 5 — Review
      </p>
      <div className="divide-y divide-border rounded-xl border border-border">
        <ReviewRow label="Title" value={form.title || "—"} />
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
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground">Suggested disciplines</p>
          <p className="mt-1 text-sm text-jic-charcoal">{analysis.potentialSkills.join(" · ")}</p>
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
