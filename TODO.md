# TODO — Plant Tamagotchi

> Roadmap de FASE 2 (features). Cada ítem sigue el ciclo del Método AInnovate:
> 0) verificar `docs/SKILLS.md` → 1) documentar en `docs/features/[nombre].md` → 2) codear → 3) actualizar docs/CHANGELOG.
> Para pedir cualquiera de estos, basta con decir: "Voy a agregar la funcionalidad de [X]".

## Setup previo (fuera de la app, lo hace el usuario)
- [x] Crear el proyecto en Supabase y completar las variables en `.env.local`
- [x] Corregir `NEXT_PUBLIC_SUPABASE_URL` en `.env.local`

## Features completadas

1. ✅ **Autenticación simple por contraseña** (`auth`) — ver `docs/features/auth.md`
   - Página `/login` con input de contraseña
   - `POST /api/auth/login` valida contra `APP_PASSWORD` y emite cookie de sesión firmada
   - Proxy (`src/proxy.ts`) que protege el dashboard

2. ✅ **Planta 3D interactiva en el dashboard** (`dashboard`, parcial) — ver `docs/features/dashboard.md`
   - `Plant3DViewer` (three.js) centrado en `/`, rotable 360° (drag/OrbitControls)
   - Pendiente dentro de esta misma feature: barra de progreso de la meta semanal (llega con la feature `puntos`)

3. ✅ **Modelo de datos de sensores + endpoint de ingestión** (`sensores`) — ver `docs/features/sensores.md`
   - Tabla `sensor_readings` + índice + RLS (migración `0001`)
   - `POST /api/sensors/ingest` protegido con `ESP32_INGEST_SECRET`, valida rangos
   - `GET /api/sensors/latest` con salud calculada, detrás de la cookie de sesión
   - `useSensorData` reemplaza la salud simulada; `SensorPanel` muestra las 4 métricas

4. ✅ **Script de simulación del ESP32** (`simulador-esp32`) — ver `docs/features/simulador-esp32.md`
   - `npm run simulate` con escenarios, `--watch` y `--seed-days` para sembrar historial
   - Usa el mismo endpoint y credencial que el dispositivo real

5. ✅ **Sistema de puntos + meta semanal** (`puntos`) — ver `docs/features/puntos.md`
   - Tablas `points_log` y `weekly_goals` + RLS (migración `0002`)
   - Esquema de puntaje: 100 pts/día × 7 = 700 pts/semana, ponderado por métrica
   - `GET /api/points` con el progreso semanal, `POST /api/points/claim` para el premio
   - `WeeklyGoal` con barra de progreso y botón de reclamo en el dashboard

6. ✅ **Gráficos históricos de sensores** (`graficos`) — ver `docs/features/graficos.md`
   - `recharts`: 4 gráficos de línea (small multiples), nunca doble eje Y
   - Paleta validada con el script de la skill `dataviz` (un solo hue, `#2a78d6`)
   - Banda del rango óptimo detrás de cada línea, leída de `SENSOR_RANGES`
   - `GET /api/sensors/history?range=24h|7d|30d` con promedio por buckets
   - Vista de tabla como gemela accesible

7. ✅ **Animación de confeti al reclamar el premio** (`confeti`) — ver `docs/features/confeti.md`
   - Ráfaga corta al cruzar los 700 pts, larga al reclamar el premio
   - Respeta `prefers-reduced-motion`; import dinámico de `canvas-confetti`
   - Nunca bloquea ni confirma el reclamo: es decoración

8. ✅ **PWA instalable** (`pwa`) — ver `docs/features/pwa.md`
   - `src/app/manifest.ts` (convención de Next 16), no `public/manifest.json`
   - Íconos generados con `ImageResponse`: 32, 180, 192, 512 y maskable
   - Service worker propio: network-first, nunca cachea `/api/*`, fallback `/offline.html`
   - ⚠️ Falta probar la instalación en un celular real (requiere HTTPS ⇒ después del deploy)

## Pendientes

9. **Deploy en Vercel** (en curso) — ver `docs/04-deployment.md`
   - Requiere confirmación explícita del usuario antes de hacer el deploy real

## Bloqueantes resueltos

- [x] Migraciones `0001` y `0002` aplicadas en Supabase por el usuario (2026-08-12), verificado contra la REST API real.
- [x] `NEXT_PUBLIC_SUPABASE_URL` en `.env.local` tenía otra vez la URL del dashboard web en vez de la URL de API — corregido a `https://jarawkubfruiiuonlysp.supabase.co` (2026-08-12).
   