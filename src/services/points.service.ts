import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase'
import { WEEKLY_TARGET_POINTS } from '@/constants/points'
import type { DailyPoints, WeeklyGoal } from '@/types/points.types'

const POINTS_TABLE = 'points_log'
const GOALS_TABLE = 'weekly_goals'

// Upsert por `day`: recalcular un día reemplaza su fila, porque pueden llegar
// lecturas atrasadas del dispositivo.
export async function saveDailyPoints(days: DailyPoints[]): Promise<void> {
  if (days.length === 0) return

  const { error } = await getSupabaseAdmin()
    .from(POINTS_TABLE)
    .upsert(
      days.map((day) => ({ ...day, computed_at: new Date().toISOString() })),
      { onConflict: 'day' }
    )

  if (error) throw new Error(`No se pudieron guardar los puntos: ${error.message}`)
}

export async function getOrCreateWeeklyGoal(weekStart: string): Promise<WeeklyGoal> {
  const supabase = getSupabaseAdmin()

  const { data: existing, error: selectError } = await supabase
    .from(GOALS_TABLE)
    .select()
    .eq('week_start', weekStart)
    .maybeSingle()

  if (selectError) throw new Error(`No se pudo leer la meta semanal: ${selectError.message}`)
  if (existing) return existing as WeeklyGoal

  const { data: created, error: insertError } = await supabase
    .from(GOALS_TABLE)
    .insert({ week_start: weekStart, target_points: WEEKLY_TARGET_POINTS })
    .select()
    .single()

  if (insertError) throw new Error(`No se pudo crear la meta semanal: ${insertError.message}`)
  return created as WeeklyGoal
}

export async function claimWeeklyGoal(weekStart: string): Promise<WeeklyGoal> {
  const claimedAt = new Date().toISOString()

  const { data, error } = await getSupabaseAdmin()
    .from(GOALS_TABLE)
    .update({ claimed_at: claimedAt })
    .eq('week_start', weekStart)
    .is('claimed_at', null)
    .select()
    .maybeSingle()

  if (error) throw new Error(`No se pudo reclamar el premio: ${error.message}`)

  // `data` nulo = ya estaba reclamada (el filtro is-null no matcheó).
  // La operación es idempotente, así que devolvemos el estado actual.
  if (!data) return getOrCreateWeeklyGoal(weekStart)
  return data as WeeklyGoal
}
