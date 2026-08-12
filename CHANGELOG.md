# Changelog — Plant Tamagotchi

> Formato: [Semantic Versioning](https://semver.org/)
> Cada entrada incluye: fecha, tipo, archivos afectados, request original.

---

## [0.2.0] — 2026-08-12

### Added — Autenticación simple por contraseña

#### Archivos afectados
- `docs/features/auth.md` — Documento de la feature (creado antes de codear, estado Completo)
- `src/lib/session.ts` — Firma y verificación de tokens de sesión (HMAC-SHA256 vía Web Crypto)
- `src/constants/auth.ts` — Nombre de cookie y duración de sesión
- `src/types/auth.types.ts` — Tipos del request/response de login
- `src/app/api/auth/login/route.ts` — `POST /api/auth/login`
- `src/app/login/page.tsx` — Pantalla de login
- `src/proxy.ts` — Protege todas las rutas del dashboard salvo `/login` y `/api/*` (creado como `middleware.ts` y renombrado a `proxy.ts` por la deprecación de esa convención en Next.js 16)
- `docs/API_DOCS.md` — Documentado `POST /api/auth/login` con requests/responses reales
- `docs/03-security.md` — Agregado detalle del esquema de token de sesión
- `docs/02-architecture.md` — Estructura de carpetas actualizada con `src/proxy.ts` y `src/app/login/`
- `TODO.md` — Feature de auth marcada como completada

### Fixed
- `src/lib/session.ts` — `verifySessionToken()` no capturaba errores de `atob()` al decodificar una cookie con base64 corrupto o manipulado, lo que crasheaba el proxy con un 500 en vez de tratar la cookie como sesión inválida. Detectado probando manualmente con una cookie manipulada antes de cerrar la feature.

### Descripción detallada
Implementado el gate de acceso único de la app: página `/login`, endpoint que valida `APP_PASSWORD` y emite una cookie de sesión firmada (sin librerías nuevas, usando la Web Crypto API nativa), y un proxy que protege todas las rutas del dashboard. Sin tabla de usuarios ni Supabase Auth (ADR-002). Probado manualmente de punta a punta con `curl`: acceso sin sesión, contraseña incorrecta, contraseña correcta, acceso con sesión válida, y acceso con cookie manipulada.

Se detectó (pero no se corrigió, por estar fuera del alcance de esta feature) que `NEXT_PUBLIC_SUPABASE_URL` en `.env.local` tiene cargada una publishable key en vez de la URL del proyecto — queda anotado en `TODO.md`.

### Request original
> Vamos por un features: Página `/login` con input de contraseña, `POST /api/auth/login` valida contra `APP_PASSWORD` y emite cookie de sesión firmada, Middleware que protege el dashboard, Doc: `docs/features/auth.md`. (aclaracion) Ya tienes los env de supabase conectados y tambien necesito que estes conectado al proyecto de github.

---

## [0.1.0] — 2026-08-11

### Added — Setup Inicial (Método AInnovate)

#### Archivos afectados
- `docs/01-project-overview.md` — Visión, objetivos, stack y estado del proyecto
- `docs/02-architecture.md` — Estructura de carpetas, flujo de datos, variables de entorno, ADRs
- `docs/03-security.md` — Modelo de autenticación por contraseña única y reglas de credenciales
- `docs/04-deployment.md` — Checklist de deploy en Vercel (pendiente de ejecutar)
- `docs/DB_SCHEMA.md` — Template de esquema, sin tablas creadas aún
- `docs/API_DOCS.md` — Template de endpoints planeados, sin implementar aún
- `docs/SKILLS.md` — Registro de skills de Claude Code relevantes al proyecto
- `docs/features/.gitkeep` — Carpeta lista para docs de features (FASE 2)
- `.windsurfrules`, `.cursorrules`, `.clinerules` — Reglas para IA (formato comentarios)
- `CLAUDE.md`, `.github/copilot-instructions.md` — Reglas para IA (formato Markdown)
- `.aider.conf.yml` — Reglas para IA (formato YAML)
- `package.json` y estructura Next.js — Proyecto inicializado con `create-next-app` (App Router, TypeScript, Tailwind CSS v4, ESLint, `src/`)
- `src/components/{ui,layout,features}`, `src/lib`, `src/hooks`, `src/types`, `src/constants`, `src/services` — Estructura de carpetas del código
- `scripts/` — Carpeta para el futuro script de simulación del ESP32
- `supabase/migrations/` — Carpeta para futuras migraciones SQL
- `.env.example` — Variables de entorno documentadas (sin valores reales)
- `.env.local` — Variables de entorno de desarrollo (contraseña `planta2026`, secrets generados; Supabase pendiente de configurar)
- `.gitignore` — Ajustado con excepción `!.env.example` para que sí se versione
- `TODO.md` — Roadmap de FASE 2 en adelante

### Dependencias instaladas
- `next`, `react`, `react-dom` (base de `create-next-app`)
- `@supabase/supabase-js` — cliente de base de datos
- `lucide-react` — iconografía
- `canvas-confetti` (+ `@types/canvas-confetti`) — animación de confeti

### Descripción detallada
Inicialización completa del proyecto siguiendo la FASE 1 del Método AInnovate: documentación base, reglas para todos los IDEs con IA, y scaffolding del proyecto Next.js con el stack acordado. Se resolvió una ambigüedad en el stack original (SQLite + Prisma vs. Supabase + Vercel) consultando al usuario, quien eligió usar el cliente de Supabase directamente sin ORM (ver ADR-001 en `docs/02-architecture.md`). No se implementó código de features todavía (auth, sensores, puntos, PWA, simulador) — quedan documentadas como pendientes en `TODO.md` para la FASE 2, a la espera además del diseño visual del usuario para el dashboard principal.

### Request original
> Lee el archivo METODO_AINNOVATE.md completo y sigue las instrucciones de la FASE 1 para inicializar el proyecto. [...] Por favor, ejecuta la FASE 1: crea la carpeta docs/, genera todos los archivos de reglas (CLAUDE.md, .windsurfrules, etc.), inicializa el proyecto y deja listo el archivo TODO.md para empezar.
