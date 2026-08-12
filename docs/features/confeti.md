# Feature: Confeti al alcanzar y reclamar el premio

> **Estado:** Completo
> **Archivos clave:** `src/lib/confetti.ts`, `src/constants/confetti.ts`, `src/hooks/useCelebration.ts`
> **Dependencias:** `canvas-confetti` (+ `@types/canvas-confetti`), ya estaban instaladas desde la FASE 1

---

## Descripción
La recompensa visual del bucle Tamagotchi: cuando la semana llega a los 700 puntos y cuando se reclama el premio, la pantalla larga confeti.

## Objetivo
Que llegar a la meta se **sienta** como llegar a la meta. Es un regalo: el momento de la recompensa es la razón de ser de toda la mecánica de puntos.

## Los dos momentos

| Momento | Cuándo | Intensidad |
|---------|--------|-----------|
| **Alcanzar** (`reach`) | `goalReached` pasa de `false` a `true` **con el dashboard abierto** | Ráfaga corta desde el centro |
| **Reclamar** (`claim`) | `POST /api/points/claim` devuelve OK | Ráfaga central + dos cañones laterales durante ~2,5 s |

**Por qué el `reach` solo se dispara en una transición y no al montar:** si se disparara cada vez que se carga la página con la meta ya alcanzada, el confeti aparecería en cada refresh hasta el lunes siguiente y dejaría de ser una celebración para pasar a ser una molestia. El hook guarda el valor anterior y solo festeja el cruce real.

El `claim` sí puede repetirse a pedido, pero de hecho no se repite: una vez reclamada la semana, el botón desaparece (`points.claimed === true`).

## Decisiones técnicas

### Import dinámico
`canvas-confetti` se importa con `await import(...)` dentro de la función, no arriba del módulo. Es una librería puramente de browser que solo se usa en un instante puntual: cargándola bajo demanda no pesa en el bundle inicial del dashboard, que ya arrastra three.js y recharts.

### `prefers-reduced-motion`
Si el sistema pide movimiento reducido, **no se dispara nada**. Una lluvia de partículas a pantalla completa es exactamente el tipo de animación que esa preferencia existe para evitar. El reclamo del premio funciona igual: el confeti es decoración, nunca la confirmación de que algo pasó — eso lo dice el texto "🎉 ¡Premio de esta semana reclamado!" del componente `WeeklyGoal`.

### Nunca bloquea el reclamo
`fireCelebration()` no puede hacer fallar el reclamo: se llama después de que el `POST` respondió OK y sus errores se tragan. Que no cargue una librería de animación no debería impedir que la usuaria cobre su premio.

### Paleta
Verdes de la planta + dorado del premio, definidos en `src/constants/confetti.ts`. No usa la paleta de los gráficos: son cosas distintas — una codifica datos, la otra es decoración.

## Flujo de Uso
1. La usuaria cuida la planta y la semana suma puntos (feature `puntos`).
2. Al cruzar los 700 con el dashboard abierto → ráfaga corta y aparece el botón "¡Reclamar premio!".
3. Toca el botón → `POST /api/points/claim`.
4. Si responde OK → confeti largo y el componente pasa a mostrar el mensaje de premio reclamado.

## Preview de debug (ver el confeti sin 700 pts)

Para poder ver y ajustar la animación sin esperar una semana real de lecturas en rango, se agregó un preview efímero vía query param en la URL del dashboard:

| URL | Qué dispara |
|-----|-------------|
| `/?preview=reach` | Ráfaga corta de cruce de meta (`fireCelebration('reach')`) |
| `/?preview=claim` | Ráfaga central + cañones del reclamo (`fireCelebration('claim')`) |

- Lo hace el componente `ConfettiPreview`, que lee `window.location.search` una sola vez al montar y renderiza `null` (no toca la UI ni el estado de puntos).
- Es **intencionalmente efímero**: al quitar el query de la URL, ya no se dispara. Igual respeta `prefers-reduced-motion` (si el sistema pide movimiento reducido, no sale nada).
- Solo debug/desarrollo: no hay botón visible ni depende de alcanzar los 700 puntos.

## Componentes / Archivos
| Archivo | Responsabilidad |
|---------|----------------|
| `src/constants/confetti.ts` | Colores, duración y forma de cada ráfaga |
| `src/lib/confetti.ts` | `fireCelebration(kind)` — import dinámico, guarda de reduced-motion |
| `src/hooks/useCelebration.ts` | Detecta la transición `false → true` de `goalReached` |
| `src/components/features/ConfettiPreview/**` | Dispara el confeti de debug según `?preview=reach|claim` |
| `src/app/page.tsx` | Encadena `claim()` → `fireCelebration('claim')` + monta `ConfettiPreview` |

## Restricciones
- No agrega tablas, migraciones ni endpoints.
- No es una confirmación: si el confeti no corre (reduced-motion, fallo de carga), la UI igual refleja el estado real.
- La lógica de "¿ya se reclamó?" vive en el servidor (`weekly_goals.claimed_at`), no en el cliente. El confeti solo reacciona a lo que el servidor confirmó.
