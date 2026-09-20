import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DemoUser, UserRole } from "@/types";
import { supabase } from "@/lib/supabase";

export type PageId =
  | "landing"
  | "challenges"
  | "challenge-detail"
  | "submit"
  | "university-dashboard"
  | "university-workspace"
  | "project"
  | "industry"
  | "government"
  | "impact"
  | "track"
  | "login";

interface NavState {
  page: PageId;
  params: Record<string, string>;
}

interface AppStateValue {
  nav: NavState;
  goTo: (page: PageId, params?: Record<string, string>) => void;
  user: DemoUser | null;
  login: (role: UserRole) => void;
  loginWithCredentials: (email: string, password: string) => Promise<string | null>;
  createAccount: (account: { name: string; email: string; password: string; role: UserRole; organization?: string }) => Promise<string | null>;
  loginWithAccount: (account: { name: string; email: string; role?: UserRole; organization?: string }) => void;
  logout: () => Promise<void>;
}

const AppStateContext = createContext<AppStateValue | null>(null);

const ROLE_LANDING: Record<UserRole, PageId> = {
  citizen: "landing",
  university: "university-dashboard",
  student: "university-dashboard",
  faculty: "university-dashboard",
  industry: "industry",
  government: "government",
};

const ROLE_NAME: Record<UserRole, string> = {
  citizen: "Ritu Kumari",
  university: "Dr. Anita Kujur",
  student: "Rohan Mahato",
  faculty: "Dr. Anita Kujur",
  industry: "Priya Sharma",
  government: "Suresh Prasad, IAS",
};

const ROLE_ORG: Partial<Record<UserRole, string>> = {
  university: "Birla Institute of Technology, Mesra",
  student: "Birla Institute of Technology, Mesra",
  faculty: "Birla Institute of Technology, Mesra",
  industry: "AquaTech Innovations Pvt Ltd",
  government: "Dept. of IT & e-Governance, Jharkhand",
};

export const DEMO_ACCOUNTS = [
  { name: "Ritu Kumari", email: "citizen@jic.demo", password: "Demo@123", role: "citizen" as const },
  { name: "Rohan Mahato", email: "student@jic.demo", password: "Demo@123", role: "student" as const, organization: ROLE_ORG.student },
  { name: "Dr. Anita Kujur", email: "faculty@jic.demo", password: "Demo@123", role: "faculty" as const, organization: ROLE_ORG.faculty },
  { name: "Dr. Anita Kujur", email: "university@jic.demo", password: "Demo@123", role: "university" as const, organization: ROLE_ORG.university },
  { name: "Priya Sharma", email: "industry@jic.demo", password: "Demo@123", role: "industry" as const, organization: ROLE_ORG.industry },
  { name: "Suresh Prasad, IAS", email: "government@jic.demo", password: "Demo@123", role: "government" as const, organization: ROLE_ORG.government },
];

const ACCOUNT_STORAGE_KEY = "jic-auth-accounts";
const SESSION_STORAGE_KEY = "jic-auth-session";

function readAccounts() {
  const stored = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (!stored) return DEMO_ACCOUNTS;
  try {
    return [...DEMO_ACCOUNTS, ...JSON.parse(stored)];
  } catch {
    return DEMO_ACCOUNTS;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<NavState>({ page: "landing", params: {} });
  const [user, setUser] = useState<(DemoUser & { email?: string }) | null>(null);

  useEffect(() => {
    if (!supabase) {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
      return;
    }

    let active = true;
    const hydrateUser = async (userId: string, email: string, metadata: Record<string, unknown>) => {
      const client = supabase;
      if (!client) return;
      const { data } = await client.from("profiles").select("name, email, role, organization").eq("user_id", userId).maybeSingle();
      if (!active) return;
      const role = data?.role as UserRole | undefined;
      if (role && data) {
        setUser({ name: data.name, email: data.email, role, organization: data.organization ?? undefined });
        return;
      }
      const metadataRole = metadata.role as UserRole | undefined;
      if (metadataRole) {
        const profile = {
          user_id: userId,
          name: String(metadata.name ?? email),
          email,
          role: metadataRole,
          organization: String(metadata.organization ?? "") || null,
        };
        if (!data) await client.from("profiles").upsert(profile);
        if (active) setUser({ name: profile.name, email, role: metadataRole, organization: profile.organization ?? undefined });
      }
    };

    void supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) void hydrateUser(sessionUser.id, sessionUser.email ?? "", sessionUser.user_metadata);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      setTimeout(() => void hydrateUser(session.user.id, session.user.email ?? "", session.user.user_metadata), 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const goTo = (page: PageId, params: Record<string, string> = {}) => {
    const requiredRoles: Partial<Record<PageId, UserRole[]>> = {
      "university-dashboard": ["university", "student", "faculty"],
      "university-workspace": ["university", "student", "faculty"],
      industry: ["industry"],
      government: ["government"],
    };
    const allowedRoles = requiredRoles[page];
    if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
      setNav({ page: "login", params: {} });
      return;
    }
    setNav({ page, params });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const login = (role: UserRole) => {
    setUser({ name: ROLE_NAME[role], role, organization: ROLE_ORG[role] });
    setNav({ page: ROLE_LANDING[role], params: {} });
  };

  const loginWithCredentials = async (email: string, password: string) => {
    const account = readAccounts().find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (account?.password === password) {
      loginWithAccount(account);
      return null;
    }
    if (!supabase) return "Email or password is incorrect.";
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error?.message ?? null;
  };

  const createAccount = async (account: { name: string; email: string; password: string; role: UserRole; organization?: string }) => {
    const normalizedEmail = account.email.trim().toLowerCase();
    if (!supabase) {
      if (readAccounts().some((item) => item.email.toLowerCase() === normalizedEmail)) return "An account with this email already exists.";
      const stored = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
      let accounts = [];
      if (stored) {
        try {
          accounts = JSON.parse(stored);
        } catch {
          accounts = [];
        }
      }
      window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify([...accounts, { ...account, email: normalizedEmail }]));
      loginWithAccount({ ...account, email: normalizedEmail });
      return null;
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: account.password,
      options: { data: { name: account.name, role: account.role, organization: account.organization ?? "" } },
    });
    if (error || !data.user) return error?.message ?? "Unable to create account.";
    if (!data.session) return "Account created. Check your email to confirm your account before signing in.";
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: data.user.id,
      name: account.name,
      email: normalizedEmail,
      role: account.role,
      organization: account.organization ?? null,
    });
    return profileError?.message ?? null;
  };

  const loginWithAccount = (account: { name: string; email: string; role?: UserRole; organization?: string }) => {
    const role = account.role ?? "citizen";
    setUser({ name: account.name, email: account.email, role, organization: account.organization ?? ROLE_ORG[role] });
    setNav({ page: ROLE_LANDING[role], params: {} });
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    goTo("landing");
  };

  return (
    <AppStateContext.Provider value={{ nav, goTo, user, login, loginWithCredentials, createAccount, loginWithAccount, logout }}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
