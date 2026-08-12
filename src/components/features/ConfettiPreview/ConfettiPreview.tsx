'use client'

import { useEffect, useState } from 'react'
import { Gift } from 'lucide-react'
import { fireCelebration } from '@/lib/confetti'

const PREVIEW_PARAM = 'preview'

/**
 * Preview de debug del confeti, sin depender de 700 pts reales.
 *
 * - `?preview=reach` → dispara la ráfaga corta de cruce de meta al cargar.
 * - `?preview=claim` → muestra un botón flotante "Reclamar (preview)" que, al
 *   tocarlo, dispara la ráfaga central + cañones del reclamo. El botón solo
 *   aparece con ese query param (debug/desarrollo), no en producción.
 *
 * Renderiza `null` a menos que `preview=claim` esté activo. No toca la UI ni
 * el estado de puntos reales.
 */
export function ConfettiPreview() {
  const [param] = useState<string | null | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    return new URLSearchParams(window.location.search).get(PREVIEW_PARAM)
  })

  useEffect(() => {
    if (param === 'reach') fireCelebration('reach')
  }, [param])

  // `reach`: efímero, vuelve a renderizar null tras el disparo.
  if (param === 'reach') return null

  // `claim`: botón para ver la ráfaga del reclamo a demanda.
  if (param !== 'claim') return null

  return (
    <button
      type="button"
      onClick={() => fireCelebration('claim')}
      className="glass fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/15"
    >
      <Gift className="h-4 w-4 text-amber-300" aria-hidden="true" />
      Reclamar (preview)
    </button>
  )
}