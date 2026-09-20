import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Factory, GraduationCap, Landmark, LockKeyhole, Mail, Sprout, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_ACCOUNTS, useAppState } from "@/lib/app-state";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup" | "forgot";
const ROLES: { id: UserRole; label: string; icon: React.ElementType }[] = [
  { id: "citizen", label: "Citizen", icon: User },
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "faculty", label: "Faculty", icon: ShieldCheck },
  { id: "university", label: "University", icon: GraduationCap },
  { id: "industry", label: "Industry", icon: Factory },
  { id: "government", label: "Government", icon: Landmark },
];

export function LoginPage() {
  const { loginWithCredentials, createAccount } = useAppState();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const switchMode = (next: AuthMode) => { setMode(next); setMessage(""); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    if (!email.includes("@")) return setMessage("Enter a valid email address.");
    if (mode === "forgot") return setMessage(`Password reset instructions were sent to ${email}.`);
    if (password.length < 8) return setMessage("Password must be at least 8 characters.");
    if (mode === "signup" && password !== confirmPassword) return setMessage("Passwords do not match.");
    const result = mode === "signup"
      ? await createAccount({ name, email, password, role, organization })
      : await loginWithCredentials(email, password);
    if (result) setMessage(result);
  };

  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back";
  return (
    <div className="grid min-h-[calc(100vh-68px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-jic-deep px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-grid-texture-light opacity-40" />
        <div className="relative flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-jic-saffron"><Sprout className="h-5 w-5" /></span><span className="font-display text-lg font-semibold">Jharkhand Innovation Connect</span></div>
        <div className="relative max-w-md"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-jic-saffron"><ShieldCheck className="h-3.5 w-3.5" /> Government of Jharkhand Platform</span><h1 className="mt-5 font-display text-3xl font-semibold leading-[1.15] xl:text-4xl">One ecosystem for every problem-solver in the state.</h1><p className="mt-4 text-sm leading-relaxed text-white/65">Citizens report. Universities research. Industry scales. Government tracks the impact across Jharkhand's 42 districts.</p></div>
        <div className="relative flex gap-8 text-sm text-white/60"><div><p className="font-display text-2xl font-semibold text-white">2,500+</p><p>Challenges reported</p></div><div><p className="font-display text-2xl font-semibold text-white">68</p><p>Institutions active</p></div><div><p className="font-display text-2xl font-semibold text-white">1.8M+</p><p>People impacted</p></div></div>
      </div>
      <div className="flex items-center justify-center bg-jic-cream px-4 py-14 sm:px-6 lg:bg-background lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-jic-deep text-jic-saffron"><Sprout className="h-5 w-5" /></span><span className="font-display text-base font-semibold text-jic-charcoal">Jharkhand Innovation Connect</span></div>
          <h2 className="font-display text-2xl font-semibold text-jic-charcoal">{title}</h2><p className="mt-1.5 text-sm text-muted-foreground">{mode === "forgot" ? "Enter your email and we will send reset instructions." : "Join Jharkhand's community problem-solving network."}</p>
          {mode === "signin" && <div className="mt-5 rounded-lg border border-border bg-card p-3"><p className="text-xs font-semibold text-jic-charcoal">Demo access</p><p className="mt-1 text-xs text-muted-foreground">Password: <span className="font-semibold text-jic-charcoal">Demo@123</span></p><div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">{DEMO_ACCOUNTS.map((account) => <button key={account.email} type="button" onClick={() => { setEmail(account.email); setPassword(account.password); setRole(account.role); }} className="rounded border border-border px-2 py-1.5 text-left text-[11px] font-semibold text-muted-foreground hover:border-jic-forest hover:text-jic-forest">{account.role}</button>)}</div></div>}
          {mode !== "forgot" && <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> or continue with email <span className="h-px flex-1 bg-border" /></div>}
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && <><Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required /></Field><Field label="Organization (optional)"><Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="University, company, or community" /></Field></>}
            <Field label="Email address"><div className="relative"><Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div></Field>
            {mode !== "forgot" && <><Field label="I am joining as"><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{ROLES.map((item) => <button type="button" key={item.id} onClick={() => setRole(item.id)} className={cn("min-h-10 rounded-lg border px-2 py-2 text-xs font-semibold", role === item.id ? "border-jic-forest bg-jic-forest-light text-jic-forest" : "border-border bg-card text-muted-foreground")}>{item.label}</button>)}</div></Field><Field label="Password"><PasswordInput value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} /></Field></>}
            {mode === "signup" && <Field label="Confirm password"><PasswordInput value={confirmPassword} onChange={setConfirmPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} /></Field>}
            {mode === "signin" && <div className="flex justify-end"><button type="button" className="text-xs font-semibold text-jic-forest hover:underline" onClick={() => switchMode("forgot")}>Forgot password?</button></div>}
            {message && <p className="rounded-lg bg-jic-earth-light px-3 py-2 text-sm text-jic-earth">{message}</p>}
            <Button type="submit" className="h-11 w-full gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90">{mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}<ArrowRight className="h-4 w-4" /></Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">{mode === "signin" ? "New to the platform?" : "Already have an account?"} <button type="button" className="font-semibold text-jic-forest hover:underline" onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Sign up" : "Sign in"}</button></div>
          {mode === "forgot" && <button type="button" onClick={() => switchMode("signin")} className="mt-3 flex w-full justify-center text-xs font-semibold text-jic-forest hover:underline">Back to sign in</button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-jic-charcoal">{label}<span className="mt-1.5 block">{children}</span></label>; }
function PasswordInput({ value, onChange, visible, onToggle }: { value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void }) { return <div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9 pr-10" type={visible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="At least 8 characters" minLength={8} required /><button type="button" onClick={onToggle} className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:text-jic-charcoal" aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>; }
