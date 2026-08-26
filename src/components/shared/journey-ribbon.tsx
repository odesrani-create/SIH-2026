import { MessageSquareText, Sparkles, GraduationCap, Factory, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Citizen Reports", icon: MessageSquareText },
  { label: "AI Understands", icon: Sparkles },
  { label: "University Matches", icon: GraduationCap },
  { label: "Industry Joins", icon: Factory },
  { label: "Solution Deployed", icon: Rocket },
];

export function JourneyRibbon({ light = false, activeIndex }: { light?: boolean; activeIndex?: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = activeIndex === i;
        return (
          <div key={step.label} className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 sm:px-4 sm:py-2",
                light
                  ? isActive
                    ? "border-jic-saffron bg-jic-saffron/15 text-jic-saffron"
                    : "border-white/15 bg-white/[0.06] text-white/80"
                  : isActive
                  ? "border-jic-forest bg-jic-forest text-white"
                  : "border-border bg-white text-jic-charcoal/80"
              )}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap text-[11px] font-semibold sm:text-xs">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px w-4 sm:w-8", light ? "bg-white/20" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
