import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/apiAuth'
import { getReadingsSince } from '@/services/sensor.service'
import { buildHistorySeries, getRangeStart } from '@/lib/history'
import {
  DEFAULT_HISTORY_RANGE,
  HISTORY_RANGES,
  HISTORY_RANGE_KEYS,
  isHistoryRange,
} from '@/constants/charts'
import type { SensorHistoryResponse } from '@/types/history.types'

export async function GET(request: NextRequest) {
  const authError = await requireSession(request)
  if (authError) return authError

  const rangeParam = request.nextUrl.searchParams.get('range')

  // Lista cerrada: cualquier otro valor es un 400, no un fallback silencioso.
  if (rangeParam !== null && !isHistoryRange(rangeParam)) {
    return NextResponse.json(
      {
        error: 'invalid_range',
        message: `El rango debe ser uno de: ${HISTORY_RANGE_KEYS.join(', ')}`,
      },
      { status: 400 }
    )
  }

  const range = rangeParam ?? DEFAULT_HISTORY_RANGE

  try {
    const now = new Date()
    const readings = await getReadingsSince(getRangeStart(range, now))

    const response: SensorHistoryResponse = {
      range,
      bucketMinutes: HISTORY_RANGES[range].bucketMinutes,
      points: buildHistorySeries(readings, range, now),
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error('[sensors/history]', error)
    return NextResponse.json(
      { error: 'storage_error', message: 'No se pudo leer el histórico' },
      { status: 500 }
    )
  }
}
