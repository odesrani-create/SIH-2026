import type { Priority, ChallengeStatus } from "@/types";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<Priority, string> = {
  Low: "bg-jic-forest-light text-jic-forest border-jic-forest/20",
  Medium: "bg-jic-saffron-light text-jic-earth border-jic-earth/20",
  High: "bg-orange-100 text-orange-800 border-orange-200",
  Critical: "bg-red-100 text-red-800 border-red-200",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        PRIORITY_STYLES[priority],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority} Priority
    </span>
  );
}

const STATUS_STYLES: Record<ChallengeStatus, string> = {
  Submitted: "bg-muted text-muted-foreground border-border",
  "Under Review": "bg-jic-saffron-light text-jic-earth border-jic-earth/20",
  Validated: "bg-blue-50 text-blue-700 border-blue-200",
  "University Assigned": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Research Started": "bg-purple-50 text-purple-700 border-purple-200",
  Prototype: "bg-jic-earth-light text-jic-earth border-jic-earth/20",
  Pilot: "bg-jic-forest-light text-jic-forest border-jic-forest/20",
  Implemented: "bg-jic-deep/10 text-jic-deep border-jic-deep/20",
};

export function StatusBadge({ status, className }: { status: ChallengeStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        STATUS_STYLES[status],
        className
      )}
    >
      {status}
    </span>
  );
}

export function DomainTag({ domain, className }: { domain: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-jic-forest/8 px-2.5 py-1 text-xs font-medium text-jic-forest",
        className
      )}
    >
      {domain}
    </span>
  );
}
