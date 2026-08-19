import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/apiAuth'
import { getReadingsSince } from '@/services/sensor.service'
import { getCareDaysSince } from '@/services/care.service'
import { getOrCreateWeeklyGoal, saveDailyPoints } from '@/services/points.service'
import {
  computeDailyPoints,
  getWeekDays,
  getWeekStart,
  groupReadingsByDay,
  toDayKey,
} from '@/lib/points'
import { WEEKLY_TARGET_POINTS } from '@/constants/points'
import { getPrizeForWeek, getWeekNumber } from '@/lib/prizes'
import type { PointsResponse } from '@/types/points.types'

export async function GET(request: NextRequest) {
  const authError = await requireSession(request)
  if (authError) return authError

  try {
    const weekStart = getWeekStart()
    const weekStartKey = toDayKey(weekStart)

    // Se recalcula toda la semana en cada pedido: es barato (7 días de
    // lecturas) y absorbe lecturas que hayan llegado atrasadas.
    const [readings, careDays] = await Promise.all([
      getReadingsSince(weekStart),
      getCareDaysSince(weekStart),
    ])
    const byDay = groupReadingsByDay(readings)

    const days = getWeekDays(weekStart).map((day) =>
      computeDailyPoints(day, byDay.get(day) ?? [], careDays.has(day))
    )

    await saveDailyPoints(days)

    const totalPoints = Math.round(days.reduce((sum, day) => sum + day.total_points, 0) * 100) / 100
    const goal = await getOrCreateWeeklyGoal(weekStartKey)

    const response: PointsResponse = {
      weekStart: weekStartKey,
      weekNumber: getWeekNumber(weekStart),
      today: toDayKey(new Date()),
      days,
      totalPoints,
      targetPoints: goal.target_points ?? WEEKLY_TARGET_POINTS,
      progress: Math.min(1, totalPoints / (goal.target_points ?? WEEKLY_TARGET_POINTS)),
      goalReached: totalPoints >= (goal.target_points ?? WEEKLY_TARGET_POINTS),
      claimed: goal.claimed_at !== null,
      prize: getPrizeForWeek(weekStart),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[points]', error)
    return NextResponse.json(
      { error: 'storage_error', message: 'No se pudieron calcular los puntos' },
      { status: 500 }
    )
  }
}
