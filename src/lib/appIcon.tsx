// Dibujo del ícono de la app: un Potus estilizado (maceta terracota con carita
// feliz + tres hojas), armado solo con divs, gradientes y border-radius.
//
// No usa fuentes ni assets externos a propósito: `ImageResponse` (satori) tiene
// que poder renderizarlo sin cargar nada. Lo comparten las cinco rutas de ícono
// (favicon, apple-icon y las tres del manifest) — ver docs/features/pwa.md.

import type { ReactElement } from 'react'

const COLORS = {
  backgroundFrom: '#f0fdf4',
  backgroundTo: '#86efac',
  leafLight: '#22c55e',
  leafMid: '#16a34a',
  leafDark: '#15803d',
  potBody: '#c2703f',
  potRim: '#d98352',
  face: '#4a2f1d',
} as const

interface AppIconOptions {
  size: number
  /**
   * Android recorta el ícono con la forma del launcher: la variante maskable
   * lleva más padding para que el arte entre en el círculo seguro del 80 %.
   */
  maskable?: boolean
}

export function renderAppIcon({ size, maskable = false }: AppIconOptions): ReactElement {
  // Todo el dibujo se define en fracciones del lado del contenido, así el mismo
  // código sirve para 32px y para 512px.
  const padding = maskable ? 0.19 : 0.1
  const content = size * (1 - padding * 2)
  const u = (fraction: number) => Math.round(content * fraction)

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(160deg, ${COLORS.backgroundFrom} 0%, ${COLORS.backgroundTo} 100%)`,
      }}
    >
      <div style={{ position: 'relative', display: 'flex', width: content, height: content }}>
        {/* Hojas */}
        <div
          style={{
            position: 'absolute',
            left: u(0.02),
            top: u(0.1),
            width: u(0.44),
            height: u(0.26),
            borderRadius: u(0.22),
            background: COLORS.leafMid,
            transform: 'rotate(-25deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: u(0.28),
            top: 0,
            width: u(0.44),
            height: u(0.28),
            borderRadius: u(0.22),
            background: COLORS.leafLight,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: u(0.54),
            top: u(0.1),
            width: u(0.44),
            height: u(0.26),
            borderRadius: u(0.22),
            background: COLORS.leafDark,
            transform: 'rotate(25deg)',
          }}
        />

        {/* Tallo */}
        <div
          style={{
            position: 'absolute',
            left: u(0.475),
            top: u(0.24),
            width: u(0.05),
            height: u(0.24),
            borderRadius: u(0.025),
            background: COLORS.leafDark,
          }}
        />

        {/* Borde de la maceta */}
        <div
          style={{
            position: 'absolute',
            left: u(0.13),
            top: u(0.46),
            width: u(0.74),
            height: u(0.12),
            borderRadius: u(0.04),
            background: COLORS.potRim,
          }}
        />

        {/* Cuerpo de la maceta */}
        <div
          style={{
            position: 'absolute',
            left: u(0.19),
            top: u(0.56),
            width: u(0.62),
            height: u(0.4),
            borderRadius: `${u(0.03)}px ${u(0.03)}px ${u(0.16)}px ${u(0.16)}px`,
            background: COLORS.potBody,
          }}
        />

        {/* Carita feliz: siempre contenta, como en el modelo 3D */}
        <div
          style={{
            position: 'absolute',
            left: u(0.35),
            top: u(0.68),
            width: u(0.07),
            height: u(0.07),
            borderRadius: u(0.035),
            background: COLORS.face,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: u(0.58),
            top: u(0.68),
            width: u(0.07),
            height: u(0.07),
            borderRadius: u(0.035),
            background: COLORS.face,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: u(0.41),
            top: u(0.78),
            width: u(0.18),
            height: u(0.09),
            borderBottomWidth: Math.max(1, u(0.035)),
            borderBottomStyle: 'solid',
            borderBottomColor: COLORS.face,
            borderRadius: `0 0 ${u(0.09)}px ${u(0.09)}px`,
          }}
        />
      </div>
    </div>
  )
}
