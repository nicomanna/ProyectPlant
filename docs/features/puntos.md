# Feature: Sistema de puntos + meta semanal

> **Estado:** Completo
> **Archivos clave:** `supabase/migrations/0002_points.sql`, `src/app/api/points/**`, `src/services/points.service.ts`, `src/lib/points.ts`
> **Dependencias:** ninguna nueva

---

## Descripción
Convierte el cuidado de la planta en un juego: cada día se otorgan puntos según cuánto tiempo estuvo la planta en condiciones óptimas, con una meta de **700 puntos por semana** que, al alcanzarse, habilita el premio.

## Objetivo
Darle el bucle de recompensa del Tamagotchi: cuidar la planta suma, descuidarla no, y la semana tiene un objetivo claro y alcanzable.

## Esquema de puntaje

**100 puntos por día × 7 días = 700 puntos por semana.** Alcanzar la meta exige cuidado sostenido, no un día perfecto aislado.

Cada día se evalúan todas las lecturas de ese día y se mide **qué fracción del tiempo estuvo cada métrica dentro de su rango óptimo** (los rangos viven en `src/constants/sensors.ts`, compartidos con la feature `sensores`):

| Métrica | Puntos máx. | Umbral para el puntaje completo |
|---------|-------------|--------------------------------|
| Humedad del sustrato | 50 | ≥ 80 % de las lecturas del día en rango |
| Luz | 25 | ≥ 60 % de las lecturas del día en rango |
| Temperatura | 15 | ≥ 70 % de las lecturas del día en rango |
| Humedad ambiente | 10 | ≥ 70 % de las lecturas del día en rango |
| **Total** | **100** | |

El puntaje de cada métrica es **proporcional** hasta su umbral, no todo-o-nada: si la humedad del sustrato estuvo en rango el 40 % del día y el umbral es 80 %, se lleva `50 × (0.40 / 0.80) = 25` puntos. Pasado el umbral, el puntaje se satura en el máximo. Esto evita que un mal día valga cero y desmotive.

**Por qué esos pesos:** la humedad del sustrato vale la mitad del día porque es lo único que la usuaria controla directamente (regar). La luz vale un cuarto porque se controla moviendo la maceta. Temperatura y humedad ambiente pesan poco: dependen del clima, no del cuidado.

**Días sin lecturas** dan 0 puntos — sin datos no hay evidencia de cuidado.

## Modelo de Datos
Dos tablas nuevas (detalle en `docs/DB_SCHEMA.md`):

### `points_log`
Una fila por día, con el desglose por métrica. Se recalcula (upsert por `day`) cada vez que se piden los puntos, porque pueden llegar lecturas atrasadas del dispositivo.

### `weekly_goals`
Una fila por semana. Guarda si el premio de esa semana ya fue reclamado (`claimed_at`), que es lo único que **no** se puede derivar de los sensores.

Las semanas arrancan el **lunes** (convención local).

## Flujo de Uso
1. El dashboard llama a `GET /api/points`.
2. El endpoint recalcula los puntos de cada día de la semana actual a partir de `sensor_readings`, los persiste en `points_log`, y suma el total.
3. Devuelve el total, el desglose por día, el progreso hacia 700, y si la meta ya se alcanzó y/o se reclamó.
4. Al alcanzar 700 pts, el dashboard habilita el botón de premio → `POST /api/points/claim` marca la semana como reclamada y dispara el confeti (feature `confeti`).

## Componentes / Archivos
| Archivo | Responsabilidad |
|---------|----------------|
| `supabase/migrations/0002_points.sql` | Tablas `points_log` y `weekly_goals` + RLS |
| `src/constants/points.ts` | Meta semanal, pesos y umbrales por métrica |
| `src/types/points.types.ts` | Tipos de puntos y respuestas de API |
| `src/lib/points.ts` | Lógica pura: lecturas de un día → puntaje; utilidades de semana (lunes) |
| `src/services/points.service.ts` | Persistencia de `points_log` y `weekly_goals` |
| `src/app/api/points/route.ts` | `GET` — recalcula y devuelve el progreso semanal |
| `src/app/api/points/claim/route.ts` | `POST` — marca la meta semanal como reclamada |
| `src/hooks/usePoints.ts` | Hook cliente del dashboard |
| `src/components/features/WeeklyGoal/**` | Barra de progreso + botón de premio |

## API / Endpoints
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/points` | Cookie de sesión | Progreso semanal y desglose por día |
| POST | `/api/points/claim` | Cookie de sesión | Reclama el premio de la semana actual |

## Restricciones
- Los puntos **se derivan** de `sensor_readings`, no se otorgan por acciones manuales: no hay forma de sumar puntos sin que la planta haya estado efectivamente bien.
- `POST /api/points/claim` es idempotente y valida que la meta esté realmente alcanzada en el servidor — no alcanza con que el cliente diga que sí.
- La lógica de puntaje vive en `src/lib/points.ts` como funciones puras, separada del acceso a datos, para poder razonarla y testearla sin DB.

## Pendiente
- [ ] Aplicar la migración `0002` en Supabase (junto con la `0001`)
