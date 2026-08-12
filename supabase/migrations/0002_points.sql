-- Migración 0002 — Sistema de puntos y meta semanal
-- Ver docs/DB_SCHEMA.md y docs/features/puntos.md

-- Un renglón por día, con el desglose por métrica. Se recalcula por upsert
-- sobre `day` porque pueden llegar lecturas atrasadas del dispositivo.
create table if not exists public.points_log (
  id              uuid primary key default gen_random_uuid(),
  day             date not null unique,
  soil_points     numeric(5,2) not null default 0,
  light_points    numeric(5,2) not null default 0,
  temp_points     numeric(5,2) not null default 0,
  humidity_points numeric(5,2) not null default 0,
  total_points    numeric(5,2) not null default 0,
  reading_count   integer      not null default 0,
  computed_at     timestamptz  not null default now()
);

create index if not exists points_log_day_idx on public.points_log (day desc);

-- Un renglón por semana (lunes). Guarda lo único que NO se puede derivar de
-- los sensores: si el premio de esa semana ya fue reclamado.
create table if not exists public.weekly_goals (
  id            uuid primary key default gen_random_uuid(),
  week_start    date not null unique,
  target_points integer     not null default 700,
  claimed_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- Mismo criterio que sensor_readings: RLS activado sin políticas. Sin Supabase
-- Auth no hay auth.uid() con el que discriminar; el acceso va por route
-- handlers con service role. Ver docs/03-security.md.
alter table public.points_log   enable row level security;
alter table public.weekly_goals enable row level security;
