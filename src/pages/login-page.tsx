import { useState } from "react";
import { User, GraduationCap, BookUser, Factory, Landmark, School, ArrowRight } from "lucide-react";
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

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-jic-charcoal">Sign in to Jharkhand Innovation Connect</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose a demo account to explore the platform from that role's perspective.</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelected(role.id)}
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
              selected === role.id ? "border-jic-forest bg-jic-forest-light/50" : "border-border bg-card hover:border-jic-forest/40"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                selected === role.id ? "bg-jic-forest text-white" : "bg-muted text-muted-foreground"
              )}
            >
              <role.icon className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-jic-charcoal">{role.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{role.description}</span>
            </span>
          </button>
        ))}
      </div>

      <Button className="mt-8 h-11 gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={() => login(selected)}>
        Continue as {ROLES.find((r) => r.id === selected)?.label} <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">Prototype build — no real credentials required.</p>
    </div>
  );
}
