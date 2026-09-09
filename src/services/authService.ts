import type { DemoUser, UserRole } from "@/types";
import {
  fetchProfile,
  getStoredSession,
  isSupabaseConfigured,
  signInWithPassword,
  signOut,
  signUp,
  type SupabaseSession,
} from "@/lib/supabase";

export interface AuthResult {
  user: DemoUser;
  session: SupabaseSession | null;
}

const ROLE_LANDING: Record<UserRole, DemoUser["role"]> = {
  citizen: "citizen",
  university: "university",
  student: "student",
  faculty: "faculty",
  industry: "industry",
  government: "government",
};

export const DEMO_USERS: Record<UserRole, DemoUser> = {
  citizen: { name: "Ritu Kumari", role: "citizen" },
  university: { name: "Dr. Anita Kujur", role: "university", organization: "Birla Institute of Technology, Mesra" },
  student: { name: "Rohan Mahato", role: "student", organization: "Birla Institute of Technology, Mesra" },
  faculty: { name: "Dr. Anita Kujur", role: "faculty", organization: "Birla Institute of Technology, Mesra" },
  industry: { name: "Priya Sharma", role: "industry", organization: "AquaTech Innovations Pvt Ltd" },
  government: { name: "Suresh Prasad, IAS", role: "government", organization: "Dept. of IT & e-Governance, Jharkhand" },
};

function profileToUser(profile: Record<string, unknown>): DemoUser {
  const role = (profile.role as UserRole) || "citizen";
  return {
    name: String(profile.full_name || "Citizen"),
    role: ROLE_LANDING[role] || "citizen",
    organization: profile.organization ? String(profile.organization) : undefined,
  };
}

export async function restoreAuth(): Promise<AuthResult | null> {
  if (!isSupabaseConfigured) return null;
  const session = getStoredSession();
  if (!session) return null;
  const profile = await fetchProfile(session.user.id, session.access_token);
  return profile ? { user: profileToUser(profile), session } : null;
}

export async function loginWithCredentials(email: string, password: string): Promise<AuthResult> {
  const session = await signInWithPassword(email, password);
  const profile = await fetchProfile(session.user.id, session.access_token);
  if (!profile) throw new Error("Account profile was not created. Please run supabase/schema.sql.");
  return { user: profileToUser(profile), session };
}

export async function registerAccount(
  email: string,
  password: string,
  fullName: string,
  organization?: string,
): Promise<AuthResult> {
  const data = await signUp(email, password, fullName, organization);
  if (!data.access_token) {
    throw new Error("Account created. Please verify your email, then sign in.");
  }
  const session = data as SupabaseSession;
  const profile = await fetchProfile(session.user.id, session.access_token);
  return {
    user: profile ? profileToUser(profile) : { name: fullName, role: "citizen" },
    session,
  };
}

export async function logoutAccount() {
  await signOut();
}

export function getDemoUser(role: UserRole) {
  return DEMO_USERS[role];
}
