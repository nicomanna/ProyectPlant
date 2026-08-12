import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { SensorReading, SensorReadingInput } from '@/types/sensor.types'

const TABLE = 'sensor_readings'

export async function insertReading(input: SensorReadingInput): Promise<SensorReading> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(`No se pudo guardar la lectura: ${error.message}`)
  return data as SensorReading
}

export async function getLatestReading(): Promise<SensorReading | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select()
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer el último dato: ${error.message}`)
  return data as SensorReading | null
}

export async function getReadingsSince(since: Date): Promise<SensorReading[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select()
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: true })

  if (error) throw new Error(`No se pudieron leer los históricos: ${error.message}`)
  return (data ?? []) as SensorReading[]
}
