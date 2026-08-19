import { CARE_SCORING, POINTS_SCORING } from '@/constants/points'
import { SENSOR_METRICS, type SensorMetric } from '@/constants/sensors'
import { isMetricOptimal } from '@/lib/plantHealth'
import type { SensorReading } from '@/types/sensor.types'
import type { DailyPoints } from '@/types/points.types'

// Funciones puras: lecturas → puntaje. Sin acceso a datos, para poder
// razonar el esquema de puntos sin depender de la DB.

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

// Fracción del día en que la métrica estuvo dentro del rango óptimo.
function optimalFraction(readings: SensorReading[], metric: SensorMetric): number {
  if (readings.length === 0) return 0
  const inRange = readings.filter((reading) => isMetricOptimal(metric, reading[metric])).length
  return inRange / readings.length
}

// Proporcional hasta el umbral, saturado en el máximo a partir de ahí.
function metricPoints(readings: SensorReading[], metric: SensorMetric): number {
  const { max, threshold } = POINTS_SCORING[metric]
  const fraction = optimalFraction(readings, metric)
  return round2(Math.min(1, fraction / threshold) * max)
}

// `day` en formato YYYY-MM-DD. Un día sin lecturas da 0 en las métricas
// ambientales: sin datos no hay evidencia de cuidado. `cared` viene de
// `care_log` (visita diaria detectada por el HC-SR04, ver `care.service.ts`).
export function computeDailyPoints(
  day: string,
  readings: SensorReading[],
  cared: boolean
): DailyPoints {
  const points = {
    soil_points: metricPoints(readings, 'soil_moisture'),
    light_points: metricPoints(readings, 'light_level'),
    temp_points: metricPoints(readings, 'temperature'),
    humidity_points: metricPoints(readings, 'humidity'),
    care_points: cared ? CARE_SCORING.max : 0,
  }

  return {
    day,
    ...points,
    total_points: round2(
      points.soil_points +
        points.light_points +
        points.temp_points +
        points.humidity_points +
        points.care_points
    ),
    reading_count: readings.length,
  }
}

// ─── Utilidades de semana (arranca el lunes, convención local) ───

export function toDayKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getWeekStart(reference: Date = new Date()): Date {
  const date = new Date(reference)
  date.setHours(0, 0, 0, 0)
  // getDay(): 0 = domingo. Retrocedemos al lunes anterior.
  const daysSinceMonday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - daysSinceMonday)
  return date
}

export function getWeekDays(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + index)
    return toDayKey(day)
  })
}

// Agrupa lecturas por día local. `recorded_at` viene en UTC desde la DB.
export function groupReadingsByDay(readings: SensorReading[]): Map<string, SensorReading[]> {
  const grouped = new Map<string, SensorReading[]>()

  for (const reading of readings) {
    const key = toDayKey(new Date(reading.recorded_at))
    const bucket = grouped.get(key)
    if (bucket) {
      bucket.push(reading)
    } else {
      grouped.set(key, [reading])
    }
  }

  return grouped
}

export const SCORED_METRICS = SENSOR_METRICS
