// Service worker de Plant Tamagotchi.
// Deliberadamente chico: cinco reglas, sin librerías. Ver docs/features/pwa.md.
//
// Al cambiar CACHE_VERSION se descartan todos los caches anteriores.

const CACHE_VERSION = 'plant-v1'
const OFFLINE_URL = '/offline.html'

// Lo mínimo para poder mostrar algo sin conexión.
const PRECACHE_URLS = [OFFLINE_URL, '/icons/192', '/icons/512']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Regla 1: solo GET. Un POST /api/points/claim nunca pasa por acá.
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Regla 2: la API nunca se cachea. Cachear lecturas de sensores mostraría
  // datos viejos como si fueran actuales, y las respuestas van detrás de la
  // cookie de sesión.
  if (url.pathname.startsWith('/api/')) return

  // Regla 3: navegaciones network-first, con la pantalla offline de fallback.
  // Nunca cache-first: si sirviera el HTML cacheado, un deploy nuevo tardaría
  // en verse.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)))
    return
  }

  // Regla 4: assets con hash en el nombre e íconos, cache-first. Son inmutables.
  const isImmutable =
    url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')

  if (!isImmutable) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
        }
        return response
      })
    })
  )
})
