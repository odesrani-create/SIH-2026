import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DemoUser, UserRole } from "@/types";
import { getDemoUser, loginWithCredentials, logoutAccount, registerAccount, restoreAuth } from "@/services/authService";

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
  authLoading: boolean;
  authError: string | null;
  login: (role: UserRole) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, organization?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
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

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<NavState>({ page: "landing", params: {} });
  const [user, setUser] = useState<DemoUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    restoreAuth()
      .then((result) => {
        if (mounted && result) {
          setUser(result.user);
          setNav({ page: ROLE_LANDING[result.user.role], params: {} });
        }
      })
      .catch((error) => {
        if (mounted) setAuthError(error instanceof Error ? error.message : "Unable to restore session.");
      })
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const goTo = (page: PageId, params: Record<string, string> = {}) => {
    setNav({ page, params });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Demo access remains available when Supabase is not configured, so the SIH prototype never breaks locally.
  const login = (role: UserRole) => {
    setAuthError(null);
    setUser(getDemoUser(role));
    goTo(ROLE_LANDING[role]);
  };

  const loginCredentials = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await loginWithCredentials(email, password);
      setUser(result.user);
      goTo(ROLE_LANDING[result.user.role]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      setAuthError(message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, organization?: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await registerAccount(email, password, fullName, organization);
      setUser(result.user);
      goTo(ROLE_LANDING[result.user.role]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed.";
      setAuthError(message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await logoutAccount();
    setUser(null);
    setAuthError(null);
    goTo("landing");
  };

  return (
    <AppStateContext.Provider
      value={{
        nav,
        goTo,
        user,
        authLoading,
        authError,
        login,
        loginWithCredentials: loginCredentials,
        register,
        logout,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
