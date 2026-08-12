// Tipos del histórico de sensores (feature `graficos`).

import type { HistoryRange } from '@/constants/charts'
import type { SensorMetric } from '@/constants/sensors'

/**
 * Un bucket de tiempo. Las métricas son `null` cuando no hubo lecturas en la
 * ventana: el hueco se dibuja como corte de la línea, no se interpola.
 */
export type HistoryPoint = {
  /** Inicio del bucket, en milisegundos epoch (el eje X es temporal). */
  t: number
} & Record<SensorMetric, number | null>

export interface SensorHistoryResponse {
  range: HistoryRange
  bucketMinutes: number
  points: HistoryPoint[]
}
