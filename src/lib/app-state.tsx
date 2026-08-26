import { createContext, useContext, useState } from "react";
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

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<NavState>({ page: "landing", params: {} });
  const [user, setUser] = useState<DemoUser | null>(null);

  const goTo = (page: PageId, params: Record<string, string> = {}) => {
    setNav({ page, params });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const login = (role: UserRole) => {
    setUser({ name: ROLE_NAME[role], role, organization: ROLE_ORG[role] });
    goTo(ROLE_LANDING[role]);
  };

  const logout = () => {
    setUser(null);
    goTo("landing");
  };

  return (
    <AppStateContext.Provider value={{ nav, goTo, user, login, logout }}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
