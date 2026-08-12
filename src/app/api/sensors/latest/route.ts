import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/apiAuth'
import { getLatestReading } from '@/services/sensor.service'
import { computePlantHealth } from '@/lib/plantHealth'
import type { SensorLatestResponse } from '@/types/sensor.types'

export async function GET(request: NextRequest) {
  const authError = await requireSession(request)
  if (authError) return authError

  try {
    const reading = await getLatestReading()
    const response: SensorLatestResponse = {
      reading,
      health: computePlantHealth(reading),
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error('[sensors/latest]', error)
    return NextResponse.json(
      { error: 'storage_error', message: 'No se pudieron leer los sensores' },
      { status: 500 }
    )
  }
}
