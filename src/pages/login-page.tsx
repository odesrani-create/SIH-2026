import { useState } from "react";
import { User, GraduationCap, BookUser, Factory, Landmark, School, ArrowRight, Sprout, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

const ROLES: { id: UserRole; label: string; description: string; icon: React.ElementType }[] = [
  { id: "citizen", label: "Citizen", description: "Report problems and track their progress", icon: User },
  { id: "university", label: "University", description: "Discover, research and lead challenge projects", icon: GraduationCap },
  { id: "student", label: "Student", description: "Join project teams and contribute research", icon: School },
  { id: "faculty", label: "Faculty", description: "Mentor teams and guide project design", icon: BookUser },
  { id: "industry", label: "Industry", description: "Fund, mentor and scale deployed solutions", icon: Factory },
  { id: "government", label: "Government", description: "Monitor state-wide impact and pipelines", icon: Landmark },
];

export function LoginPage() {
  const { login } = useAppState();
  const [selected, setSelected] = useState<UserRole>("citizen");
  const activeRole = ROLES.find((r) => r.id === selected)!;

  return (
    <div className="grid min-h-[calc(100vh-68px)] lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden overflow-hidden bg-jic-deep px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-grid-texture-light opacity-40" />
        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-jic-saffron/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-jic-forest/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-jic-saffron">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold">Jharkhand Innovation Connect</span>
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-jic-saffron">
            <ShieldCheck className="h-3.5 w-3.5" /> Government of Jharkhand Platform
          </span>
          <h1 className="mt-5 text-balance font-display text-3xl font-semibold leading-[1.15] xl:text-4xl">
            One ecosystem for every problem-solver in the state.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            Citizens report. Universities research. Industry scales. Government tracks the impact — all in one
            place, built for Jharkhand's 42 districts.
          </p>
        </div>

        <div className="relative flex gap-8 text-sm text-white/60">
          <div>
            <p className="font-display text-2xl font-semibold text-white">2,500+</p>
            <p>Challenges reported</p>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-white">68</p>
            <p>Institutions active</p>
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-white">1.8M+</p>
            <p>People impacted</p>
          </div>
        </div>
      </div>

      {/* Right: role selection */}
      <div className="flex items-center justify-center bg-jic-cream px-4 py-14 sm:px-6 lg:bg-background lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-jic-deep text-jic-saffron">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="font-display text-base font-semibold text-jic-charcoal">Jharkhand Innovation Connect</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-jic-charcoal">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Choose a demo account to explore the platform from that role's perspective.
          </p>

          <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200",
                  selected === role.id
                    ? "border-jic-forest bg-jic-forest-light/60 shadow-elevation-sm"
                    : "border-border bg-card hover:border-jic-forest/35 hover:bg-jic-forest-light/20"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                    selected === role.id ? "bg-jic-deep text-jic-saffron" : "bg-muted text-muted-foreground"
                  )}
                >
                  <role.icon className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-jic-charcoal">{role.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{role.description}</span>
                </span>
              </button>
            ))}
          </div>

          <Button
            className="mt-7 h-12 w-full gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90"
            onClick={() => login(selected)}
          >
            Continue as {activeRole.label} <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Prototype build — no real credentials required.
          </p>
        </div>
      </div>
    </div>
  );
}
