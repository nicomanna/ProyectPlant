# Feature: Sistema de puntos + meta semanal

> **Estado:** Completo — ⚠️ requiere aplicar la migración `0003` en Supabase
> **Archivos clave:** `supabase/migrations/0002_points.sql`, `supabase/migrations/0003_care_log.sql`, `src/app/api/points/**`, `src/app/api/sensors/care/route.ts`, `src/services/points.service.ts`, `src/services/care.service.ts`, `src/lib/points.ts`
> **Dependencias:** ninguna nueva

---

## Descripción
Convierte el cuidado de la planta en un juego: cada día se otorgan puntos según cuánto tiempo estuvo la planta en condiciones óptimas, con una meta de **700 puntos por semana** que, al alcanzarse, habilita el premio.

## Objetivo
Darle el bucle de recompensa del Tamagotchi: cuidar la planta suma, descuidarla no, y la semana tiene un objetivo claro y alcanzable.

## Esquema de puntaje

**100 puntos por día × 7 días = 700 puntos por semana.** Alcanzar la meta exige cuidado sostenido, no un día perfecto aislado.

Cada día se evalúan todas las lecturas de ese día y se mide **qué fracción del tiempo estuvo cada métrica dentro de su rango óptimo** (los rangos viven en `src/constants/sensors.ts`, compartidos con la feature `sensores`), más si hubo una **visita diaria** a la planta detectada por el sensor ultrasónico (HC-SR04):

| Métrica | Puntos máx. | Umbral para el puntaje completo |
|---------|-------------|--------------------------------|
| Humedad del sustrato | 40 | ≥ 80 % de las lecturas del día en rango |
| Luz | 20 | ≥ 60 % de las lecturas del día en rango |
| Visita diaria a la planta | 20 | todo-o-nada: al menos una visita detectada ese día |
| Temperatura | 12 | ≥ 70 % de las lecturas del día en rango |
| Humedad ambiente | 8 | ≥ 70 % de las lecturas del día en rango |
| **Total** | **100** | |

El puntaje de las 4 métricas ambientales es **proporcional** hasta su umbral, no todo-o-nada: si la humedad del sustrato estuvo en rango el 40 % del día y el umbral es 80 %, se lleva `40 × (0.40 / 0.80) = 20` puntos. Pasado el umbral, el puntaje se satura en el máximo. Esto evita que un mal día valga cero y desmotive.

La **visita diaria** funciona distinto: es un evento (alguien se quedó cerca de la planta ≥3s), no algo medible en fracción de tiempo, así que su puntaje es **todo-o-nada** — 20 pts si el HC-SR04 detectó al menos una visita ese día, 0 si no. Ver `src/constants/points.ts` (`CARE_SCORING`) y `src/lib/points.ts` (`computeDailyPoints`).

**Por qué esos pesos:** los 4 pesos ambientales que ya existían se escalaron ×0.8 (preservando sus proporciones relativas entre sí) para liberar los 20 pts de la visita. La humedad del sustrato sigue siendo, con claridad, la métrica que más pesa — el doble que la visita — porque sigue siendo lo único que la usuaria controla directamente regando. La visita queda empatada con la luz: ambas son acciones deliberadas que la usuaria controla directamente, pero un gesto puntual de unos segundos no compite con un cuidado sostenido durante todo el día como regar. Temperatura y humedad ambiente siguen pesando poco: dependen del clima, no del cuidado.

**Días sin lecturas** dan 0 puntos en las métricas ambientales — sin datos no hay evidencia de cuidado. Lo mismo con la visita: sin evento registrado ese día en `care_log`, 0 pts en esa métrica.

## Modelo de Datos
Tres tablas (detalle en `docs/DB_SCHEMA.md`):

### `points_log`
Una fila por día, con el desglose por métrica (incluida la visita). Se recalcula (upsert por `day`) cada vez que se piden los puntos, porque pueden llegar lecturas o visitas atrasadas del dispositivo.

### `weekly_goals`
Una fila por semana. Guarda si el premio de esa semana ya fue reclamado (`claimed_at`), que es lo único que **no** se puede derivar de los sensores.

### `care_log`
Una fila por día en que el HC-SR04 detectó una visita ("cariño"). A diferencia de `sensor_readings`, es un **evento discreto** (no una serie de mediciones periódicas): se crea cuando `POST /api/sensors/care` recibe el aviso del firmware tras ≥3s de cercanía sostenida. El upsert por `day` lo hace idempotente ante reintentos.

Las semanas arrancan el **lunes** (convención local).

## Flujo de Uso
1. El dashboard llama a `GET /api/points`.
2. El endpoint recalcula los puntos de cada día de la semana actual a partir de `sensor_readings`, los persiste en `points_log`, y suma el total.
3. Devuelve el total, el desglose por día, el progreso hacia 700, y si la meta ya se alcanzó y/o se reclamó.
4. Al alcanzar 700 pts, el dashboard habilita el botón de premio → `POST /api/points/claim` marca la semana como reclamada y dispara el confeti (feature `confeti`).

## Premios semanales (weekly_goals)

Cada semana que alcanza los 700 pts desbloquea un **premio**, configurado en `src/constants/prizes.ts`. El premio que corresponde se elige por el número de semana calculado en `src/lib/prizes.ts` (`getWeekNumber`) a partir de `PRIZES_WEEK_1_START` (la semana calendario que contiene `2026-08-10` es la semana 1):

| Semana | Premio | Tipo |
|--------|--------|------|
| 1 | "Nuestra Planta, Nuestro Espacio ❤️" | carta |
| 2 | "🎟️ Vale por una Merienda Juntos" | vale |
| 3 | "🎟️ Vale por una Salida al Cine" | vale |
| 4 | "🎟️ Vale del 100% en Kobac Delivery" | vale |
| ≥5 | `DEFAULT_PRIZE` ("🎟️ Vale por un Premio Sorpresa") | vale |

**Si no hay más semanas definidas** (más allá de la semana 4), se usa `DEFAULT_PRIZE` en vez de romper o dejar sin premio: el ciclo repite el vale por defecto.

### Flujo de reclamo con el Dashboard
El botón "¡Ver mi premio!" del panel `WeeklyGoal` se habilitaba al alcanzar los 700 pts. Ahora al tocarlo **ya no reclama directo**: abre un **modal Glassmorphism** (`PrizeModal`) que muestra la carta o el vale correspondiente a la semana:

1. El `GET /api/points` devuelve ahora `weekNumber` y `prize` (el objeto `WeeklyPrize` resuelto).
2. El dashboard abre el modal con el premio de la semana.
3. El botón **"Marcar como Canjeado"** del modal llama a `POST /api/points/claim`, que persiste `claimed_at` en `weekly_goals` (idempotente, filtrado por `claimed_at is null`).
4. Al confirmar el reclamo -> confeti de `claim` y el modal se cierra; `WeeklyGoal` pasa a mostrar "🎉 ¡Premio de esta semana reclamado!".

La lógica de "¿ya se reclamó?" sigue viviendo en el servidor (`weekly_goals.claimed_at`), no en el cliente. El modal es visual/presentación: solo muestra el premio y dispara el reclamo.

### Componentes / Archivos (premios)
| Archivo | Responsabilidad |
|---------|----------------|
| `src/constants/prizes.ts` | Lista `WEEKLY_PRIZES`, `DEFAULT_PRIZE`, `PRIZES_WEEK_1_START`, tipos `WeeklyPrize`/`PrizeType` |
| `src/lib/prizes.ts` | `getWeekNumber(weekStart)` y `getPrizeForWeek(weekStart)` (funciones puras) |
| `src/components/features/PrizeModal/**` | Modal Glassmorphism de la carta/vale + botón "Marcar como Canjeado" |
| `src/app/api/points/route.ts` | GET incluye `weekNumber` y `prize` |
| `src/app/api/points/claim/route.ts` | Claim devuelve `weekNumber` y `prize` |
| `src/components/features/WeeklyGoal/**` | El botón "¡Ver mi premio!" abre el modal |
| `src/app/page.tsx` | Estado del modal y encadenamiento reclamo → confeti |

## Checklist de tareas (`WeeklyGoalModal`)

Tocar el header del panel `WeeklyGoal` abre un modal glassmorphism (mismo patrón visual que `PrizeModal`) con las 5 tareas del día en curso, en **tiempo real**:

1. **Las 4 métricas ambientales:** el estado ("cumplida"/"pendiente") sale de si la **última lectura** (`useSensorData()`) está dentro del rango óptimo (`isMetricOptimal`, `src/lib/plantHealth.ts`) — es el dato accionable de "¿está bien ahora mismo?". Como contexto se muestran también los puntos ya ganados hoy de esa métrica, leídos de `points.days` filtrado por `points.today`. Si todavía no llegó ninguna lectura (`reading === null`), la fila muestra "sin datos" en vez de un falso "pendiente".
2. **La visita diaria:** el estado sale directo de `care_points > 0` en el día de hoy — ya es todo-o-nada, no hace falta un campo booleano aparte.

`GET /api/points` expone `today` (el día actual, `YYYY-MM-DD`, calculado en el servidor) para que el modal sepa qué fila de `days` corresponde a "hoy" sin depender del timezone del browser.

**Disparador:** el header del panel `WeeklyGoal` (ícono + título + contador de puntos) es un `<button onClick={onOpenDetail}>`; la barra de progreso y el botón de premio quedan fuera de ese botón.

## Componentes / Archivos
| Archivo | Responsabilidad |
|---------|----------------|
| `supabase/migrations/0002_points.sql` | Tablas `points_log` y `weekly_goals` + RLS |
| `supabase/migrations/0003_care_log.sql` | Tabla `care_log` + columna `care_points` en `points_log` + RLS |
| `src/constants/points.ts` | Meta semanal, pesos y umbrales por métrica, `CARE_SCORING` |
| `src/types/points.types.ts` | Tipos de puntos y respuestas de API |
| `src/types/care.types.ts` | Tipos del evento de visita diaria |
| `src/lib/points.ts` | Lógica pura: lecturas + visita de un día → puntaje; utilidades de semana (lunes) |
| `src/services/points.service.ts` | Persistencia de `points_log` y `weekly_goals` |
| `src/services/care.service.ts` | Persistencia y lectura de `care_log` (idempotente por día) |
| `src/app/api/points/route.ts` | `GET` — recalcula y devuelve el progreso semanal |
| `src/app/api/points/claim/route.ts` | `POST` — marca la meta semanal como reclamada |
| `src/app/api/sensors/care/route.ts` | `POST` — el ESP32 reporta la visita diaria |
| `src/hooks/usePoints.ts` | Hook cliente del dashboard |
| `src/components/features/WeeklyGoal/WeeklyGoal.tsx` | Barra de progreso + botón de premio + disparador del checklist |
| `src/components/features/WeeklyGoal/WeeklyGoalModal.tsx` | Modal glassmorphism con el checklist de las 5 tareas del día |

## API / Endpoints
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/points` | Cookie de sesión | Progreso semanal y desglose por día |
| POST | `/api/points/claim` | Cookie de sesión | Reclama el premio de la semana actual |
| POST | `/api/sensors/care` | `ESP32_INGEST_SECRET` | Registra la visita diaria (idempotente por día) |

## Restricciones
- Los puntos **se derivan** de `sensor_readings`, no se otorgan por acciones manuales: no hay forma de sumar puntos sin que la planta haya estado efectivamente bien.
- `POST /api/points/claim` es idempotente y valida que la meta esté realmente alcanzada en el servidor — no alcanza con que el cliente diga que sí.
- La lógica de puntaje vive en `src/lib/points.ts` como funciones puras, separada del acceso a datos, para poder razonarla y testearla sin DB.

## Pendiente
- [ ] Aplicar la migración `0002` en Supabase (junto con la `0001`)
- [ ] Aplicar la migración `0003` en Supabase (tabla `care_log` + columna `care_points`) — sin esto, `GET /api/points` falla con 500
