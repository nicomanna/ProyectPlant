# Seguridad — Plant Tamagotchi

## Autenticación
Gate de acceso por **contraseña única compartida**, no hay cuentas de usuario individuales:
1. El usuario ingresa la contraseña en `/login`.
2. El server valida contra `APP_PASSWORD` (variable de entorno, nunca en el cliente).
3. Si es correcta, se emite una cookie de sesión `httpOnly`, `secure` (en producción) y firmada con `SESSION_SECRET`.
4. Un proxy de Next.js (`src/proxy.ts` — la convención `middleware` fue renombrada a `proxy` en Next.js 16) verifica esa cookie en cada request al dashboard y redirige a `/login` si falta o es inválida.

La contraseña **NUNCA** se hardcodea en el código ni se documenta en archivos versionados: vive únicamente en `APP_PASSWORD` dentro de `.env.local` (desarrollo, gitignoreado) y en las variables de entorno de Vercel (producción).

### Detalle del token de sesión
- Cookie: `plant_session` (nombre en `src/constants/auth.ts`), `httpOnly`, `sameSite=lax`, `secure` solo en producción, `Max-Age` de 30 días.
- Formato: `{payload}.{firma}`, ambos en base64url. `payload` es el timestamp de expiración; `firma` es HMAC-SHA256 del payload con `SESSION_SECRET`, calculado con la Web Crypto API (`crypto.subtle`) — portable entre el runtime Node.js y Edge, no depende de `node:crypto`.
- No es JWT ni usa ninguna librería externa: implementación mínima a mano en `src/lib/session.ts`, ya que no había necesidad de más claims que la expiración (Mandamiento I — no agregar dependencias no solicitadas).
- Cualquier token con firma inválida, expirado, o simplemente malformado (base64 corrupto) se trata de forma uniforme como sesión inválida — `verifySessionToken()` nunca lanza una excepción hacia quien la llama.

## Autorización
No hay roles ni multi-tenancy: es una app de un solo "usuario" real. La única distinción de autorización es:
- **Dashboard/API de la app** → protegido por la cookie de sesión (contraseña `APP_PASSWORD`).
- **Endpoint de ingestión de sensores** (`POST /api/sensors/ingest`, usado por el ESP32 real o por `scripts/simulate-esp32.ts`) → protegido por `ESP32_INGEST_SECRET`, un secret **distinto** al de la app, para no tener que embeber `APP_PASSWORD` en firmware o en un script que corre fuera del navegador de la usuaria.

## Variables de Entorno
| Variable | Secreta | Dónde se usa |
|----------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Cliente y servidor |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No (pero de uso limitado por RLS) | Cliente y servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | **SÍ** | Solo route handlers server-side (ej. `/api/sensors/ingest`) |
| `APP_PASSWORD` | **SÍ** | Solo `/api/auth/login` (server) |
| `SESSION_SECRET` | **SÍ** | Solo al firmar/verificar la cookie de sesión (server) |
| `ESP32_INGEST_SECRET` | **SÍ** | Solo `/api/sensors/ingest` (server) y el firmware/script del ESP32 |

## Reglas INVIOLABLES
- NUNCA hardcodear `APP_PASSWORD`, `SESSION_SECRET`, `ESP32_INGEST_SECRET` ni ninguna key de Supabase en el código fuente.
- NUNCA exponer `SUPABASE_SERVICE_ROLE_KEY` en el cliente ni en ningún componente que corra en el browser.
- NUNCA desactivar Row Level Security (RLS) en tablas de Supabase sin autorización explícita del usuario.
- NUNCA hacer deploy a Vercel sin haber completado el checklist de `docs/04-deployment.md`.
- SIEMPRE validar en el servidor cualquier dato que llegue del cliente o del ESP32 (no confiar en inputs externos).
- SIEMPRE usar tipos (TypeScript) para modelar las respuestas de Supabase y evitar inyección/uso indebido de datos.
- La cookie de sesión debe ser `httpOnly` y `secure` en producción, con expiración razonable.
