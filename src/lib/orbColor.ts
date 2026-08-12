import { SENSOR_RANGES, type SensorMetric } from '@/constants/sensors'
import { ORB_CONFIGS } from '@/constants/orbs'

const AMBER = [250, 204, 21]
const RED = [239, 68, 68]

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const n = parseInt(value, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function mixRgb(a: number[], b: number[], t: number): string {
  const r = Math.round(lerp(a[0], b[0], t))
  const g = Math.round(lerp(a[1], b[1], t))
  const bl = Math.round(lerp(a[2], b[2], t))
  return `rgb(${r} ${g} ${bl})`
}

/**
 * Fracción de la métrica dentro de su rango físico válido, para pintar el
 * anillo de progreso del orbe (0..1). Válido aunque fuera del óptimo.
 */
export function orbRingProgress(metric: SensorMetric, value: number): number {
  const { validMin, validMax } = SENSOR_RANGES[metric]
  const span = validMax - validMin
  if (span <= 0) return 0
  return Math.min(1, Math.max(0, (value - validMin) / span))
}

/**
 * Color dinámico del resplandor del orbe según la salud de la métrica.
 * En rango óptimo → accent base (cian/dorado/teal/naranja); a medida que la
 * métrica se aleja, interpola hacia ámbar y luego rojo crítico.
 * `health` viene de `computeMetricHealth` (0..1).
 */
export function orbColorFor(metric: SensorMetric, health: number): string {
  const base = hexToRgb(ORB_CONFIGS[metric].accent)
  const clamped = Math.min(1, Math.max(0, health))
  // En rango óptimo (health >= 1) usamos el accent puro.
  if (clamped >= 0.5) return ORB_CONFIGS[metric].accent
  // Decaída: accent -> ámbar -> rojo
  if (clamped >= 0.25) {
    const t = (0.5 - clamped) / 0.25
    return mixRgb(base, AMBER, t)
  }
  const t = (0.25 - clamped) / 0.25
  return mixRgb(AMBER, RED, t)
}