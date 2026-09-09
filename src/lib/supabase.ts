const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (typeof window !== "undefined" && !isSupabaseConfigured) {
  console.info("Supabase is not configured. The app will use demo mode until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
}

export const SUPABASE_URL = supabaseUrl ?? "";
export const SUPABASE_ANON_KEY = supabaseAnonKey ?? "";

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
}

const SESSION_KEY = "jic.supabase.session";

export function getStoredSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SupabaseSession) : null;
  } catch {
    return null;
  }
}

export function storeSession(session: SupabaseSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

async function request(path: string, options: RequestInit = {}) {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.msg || data?.message || data?.error_description || data?.error || "Supabase request failed.";
    throw new Error(message);
  }
  return data;
}

export async function signInWithPassword(email: string, password: string) {
  const session = (await request("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })) as SupabaseSession;
  storeSession(session);
  return session;
}

export async function signUp(email: string, password: string, fullName: string, organization?: string) {
  const data = await request("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      data: { full_name: fullName, organization: organization || null },
    }),
  });

  if (data?.access_token) storeSession(data as SupabaseSession);
  return data as SupabaseSession & { user: SupabaseSession["user"] };
}

export async function signOut() {
  const session = getStoredSession();
  if (session && isSupabaseConfigured) {
    await request("/auth/v1/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).catch(() => undefined);
  }
  storeSession(null);
}

export async function fetchProfile(userId: string, accessToken: string) {
  const data = await request(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,full_name,role,organization,verified`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data?.[0] ?? null;
}
