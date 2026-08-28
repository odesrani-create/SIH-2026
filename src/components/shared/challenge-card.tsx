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
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-elevation-sm transition-all duration-300 hover:-translate-y-1 hover:border-jic-forest/25 hover:shadow-elevation-lg"
    >
      <div className="relative">
        <DomainVisual domain={challenge.domain} className="h-32 w-full" />
        <div className="absolute left-3 top-3">
          <StatusBadge status={challenge.status} className="border-white/25 bg-white/90 shadow-elevation-xs backdrop-blur" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <PriorityBadge priority={challenge.priority} />
          <span className="text-[11px] font-medium text-muted-foreground">{challenge.trackingId}</span>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-jic-charcoal transition-colors group-hover:text-jic-forest">
          {challenge.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{challenge.description}</p>
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
        <div className="mt-auto flex items-center justify-end border-t border-border/70 pt-3.5">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-jic-forest">
            View Challenge <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </button>
  );
}
