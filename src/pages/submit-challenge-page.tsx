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
  Image as ImageIcon,
  Video,
  File,
  X,
  Clock3,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/section-heading";
import { DISTRICT_NAMES, DOMAINS } from "@/data/demoData";
import { classifyChallenge, generateTrackingId } from "@/services/aiService";
import { useAppState } from "@/lib/app-state";
import type { AIAnalysis, EvidenceFile, EvidenceKind } from "@/types";
import { cn } from "@/lib/utils";

const STEPS = ["Problem", "Location", "Evidence", "Outcome", "Review"];

const ANALYSIS_CHECKS = [
  "Understanding problem",
  "Identifying domain",
  "Checking evidence quality",
  "Detecting duplicate challenges",
  "Estimating priority",
  "Finding relevant expertise",
];

interface FormData {
  title: string;
  description: string;
  category: string;
  affectedGroup: string;
  population: string;
  duration: string;
  visibleSymptoms: string;
  district: string;
  block: string;
  village: string;
  gps: string;
  evidenceFiles: EvidenceFile[];
  outcome: string;
}

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  category: "",
  affectedGroup: "",
  population: "",
  duration: "",
  visibleSymptoms: "",
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
    if (step === 0) {
      return form.title.trim().length > 3 && form.description.trim().length > 10 && form.category && form.duration.trim().length > 0;
    }
    if (step === 1) return form.district.length > 0;
    if (step === 2) return form.evidenceFiles.length > 0;
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
      description: [
        form.description,
        form.visibleSymptoms ? `Visible symptoms: ${form.visibleSymptoms}` : "",
        form.duration ? `Duration: ${form.duration}` : "",
        form.affectedGroup ? `Affected group: ${form.affectedGroup}` : "",
      ].filter(Boolean).join("\n"),
      affectedPopulation: Number(form.population) || 500,
      evidence: form.evidenceFiles,
      location: { district: form.district, block: form.block, village: form.village, gps: form.gps },
    });

    await new Promise((r) => setTimeout(r, ANALYSIS_CHECKS.length * 550 + 300));
    clearInterval(interval);
    setChecksDone(ANALYSIS_CHECKS.length);
    setAnalysis(result);
    setTrackingId(generateTrackingId());
    setPhase("success");
  };

  if (phase === "analyzing") return <AnalyzingScreen checksDone={checksDone} />;
  if (phase === "success" && analysis) {
    return <SuccessScreen trackingId={trackingId} analysis={analysis} title={form.title} onDone={() => goTo("track")} onLanding={() => goTo("landing")} />;
  }

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border bg-jic-forest-light/30">
        <div className="absolute inset-0 bg-grid-texture opacity-[0.25]" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Submit a Challenge" title="Tell us about the problem in your community" description="Add enough context for JIC's AI to understand the issue, check the evidence and identify existing related challenges." />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mt-8 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold", i < step ? "border-jic-forest bg-jic-forest text-white" : i === step ? "border-jic-forest text-jic-forest" : "border-border text-muted-foreground")}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</div>
                <span className={cn("hidden text-xs font-medium sm:block", i === step ? "text-jic-forest" : "text-muted-foreground")}>{label}</span>
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
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="gap-1.5"><ChevronLeft className="h-4 w-4" /> Back</Button>
            {step < STEPS.length - 1 ? (
              <Button disabled={!canProceed()} className="gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={() => setStep((s) => s + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
            ) : (
              <Button className="gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={submit}>Submit Challenge <ArrowRight className="h-4 w-4" /></Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div><div className="mb-1.5 flex items-center justify-between gap-3"><label className="block text-sm font-medium text-jic-charcoal">{label}</label>{hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}</div>{children}</div>;
}

function StepProblem({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest"><FileText className="h-3.5 w-3.5" /> Step 1 — Problem</p>
      <Field label="Problem title"><Input value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Frequent hand pump failures in our village" maxLength={120} /></Field>
      <Field label="Describe the problem" hint="Be specific about what is happening"><Textarea rows={5} value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="What is happening? Where does it happen? What happens when people try to use the affected service or infrastructure?" /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category"><Select value={form.category} onValueChange={(v) => update({ category: v })}><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Who is affected?"><Input value={form.affectedGroup} onChange={(e) => update({ affectedGroup: e.target.value })} placeholder="e.g. Farming households, schoolchildren" /></Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Approximate people affected" hint="An estimate is okay"><Input type="number" min={0} value={form.population} onChange={(e) => update({ population: e.target.value })} placeholder="e.g. 1200" /></Field>
        <Field label="How long has this existed?" hint="Important for AI assessment"><div className="relative"><Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={form.duration} onChange={(e) => update({ duration: e.target.value })} placeholder="e.g. 3 months / every monsoon" /></div></Field>
      </div>
      <Field label="What can you actually see or observe?" hint="Optional but useful for image validation"><Textarea rows={3} value={form.visibleSymptoms} onChange={(e) => update({ visibleSymptoms: e.target.value })} placeholder="e.g. broken pipe joint, standing water, cracked road surface, damaged school roof..." /></Field>
      <div className="rounded-xl border border-jic-forest/15 bg-jic-forest-light/35 p-4"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-jic-forest" /><div><p className="text-sm font-semibold text-jic-charcoal">Why JIC asks these questions</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Your answers help the AI distinguish a genuine community issue from an unclear submission and avoid creating duplicate challenges later.</p></div></div></div>
    </div>
  );
}

function StepLocation({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest"><MapPin className="h-3.5 w-3.5" /> Step 2 — Location</p>
      <div className="rounded-xl border border-jic-forest/15 bg-jic-forest-light/35 p-4"><div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-jic-forest" /><div><p className="text-sm font-semibold text-jic-charcoal">Location improves duplicate detection</p><p className="mt-1 text-xs leading-5 text-muted-foreground">JIC uses location alongside text and evidence to determine whether a similar challenge already exists nearby.</p></div></div></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="District"><Select value={form.district} onValueChange={(v) => update({ district: v })}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{DISTRICT_NAMES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Block"><Input value={form.block} onChange={(e) => update({ block: e.target.value })} placeholder="e.g. Bero" /></Field>
      </div>
      <Field label="Village / City"><Input value={form.village} onChange={(e) => update({ village: e.target.value })} placeholder="e.g. Kathikund" /></Field>
      <Field label="GPS location" hint="Optional if you provide a detailed village/city"><div className="flex flex-col gap-2 sm:flex-row"><Input value={form.gps} onChange={(e) => update({ gps: e.target.value })} placeholder="Lat, Long" /><Button type="button" variant="outline" onClick={() => update({ gps: "23.6102° N, 85.2799° E" })} className="shrink-0"><MapPin className="mr-1.5 h-4 w-4" />Use current location</Button></div></Field>
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">Map selector — tap to drop a pin (preview)</div>
    </div>
  );
}

function StepEvidence({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next: EvidenceFile[] = Array.from(files).map((file, index) => {
      const kind: EvidenceKind = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";
      const local: EvidenceFile = { id: `${Date.now()}-${index}-${file.name}`, name: file.name, kind, size: file.size, type: file.type, previewUrl: kind === "image" || kind === "video" ? URL.createObjectURL(file) : undefined, lastModified: file.lastModified };
      if (kind === "image" && local.previewUrl) {
        const img = new Image();
        img.onload = () => update({ evidenceFiles: form.evidenceFiles.map((entry) => entry.id === local.id ? { ...entry, width: img.naturalWidth, height: img.naturalHeight } : entry) });
        img.src = local.previewUrl;
      }
      return local;
    });
    update({ evidenceFiles: [...form.evidenceFiles, ...next] });
  };

  const removeFile = (id: string) => {
    const file = form.evidenceFiles.find((entry) => entry.id === id);
    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    update({ evidenceFiles: form.evidenceFiles.filter((entry) => entry.id !== id) });
  };

  const browse = (kind: EvidenceKind) => {
    if (!inputRef.current) return;
    inputRef.current.accept = kind === "image" ? "image/*" : kind === "video" ? "video/*" : ".pdf,.doc,.docx,.txt";
    inputRef.current.click();
  };

  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest"><Upload className="h-3.5 w-3.5" /> Step 3 — Evidence</p>
      <div className="rounded-xl border border-jic-forest/15 bg-jic-forest-light/35 p-4"><div className="flex items-start gap-3"><Camera className="mt-0.5 h-4 w-4 shrink-0 text-jic-forest" /><div><p className="text-sm font-semibold text-jic-charcoal">Add visual evidence whenever possible</p><p className="mt-1 text-xs leading-5 text-muted-foreground">JIC's future vision model can use images and video to understand visible symptoms. Clear, relevant photos make the assessment stronger.</p></div></div></div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ""; }} />
      <div className="grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => browse("image")} className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-8 text-sm font-medium text-muted-foreground transition hover:border-jic-forest hover:bg-jic-forest-light/30 hover:text-jic-forest"><ImageIcon className="h-5 w-5" />Upload Images</button>
        <button type="button" onClick={() => browse("video")} className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-8 text-sm font-medium text-muted-foreground transition hover:border-jic-forest hover:bg-jic-forest-light/30 hover:text-jic-forest"><Video className="h-5 w-5" />Upload Videos</button>
        <button type="button" onClick={() => browse("document")} className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-8 text-sm font-medium text-muted-foreground transition hover:border-jic-forest hover:bg-jic-forest-light/30 hover:text-jic-forest"><File className="h-5 w-5" />Upload Documents</button>
      </div>
      {form.evidenceFiles.length > 0 && <div className="space-y-3"><div className="flex items-center justify-between"><p className="text-sm font-medium text-jic-charcoal">{form.evidenceFiles.length} file(s) attached</p><span className="text-xs text-muted-foreground">AI-ready metadata captured</span></div><div className="grid gap-3 sm:grid-cols-2">{form.evidenceFiles.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">{file.previewUrl && file.kind === "image" ? <img src={file.previewUrl} alt={file.name} className="h-full w-full object-cover" /> : file.kind === "video" ? <Video className="h-5 w-5 text-jic-forest" /> : <File className="h-5 w-5 text-jic-forest" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-jic-charcoal">{file.name}</p><p className="text-[11px] text-muted-foreground">{file.kind}{file.size ? ` · ${Math.ceil(file.size / 1024)} KB` : ""}{file.width && file.height ? ` · ${file.width}×${file.height}` : ""}</p></div><button type="button" onClick={() => removeFile(file.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-jic-charcoal" aria-label={`Remove ${file.name}`}><X className="h-4 w-4" /></button></div>)}</div></div>}
    </div>
  );
}

function StepOutcome({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return <div className="space-y-5"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest"><Target className="h-3.5 w-3.5" /> Step 4 — Expected Outcome</p><Field label="What kind of solution are you looking for?"><Textarea rows={5} value={form.outcome} onChange={(e) => update({ outcome: e.target.value })} placeholder="Describe what success would look like for your community." /></Field></div>;
}

function StepReview({ form }: { form: FormData }) {
  return <div className="space-y-5"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest"><ClipboardList className="h-3.5 w-3.5" /> Step 5 — Review</p><div className="divide-y divide-border rounded-xl border border-border"><ReviewRow label="Title" value={form.title || "—"} /><ReviewRow label="Category" value={form.category || "—"} /><ReviewRow label="Affected" value={`${form.affectedGroup || "—"} (~${form.population || "0"} people)`} /><ReviewRow label="Duration" value={form.duration || "—"} /><ReviewRow label="Observed symptoms" value={form.visibleSymptoms || "—"} /><ReviewRow label="Location" value={[form.village, form.block, form.district].filter(Boolean).join(", ") || "—"} /><ReviewRow label="Evidence" value={form.evidenceFiles.length ? `${form.evidenceFiles.length} file(s) attached` : "No evidence attached"} /><ReviewRow label="Desired outcome" value={form.outcome || "—"} /></div><p className="text-xs text-muted-foreground">By submitting, you confirm this information is accurate to the best of your knowledge. AI analysis is an assistive review and can request additional evidence.</p></div>;
}

function ReviewRow({ label, value }: { label: string; value: string }) { return <div className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"><span className="text-xs font-medium text-muted-foreground">{label}</span><span className="text-sm text-jic-charcoal sm:max-w-sm sm:text-right">{value}</span></div>; }

function AnalyzingScreen({ checksDone }: { checksDone: number }) {
  return <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-jic-deep text-jic-saffron"><Sparkles className="h-7 w-7" /></motion.div><h2 className="mt-6 font-display text-2xl font-semibold text-jic-charcoal">Analyzing problem…</h2><p className="mt-1 text-sm text-muted-foreground">JIC is reading the description, evidence and location before it decides what happens next.</p><div className="mt-8 w-full space-y-3 text-left">{ANALYSIS_CHECKS.map((label, i) => <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">{i < checksDone ? <CheckCircle2 className="h-5 w-5 shrink-0 text-jic-forest" /> : <span className="h-5 w-5 shrink-0 animate-pulse rounded-full border-2 border-border" />}<span className={cn("text-sm", i < checksDone ? "text-jic-charcoal" : "text-muted-foreground")}>{label}</span></div>)}</div></div>;
}

function SuccessScreen({ trackingId, analysis, title, onDone, onLanding }: { trackingId: string; analysis: AIAnalysis; title: string; onDone: () => void; onLanding: () => void }) {
  const [copied, setCopied] = useState(false);
  return <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-jic-forest/20 bg-jic-forest-light/40 p-8 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-jic-forest text-white"><Check className="h-8 w-8" /></div><h2 className="mt-5 font-display text-2xl font-semibold text-jic-charcoal">Challenge Submitted Successfully</h2><p className="mt-1 text-sm text-muted-foreground">"{title || "Your challenge"}" is now in the review pipeline.</p><div className="mx-auto mt-6 flex max-w-xs items-center justify-between gap-3 rounded-xl border border-jic-forest/30 bg-white px-4 py-3"><div className="text-left"><p className="text-[11px] font-medium text-muted-foreground">Tracking ID</p><p className="font-mono text-base font-semibold text-jic-charcoal">{trackingId}</p></div><button onClick={() => { navigator.clipboard?.writeText(trackingId); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-jic-forest hover:bg-jic-forest-light" aria-label="Copy tracking ID">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div></motion.div><div className="mt-8 rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-jic-forest" /><p className="font-display text-lg font-semibold text-jic-charcoal">AI Recommendation</p></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><MiniStat label="Domain" value={analysis.domain} /><MiniStat label="Priority" value={analysis.priority} /><MiniStat label="Impact" value={`${analysis.impactScore.toFixed(1)} / 5`} /><MiniStat label="Duplicate risk" value={analysis.duplicateRisk} /></div><div className="mt-4"><p className="text-xs font-medium text-muted-foreground">Suggested disciplines</p><p className="mt-1 text-sm text-jic-charcoal">{analysis.potentialSkills.join(" · ")}</p></div><div className="mt-3"><p className="text-xs font-medium text-muted-foreground">Suggested technologies</p><div className="mt-1.5 flex flex-wrap gap-1.5">{analysis.suggestedTechnologies.map((t) => <span key={t} className="rounded-full bg-jic-forest-light px-2.5 py-0.5 text-xs font-medium text-jic-forest">{t}</span>)}</div></div></div><div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"><Button className="bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={onDone}>Track this challenge</Button><Button variant="outline" onClick={onLanding}>Back to home</Button></div></div>;
}

function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted/50 px-4 py-3"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-sm font-semibold text-jic-charcoal">{value}</p></div>; }
