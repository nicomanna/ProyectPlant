import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken } from '@/lib/session'
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/constants/auth'
import type { LoginRequestBody } from '@/types/auth.types'

export async function POST(request: NextRequest) {
  let body: LoginRequestBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'La petición no tiene un formato válido' },
      { status: 400 }
    )
  }

  const appPassword = process.env.APP_PASSWORD
  if (!appPassword) {
    return NextResponse.json(
      { error: 'server_misconfigured', message: 'La app no está configurada correctamente' },
      { status: 500 }
    )
  }

  if (typeof body.password !== 'string' || body.password !== appPassword) {
    return NextResponse.json(
      { error: 'invalid_credentials', message: 'Contraseña incorrecta' },
      { status: 401 }
    )
  }

  const token = await createSessionToken()
  const response = NextResponse.json({ message: 'Sesión iniciada correctamente' })

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  })

  return response
}
