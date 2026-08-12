import type { MetadataRoute } from 'next'

// Next lo sirve en /manifest.webmanifest y agrega el <link rel="manifest">
// solo. Al estar tipado, un campo mal escrito es un error de build.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Plant Tamagotchi',
    short_name: 'Planta',
    description: 'Cuidá tu planta, sumá puntos y ganá el premio de la semana',
    lang: 'es-AR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f0fdf4',
    theme_color: '#16a34a',
    icons: [
      { src: '/icons/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Android recorta el ícono con la forma del launcher: esta variante trae
      // el padding necesario para que no se coma las hojas.
      { src: '/icons/maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
