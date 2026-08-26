import { useState } from "react";
import { Search, Check, MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { PriorityBadge } from "@/components/shared/badges";
import { findChallengeByTrackingId } from "@/services/aiService";
import type { Challenge, ChallengeStatus } from "@/types";
import { cn } from "@/lib/utils";

const TIMELINE: ChallengeStatus[] = [
  "Submitted",
  "Under Review",
  "Validated",
  "University Assigned",
  "Research Started",
  "Prototype",
  "Pilot",
  "Implemented",
];

export function TrackChallengePage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Challenge | null | undefined>(undefined);

  const search = () => {
    if (!input.trim()) return;
    setResult(findChallengeByTrackingId(input) ?? null);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Transparency" title="Track your challenge" description="Enter your Challenge ID to see exactly where it stands in the process." align="center" className="mx-auto" />

      <div className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="e.g. JIC-2025-001842"
            className="h-11 rounded-full pl-10 font-mono"
          />
        </div>
        <Button className="h-11 bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={search}>
          Track
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Try <button onClick={() => setInput("JIC-2025-001842")} className="font-mono font-medium text-jic-forest hover:underline">JIC-2025-001842</button>
      </p>

      {result === null && (
        <div className="mt-10 rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No challenge found for that ID. Please check and try again.
        </div>
      )}

      {result && (
        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={result.priority} />
            <span className="font-mono text-xs text-muted-foreground">{result.trackingId}</span>
          </div>
          <h2 className="mt-3 font-display text-xl font-semibold text-jic-charcoal">{result.title}</h2>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {result.district}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Submitted {new Date(result.submittedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>

          <div className="mt-8 space-y-1">
            {TIMELINE.map((stage, i) => {
              const currentIndex = TIMELINE.indexOf(result.status);
              const done = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={stage} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs",
                        done ? "border-jic-forest bg-jic-forest text-white" : "border-border text-muted-foreground"
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    {i < TIMELINE.length - 1 && <span className={cn("h-8 w-0.5", i < currentIndex ? "bg-jic-forest" : "bg-border")} />}
                  </div>
                  <div className="pb-2 pt-0.5">
                    <p className={cn("text-sm font-medium", isCurrent ? "text-jic-forest" : done ? "text-jic-charcoal" : "text-muted-foreground")}>
                      {stage}
                    </p>
                    {isCurrent && <p className="text-xs text-muted-foreground">Current stage</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
