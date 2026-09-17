import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DemoUser, UserRole } from "@/types";

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
  loginWithCredentials: (email: string, password: string) => string | null;
  createAccount: (account: { name: string; email: string; password: string; role: UserRole; organization?: string }) => string | null;
  loginWithAccount: (account: { name: string; email: string; role?: UserRole; organization?: string }) => void;
  logout: () => void;
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
  const [user, setUser] = useState<(DemoUser & { email?: string }) | null>(() => {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  });

  useEffect(() => {
    if (user) window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }, [user]);

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

  const loginWithCredentials = (email: string, password: string) => {
    const account = readAccounts().find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!account || account.password !== password) return "Email or password is incorrect.";
    loginWithAccount(account);
    return null;
  };

  const createAccount = (account: { name: string; email: string; password: string; role: UserRole; organization?: string }) => {
    const normalizedEmail = account.email.trim().toLowerCase();
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
  };

  const loginWithAccount = (account: { name: string; email: string; role?: UserRole; organization?: string }) => {
    const role = account.role ?? "citizen";
    setUser({ name: account.name, email: account.email, role, organization: account.organization ?? ROLE_ORG[role] });
    setNav({ page: ROLE_LANDING[role], params: {} });
  };

  const logout = () => {
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
