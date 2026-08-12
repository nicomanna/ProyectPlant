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
| POST | `/api/sensors/ingest` | Recibe una lectura del ESP32 / simulador | `ESP32_INGEST_SECRET` | **Implementado** |
| GET | `/api/sensors/latest` | Última lectura de sensores + salud calculada | Sesión | **Implementado** |
| GET | `/api/sensors/history` | Histórico agregado por buckets para los gráficos | Sesión | **Implementado** |
| GET | `/api/points` | Puntos actuales y progreso de la meta semanal | Sesión | **Implementado** |
| POST | `/api/points/claim` | Reclama el premio de la semana actual | Sesión | **Implementado** |

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

### Ingestión de lecturas

**`POST /api/sensors/ingest`** — Auth: `Authorization: Bearer {ESP32_INGEST_SECRET}`

Recibe una lectura del ESP32 (o del script simulador) y la persiste. Valida el rango físico de cada métrica antes de guardar: no se confía en el dispositivo.

**Request body:**
```json
{
  "soil_moisture": 55.2,
  "light_level": 48.0,
  "temperature": 22.4,
  "humidity": 58.1,
  "recorded_at": "2026-08-12T14:30:00.000Z"
}
```
`recorded_at` es opcional (default: `now()` en la DB). El resto son obligatorios.

**Response 201:**
```json
{
  "reading": {
    "id": "uuid",
    "device_id": "esp32-01",
    "soil_moisture": 55.2,
    "light_level": 48.0,
    "temperature": 22.4,
    "humidity": 58.1,
    "recorded_at": "2026-08-12T14:30:00.000Z",
    "created_at": "2026-08-12T14:30:01.123Z"
  }
}
```

**Response 400** — campo faltante, no numérico, `recorded_at` inválido, o valor fuera del rango físico (`error`: `invalid_request` o `out_of_range`).

**Response 401** — `error: "unauthorized"`, secret inválido o ausente.

**Response 500** — `error: "storage_error"` (fallo al escribir en Supabase) o `server_misconfigured` (falta `ESP32_INGEST_SECRET`).

---

### Última lectura

**`GET /api/sensors/latest`** — Auth: cookie de sesión

Devuelve la lectura más reciente y la salud de la planta derivada de ella (0–1), que alimenta el modelo 3D del dashboard.

**Response 200:**
```json
{
  "reading": { "...": "igual que en el ingest" },
  "health": 0.87
}
```
Si todavía no hay lecturas, `reading` es `null` y `health` es `1`.

**Response 401** — `error: "unauthorized"`, sesión inválida o expirada.

**Response 500** — `error: "storage_error"`. Ocurre también si la migración `0001` todavía no fue aplicada (la tabla no existe).

---

### Histórico de lecturas

**`GET /api/sensors/history?range=24h|7d|30d`** — Auth: cookie de sesión

Devuelve la serie que alimenta los gráficos. Las lecturas se **promedian por bucket** de tiempo según el rango pedido, para no mandar cientos de filas ni dibujar un gráfico ilegible:

| `range` | Ventana | Bucket | Puntos |
|---------|---------|--------|--------|
| `24h` (default) | 24 horas | 1 hora | 24 |
| `7d` | 7 días | 4 horas | 42 |
| `30d` | 30 días | 1 día | 30 |

**Response 200:**
```json
{
  "range": "24h",
  "bucketMinutes": 60,
  "points": [
    { "t": 1786012800000, "soil_moisture": 55.2, "light_level": 48.0, "temperature": 22.4, "humidity": 58.1 },
    { "t": 1786016400000, "soil_moisture": null, "light_level": null, "temperature": null, "humidity": null }
  ]
}
```
`t` es el inicio del bucket en milisegundos epoch. Los buckets **sin lecturas se devuelven con `null`** en vez de omitirse: así el eje de tiempo queda parejo y la línea del gráfico se corta en el hueco en vez de interpolar datos que no existen.

**Response 400** (rango desconocido):
```json
{
  "error": "invalid_range",
  "message": "El rango debe ser uno de: 24h, 7d, 30d"
}
```

**Response 401** — `error: "unauthorized"`, sesión inválida o expirada.

**Response 500** — `error: "storage_error"`. Ocurre también si la migración `0001` todavía no fue aplicada.

---

### Progreso semanal de puntos

**`GET /api/points`** — Auth: cookie de sesión

Recalcula los puntos de cada día de la semana en curso a partir de `sensor_readings`, los persiste en `points_log` (upsert por día) y devuelve el progreso hacia los 700 puntos. El recálculo completo en cada pedido es barato (7 días de lecturas) y absorbe las lecturas que hayan llegado atrasadas del dispositivo.

**Response 200:**
```json
{
  "weekStart": "2026-08-10",
  "days": [
    {
      "day": "2026-08-10",
      "soil_points": 50,
      "light_points": 25,
      "temp_points": 15,
      "humidity_points": 10,
      "total_points": 100,
      "reading_count": 24
    }
  ],
  "totalPoints": 412.5,
  "targetPoints": 700,
  "progress": 0.589,
  "goalReached": false,
  "claimed": false
}
```
`days` siempre trae las 7 entradas de la semana (lunes a domingo); los días futuros o sin lecturas vienen en 0. `progress` está acotado a 1.

**Response 401** — `error: "unauthorized"`.

**Response 500** — `error: "storage_error"`. Ocurre también si las migraciones `0001` / `0002` todavía no fueron aplicadas.

---

### Reclamo del premio semanal

**`POST /api/points/claim`** — Auth: cookie de sesión. Sin body.

Marca la semana en curso como reclamada. **Re-verifica la meta en el servidor** antes de marcar: no alcanza con que el cliente diga que llegó a los 700 puntos. Es idempotente — el `update` filtra por `claimed_at is null`, así que reclamar dos veces no pisa la marca de tiempo original.

**Response 200:**
```json
{
  "claimed": true,
  "claimedAt": "2026-08-16T18:04:22.481Z",
  "message": "¡Premio reclamado!"
}
```

**Response 400** (todavía no llegó a la meta):
```json
{
  "error": "goal_not_reached",
  "message": "Todavía faltan puntos: 412 de 700"
}
```

**Response 401** — `error: "unauthorized"`.

**Response 500** — `error: "storage_error"`.

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
