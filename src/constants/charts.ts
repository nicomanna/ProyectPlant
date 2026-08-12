// Tokens y specs de los gráficos históricos.
//
// Los colores de acá están VALIDADOS con el script de la skill `dataviz`:
//   node scripts/validate_palette.js "#2a78d6" --mode light --surface "#ffffff"
//   → ALL CHECKS PASS (contraste 4.13:1)
// Si se cambia CHART_SERIES_COLOR, hay que volver a correr el validador.
// Ver docs/features/graficos.md § Decisiones de diseño.

export const CHART_COLORS = {
  /** Único hue de datos: cada gráfico tiene una sola serie, el título carga la identidad. */
  series: '#2a78d6',
  /** Superficie de la tarjeta; también el color del anillo del punto final. */
  surface: '#ffffff',
  /** Grilla hairline, un paso off-surface. */
  grid: '#e1e0d9',
  /** Eje y baseline. */
  axis: '#c3c2b7',
  /** Tinta apagada: ticks y etiquetas de eje. */
  muted: '#898781',
  /** Tinta secundaria: valores del tooltip. */
  ink: '#52514e',
  /** Lavado de la banda de rango óptimo. Contexto, no una serie: sin borde. */
  optimalBand: '#0ca30c',
  optimalBandOpacity: 0.09,
} as const

export const CHART_MARKS = {
  /** Línea de 2px (spec de la skill). */
  strokeWidth: 2,
  /** Punto final ≥ 8px de diámetro ⇒ r = 4. */
  endDotRadius: 4,
  /** Anillo de 2px en color superficie sobre el punto final. */
  endDotRingWidth: 2,
} as const

export interface HistoryRangeConfig {
  label: string
  hours: number
  bucketMinutes: number
}

export const HISTORY_RANGES = {
  '24h': { label: '24 h', hours: 24, bucketMinutes: 60 },
  '7d': { label: '7 días', hours: 24 * 7, bucketMinutes: 240 },
  '30d': { label: '30 días', hours: 24 * 30, bucketMinutes: 60 * 24 },
} as const satisfies Record<string, HistoryRangeConfig>

export type HistoryRange = keyof typeof HISTORY_RANGES

export const HISTORY_RANGE_KEYS = Object.keys(HISTORY_RANGES) as HistoryRange[]

export const DEFAULT_HISTORY_RANGE: HistoryRange = '24h'

export function isHistoryRange(value: string): value is HistoryRange {
  return value in HISTORY_RANGES
}
