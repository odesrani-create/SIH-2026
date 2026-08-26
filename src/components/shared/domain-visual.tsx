import {
  Droplets,
  Sprout,
  HeartPulse,
  GraduationCap,
  Leaf,
  Zap,
  Building2,
  Accessibility,
  Landmark,
  Users,
  Recycle,
  Construction,
  type LucideIcon,
} from "lucide-react";
import type { Domain } from "@/types";
import { cn } from "@/lib/utils";

const DOMAIN_ICON: Record<Domain, LucideIcon> = {
  Water: Droplets,
  Agriculture: Sprout,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Environment: Leaf,
  Energy: Zap,
  "Urban Development": Building2,
  Accessibility: Accessibility,
  "Public Administration": Landmark,
  "Rural Livelihoods": Users,
  Sanitation: Recycle,
  Infrastructure: Construction,
};

const DOMAIN_TONE: Record<Domain, string> = {
  Water: "from-sky-800 to-jic-deep",
  Agriculture: "from-jic-forest to-jic-deep",
  Healthcare: "from-rose-800 to-jic-deep",
  Education: "from-amber-700 to-jic-deep",
  Environment: "from-emerald-800 to-jic-deep",
  Energy: "from-jic-saffron/90 to-jic-earth",
  "Urban Development": "from-slate-700 to-jic-deep",
  Accessibility: "from-violet-800 to-jic-deep",
  "Public Administration": "from-jic-earth to-jic-deep",
  "Rural Livelihoods": "from-teal-800 to-jic-deep",
  Sanitation: "from-cyan-800 to-jic-deep",
  Infrastructure: "from-stone-700 to-jic-deep",
};

export function DomainVisual({ domain, className }: { domain: Domain; className?: string }) {
  const Icon = DOMAIN_ICON[domain];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        DOMAIN_TONE[domain],
        className
      )}
    >
      <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:16px_16px]" />
      <Icon className="h-10 w-10 text-white/90" strokeWidth={1.5} />
    </div>
  );
}
