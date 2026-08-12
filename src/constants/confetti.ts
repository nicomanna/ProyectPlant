// Parámetros de las ráfagas de confeti.
// Verdes de la planta + dorado del premio. No comparte paleta con los gráficos:
// ahí el color codifica datos, acá es pura decoración.

export const CONFETTI_COLORS = ['#22c55e', '#16a34a', '#84cc16', '#fbbf24', '#ffffff'] as const

/** Ráfaga corta: la semana acaba de llegar a los 700 puntos. */
export const CONFETTI_REACH = {
  particleCount: 80,
  spread: 70,
  startVelocity: 32,
  origin: { x: 0.5, y: 0.6 },
} as const

/** Ráfaga central del reclamo, más ancha y más rápida. */
export const CONFETTI_CLAIM_BURST = {
  particleCount: 140,
  spread: 100,
  startVelocity: 42,
  origin: { x: 0.5, y: 0.55 },
} as const

/** Cañones laterales que acompañan al reclamo. */
export const CONFETTI_CLAIM_CANNONS = {
  durationMs: 2500,
  intervalMs: 220,
  particleCount: 24,
  spread: 60,
  startVelocity: 45,
  /** Ángulos hacia adentro desde cada borde. */
  leftAngle: 60,
  rightAngle: 120,
  y: 0.7,
} as const
