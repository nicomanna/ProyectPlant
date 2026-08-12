import { SENSOR_RANGES, SENSOR_METRICS, type SensorMetric } from '@/constants/sensors'
import type { SensorReading } from '@/types/sensor.types'

// Salud de una métrica: 1 dentro del rango óptimo, y decae linealmente
// hasta 0 cuando se aleja `tolerance` del borde del óptimo.
export function computeMetricHealth(metric: SensorMetric, value: number): number {
  const { optimalMin, optimalMax, tolerance } = SENSOR_RANGES[metric]

  if (value >= optimalMin && value <= optimalMax) return 1

  const distance = value < optimalMin ? optimalMin - value : value - optimalMax
  return Math.max(0, 1 - distance / tolerance)
}

// Promedio ponderado de todas las métricas. La humedad del sustrato pesa
// el doble: es la variable que la usuaria controla directamente regando.
export function computePlantHealth(reading: SensorReading | null): number {
  if (!reading) return 1

  let weightedSum = 0
  let totalWeight = 0

  for (const metric of SENSOR_METRICS) {
    const { weight } = SENSOR_RANGES[metric]
    weightedSum += computeMetricHealth(metric, reading[metric]) * weight
    totalWeight += weight
  }

  return weightedSum / totalWeight
}

export function isMetricOptimal(metric: SensorMetric, value: number): boolean {
  const { optimalMin, optimalMax } = SENSOR_RANGES[metric]
  return value >= optimalMin && value <= optimalMax
}
