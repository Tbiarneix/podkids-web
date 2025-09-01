import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Admin client (service_role) to bypass RLS in server-only contexts (API routes, scripts)
// Requires SUPABASE_SERVICE_ROLE_KEY to be set in the environment.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
