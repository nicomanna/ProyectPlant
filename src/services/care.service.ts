import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { CareEvent } from '@/types/care.types'

const TABLE = 'care_log'

// Upsert idempotente por `day`: si el ESP32 reintenta el POST (red inestable,
// reboot que resetea `caredToday`) no duplica el evento del día.
export async function recordCareEvent(
  day: string
): Promise<{ event: CareEvent; alreadyRecorded: boolean }> {
  const supabase = getSupabaseAdmin()

  const { data: inserted, error: insertError } = await supabase
    .from(TABLE)
    .upsert({ day }, { onConflict: 'day', ignoreDuplicates: true })
    .select()
    .maybeSingle()

  if (insertError) throw new Error(`No se pudo registrar la visita: ${insertError.message}`)
  if (inserted) return { event: inserted as CareEvent, alreadyRecorded: false }

  // `ignoreDuplicates` no devuelve la fila existente: se busca aparte.
  const { data: existing, error: selectError } = await supabase
    .from(TABLE)
    .select()
    .eq('day', day)
    .single()

  if (selectError) throw new Error(`No se pudo leer la visita registrada: ${selectError.message}`)
  return { event: existing as CareEvent, alreadyRecorded: true }
}

export async function getCareDaysSince(since: Date): Promise<Set<string>> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('day')
    .gte('day', since.toISOString().slice(0, 10))

  if (error) throw new Error(`No se pudieron leer las visitas: ${error.message}`)
  return new Set((data ?? []).map((row) => (row as { day: string }).day))
}
