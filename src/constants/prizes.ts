// Lista de premios semanales del sistema de puntos (weekly_goals).
//
// El premio que corresponde a una semana se elige por el número de semana
// (1..N) calculado en `src/lib/prizes.ts` a partir de `PRIZES_WEEK_1_START`.
// Si se supera la cantidad de premios definidos, se repite el último
// (DEFAULT_PRIZE) en vez de romper.

export type PrizeType = 'carta' | 'vale'

export interface WeeklyPrize {
  title: string
  type: PrizeType
  message: string
}

// Semana calendario (lunes) en la que arranca el ciclo de premios.
// En este formato YYYY-MM-DD. La semana 1 es la que contiene esta fecha.
export const PRIZES_WEEK_1_START = '2026-08-10'

export const WEEKLY_PRIZES: WeeklyPrize[] = [
  {
    title: 'Nuestra Planta, Nuestro Espacio ❤️',
    type: 'carta',
    message:
      '¡Felicidades mi amor! Cuidaste tu planta como cuidamos nuestro amor todos los días. Tu primer premio no se vence ni se canjea: es saber cuánto te amo y agradezco tenerte en mi vida. Gracias por hacer mi mundo más lindo.',
  },
  {
    title: '🎟️ Vale por una Merienda Juntos',
    type: 'vale',
    message:
      '¡Te ganaste una merienda! Elegimos esa cafetería rica que querías probar (o armamos una súper merienda en casa) con café y cositas ricas para disfrutar sin apuros.',
  },
  {
    title: '🎟️ Vale por una Salida al Cine',
    type: 'vale',
    message:
      '¡Premios acumulados! Vale por una salida al cine a ver la película que tú elijas, con pochoclos y bebida incluidos.',
  },
  {
    title: '🎟️ Vale del 100% en Kobac Delivery',
    type: 'vale',
    message:
      '¡Completaste tu primer mes perfecto de cuidados! Te ganaste un pedido 100% gratis en Kobac Delivery para cenar lo que más te guste.',
  },
]

// Vale por defecto: se usa cuando ya se superó la semana 4 (repite el ciclo)
// o ante cualquier semana indefinida, para que nunca quede sin premio.
export const DEFAULT_PRIZE: WeeklyPrize = {
  title: '🎟️ Vale por un Premio Sorpresa',
  type: 'vale',
  message:
    '¡Seguís sumando premios y cuidados! Te ganaste una sorpresa: vale por elegir tu próximo mimo, por definir juntos. Gracias por seguir cuidando nuestra plantita.',
}