import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/session'
import { SESSION_COOKIE_NAME } from '@/constants/auth'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const hasValidSession = await verifySessionToken(token)

  if (!hasValidSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Rutas públicas de la PWA: el navegador pide el manifest SIN credenciales, así
// que si el proxy lo interceptara la app nunca sería instalable. Ninguna expone
// datos — son metadatos, imágenes generadas y una página estática de "sin
// conexión". Ver docs/features/pwa.md y docs/03-security.md.
export const config = {
  matcher: [
    '/((?!api|login|manifest\\.webmanifest|sw\\.js|offline\\.html|icons|icon|apple-icon|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
