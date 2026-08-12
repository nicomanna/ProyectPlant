import { NextRequest, NextResponse } from 'next/server'
import { requireIngestSecret } from '@/lib/apiAuth'
import { insertReading } from '@/services/sensor.service'
import { SENSOR_RANGES, SENSOR_METRICS } from '@/constants/sensors'
import type { SensorIngestRequest, SensorReadingInput } from '@/types/sensor.types'

export async function POST(request: NextRequest) {
  const authError = requireIngestSecret(request)
  if (authError) return authError

  let body: SensorIngestRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'La petición no tiene un formato válido' },
      { status: 400 }
    )
  }

  // No se confía en el dispositivo: cada métrica tiene que ser un número
  // finito dentro de su rango físico plausible.
  for (const metric of SENSOR_METRICS) {
    const value = body[metric]
    const { validMin, validMax } = SENSOR_RANGES[metric]

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return NextResponse.json(
        { error: 'invalid_request', message: `${metric} debe ser un número` },
        { status: 400 }
      )
    }

    if (value < validMin || value > validMax) {
      return NextResponse.json(
        { error: 'out_of_range', message: `${metric} fuera de rango (${validMin}–${validMax})` },
        { status: 400 }
      )
    }
  }

  const reading: SensorReadingInput = {
    soil_moisture: body.soil_moisture,
    light_level: body.light_level,
    temperature: body.temperature,
    humidity: body.humidity,
  }

  if (body.recorded_at !== undefined) {
    const timestamp = new Date(body.recorded_at)
    if (Number.isNaN(timestamp.getTime())) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'recorded_at no es una fecha válida' },
        { status: 400 }
      )
    }
    reading.recorded_at = timestamp.toISOString()
  }

  try {
    const saved = await insertReading(reading)
    return NextResponse.json({ reading: saved }, { status: 201 })
  } catch (error) {
    console.error('[sensors/ingest]', error)
    return NextResponse.json(
      { error: 'storage_error', message: 'No se pudo guardar la lectura' },
      { status: 500 }
    )
  }
}
