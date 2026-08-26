import { MapPin, Users, ArrowRight } from "lucide-react";
import type { Challenge } from "@/types";
import { PriorityBadge, StatusBadge } from "@/components/shared/badges";
import { DomainVisual } from "@/components/shared/domain-visual";
import { useAppState } from "@/lib/app-state";

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { goTo } = useAppState();
  return (
    <button
      onClick={() => goTo("challenge-detail", { id: challenge.id })}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <DomainVisual domain={challenge.domain} className="h-32 w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={challenge.status} />
          <PriorityBadge priority={challenge.priority} />
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-jic-charcoal group-hover:text-jic-forest">
          {challenge.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{challenge.description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {challenge.district}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {challenge.affectedPopulation.toLocaleString("en-IN")}+ affected
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {challenge.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-xs font-medium text-muted-foreground">{challenge.trackingId}</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-jic-forest">
            View Challenge <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
}
