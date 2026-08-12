// Rangos de las métricas de la planta (Potus / Peperomia).
// `optimal` = zona ideal (salud 1.0). `valid` = rango físico plausible;
// fuera de eso la lectura se rechaza por 400 en el ingest.
// `tolerance` = a cuánta distancia del óptimo la métrica llega a salud 0.

export interface MetricRange {
  optimalMin: number
  optimalMax: number
  validMin: number
  validMax: number
  tolerance: number
  weight: number
}

export const SENSOR_RANGES = {
  soil_moisture: {
    optimalMin: 40,
    optimalMax: 70,
    validMin: 0,
    validMax: 100,
    tolerance: 30,
    weight: 2,
  },
  light_level: {
    optimalMin: 30,
    optimalMax: 75,
    validMin: 0,
    validMax: 100,
    tolerance: 35,
    weight: 1,
  },
  temperature: {
    optimalMin: 18,
    optimalMax: 27,
    validMin: -20,
    validMax: 60,
    tolerance: 12,
    weight: 1,
  },
  humidity: {
    optimalMin: 40,
    optimalMax: 70,
    validMin: 0,
    validMax: 100,
    tolerance: 35,
    weight: 1,
  },
} as const satisfies Record<string, MetricRange>

export type SensorMetric = keyof typeof SENSOR_RANGES

export const SENSOR_METRICS = Object.keys(SENSOR_RANGES) as SensorMetric[]

export const SENSOR_POLL_INTERVAL_MS = 30_000

export const METRIC_LABELS: Record<SensorMetric, string> = {
  soil_moisture: 'Humedad del sustrato',
  light_level: 'Luz',
  temperature: 'Temperatura',
  humidity: 'Humedad ambiente',
}

export const METRIC_UNITS: Record<SensorMetric, string> = {
  soil_moisture: '%',
  light_level: '%',
  temperature: '°C',
  humidity: '%',
}
