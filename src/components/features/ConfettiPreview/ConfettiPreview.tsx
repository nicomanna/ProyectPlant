'use client'

import { useEffect } from 'react'
import { fireCelebration } from '@/lib/confetti'

const PREVIEW_PARAM = 'preview'

/**
 * Preview de debug del confeti, sin depender de 700 pts reales.
 *
 * Al cargar la página con `?preview=reach` o `?preview=claim` en la URL, dispara
 * esa celebración una sola vez. Deja la UI intacta (renderiza `null`) y no
 * toca el estado de puntos.
 *
 * Uso: /?preview=claim  →  confeti largo de reclamo
 *      /?preview=reach  →  ráfaga corta de cruce de meta
 *
 * Es intencionalmente efímero: desaparece al quitar el query de la URL.
 */
export function ConfettiPreview() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const kind = new URLSearchParams(window.location.search).get(PREVIEW_PARAM)
    if (kind === 'reach' || kind === 'claim') {
      fireCelebration(kind)
    }
  }, [])

  return null
}