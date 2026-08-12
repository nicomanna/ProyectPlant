# Esquema de Base de Datos — Plant Tamagotchi

**Base de datos:** Supabase (PostgreSQL)
**Última actualización:** 2026-08-11 (FASE 1 — aún sin tablas creadas)

---

## Diagrama ER

```mermaid
erDiagram
    %% Todavía no hay tablas creadas.
    %% Este diagrama se completa en FASE 2, feature por feature.
```

---

## Índice de Tablas

| # | Tabla | Descripción | RLS | Políticas |
|---|-------|-------------|-----|-----------|
| _(ninguna tabla creada aún)_ | | | | |

---

## Tablas

_(Se documentan acá conforme se crean, con columnas, índices, FKs, políticas RLS y triggers — ver formato completo en el Apéndice A de `metodo_ainnovate.md`)_

---

## Notas de Planeamiento (no implementado todavía)

Referencia para FASE 2 — nombres tentativos, sujetos a la feature real que se documente antes de codear:

| Tabla tentativa | Propósito |
|------------------|-----------|
| `sensor_readings` | Lecturas del ESP32 (humedad, luz, temperatura, timestamp) |
| `points_log` | Historial de puntos ganados y motivo (ej. riego, humedad óptima) |
| `weekly_goals` | Meta semanal (700 pts), fecha de inicio/fin, estado (reclamada o no) |

> Estas tablas NO existen todavía. Se crean recién cuando se documente e implemente la feature correspondiente en `docs/features/`.

---

## Historial de Migraciones

| # | Archivo | Fecha | Descripción | Estado |
|---|---------|-------|-------------|--------|
| _(ninguna migración aplicada aún)_ | | | | |

---

## Resumen RLS

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| _(sin tablas aún)_ | | | | |
