import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Cliente con service role: bypassa RLS. La tabla tiene RLS activado sin
// políticas (ver docs/features/sensores.md), así que este es el único camino
// de acceso a datos. `server-only` hace fallar el build si se importa desde
// un componente cliente, para que la key nunca llegue al browser.
let client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno'
    )
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return client
}
