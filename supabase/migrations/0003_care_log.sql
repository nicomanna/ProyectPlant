-- Migración 0003 — Visita diaria a la planta (HC-SR04) como 5ta métrica de puntos
-- Ver docs/DB_SCHEMA.md y docs/features/puntos.md

-- Un renglón por día, evento discreto (no serie temporal como sensor_readings):
-- se creó cuando el HC-SR04 detectó "cariño" sostenido. Igual en espíritu a
-- weekly_goals: guarda algo que no se puede derivar de los sensores.
create table if not exists public.care_log (
  id         uuid primary key default gen_random_uuid(),
  day        date not null unique,
  cared_at   timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists care_log_day_idx on public.care_log (day desc);

-- Mismo criterio que las demás tablas: RLS activado sin políticas. Ver docs/03-security.md.
alter table public.care_log enable row level security;

-- Puntaje de la visita diaria dentro del desglose ya existente (máx. 20, todo-o-nada).
alter table public.points_log
  add column if not exists care_points numeric(5,2) not null default 0;
