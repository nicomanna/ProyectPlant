'use client'

import { useEffect } from 'react'

/**
 * Registra `public/sw.js`. No renderiza nada.
 *
 * Solo corre en producción a propósito: un service worker cacheando durante
 * `next dev` produce el tipo de bug fantasma que hace perder una tarde.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      // Que no registre no rompe la app: sigue funcionando como web normal.
      console.warn('[pwa] no se pudo registrar el service worker', error)
    })
  }, [])

  return null
}
