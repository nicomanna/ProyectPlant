'use client'

import { useEffect, useRef } from 'react'
import { fireCelebration } from '@/lib/confetti'

/**
 * Festeja el cruce de la meta semanal, no el estado de haberla cruzado.
 *
 * Solo dispara cuando `goalReached` pasa de `false` a `true` con el dashboard
 * abierto. Si festejara al montar, el confeti volvería a salir en cada refresh
 * hasta el lunes siguiente y dejaría de ser una celebración.
 *
 * @param goalReached `undefined` mientras no se sabe (los puntos no cargaron).
 */
export function useCelebration(goalReached: boolean | undefined): void {
  const previous = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    if (goalReached === undefined) return

    if (previous.current === false && goalReached) {
      fireCelebration('reach')
    }

    previous.current = goalReached
  }, [goalReached])
}
