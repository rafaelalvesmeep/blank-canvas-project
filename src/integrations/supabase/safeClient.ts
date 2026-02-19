import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function resolveSupabaseUrl(): string | null {
  const directUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (directUrl && directUrl.trim()) return directUrl;

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
  if (projectId && projectId.trim()) return `https://${projectId}.supabase.co`;

  return null;
}

function resolveSupabaseKey(): string | null {
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  return key && key.trim() ? key : null;
}

/**
 * Safe getter to avoid blank-screen crashes when env vars aren't injected yet.
 * Returns null when the backend env is missing.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;

  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();

  if (!url || !key) return null;

  client = createClient(url, key, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return client;
}
