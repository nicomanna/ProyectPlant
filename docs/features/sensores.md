# Feature: Sensores (ingesta + lectura)

> **Estado:** Código completo — ⚠️ requiere aplicar la migración `0001` en Supabase
> **Archivos clave:** `supabase/migrations/0001_sensor_readings.sql`, `src/app/api/sensors/**`, `src/services/sensor.service.ts`, `src/lib/supabase.ts`, `src/lib/plantHealth.ts`
> **Dependencias:** `@supabase/supabase-js` (ya instalada)

---

## Descripción
Capa de datos de la app: recibe lecturas del ESP32 (o del script simulador), las persiste en Supabase, y las expone al dashboard para que la planta 3D y los puntos reaccionen a datos reales en vez de simulados.

## Objetivo
Que el estado que se ve en pantalla sea el estado real de la planta física, y dejar la base para el sistema de puntos y los gráficos históricos.

## Modelo de Datos
Tabla `sensor_readings` (detalle completo en `docs/DB_SCHEMA.md`):

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid` | PK |
| `device_id` | `text` | Identificador del dispositivo (default `esp32-01`) |
| `soil_moisture` | `numeric` | Humedad del sustrato, 0–100 % |
| `light_level` | `numeric` | Nivel de luz, 0–100 % |
| `temperature` | `numeric` | Temperatura ambiente, °C |
| `humidity` | `numeric` | Humedad ambiente, 0–100 % |
| `recorded_at` | `timestamptz` | Momento de la medición (lo envía el dispositivo, default `now()`) |
| `created_at` | `timestamptz` | Momento de la inserción en la DB |

### Decisión de RLS
La app **no usa Supabase Auth** (ADR-002): no existe `auth.uid()` con el que escribir políticas por usuario. Por eso:
- RLS queda **activado** en la tabla, y **sin ninguna política permisiva** → la `anon key` no puede leer ni escribir nada, ni siquiera si se filtra (es pública por diseño).
- **Todo** el acceso a datos pasa por route handlers server-side que usan `SUPABASE_SERVICE_ROLE_KEY` (que bypassa RLS por diseño de Postgres), detrás de la cookie de sesión o del `ESP32_INGEST_SECRET`.

Esto es deliberado y se documenta también en `docs/03-security.md`: la autorización vive en la capa de API, no en RLS, porque no hay identidad de usuario en la base.

## Flujo de Uso
1. El ESP32 (o `scripts/simulate-esp32.ts`) hace `POST /api/sensors/ingest` con `Authorization: Bearer {ESP32_INGEST_SECRET}` y el body de la lectura.
2. El endpoint valida el secret y **valida el rango de cada campo** (no confía en el dispositivo) antes de insertar.
3. La lectura se guarda en `sensor_readings` con el cliente de service role.
4. El dashboard llama a `GET /api/sensors/latest` (protegido por la cookie de sesión) cada 30 s.
5. `computePlantHealth()` convierte la lectura en un valor de salud 0–1, que alimenta la planta 3D.

## Componentes / Archivos
| Archivo | Responsabilidad |
|---------|----------------|
| `supabase/migrations/0001_sensor_readings.sql` | Migración: tabla, índices, RLS |
| `src/lib/supabase.ts` | Cliente de Supabase para server (service role). Nunca se importa desde el cliente |
| `src/types/sensor.types.ts` | `SensorReading`, `SensorReadingInput`, respuestas de API |
| `src/constants/sensors.ts` | Rangos óptimos y límites físicos válidos por métrica |
| `src/lib/plantHealth.ts` | `computePlantHealth()`: lectura → salud 0–1 |
| `src/services/sensor.service.ts` | Acceso a datos: `insertReading()`, `getLatestReading()`, `getReadingsSince()` |
| `src/app/api/sensors/ingest/route.ts` | `POST` — recibe lecturas del dispositivo |
| `src/app/api/sensors/latest/route.ts` | `GET` — última lectura, para el dashboard |
| `src/hooks/useSensorData.ts` | Hook cliente: hace polling de `/api/sensors/latest` y devuelve lectura + salud + estados de carga/error |
| `src/app/page.tsx` | Dashboard: usa `useSensorData` en lugar de la salud simulada |

## API / Endpoints
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/sensors/ingest` | `ESP32_INGEST_SECRET` | Inserta una lectura |
| GET | `/api/sensors/latest` | Cookie de sesión | Última lectura + salud calculada |
| POST | `/api/sensors/care` | `ESP32_INGEST_SECRET` | Registra la visita diaria (HC-SR04); ver `docs/features/puntos.md` |

Detalle de request/response en `docs/API_DOCS.md`.

## Rangos óptimos (Potus / Peperomia)
| Métrica | Óptimo | Rango físico aceptado |
|---------|--------|----------------------|
| Humedad del sustrato | 40–70 % | 0–100 |
| Luz | 30–75 % | 0–100 |
| Temperatura | 18–27 °C | -20–60 |
| Humedad ambiente | 40–70 % | 0–100 |

`computePlantHealth()` da 1.0 a cada métrica dentro de su rango óptimo, y decae linealmente hacia 0 conforme se aleja (con una tolerancia por métrica). La salud final es el promedio ponderado, con la humedad del sustrato pesando el doble que el resto — es la variable que la usuaria realmente controla regando.

## Restricciones
- El endpoint de ingesta **nunca** usa `APP_PASSWORD` ni la cookie de sesión: el ESP32 no es un browser (ver `docs/03-security.md`).
- `SUPABASE_SERVICE_ROLE_KEY` solo se usa en código server-side. `src/lib/supabase.ts` lleva `import 'server-only'` para que el build falle si alguien lo importa desde un componente cliente.
- Se valida el rango físico de cada métrica en el servidor; un valor fuera de rango se rechaza con 400 en vez de guardarse.
- Sin realtime de Supabase en esta iteración: polling simple cada 30 s (suficiente para una planta, y no requiere exponer la anon key con políticas de lectura).

## Pendiente
- [ ] ⚠️ **Aplicar la migración `supabase/migrations/0001_sensor_readings.sql`** en el proyecto Supabase (SQL Editor → pegar → Run). Verificado que la tabla **todavía no existe**: sin esto, `/api/sensors/latest` responde 500 y el dashboard muestra el aviso de error. No hay CLI de Supabase ni connection string de Postgres en el entorno, así que no se pudo aplicar automáticamente.

## Componentes agregados durante la implementación
- `src/lib/apiAuth.ts` — helpers `requireSession()` (cookie, para endpoints del dashboard) y `requireIngestSecret()` (bearer, para el dispositivo). El proxy deja pasar `/api/*` sin verificar porque los endpoints tienen esquemas de auth distintos, así que cada uno valida el suyo.
- `src/components/features/SensorPanel/**` — grilla de las 4 métricas bajo la planta, con indicador de "en rango"/"fuera de rango" por métrica.
- Se eliminó `src/hooks/useSimulatedPlantHealth.ts`: reemplazado por `useSensorData`, que trae salud real. La prop `health` de `Plant3DViewer` no cambió, tal como estaba previsto en `docs/features/dashboard.md`.
- Se agregó la dependencia `server-only` para que el build falle si `src/lib/supabase.ts` (que tiene la service role key) se importa desde un componente cliente.
