# TODO — Plant Tamagotchi

> Roadmap de FASE 2 (features). Cada ítem sigue el ciclo del Método AInnovate:
> 0) verificar `docs/SKILLS.md` → 1) documentar en `docs/features/[nombre].md` → 2) codear → 3) actualizar docs/CHANGELOG.
> Para pedir cualquiera de estos, basta con decir: "Voy a agregar la funcionalidad de [X]".

## ⏸ Bloqueado esperando al usuario
- [ ] **Diseño visual de la pantalla principal** — el usuario está preparando el diseño 3D a color de la planta + dispositivo + carita feliz. NO construir el layout/estética del dashboard hasta tenerlo. Se puede avanzar en paralelo con lógica, API y base de datos.

## Setup previo (fuera de la app, lo hace el usuario)
- [x] Crear el proyecto en Supabase y completar `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- [ ] ⚠️ **Corregir `NEXT_PUBLIC_SUPABASE_URL` en `.env.local`** — actualmente tiene cargada una *publishable key* (`sb_publishable_...`), no la URL del proyecto. Debería ser algo como `https://jarawkubfruiiuonlysp.supabase.co` (a confirmar en el dashboard de Supabase → Project Settings → API). No bloquea la feature de auth, pero sí bloqueará la feature de sensores.

## Features completadas

1. ✅ **Autenticación simple por contraseña** (`auth`) — ver `docs/features/auth.md`
   - Página `/login` con input de contraseña
   - `POST /api/auth/login` valida contra `APP_PASSWORD` y emite cookie de sesión firmada
   - Proxy (`src/proxy.ts`) que protege el dashboard

## Features pendientes (orden sugerido)

2. **Modelo de datos de sensores + endpoint de ingestión** (`sensores`)
   - Tabla `sensor_readings` en Supabase + RLS
   - `POST /api/sensors/ingest` protegido con `ESP32_INGEST_SECRET`
   - `GET /api/sensors/latest`
   - Doc: `docs/features/sensores.md`

3. **Script de simulación del ESP32** (`simulador-esp32`)
   - `scripts/simulate-esp32.ts`: genera lecturas falsas y las postea a `/api/sensors/ingest`
   - Doc: `docs/features/simulador-esp32.md`

4. **Sistema de puntos + meta semanal** (`puntos`)
   - Tabla `points_log` y `weekly_goals` en Supabase + RLS
   - Reglas de puntaje según cuidado de la planta (a definir con el usuario antes de codear)
   - `GET /api/points` con progreso hacia los 700 pts semanales
   - Doc: `docs/features/puntos.md`

5. **Dashboard mobile-first** (`dashboard`) — ⏸ depende del diseño del usuario
   - Pantalla principal con la planta 3D + carita feliz + estado de sensores en vivo
   - Barra de progreso de la meta semanal
   - Doc: `docs/features/dashboard.md`

6. **Gráficos históricos de sensores** (`graficos`)
   - Definir con el usuario la librería de gráficos a usar (no está en el stack original, hay que confirmar antes de instalar — Mandamiento I)
   - Doc: `docs/features/graficos.md`

7. **Animación de confeti al reclamar el premio** (`confeti`)
   - Trigger al alcanzar/reclamar la meta semanal usando `canvas-confetti`
   - Doc: `docs/features/confeti.md`

8. **PWA instalable** (`pwa`)
   - `public/manifest.json`, íconos (varios tamaños, dependen del diseño final), service worker básico
   - Doc: `docs/features/pwa.md`

9. **Deploy en Vercel**
   - Completar checklist de `docs/04-deployment.md`
   - Requiere confirmación explícita del usuario antes de hacer el deploy real
   