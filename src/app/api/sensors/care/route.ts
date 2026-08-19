import { NextRequest, NextResponse } from 'next/server'
import { requireIngestSecret } from '@/lib/apiAuth'
import { recordCareEvent } from '@/services/care.service'
import { toDayKey } from '@/lib/points'
import type { CareIngestRequest, CareIngestResponse } from '@/types/care.types'

export async function POST(request: NextRequest) {
  const authError = requireIngestSecret(request)
  if (authError) return authError

  let body: CareIngestRequest
  try {
    body = await request.json()
  } catch {
    // Body vacío es válido: el ESP32 puede no mandar nada y usar la hora del servidor.
    body = {}
  }

  let occurredAt = new Date()
  if (body.occurred_at !== undefined) {
    occurredAt = new Date(body.occurred_at)
    if (Number.isNaN(occurredAt.getTime())) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'occurred_at no es una fecha válida' },
        { status: 400 }
      )
    }
  }

  try {
    // Mismo bucketing por día que agrupa sensor_readings, para que el
    // cruce en el scoring (`computeDailyPoints`) sea consistente.
    const day = toDayKey(occurredAt)
    const { event, alreadyRecorded } = await recordCareEvent(day)

    const response: CareIngestResponse = {
      day: event.day,
      caredAt: event.cared_at,
      alreadyRecorded,
    }

    return NextResponse.json(response, { status: alreadyRecorded ? 200 : 201 })
  } catch (error) {
    console.error('[sensors/care]', error)
    return NextResponse.json(
      { error: 'storage_error', message: 'No se pudo registrar la visita' },
      { status: 500 }
    )
  }
}
