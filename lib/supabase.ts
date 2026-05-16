import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Builds a Supabase client. We use the publishable/anon key for both client- and
 * server-side calls during dev; permissive RLS policies (see supabase/migrations/0001_init.sql)
 * allow anonymous insert + select + update on sessions and answers.
 *
 * When the user provides a real service_role key, set SUPABASE_SERVICE_ROLE_KEY and
 * server routes will pick it up automatically (anon key remains for client).
 */

function pickServerKey(): string {
  const explicit = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (explicit && explicit.length > 0) return explicit
  // Fall back to anon/publishable key. Permissive RLS makes this work.
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
}

function pickServerUrl(): string {
  return (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ""
  )
}

let _serverClient: SupabaseClient | null = null
export function supabaseServer(): SupabaseClient {
  if (_serverClient) return _serverClient
  _serverClient = createClient(pickServerUrl(), pickServerKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _serverClient
}

let _browserClient: SupabaseClient | null = null
export function supabaseBrowser(): SupabaseClient {
  if (_browserClient) return _browserClient
  _browserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  )
  return _browserClient
}
