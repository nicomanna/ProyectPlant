import type { SensorMetric } from '@/constants/sensors'

// 100 pts por día × 7 días = 700 pts por semana.
// `max` es el puntaje tope de la métrica; `threshold` es la fracción del día
// en rango óptimo a partir de la cual se cobra ese tope. Debajo del umbral el
// puntaje es proporcional (un mal día suma algo, no cero).
export interface MetricScoring {
  max: number
  threshold: number
}

export const POINTS_SCORING = {
  soil_moisture: { max: 40, threshold: 0.8 },
  light_level: { max: 20, threshold: 0.6 },
  temperature: { max: 12, threshold: 0.7 },
  humidity: { max: 8, threshold: 0.7 },
} as const satisfies Record<SensorMetric, MetricScoring>

// Visita diaria a la planta (HC-SR04): evento binario por día, no una fracción
// de tiempo en rango — por eso no tiene `threshold` como las métricas de arriba.
export const CARE_SCORING = { max: 20 } as const

export const DAILY_MAX_POINTS = 100
export const WEEKLY_TARGET_POINTS = 700
export const DAYS_PER_WEEK = 7
