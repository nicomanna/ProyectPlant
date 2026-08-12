// Disparo del confeti. Es decoración: nunca es la confirmación de que algo
// pasó, y nunca puede hacer fallar la acción que lo dispara.

import {
  CONFETTI_CLAIM_BURST,
  CONFETTI_CLAIM_CANNONS,
  CONFETTI_COLORS,
  CONFETTI_REACH,
} from '@/constants/confetti'

export type CelebrationKind = 'reach' | 'claim'

const colors = [...CONFETTI_COLORS]

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * `canvas-confetti` es una librería de browser que se usa en un instante
 * puntual: se importa bajo demanda para no sumarla al bundle inicial del
 * dashboard, que ya arrastra three.js y recharts.
 */
async function loadConfetti() {
  return (await import('canvas-confetti')).default
}

function fireCannons(confetti: Awaited<ReturnType<typeof loadConfetti>>): void {
  const { durationMs, intervalMs, particleCount, spread, startVelocity, leftAngle, rightAngle, y } =
    CONFETTI_CLAIM_CANNONS

  const endsAt = Date.now() + durationMs
  const timer = window.setInterval(() => {
    if (Date.now() > endsAt) {
      window.clearInterval(timer)
      return
    }

    confetti({ particleCount, spread, startVelocity, colors, angle: leftAngle, origin: { x: 0, y } })
    confetti({ particleCount, spread, startVelocity, colors, angle: rightAngle, origin: { x: 1, y } })
  }, intervalMs)
}

/**
 * No hace nada si el sistema pide movimiento reducido: una lluvia de partículas
 * a pantalla completa es justo lo que esa preferencia existe para evitar.
 */
export async function fireCelebration(kind: CelebrationKind): Promise<void> {
  if (typeof window === 'undefined' || prefersReducedMotion()) return

  try {
    const confetti = await loadConfetti()

    if (kind === 'reach') {
      confetti({ ...CONFETTI_REACH, colors })
      return
    }

    confetti({ ...CONFETTI_CLAIM_BURST, colors })
    fireCannons(confetti)
  } catch (error) {
    // Que no cargue una librería de animación no debe romper el reclamo.
    console.warn('[confetti] no se pudo animar', error)
  }
}
