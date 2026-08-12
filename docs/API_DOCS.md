# Documentación de API — Plant Tamagotchi

**Base URL:** `/api`
**Autenticación:** Cookie de sesión (dashboard) o header con `ESP32_INGEST_SECRET` (ingestión de sensores)
**Última actualización:** 2026-08-12

---

## Autenticación

Endpoints del dashboard requieren la cookie de sesión emitida por `POST /api/auth/login` (ver `docs/03-security.md`).

Endpoints de ingestión de sensores requieren:
```
Authorization: Bearer {ESP32_INGEST_SECRET}
```

---

## Índice de Endpoints

| Método | Ruta | Descripción | Auth | Estado |
|--------|------|-------------|------|--------|
| GET | `/api/health` | Estado del servidor | NO | Pendiente |
| POST | `/api/auth/login` | Valida `APP_PASSWORD` y crea sesión | NO | **Implementado** |
| POST | `/api/auth/logout` | Cierra la sesión | Sesión | Pendiente (no pedido aún) |
| POST | `/api/sensors/ingest` | Recibe una lectura del ESP32 / simulador | `ESP32_INGEST_SECRET` | Pendiente |
| GET | `/api/sensors/latest` | Última lectura de sensores | Sesión | Pendiente |
| GET | `/api/points` | Puntos actuales y progreso de la meta semanal | Sesión | Pendiente |

> Las filas "Pendiente" son referencia planeada; se documentan a fondo (request/response reales) recién cuando se construyen.

---

## Endpoints

### Login

**`POST /api/auth/login`** — Sin autenticación previa

Valida la contraseña única de la app y, si es correcta, emite la cookie de sesión (`plant_session`, `httpOnly`, firmada con HMAC-SHA256, expira a los 30 días).

**Request body:**
```json
{
  "password": "string"
}
```

**Response 200:**
```json
{
  "message": "Sesión iniciada correctamente"
}
```
Incluye el header `Set-Cookie: plant_session=...; HttpOnly; SameSite=lax; Max-Age=2592000`.

**Response 400** (body inválido):
```json
{
  "error": "invalid_request",
  "message": "La petición no tiene un formato válido"
}
```

**Response 401** (contraseña incorrecta):
```json
{
  "error": "invalid_credentials",
  "message": "Contraseña incorrecta"
}
```

**Response 500** (falta `APP_PASSWORD` en el servidor):
```json
{
  "error": "server_misconfigured",
  "message": "La app no está configurada correctamente"
}
```

---

## Formato de Respuestas

### Exitosa
```json
{
  "data": { },
  "message": "Operación exitosa"
}
```

### Error
```json
{
  "error": "Tipo de error",
  "message": "Descripción del error",
  "details": { }
}
```

---

## Códigos de Error Globales

| Código | Descripción |
|--------|-------------|
| 400 | Datos inválidos |
| 401 | Sesión o secret inválido/expirado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 429 | Rate limit excedido |
| 500 | Error del servidor |
