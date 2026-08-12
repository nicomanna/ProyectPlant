# Feature: Autenticación simple por contraseña

> **Estado:** Completo
> **Archivos clave:** `src/app/login/page.tsx`, `src/app/api/auth/login/route.ts`, `src/proxy.ts`, `src/lib/session.ts`
> **Dependencias:** Ninguna nueva (usa Web Crypto API nativa, ya disponible en Node.js y en el Edge Runtime de Next.js)

---

## Descripción
Gate de acceso único para toda la app. No hay cuentas de usuario ni roles (ADR-002 en `docs/02-architecture.md`): una sola contraseña compartida (`APP_PASSWORD`) protege el dashboard completo.

## Objetivo
Evitar que cualquiera que encuentre la URL de la app pueda ver el estado de la planta o los puntos, sin la complejidad de un sistema de usuarios real.

## Modelo de Datos
No aplica. No se crea ninguna tabla en Supabase para esta feature — la sesión es un token stateless firmado, no queda persistida en la base de datos.

## Flujo de Uso
1. La usuaria entra a cualquier ruta protegida sin sesión válida → el proxy (`src/proxy.ts`) la redirige a `/login`.
2. Ingresa la contraseña en el formulario de `/login`.
3. El form hace `POST /api/auth/login` con `{ password }`.
4. El servidor compara contra `APP_PASSWORD` (env var, nunca en el cliente).
   - Si es incorrecta → responde 401 con un mensaje genérico ("Contraseña incorrecta").
   - Si es correcta → genera un token de sesión firmado (HMAC-SHA256 con `SESSION_SECRET`) con fecha de expiración, y lo setea como cookie `httpOnly`.
5. El cliente redirige a `/` (dashboard).
6. En cada request subsiguiente, el proxy valida la firma y la expiración del token de la cookie antes de dejar pasar a rutas protegidas.

## Componentes / Archivos
| Archivo | Responsabilidad |
|---------|----------------|
| `src/app/login/page.tsx` | Client Component: formulario de contraseña, muestra error, llama a `/api/auth/login` |
| `src/app/api/auth/login/route.ts` | Route Handler: valida `APP_PASSWORD`, crea y setea la cookie de sesión |
| `src/proxy.ts` | Verifica la cookie de sesión en cada request; redirige a `/login` si falta o es inválida/expirada |
| `src/lib/session.ts` | `createSessionToken()` y `verifySessionToken()` — firma/verifica el token con Web Crypto (HMAC-SHA256) |
| `src/constants/auth.ts` | Nombre de la cookie y duración de la sesión |
| `src/types/auth.types.ts` | Tipos: `LoginRequestBody`, `LoginResponse` |

## API / Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Valida la contraseña y crea la sesión (ver detalle en `docs/API_DOCS.md`) |

## UI / Pantallas
Pantalla `/login`: mobile-first, formulario simple con input de contraseña (con toggle mostrar/ocultar), botón de submit y mensaje de error. Usa la paleta verde por defecto de Tailwind (no depende del diseño 3D pendiente del dashboard, que se define en la feature `dashboard`).

## Skills Utilizadas
| Skill | Cómo se usó |
|-------|------------|
| `ui-styling` | Guía para el formulario de login accesible con Tailwind (labels, estados de foco/error) |

## Restricciones
- `APP_PASSWORD` y `SESSION_SECRET` nunca se exponen al cliente ni se hardcodean (Mandamiento VIII).
- La verificación de la firma debe correr también en el proxy (`src/proxy.ts`) → se usa Web Crypto (`crypto.subtle`) en vez de `node:crypto` por ser portable entre runtimes (Node.js y Edge), independientemente del runtime que use el proxy.
- No se implementa `logout` en esta iteración (no fue pedido); la sesión expira sola. Ver `Pendiente`.
- No hay rate limiting de intentos de login en esta iteración (no fue pedido).

## Pendiente
- [ ] Endpoint de logout (si se llega a necesitar)
- [ ] Rate limiting / bloqueo tras intentos fallidos (si se llega a necesitar)

## Notas de implementación
- `verifySessionToken()` envuelve la verificación en `try/catch`: una cookie corrupta o manipulada con un formato base64 inválido lanzaba una excepción no controlada que crasheaba el proxy con un 500 en vez de tratarla como sesión inválida. Se detectó probando manualmente con una cookie manipulada y se corrigió antes de cerrar la feature — cualquier token con formato inválido ahora se trata como no autenticado (redirect a `/login`), igual que un token ausente o con firma incorrecta.
- Probado manualmente end-to-end con `curl`: request sin sesión → 307 a `/login`; contraseña incorrecta → 401; contraseña correcta → 200 + cookie `httpOnly`; request con cookie válida → 200; request con cookie manipulada/corrupta → 307 a `/login` (no 500).
