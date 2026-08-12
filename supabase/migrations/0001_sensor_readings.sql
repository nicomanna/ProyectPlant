-- Migración 0001 — Lecturas de sensores del ESP32
-- Ver docs/DB_SCHEMA.md y docs/features/sensores.md

create table if not exists public.sensor_readings (
  id            uuid primary key default gen_random_uuid(),
  device_id     text        not null default 'esp32-01',
  soil_moisture numeric(5,2) not null check (soil_moisture between 0 and 100),
  light_level   numeric(5,2) not null check (light_level   between 0 and 100),
  temperature   numeric(5,2) not null check (temperature   between -20 and 60),
  humidity      numeric(5,2) not null check (humidity      between 0 and 100),
  recorded_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- El dashboard siempre pide "la última lectura" y los gráficos piden
-- "las lecturas desde X", ambos ordenados por recorded_at descendente.
create index if not exists sensor_readings_recorded_at_idx
  on public.sensor_readings (recorded_at desc);

-- RLS activado SIN políticas: la app no usa Supabase Auth (ADR-002), así que
-- no hay auth.uid() con el que discriminar. Sin políticas, la anon key (que es
-- pública por diseño) no puede leer ni escribir nada. Todo el acceso pasa por
-- route handlers server-side con SUPABASE_SERVICE_ROLE_KEY, que bypassa RLS.
-- La autorización real vive en la capa de API. Ver docs/03-security.md.
alter table public.sensor_readings enable row level security;
