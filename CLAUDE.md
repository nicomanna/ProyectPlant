# PLANT TAMAGOTCHI — Reglas para IA (Método AInnovate v2)

> **ATENCIÓN IA:** Este proyecto usa Documentation-Driven Development.
> **ANTES** de escribir CUALQUIER línea de código, DEBES leer los docs relevantes.
> Documento completo del método: `metodo_ainnovate.md` (raíz del proyecto)

## Particularidades de este proyecto

1. **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (cliente `@supabase/supabase-js` directo, **sin Prisma** ni otro ORM) + Lucide React + `canvas-confetti`. Deploy en Vercel.
2. **Tailwind en JSX:** las clases van directo en el JSX/TSX. NO se crean archivos `ComponentName.module.css` por componente. La separación lógica/estilos del Mandamiento II se cumple separando tipos (`.types.ts`) de lógica (`.tsx`), no separando las clases Tailwind.
3. **Flujo rápido para cambios menores de UI:** si el cambio es puramente visual (colores, spacing, copy, ajustar una `className`) y NO agrega/quita funcionalidad ni cambia el flujo de datos → alcanza con actualizar `CHANGELOG.md`. No hace falta crear/actualizar un doc de feature completo. Cualquier otro cambio (nueva funcionalidad, lógica, DB, API) sigue el ciclo completo de FASE 2.
4. Es una app de un solo "usuario" (regalo): la auth es una contraseña única compartida (`APP_PASSWORD`), no un sistema de cuentas. Ver `docs/03-security.md`.

## Protocolo Obligatorio (antes de cada cambio)
1. LEER `docs/01-project-overview.md`
2. LEER `docs/02-architecture.md`
3. IDENTIFICAR qué feature se modifica
4. LEER `docs/features/[feature].md`
5. Si NO existe doc para la feature → CREARLO antes de codear (salvo flujo rápido de UI, punto 3 arriba)
6. Si se toca DB → LEER `docs/DB_SCHEMA.md`
7. Si se toca API → LEER `docs/API_DOCS.md`
8. Si se toca auth/seguridad → LEER `docs/03-security.md`

## Los 12 Mandamientos del Vibe Coding (INVIOLABLES)
| # | Mandamiento | Regla |
|---|-------------|-------|
| I | NO ALUCINARÁS | Solo implementar exactamente lo pedido. Ante duda → PREGUNTAR |
| II | SEPARARÁS LÓGICA DE ESTILOS | Clases Tailwind en JSX; lógica y tipos en archivos separados cuando amerite |
| III | DOCUMENTARÁS CADA CAMBIO | Ningún cambio sin su doc correspondiente (salvo flujo rápido de UI) |
| IV | ACTUALIZARÁS EL CHANGELOG | Cada request → nueva entrada |
| V | DOCUMENTARÁS LA DB | Cada cambio de schema → DB_SCHEMA.md |
| VI | SEGUIRÁS LA ESTRUCTURA | No crear archivos fuera de la estructura |
| VII | USARÁS EL SISTEMA DE ESTILOS | Respetar el design system de Tailwind v4 (`@theme` en `globals.css`, sin `tailwind.config.js`) |
| VIII | PROTEGERÁS CREDENCIALES | Nada hardcodeado (incluida `APP_PASSWORD`), todo en `.env` |
| IX | TIPARÁS TODO | TypeScript estricto, cero `any` |
| X | VALIDARÁS ANTES DE ENTREGAR | Checklist obligatorio |
| XI | MANTENDRÁS CONSISTENCIA | Seguir convenciones existentes |
| XII | COMUNICARÁS CON CLARIDAD | Resumen de acciones al terminar |

## 4 Leyes de Operación
1. **LEER ANTES DE ACTUAR** — Consultar docs antes de cualquier cambio
2. **NO ROMPER LO QUE FUNCIONA** — Detenerse si hay conflicto con la arquitectura
3. **DOCUMENTACIÓN CONTINUA** — Actualizar docs + CHANGELOG después de cada cambio
4. **SEGURIDAD** — Nunca deploy/push/cambios destructivos sin confirmación

## Documentación del Proyecto
| Doc | Cuándo leerlo |
|-----|--------------|
| `docs/01-project-overview.md` | SIEMPRE (visión, stack, estado) |
| `docs/02-architecture.md` | SIEMPRE (estructura, convenciones) |
| `docs/03-security.md` | Si se toca auth, credenciales, RLS |
| `docs/04-deployment.md` | Si se toca deploy, CI/CD |
| `docs/DB_SCHEMA.md` | Si se toca base de datos |
| `docs/API_DOCS.md` | Si se toca endpoints/API |
| `docs/SKILLS.md` | ANTES de implementar cualquier feature nueva |
| `docs/features/*.md` | El doc de la feature que se modifica |
| `TODO.md` | Roadmap de tareas pendientes |

## Tabla de Lookup
| Archivo que se modifica | Doc que se debe leer |
|------------------------|---------------------|
| `src/app/page.tsx` | `docs/features/dashboard.md` (cuando exista) |
| `src/app/login/**` | `docs/features/auth.md` + `docs/03-security.md` |
| `src/app/api/auth/**` | `docs/features/auth.md` + `docs/03-security.md` |
| `src/app/api/sensors/**` | `docs/features/sensores.md` + `docs/DB_SCHEMA.md` + `docs/API_DOCS.md` |
| `src/app/api/points/**` | `docs/features/puntos.md` + `docs/DB_SCHEMA.md` + `docs/API_DOCS.md` |
| `src/components/features/PlantAvatar/**` | `docs/features/dashboard.md` |
| `scripts/simulate-esp32.ts` | `docs/features/simulador-esp32.md` |
| `supabase/migrations/*.sql` | `docs/DB_SCHEMA.md` |
| `public/manifest.json`, service worker | `docs/features/pwa.md` |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
