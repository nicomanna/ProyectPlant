// Lógica pura del histórico: lecturas crudas → buckets promediados.
// Sin acceso a DB ni a Next, para poder razonarla y probarla aislada
// (mismo criterio que src/lib/points.ts).

import { HISTORY_RANGES, type HistoryRange } from '@/constants/charts'
import { SENSOR_METRICS, type SensorMetric } from '@/constants/sensors'
import type { HistoryPoint } from '@/types/history.types'
import type { SensorReading } from '@/types/sensor.types'

/** Inicio de la ventana de tiempo del rango pedido, relativo a `now`. */
export function getRangeStart(range: HistoryRange, now: Date = new Date()): Date {
  return new Date(now.getTime() - HISTORY_RANGES[range].hours * 60 * 60 * 1000)
}

/**
 * Alinea un instante al comienzo de su bucket. Se alinea contra el epoch (no
 * contra el inicio de la ventana) para que los buckets caigan siempre en las
 * mismas fronteras y dos requests consecutivos no muestren el eje corrido.
 */
function toBucketStart(ms: number, bucketMs: number): number {
  return Math.floor(ms / bucketMs) * bucketMs
}

/**
 * Arma la serie del gráfico: un punto por bucket de la ventana completa,
 * incluidos los buckets vacíos (métricas en `null`). Cada métrica es el
 * promedio de las lecturas que cayeron en ese bucket.
 */
export function buildHistorySeries(
  readings: SensorReading[],
  range: HistoryRange,
  now: Date = new Date(),
): HistoryPoint[] {
  const bucketMs = HISTORY_RANGES[range].bucketMinutes * 60 * 1000
  const firstBucket = toBucketStart(getRangeStart(range, now).getTime(), bucketMs)
  const lastBucket = toBucketStart(now.getTime(), bucketMs)

  // Acumuladores por bucket: suma y cantidad de cada métrica.
  const sums = new Map<number, Record<SensorMetric, { sum: number; count: number }>>()

  for (const reading of readings) {
    const at = new Date(reading.recorded_at).getTime()
    if (Number.isNaN(at)) continue

    const bucket = toBucketStart(at, bucketMs)
    if (bucket < firstBucket || bucket > lastBucket) continue

    let acc = sums.get(bucket)
    if (!acc) {
      acc = {} as Record<SensorMetric, { sum: number; count: number }>
      for (const metric of SENSOR_METRICS) acc[metric] = { sum: 0, count: 0 }
      sums.set(bucket, acc)
    }

    for (const metric of SENSOR_METRICS) {
      const value = Number(reading[metric])
      if (!Number.isFinite(value)) continue
      acc[metric].sum += value
      acc[metric].count += 1
    }
  }

  const points: HistoryPoint[] = []

  for (let bucket = firstBucket; bucket <= lastBucket; bucket += bucketMs) {
    const acc = sums.get(bucket)
    const point = { t: bucket } as HistoryPoint

    for (const metric of SENSOR_METRICS) {
      const metricAcc = acc?.[metric]
      point[metric] =
        metricAcc && metricAcc.count > 0
          ? Math.round((metricAcc.sum / metricAcc.count) * 10) / 10
          : null
    }

    points.push(point)
  }

  return points
}

/** Formato de tick del eje X: la hora alcanza en 24 h, más allá hace falta el día. */
export function formatBucketTick(ms: number, range: HistoryRange): string {
  const date = new Date(ms)

  if (range === '24h') {
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  if (range === '7d') {
    return date.toLocaleDateString('es-AR', { weekday: 'short' })
  }

  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

/** Formato completo para el tooltip y la tabla. */
export function formatBucketFull(ms: number): string {
  return new Date(ms).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
