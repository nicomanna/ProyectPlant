# Arquitectura — Plant Tamagotchi

## Stack Completo
| Paquete | Rol |
|---------|-----|
| `next` (16.3.0) | Framework, App Router |
| `react` / `react-dom` (19.2.8) | UI |
| `typescript` (^5) | Tipado estático |
| `tailwindcss` (^4) + `@tailwindcss/postcss` | Estilos utility-first |
| `eslint` + `eslint-config-next` | Linting |
| `@supabase/supabase-js` | Cliente de base de datos y (si aplica) realtime |
| `lucide-react` | Iconografía |
| `canvas-confetti` (+ `@types/canvas-confetti`) | Animación de confeti al reclamar el premio semanal |
| `three` (+ `@types/three`) | Render 3D del avatar de la planta (WebGL) en el dashboard |
| `recharts` | Gráficos históricos de sensores (SVG, declarativo en JSX) |
| `server-only` | Marca módulos que nunca deben llegar al browser (cliente de service role) |
| `tsx` (dev) | Corre el script del simulador del ESP32 en TypeScript |

> No se usa Prisma ni ningún ORM: las queries a Supabase se hacen con el cliente `@supabase/supabase-js` directamente desde `src/services/`. Decisión registrada en ADR-001.

## Estructura de Carpetas

```
proyecto-plant/
├── docs/                           # Documentación (Método AInnovate)
│   ├── 01-project-overview.md
│   ├── 02-architecture.md
│   ├── 03-security.md
│   ├── 04-deployment.md
│   ├── DB_SCHEMA.md
│   ├── API_DOCS.md
│   ├── SKILLS.md
│   └── features/                   # Un .md por funcionalidad (FASE 2)
├── src/
│   ├── proxy.ts                    # Protege rutas privadas verificando la cookie de sesión (antes "middleware.ts", renombrado en Next.js 16)
│   ├── app/                        # Rutas (App Router)
│   │   ├── api/
│   │   │   ├── auth/login/         # POST — valida APP_PASSWORD, emite la cookie
│   │   │   ├── sensors/
│   │   │   │   ├── ingest/         # POST — lecturas del ESP32 (Bearer secret)
│   │   │   │   ├── latest/         # GET  — última lectura + salud
│   │   │   │   └── history/        # GET  — histórico agregado por buckets
│   │   │   └── points/
│   │   │       ├── route.ts        # GET  — progreso de la meta semanal
│   │   │       └── claim/          # POST — reclama el premio de la semana
│   │   ├── login/
│   │   │   └── page.tsx            # Pantalla de login (contraseña única)
│   │   ├── manifest.ts             # Web app manifest (Next lo sirve en /manifest.webmanifest)
│   │   ├── icon.tsx                # Favicon 32×32 generado con ImageResponse
│   │   ├── apple-icon.tsx          # Ícono de iOS 180×180
│   │   ├── icons/[variant]/        # Íconos del manifest (192, 512, maskable)
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Dashboard: planta 3D + meta + sensores + gráficos
│   │   └── globals.css             # Solo directivas de Tailwind + estilos base globales
│   ├── components/
│   │   ├── ui/                     # Componentes base reutilizables (Button, Card, ProgressBar...)
│   │   ├── layout/                 # Header, Container, BottomNav, etc.
│   │   └── features/
│   │       ├── PlantAvatar/        # Modelo 3D de la planta (three.js): Plant3DViewer.tsx, plantModel.ts
│   │       ├── SensorPanel/        # Grilla con las 4 métricas actuales
│   │       ├── WeeklyGoal/         # Barra de progreso + botón de premio
│   │       ├── SensorCharts/       # Gráficos históricos (recharts) + vista de tabla
│   │       ├── PWA/                # Registro del service worker
│   │       └── ConfettiPreview/    # Preview de debug del confeti (?preview=reach|claim)
│   ├── lib/                        # Utilidades y lógica pura (supabase, apiAuth, session,
│   │                               #   plantHealth, points, history)
│   ├── hooks/                      # Custom hooks (useSensorData, usePoints, useSensorHistory)
│   ├── types/                      # Tipos globales / tipos de datos de Supabase
│   ├── constants/                  # Constantes (sensors, points, charts, auth, orbs)
│   └── services/                   # Capa de acceso a datos (sensor.service.ts, points.service.ts)
├── scripts/
│   └── simulate-esp32.ts           # Script para simular el ESP32 sin hardware real
├── public/
│   ├── sw.js                       # Service worker (network-first, nunca cachea /api)
│   └── offline.html                # Pantalla estática de "sin conexión"
├── supabase/
│   └── migrations/                 # Migraciones SQL (se crean por feature en FASE 2)
├── .windsurfrules
├── .cursorrules
├── .clinerules
├── .aider.conf.yml
├── .github/copilot-instructions.md
├── CLAUDE.md
├── CHANGELOG.md
├── TODO.md
├── metodo_ainnovate.md
├── .env.local                      # Variables de entorno reales (NO se commitea)
├── .env.example
└── package.json
```

> Nota sobre Tailwind: al usar TailwindCSS, las clases van directamente en el JSX/TSX de cada componente. NO se crean archivos `.module.css` por componente (aclaración explícita del usuario). La separación lógica/estilos del Mandamiento II se cumple separando tipos (`.types.ts`) y lógica (`.tsx`) cuando el componente lo amerite, no separando clases Tailwind a un archivo aparte.

## Base de Datos
Motor: **Supabase (PostgreSQL)**. Aún no se crearon tablas — se crean progresivamente en FASE 2, una por feature (auth de sesión si aplica, `sensor_readings`, `points_log`, `weekly_goals`, etc.). Detalle completo y actualizado en [`DB_SCHEMA.md`](./DB_SCHEMA.md).

## Flujo de Datos (planeado)

```
ESP32 real  ──┐
              ├──► POST /api/sensors/ingest ──► tabla sensor_readings (Supabase)
Script simulador ──┘                                      │
                                                            ▼
                                            Dashboard (src/app/page.tsx)
                                            hace fetch / polling (o Supabase Realtime)
                                                            │
                                                            ▼
                                          Reglas de cuidado ──► tabla points_log
                                                            │
                                                            ▼
                                     Barra de progreso hacia weekly goal (700 pts)
                                                            │
                                                            ▼
                                     Al alcanzar la meta ──► animación de confeti
```

El endpoint de ingestión (`/api/sensors/ingest`) se protege con un secret propio de dispositivo (ver `docs/03-security.md`), distinto de la contraseña de acceso a la app, para no exponer `APP_PASSWORD` en el firmware del ESP32 ni en el script simulador.

## Variables de Entorno
| Variable | Descripción | Tipo | Requerida |
|----------|-------------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | pública | SI |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase (cliente) | pública | SI |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de service role (solo server, ej. endpoint de ingest) | privada | SI |
| `APP_PASSWORD` | Contraseña de acceso a la app (gate simple) | privada | SI |
| `SESSION_SECRET` | Secret para firmar la cookie/token de sesión | privada | SI |
| `ESP32_INGEST_SECRET` | Secret que usa el ESP32/script simulador para autenticar el POST de lecturas | privada | SI |

## Convenciones del Proyecto
- Nomenclatura: ver Mandamiento XI (`PascalCase` componentes, `camelCase` con prefijo `use` para hooks, `SCREAMING_SNAKE` para constantes, `*.service.ts` para servicios).
- Tailwind (v4): usar únicamente el design system definido en `src/app/globals.css` vía `@theme` (colores, spacing, tipografía) — esta versión de Tailwind no usa `tailwind.config.js`. No inventar valores arbitrarios fuera del sistema salvo justificación documentada.
- TypeScript estricto, sin `any` (Mandamiento IX).
- Cada componente de `components/ui` y `components/features` exporta desde un `index.ts` cuando tiene más de un archivo asociado (tipos, subcomponentes).

## Decisiones Arquitectónicas

### ADR-001: Supabase client directo, sin Prisma
**Fecha:** 2026-08-11
**Contexto:** El usuario pidió originalmente "SQLite con Prisma", pero también pidió deploy en Vercel con Supabase como base de datos. SQLite no persiste en el filesystem efímero de Vercel serverless, y mantener Prisma solo como capa intermedia sobre Supabase agregaba una dependencia extra sin necesidad real para un proyecto de este tamaño.
**Decisión:** Se usa `@supabase/supabase-js` directamente desde `src/services/` para todas las queries. No se instala Prisma.
**Consecuencias:** Menos dependencias, acceso directo a Realtime de Supabase si se necesita para el estado de sensores en vivo. El tipado de las filas de la base se mantiene a mano (o generado con `supabase gen types typescript`) en `src/types/`.

### ADR-002: Autenticación por contraseña única, sin sistema de usuarios
**Fecha:** 2026-08-11
**Contexto:** La app es para una sola persona (regalo), no requiere multi-tenancy ni roles.
**Decisión:** Un solo gate de acceso por contraseña compartida (`APP_PASSWORD`), sin tabla de usuarios ni Supabase Auth. Se implementa como cookie de sesión firmada tras validar la contraseña.
**Consecuencias:** Simplifica muchísimo la implementación. Si en el futuro se necesitan múltiples usuarios/roles, habría que migrar a Supabase Auth (cambio que requeriría autorización explícita por romper con Mandamiento VI).
