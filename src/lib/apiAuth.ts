import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/session'
import { SESSION_COOKIE_NAME } from '@/constants/auth'

// El proxy deja pasar /api/* sin verificar (los endpoints tienen esquemas de
// auth distintos: cookie para el dashboard, bearer secret para el ESP32).
// Los endpoints que sirven datos al dashboard validan la sesión con esto.
export async function requireSession(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const isValid = await verifySessionToken(token)

  if (!isValid) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Sesión inválida o expirada' },
      { status: 401 }
    )
  }

  return null
}

// Auth del dispositivo ESP32: header `Authorization: Bearer {ESP32_INGEST_SECRET}`.
export function requireIngestSecret(request: NextRequest): NextResponse | null {
  const secret = process.env.ESP32_INGEST_SECRET

  if (!secret) {
    return NextResponse.json(
      { error: 'server_misconfigured', message: 'La app no está configurada correctamente' },
      { status: 500 }
    )
  }

  const header = request.headers.get('authorization')
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Secret de ingesta inválido' },
      { status: 401 }
    )
  }

  return null
}
