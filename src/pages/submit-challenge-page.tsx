import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, FileText, MapPin, Target, ClipboardList, Sparkles, CheckCircle2, Copy, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/section-heading";
import { DISTRICT_NAMES, DOMAINS } from "@/data/demoData";
import { classifyChallenge, generateTrackingId } from "@/services/aiService";
import { createChallenge } from "@/services/challengeService";
import { useAppState } from "@/lib/app-state";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { AIAnalysis } from "@/types";
import { cn } from "@/lib/utils";

const STEPS = ["Problem", "Location", "Evidence", "Outcome", "Review"];
const ANALYSIS_CHECKS = ["Understanding problem", "Identifying domain", "Detecting duplicate challenges", "Estimating priority", "Finding relevant expertise", "Matching institutions"];

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

const EMPTY_FORM: FormData = { title: "", description: "", category: "", affectedGroup: "", population: "", district: "", block: "", village: "", gps: "", evidenceFiles: [], outcome: "" };
type Phase = "form" | "analyzing" | "success";

function parseGps(value: string) {
  const matches = value.match(/-?\d+(?:\.\d+)?/g);
  if (!matches || matches.length < 2) return { latitude: undefined, longitude: undefined };
  const latitude = Number(matches[0]);
  const longitude = Number(matches[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return { latitude: undefined, longitude: undefined };
  return { latitude, longitude };
}

export function SubmitChallengePage() {
  const { goTo } = useAppState();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [phase, setPhase] = useState<Phase>("form");
  const [checksDone, setChecksDone] = useState(0);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");

  const update = (patch: Partial<FormData>) => setForm((current) => ({ ...current, ...patch }));

  const canProceed = () => {
    if (step === 0) return form.title.trim().length > 3 && form.description.trim().length > 10 && Boolean(form.category);
    if (step === 1) return Boolean(form.district);
    if (step === 3) return form.outcome.trim().length > 5;
    return true;
  };

  const submit = async () => {
    setError("");
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local before submitting.");
      return;
    }

    setPhase("analyzing");
    setChecksDone(0);
    const interval = window.setInterval(() => setChecksDone((n) => Math.min(n + 1, ANALYSIS_CHECKS.length)), 550);

    try {
      const result = await classifyChallenge({ title: form.title, description: form.description, affectedPopulation: Number(form.population) || 0 });
      const id = generateTrackingId();
      const { latitude, longitude } = parseGps(form.gps);

      await new Promise((resolve) => window.setTimeout(resolve, ANALYSIS_CHECKS.length * 550 + 300));
      setChecksDone(ANALYSIS_CHECKS.length);

      await createChallenge({
        trackingId: id,
        title: form.title.trim(),
        description: form.description.trim(),
        currentSituation: form.description.trim(),
        desiredOutcome: form.outcome.trim(),
        domain: result.domain,
        district: form.district,
        block: form.block.trim() || undefined,
        village: form.village.trim() || undefined,
        latitude,
        longitude,
        priority: result.priority,
        affectedPopulation: Number(form.population) || 0,
        tags: [form.category, form.affectedGroup].filter(Boolean),
        aiAnalysis: result,
      });

      setAnalysis(result);
      setTrackingId(id);
      setPhase("success");
    } catch (submissionError) {
      setPhase("form");
      setError(submissionError instanceof Error ? submissionError.message : "Challenge could not be submitted. Please try again.");
    } finally {
      window.clearInterval(interval);
    }
  };

  if (phase === "analyzing") return <AnalyzingScreen checksDone={checksDone} />;
  if (phase === "success" && analysis) return <SuccessScreen trackingId={trackingId} analysis={analysis} title={form.title} onDone={() => goTo("track")} onLanding={() => goTo("landing")} />;

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border bg-jic-forest-light/30">
        <div className="absolute inset-0 bg-grid-texture opacity-[0.25]" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Submit a Challenge" title="Tell us about the problem in your community" description="It takes about 3 minutes. Our AI will analyse it and save your challenge securely." />
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

        {error && <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-semibold">Submission failed</p><p className="mt-1">{error}</p></div></div>}

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              {step === 0 && <StepProblem form={form} update={update} />}
              {step === 1 && <StepLocation form={form} update={update} />}
              {step === 2 && <StepEvidence form={form} />}
              {step === 3 && <StepOutcome form={form} update={update} />}
              {step === 4 && <StepReview form={form} />}
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="gap-1.5"><ChevronLeft className="h-4 w-4" /> Back</Button>
            {step < STEPS.length - 1 ? <Button disabled={!canProceed()} className="gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={() => setStep((s) => s + 1)}>Next <ChevronRight className="h-4 w-4" /></Button> : <Button className="gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={submit}>Submit Challenge <ArrowRight className="h-4 w-4" /></Button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="mb-1.5 block text-sm font-medium text-jic-charcoal">{label}</label>{children}</div>; }

function StepProblem({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return <div className="space-y-5"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest"><FileText className="h-3.5 w-3.5" /> Step 1 — Problem</p><Field label="Problem title"><Input value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Frequent hand pump failures in our village" /></Field><Field label="Describe the problem"><Textarea rows={5} value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="What is happening? How long has this been a problem? What have you tried already?" /></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Category"><Select value={form.category} onValueChange={(v) => update({ category: v })}><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></Field><Field label="Who is affected?"><Input value={form.affectedGroup} onChange={(e) => update({ affectedGroup: e.target.value })} placeholder="e.g. Farming households, schoolchildren" /></Field></div><Field label="Approximate number of people affected"><Input type="number" min={0} value={form.population} onChange={(e) => update({ population: e.target.value })} placeholder="e.g. 1200" /></Field></div>;
}

function StepLocation({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  const useLocation = () => { if (!navigator.geolocation) return; navigator.geolocation.getCurrentPosition((position) => update({ gps: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}` }), () => update({ gps: "" }), { enableHighAccuracy: true, timeout: 10000 }); };
  return <div className="space-y-5"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest"><MapPin className="h-3.5 w-3.5" /> Step 2 — Location</p><div className="grid gap-5 sm:grid-cols-2"><Field label="District"><Select value={form.district} onValueChange={(v) => update({ district: v })}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{DISTRICT_NAMES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></Field><Field label="Block"><Input value={form.block} onChange={(e) => update({ block: e.target.value })} placeholder="e.g. Bero" /></Field></div><Field label="Village / City"><Input value={form.village} onChange={(e) => update({ village: e.target.value })} placeholder="e.g. Kathikund" /></Field><Field label="GPS location"><div className="flex gap-2"><Input value={form.gps} onChange={(e) => update({ gps: e.target.value })} placeholder="Lat, Long (optional)" /><Button type="button" variant="outline" onClick={useLocation}>Use current location</Button></div></Field><div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">GPS coordinates will be saved with the challenge when provided.</div></div>;
}

function StepEvidence({ form }: { form: FormData }) {
  return <div className="space-y-5"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest"><FileText className="h-3.5 w-3.5" /> Step 3 — Evidence</p><p className="text-sm text-muted-foreground">Evidence storage is the next upload integration. Your challenge can already be submitted without attachments.</p><div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center"><p className="text-sm font-medium">No files attached</p><p className="mt-1 text-xs text-muted-foreground">Photo, video and document upload will be connected to Supabase Storage next.</p></div>{form.evidenceFiles.length > 0 && <p className="text-xs text-muted-foreground">{form.evidenceFiles.length} file(s)</p>}</div>;
}

function StepOutcome({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) { return <div className="space-y-5"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest"><Target className="h-3.5 w-3.5" /> Step 4 — Expected Outcome</p><Field label="What kind of solution are you looking for?"><Textarea rows={5} value={form.outcome} onChange={(e) => update({ outcome: e.target.value })} placeholder="Describe what success would look like for your community." /></Field></div>; }

function StepReview({ form }: { form: FormData }) { return <div className="space-y-5"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-jic-forest"><ClipboardList className="h-3.5 w-3.5" /> Step 5 — Review</p><div className="divide-y divide-border rounded-xl border border-border"><ReviewRow label="Title" value={form.title || "—"} /><ReviewRow label="Category" value={form.category || "—"} /><ReviewRow label="Affected" value={`${form.affectedGroup || "—"} (~${form.population || "0"} people)`} /><ReviewRow label="Location" value={[form.village, form.block, form.district].filter(Boolean).join(", ") || "—"} /><ReviewRow label="GPS" value={form.gps || "Not provided"} /><ReviewRow label="Desired outcome" value={form.outcome || "—"} /></div><p className="text-xs text-muted-foreground">Your submission will be stored in Supabase and assigned a tracking ID after AI analysis.</p></div>; }

function ReviewRow({ label, value }: { label: string; value: string }) { return <div className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"><span className="text-xs font-medium text-muted-foreground">{label}</span><span className="text-sm text-jic-charcoal sm:max-w-sm sm:text-right">{value}</span></div>; }

function AnalyzingScreen({ checksDone }: { checksDone: number }) { return <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="flex h-20 w-20 items-center justify-center rounded-full bg-jic-forest-light"><Sparkles className="h-9 w-9 text-jic-forest" /></motion.div><h2 className="mt-8 text-2xl font-bold text-jic-charcoal">Analysing your challenge…</h2><p className="mt-2 text-sm text-muted-foreground">AI is evaluating your submission before it is saved.</p><div className="mt-8 w-full space-y-3 text-left">{ANALYSIS_CHECKS.map((label, i) => <div key={label} className="flex items-center gap-3 text-sm">{i < checksDone ? <CheckCircle2 className="h-5 w-5 text-jic-forest" /> : <div className="h-5 w-5 rounded-full border-2 border-border" />}<span className={i < checksDone ? "text-jic-charcoal" : "text-muted-foreground"}>{label}</span></div>)}</div></div>; }

function SuccessScreen({ trackingId, analysis, title, onDone, onLanding }: { trackingId: string; analysis: AIAnalysis; title: string; onDone: () => void; onLanding: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard?.writeText(trackingId); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  return <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-jic-forest-light"><CheckCircle2 className="h-9 w-9 text-jic-forest" /></div><h1 className="mt-6 text-3xl font-bold text-jic-charcoal">Challenge submitted successfully</h1><p className="mt-2 text-muted-foreground">“{title}” has been saved. Keep your tracking ID to check its progress.</p><div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-card p-6"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking ID</p><div className="mt-2 flex items-center justify-center gap-2"><code className="text-2xl font-bold tracking-widest text-jic-forest">{trackingId}</code><Button variant="ghost" size="icon" onClick={copy} aria-label="Copy tracking ID"><Copy className="h-4 w-4" /></Button></div>{copied && <p className="mt-2 text-xs text-jic-forest">Copied</p>}<div className="mt-5 grid grid-cols-2 gap-3 text-left"><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">AI domain</p><p className="mt-1 text-sm font-semibold">{analysis.domain}</p></div><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Priority</p><p className="mt-1 text-sm font-semibold">{analysis.priority}</p></div></div></div><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button onClick={onDone} className="gap-2 bg-jic-deep text-jic-cream hover:bg-jic-deep/90">Track this challenge <ArrowRight className="h-4 w-4" /></Button><Button variant="outline" onClick={onLanding}>Back to home</Button></div></div>;
}
