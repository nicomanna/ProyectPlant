import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/apiAuth'
import { getReadingsSince } from '@/services/sensor.service'
import { claimWeeklyGoal, getOrCreateWeeklyGoal } from '@/services/points.service'
import {
  computeDailyPoints,
  getWeekDays,
  getWeekStart,
  groupReadingsByDay,
  toDayKey,
} from '@/lib/points'
import type { ClaimResponse } from '@/types/points.types'

export async function POST(request: NextRequest) {
  const authError = await requireSession(request)
  if (authError) return authError

  try {
    const weekStart = getWeekStart()
    const weekStartKey = toDayKey(weekStart)

    const goal = await getOrCreateWeeklyGoal(weekStartKey)

    // La meta se re-verifica en el servidor: no alcanza con que el cliente
    // diga que llegó a los 700 puntos.
    const readings = await getReadingsSince(weekStart)
    const byDay = groupReadingsByDay(readings)
    const totalPoints = getWeekDays(weekStart).reduce(
      (sum, day) => sum + computeDailyPoints(day, byDay.get(day) ?? []).total_points,
      0
    )

    if (totalPoints < goal.target_points) {
      return NextResponse.json(
        {
          error: 'goal_not_reached',
          message: `Todavía faltan puntos: ${Math.round(totalPoints)} de ${goal.target_points}`,
        },
        { status: 400 }
      )
    }

    const claimed = await claimWeeklyGoal(weekStartKey)

    const response: ClaimResponse = {
      claimed: true,
      claimedAt: claimed.claimed_at ?? new Date().toISOString(),
      message: '¡Premio reclamado!',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[points/claim]', error)
    return NextResponse.json(
      { error: 'storage_error', message: 'No se pudo reclamar el premio' },
      { status: 500 }
    )
  }
}
