import { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  ArrowLeft,
  Sparkles,
  FileText,
  Target,
  Layers,
  Building2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge, DomainTag } from "@/components/shared/badges";
import { DomainVisual } from "@/components/shared/domain-visual";
import { useAppState } from "@/lib/app-state";
import { CHALLENGES } from "@/data/demoData";
import { classifyChallenge, matchInstitutions } from "@/services/aiService";
import type { AIAnalysis, University } from "@/types";

export function ChallengeDetailPage() {
  const { nav, goTo, user } = useAppState();
  const challenge = CHALLENGES.find((c) => c.id === nav.params.id) ?? CHALLENGES[0];

  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [institutions, setInstitutions] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    classifyChallenge({
      title: challenge.title,
      description: challenge.description,
      affectedPopulation: challenge.affectedPopulation,
    }).then(async (result) => {
      if (!active) return;
      setAnalysis(result);
      const inst = await matchInstitutions(challenge.domain, challenge.tags);
      if (!active) return;
      setInstitutions(inst);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [challenge.id]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => goTo("challenges")}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-jic-forest"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Challenges
      </button>

      <DomainVisual domain={challenge.domain} className="h-52 w-full rounded-3xl sm:h-64" />

      <div className="mt-6 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={challenge.status} />
            <PriorityBadge priority={challenge.priority} />
            <DomainTag domain={challenge.domain} />
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-jic-charcoal sm:text-4xl">
            {challenge.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {challenge.village ? `${challenge.village}, ` : ""}
              {challenge.block ? `${challenge.block}, ` : ""}
              {challenge.district}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Submitted {formatDate(challenge.submittedDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {challenge.affectedPopulation.toLocaleString("en-IN")}+ affected
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Tracking ID: <span className="font-mono font-medium text-jic-charcoal">{challenge.trackingId}</span> · Submitted by{" "}
            {challenge.submittedBy}
          </p>

          <div className="mt-8 space-y-6">
            <DetailBlock icon={FileText} title="Problem Description" text={challenge.description} />
            <DetailBlock icon={Layers} title="Current Situation" text={challenge.currentSituation} />
            <DetailBlock icon={Target} title="Desired Outcome" text={challenge.desiredOutcome} />
          </div>

          <div className="mt-8">
            <p className="mb-2 text-sm font-semibold text-jic-charcoal">Tags</p>
            <div className="flex flex-wrap gap-2">
              {challenge.tags.map((t) => (
                <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-2 text-sm font-semibold text-jic-charcoal">Supporting Documents</p>
            <div className="flex flex-wrap gap-2">
              {["Site_Photos.zip", "Community_Survey.pdf", "Location_Map.png"].map((doc) => (
                <span key={doc} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" /> {doc}
                </span>
              ))}
            </div>
          </div>

          {user?.role === "university" || user?.role === "faculty" ? (
            <Button
              className="mt-10 bg-jic-deep text-jic-cream hover:bg-jic-deep/90"
              onClick={() => goTo("university-workspace", { id: challenge.id })}
            >
              Open in University Workspace
            </Button>
          ) : null}
        </div>

        {/* Sidebar: AI analysis + institutions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-jic-forest/20 bg-jic-forest-light/40 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-jic-deep text-jic-saffron">
                <Sparkles className="h-4 w-4" />
              </span>
              <p className="font-display text-base font-semibold text-jic-charcoal">AI Analysis</p>
            </div>
            {loading || !analysis ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing problem…
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Category" value={analysis.domain} />
                <Row label="Priority" value={analysis.priority} />
                <Row label="Estimated Impact" value={`${analysis.impactScore.toFixed(1)} / 5`} />
                <Row label="Duplicate Risk" value={analysis.duplicateRisk} />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Related Domains</p>
                  <p className="mt-1 text-jic-charcoal">{analysis.relatedDomains.join(" · ")}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Potential Skills</p>
                  <p className="mt-1 text-jic-charcoal">{analysis.potentialSkills.join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Suggested Technologies</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {analysis.suggestedTechnologies.map((t) => (
                      <span key={t} className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-jic-forest">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-jic-forest" />
              <p className="font-display text-base font-semibold text-jic-charcoal">Recommended Institutions</p>
            </div>
            <div className="mt-4 space-y-3">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
                  ))
                : institutions.map((u) => (
                    <div key={u.id} className="rounded-xl border border-border p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug text-jic-charcoal">{u.name}</p>
                        <span className="shrink-0 rounded-full bg-jic-forest-light px-2 py-0.5 text-xs font-bold text-jic-forest">
                          {u.matchScore}% Match
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">{u.expertise.slice(0, 3).join(" · ")}</p>
                      <button
                        onClick={() => goTo("university-dashboard")}
                        className="mt-2 text-xs font-semibold text-jic-forest hover:underline"
                      >
                        View Institution
                      </button>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-jic-charcoal">
        <Icon className="h-4 w-4 text-jic-forest" /> {title}
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="font-semibold text-jic-charcoal">{value}</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
