import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
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
  loginWithGoogle: (role: UserRole) => Promise<string | null>;
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
const GOOGLE_ROLE_STORAGE_KEY = "jic-google-role";

const USER_ROLES = new Set<UserRole>(["citizen", "university", "student", "faculty", "industry", "government"]);

function isStoredUser(value: unknown): value is DemoUser & { email?: string } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DemoUser>;
  return typeof candidate.name === "string" && USER_ROLES.has(candidate.role as UserRole);
}

function persistSession(user: (DemoUser & { email?: string }) | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

function readAccounts() {
  const stored = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (!stored) return DEMO_ACCOUNTS;
  try {
    const accounts = JSON.parse(stored);
    if (!Array.isArray(accounts)) return DEMO_ACCOUNTS;
    const validAccounts = accounts.filter((account): account is typeof DEMO_ACCOUNTS[number] => (
      account &&
      typeof account.email === "string" &&
      typeof account.password === "string" &&
      typeof account.name === "string" &&
      USER_ROLES.has(account.role)
    ));
    return [...DEMO_ACCOUNTS, ...validAccounts];
  } catch {
    return DEMO_ACCOUNTS;
  }
}

function getPreferredLandingPage(role?: UserRole): PageId {
  return role ? ROLE_LANDING[role] ?? "landing" : "landing";
}

function readGoogleRole(): UserRole | undefined {
  if (typeof window === "undefined") return undefined;
  const role = window.localStorage.getItem(GOOGLE_ROLE_STORAGE_KEY) as UserRole | null;
  return role && USER_ROLES.has(role) ? role : undefined;
}

function clearGoogleRole() {
  if (typeof window !== "undefined") window.localStorage.removeItem(GOOGLE_ROLE_STORAGE_KEY);
}

function setAuthenticatedState(
  nextUser: DemoUser & { email?: string },
  setUser: Dispatch<SetStateAction<(DemoUser & { email?: string }) | null>>,
  setNav: Dispatch<SetStateAction<NavState>>,
) {
  setUser(nextUser);
  persistSession(nextUser);
  setNav({ page: getPreferredLandingPage(nextUser.role), params: {} });
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<NavState>(() => {
    if (typeof window === "undefined") return { page: "login", params: {} };
    try {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return { page: "login", params: {} };
      const parsed: unknown = JSON.parse(stored);
      if (!isStoredUser(parsed)) return { page: "login", params: {} };
      return { page: getPreferredLandingPage(parsed.role), params: {} };
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return { page: "login", params: {} };
    }
  });
  const [user, setUser] = useState<(DemoUser & { email?: string }) | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      const parsed: unknown = JSON.parse(stored);
      return isStoredUser(parsed) ? parsed : null;
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  });

  useEffect(() => {
    if (!supabase) {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        try {
          const parsed: unknown = JSON.parse(stored);
          if (!isStoredUser(parsed)) throw new Error("Invalid stored session");
          setAuthenticatedState(parsed, setUser, setNav);
        } catch {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          setUser(null);
          setNav({ page: "login", params: {} });
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
        const nextUser = { name: data.name, email: data.email, role, organization: data.organization ?? undefined };
        clearGoogleRole();
        setAuthenticatedState(nextUser, setUser, setNav);
        return;
      }
      const metadataRole = metadata.role as UserRole | undefined;
      const googleRole = readGoogleRole();
      const profileRole = metadataRole && USER_ROLES.has(metadataRole) ? metadataRole : googleRole;
      if (profileRole) {
        const profile = {
          user_id: userId,
          name: String(metadata.name ?? email),
          email,
          role: profileRole,
          organization: String(metadata.organization ?? ROLE_ORG[profileRole] ?? "") || null,
        };
        if (!data) await client.from("profiles").upsert(profile);
        if (active) {
          clearGoogleRole();
          const nextUser = { name: profile.name, email, role: profileRole, organization: profile.organization ?? undefined };
          setAuthenticatedState(nextUser, setUser, setNav);
        }
      }
    };

    void supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        void hydrateUser(sessionUser.id, sessionUser.email ?? "", sessionUser.user_metadata);
      } else {
        setUser(null);
        setNav({ page: "login", params: {} });
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setNav({ page: "login", params: {} });
        persistSession(null);
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
    if (page !== "login" && !user) {
      setNav({ page: "login", params: {} });
      return;
    }

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
    const nextUser = { name: ROLE_NAME[role], role, organization: ROLE_ORG[role] };
    setAuthenticatedState(nextUser, setUser, setNav);
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

  const loginWithGoogle = async (role: UserRole) => {
    if (!supabase) return "Google sign-in is not configured. Add the Supabase environment variables first.";
    window.localStorage.setItem(GOOGLE_ROLE_STORAGE_KEY, role);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      clearGoogleRole();
      return error.message;
    }
    return null;
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
    const nextUser = { name: account.name, email: account.email, role, organization: account.organization ?? ROLE_ORG[role] };
    setAuthenticatedState(nextUser, setUser, setNav);
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    persistSession(null);
    setUser(null);
    setNav({ page: "login", params: {} });
  };

  return (
    <AppStateContext.Provider value={{ nav, goTo, user, login, loginWithCredentials, loginWithGoogle, createAccount, loginWithAccount, logout }}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
