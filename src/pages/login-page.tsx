import { useState } from "react";
import { User, GraduationCap, BookUser, Factory, Landmark, School, ArrowRight, Sprout, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/app-state";
import { isSupabaseConfigured } from "@/lib/supabase";
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
  const { login, loginWithCredentials, register, authLoading, authError, clearAuthError } = useAppState();
  const [selected, setSelected] = useState<UserRole>("citizen");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const activeRole = ROLES.find((r) => r.id === selected)!;

  const submitAuth = async () => {
    setFormError(null);
    clearAuthError();
    if (!email.trim() || !password) {
      setFormError("Please enter your email and password.");
      return;
    }
    if (mode === "register" && !fullName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }

    try {
      if (mode === "login") await loginWithCredentials(email.trim(), password);
      else await register(email.trim(), password, fullName.trim(), organization.trim() || undefined);
    } catch {
      // The provider exposes the readable error below.
    }
  };

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setFormError(null);
    clearAuthError();
  };

  return (
    <div className="grid min-h-[calc(100vh-68px)] lg:grid-cols-2">
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
            Citizens report. Universities research. Industry scales. Government tracks the impact — all in one place.
          </p>
        </div>

        <div className="relative flex gap-8 text-sm text-white/60">
          <div><p className="font-display text-2xl font-semibold text-white">2,500+</p><p>Challenges reported</p></div>
          <div><p className="font-display text-2xl font-semibold text-white">68</p><p>Institutions active</p></div>
          <div><p className="font-display text-2xl font-semibold text-white">1.8M+</p><p>People impacted</p></div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-jic-cream px-4 py-12 sm:px-6 lg:bg-background lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-jic-deep text-jic-saffron"><Sprout className="h-5 w-5" /></span>
            <span className="font-display text-base font-semibold text-jic-charcoal">Jharkhand Innovation Connect</span>
          </div>

          <div className="flex rounded-xl bg-muted p-1">
            <button type="button" onClick={() => switchMode("login")} className={cn("flex-1 rounded-lg px-3 py-2 text-sm font-semibold", mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground")}>Sign in</button>
            <button type="button" onClick={() => switchMode("register")} className={cn("flex-1 rounded-lg px-3 py-2 text-sm font-semibold", mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground")}>Create account</button>
          </div>

          <h2 className="mt-7 font-display text-2xl font-semibold text-jic-charcoal">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "login" ? "Sign in with your registered account." : "New accounts start as Citizen and can be verified for other roles."}
          </p>

          {mode === "register" && <Input className="mt-5 h-11" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />}
          <Input className="mt-3 h-11" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          {mode === "register" && <Input className="mt-3 h-11" placeholder="Organization (optional)" value={organization} onChange={(e) => setOrganization(e.target.value)} />}
          <div className="relative mt-3">
            <Input className="h-11 pr-11" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {(formError || authError) && <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">{formError || authError}</p>}

          <Button disabled={authLoading} className="mt-5 h-12 w-full gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={submitAuth}>
            {authLoading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" />
          </Button>

          {!isSupabaseConfigured && (
            <div className="mt-7 border-t pt-6">
              <p className="mb-3 text-xs font-semibold text-muted-foreground">Demo access</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ROLES.map((role) => (
                  <button key={role.id} type="button" onClick={() => setSelected(role.id)} className={cn("flex items-start gap-2 rounded-xl border p-2.5 text-left", selected === role.id ? "border-jic-forest bg-jic-forest-light/60" : "border-border bg-card hover:border-jic-forest/35")}>
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", selected === role.id ? "bg-jic-deep text-jic-saffron" : "bg-muted text-muted-foreground")}><role.icon className="h-4 w-4" /></span>
                    <span><span className="block text-xs font-semibold">{role.label}</span><span className="block text-[10px] text-muted-foreground">{role.description}</span></span>
                  </button>
                ))}
              </div>
              <Button variant="outline" className="mt-3 w-full" onClick={() => login(selected)}>Continue as demo {activeRole.label}</Button>
            </div>
          )}

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            {isSupabaseConfigured ? "Secure authentication powered by your Supabase project." : "Demo mode is active. Add Supabase environment variables to enable real accounts."}
          </p>
        </div>
      </div>
    </div>
  );
}
