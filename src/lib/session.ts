import { SESSION_DURATION_MS } from '@/constants/auth'

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET no está definida. Revisá tu archivo .env.local')
  }
  return secret
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = getSessionSecret()
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION_MS
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(String(expiresAt)))

  const key = await getHmacKey()
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64))
  const signatureB64 = base64UrlEncode(new Uint8Array(signature))

  return `${payloadB64}.${signatureB64}`
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false

  const [payloadB64, signatureB64] = token.split('.')
  if (!payloadB64 || !signatureB64) return false

  try {
    const key = await getHmacKey()
    const isSignatureValid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(signatureB64),
      new TextEncoder().encode(payloadB64)
    )
    if (!isSignatureValid) return false

    const expiresAt = Number(new TextDecoder().decode(base64UrlDecode(payloadB64)))
    if (!Number.isFinite(expiresAt)) return false

    return Date.now() < expiresAt
  } catch {
    // Un token con formato base64 inválido (cookie corrupta o manipulada)
    // se trata como sesión inválida en vez de propagar el error.
    return false
  }
}
