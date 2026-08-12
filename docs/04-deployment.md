# Deployment — Plant Tamagotchi

> Este documento se completa cuando se haga el primer deploy real. Por ahora deja registrado el plan.

## Destino
- **Hosting:** Vercel
- **Base de datos:** Supabase (proyecto cloud, no local)

## Checklist previo al primer deploy
- [ ] Proyecto Supabase creado y migraciones aplicadas (ver `docs/DB_SCHEMA.md`)
- [ ] Todas las variables de `docs/02-architecture.md` → sección "Variables de Entorno" cargadas en Vercel (Project Settings → Environment Variables)
- [ ] `.env.local` NO está commiteado (verificar `.gitignore`)
- [ ] `APP_PASSWORD` configurada en Vercel (no la default de desarrollo, salvo que el usuario confirme mantenerla)
- [ ] RLS activado y revisado en todas las tablas de Supabase con datos sensibles
- [ ] `npm run build` pasa sin errores localmente
- [ ] PWA: manifest e íconos presentes en `public/`
- [ ] Endpoint `/api/sensors/ingest` probado con `scripts/simulate-esp32.ts` contra el proyecto Supabase real

## Proceso de Deploy
1. Conectar el repositorio a Vercel (o usar `vercel` CLI).
2. Configurar variables de entorno en Vercel (Production + Preview).
3. Deploy automático en cada push a `main` (o manual con `vercel --prod`, siempre con confirmación explícita del usuario).

## Post-Deploy
- [ ] Verificar que `/login` funciona con la contraseña de producción
- [ ] Verificar que el dashboard muestra datos reales de Supabase
- [ ] Verificar instalación de la PWA en un dispositivo móvil real
