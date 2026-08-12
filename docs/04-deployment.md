# Deployment — Plant Tamagotchi

## Destino
- **Hosting:** Vercel (repo de GitHub ya conectado)
- **Base de datos:** Supabase (proyecto cloud, no local) — migraciones `0001` y `0002` aplicadas

## Checklist previo al primer deploy
- [x] Proyecto Supabase creado y migraciones aplicadas (ver `docs/DB_SCHEMA.md`)
- [ ] Las 6 variables de entorno cargadas en Vercel (Project Settings → Environment Variables), en **Production** y **Preview**
- [x] `.env.local` NO está commiteado (`.gitignore` excluye todo `.env*` salvo `.env.example`)
- [x] `APP_PASSWORD` de producción confirmada con el usuario — se mantiene la misma de desarrollo (decisión explícita, no un olvido)
- [x] `SESSION_SECRET` y `ESP32_INGEST_SECRET` de producción confirmados con el usuario — se reusan los de desarrollo (app de un solo entorno real, sin beneficio de seguridad relevante en duplicarlos)
- [x] RLS activado y revisado en las tres tablas de Supabase (`sensor_readings`, `points_log`, `weekly_goals`)
- [x] `npm run build` y `npm run lint` pasan sin errores localmente
- [x] PWA: manifest e íconos presentes (`src/app/manifest.ts`, `src/app/icon.tsx`, etc.)
- [ ] Endpoint `/api/sensors/ingest` probado con `scripts/simulate-esp32.ts` contra el proyecto Supabase real (opcional antes del deploy, recomendado después para tener datos con los que ver el dashboard)

## Variables de Entorno requeridas en Vercel
Los **nombres** de las 6 variables (los valores reales, por ser credenciales, no se documentan en este archivo — están en `.env.local`, que nunca se commitea):

| Variable | Secreta | Entornos |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No (uso limitado por RLS) | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sí** | Production, Preview |
| `APP_PASSWORD` | **Sí** | Production, Preview |
| `SESSION_SECRET` | **Sí** | Production, Preview |
| `ESP32_INGEST_SECRET` | **Sí** | Production, Preview |

Detalle de cada una en `docs/03-security.md`.

## Proceso de Deploy
1. Cargar las 6 variables de entorno en Vercel (Project Settings → Environment Variables → marcar Production y Preview).
2. Commitear y pushear a `main` — el repo ya está conectado a Vercel, así que el push dispara el deploy automáticamente.
3. Verificar el deploy en el dashboard de Vercel (build logs, dominio asignado).
4. Correr el checklist de Post-Deploy.

## Post-Deploy
- [ ] Verificar que `/login` funciona con la contraseña de producción
- [ ] Verificar que el dashboard muestra datos reales de Supabase (o el estado "sin lecturas" si todavía no hay datos)
- [ ] Verificar que `/manifest.webmanifest`, `/sw.js` y los íconos responden 200 sobre el dominio de producción
- [ ] Verificar instalación de la PWA en un dispositivo móvil real (requiere HTTPS, que Vercel da por defecto)
- [ ] Si se corrió el simulador contra producción, confirmar que `/api/sensors/latest` refleja la lectura
