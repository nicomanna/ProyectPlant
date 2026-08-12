import { ImageResponse } from 'next/og'
import { renderAppIcon } from '@/lib/appIcon'

// 180×180 es el tamaño que pide iOS para la pantalla de inicio.
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(renderAppIcon({ size: size.width }), { ...size })
}
