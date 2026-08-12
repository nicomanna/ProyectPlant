'use client'

import { useEffect, useState } from 'react'
import { Gift } from 'lucide-react'
import { fireCelebration } from '@/lib/confetti'

const PREVIEW_PARAM = 'preview'

const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * Preview de debug del confeti, sin depender de 700 pts reales.
 *
 * - **Modo dev** (`next dev`): siempre muestra el botón flotante "Reclamar
 *   (preview)" para disparar la ráfaga central + cañones a demanda. No requiere
 *   ninguna URL especial y no se ve afectado por el proxy de auth.
 * - `?preview=reach` → además, dispara la ráfaga corta de cruce de meta al cargar.
 *
 * En producción (`next build`/Vercel) no renderiza nada: el botón es solo de
 * desarrollo y queda fuera del bundle de producción renderizado.
 */
export function ConfettiPreview() {
  const [param] = useState<string | null | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    return new URLSearchParams(window.location.search).get(PREVIEW_PARAM)
  })

  useEffect(() => {
    if (param === 'reach') fireCelebration('reach')
  }, [param])

  if (!IS_DEV) return null

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