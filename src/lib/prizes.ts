import {
  DEFAULT_PRIZE,
  PRIZES_WEEK_1_START,
  WEEKLY_PRIZES,
  type WeeklyPrize,
} from '@/constants/prizes'
import { toDayKey } from './points'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

function parseDayKey(key: string): number {
  return new Date(`${key}T00:00:00Z`).getTime()
}

/**
 * Número de semana de un `weekStart` (lunes, en formato YYYY-MM-DD o Date)
 * relativo a `PRIZES_WEEK_1_START`. La semana que contiene la fecha ancla es
 * la 1. Si `weekStart` es anterior al ancla devuelve 1 (nunca 0 o negativo).
 */
export function getWeekNumber(weekStart: string | Date): number {
  const key = typeof weekStart === 'string' ? weekStart : toDayKey(weekStart)
  const startMs = parseDayKey(key)
  const anchorMs = parseDayKey(PRIZES_WEEK_1_START)
  const elapsedWeeks = Math.floor((startMs - anchorMs) / WEEK_MS)
  return Math.max(1, elapsedWeeks + 1)
}

/**
 * Premio que corresponde a una semana. Usa `WEEKLY_PRIZES[weekNumber - 1]`,
 * y si la semana está fuera de la lista definida (más allá de la semana N)
 * repite el `DEFAULT_PRIZE` en vez de romper.
 */
export function getPrizeForWeek(weekStart: string | Date): WeeklyPrize {
  const weekNumber = getWeekNumber(weekStart)
  return WEEKLY_PRIZES[weekNumber - 1] ?? DEFAULT_PRIZE
}