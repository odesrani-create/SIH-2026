import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const browserKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && browserKey ? createClient(url, browserKey) : null;

export const isSupabaseConfigured = Boolean(supabase);
export const useAIEdgeFunction = import.meta.env.VITE_USE_AI_EDGE_FUNCTION === "true";