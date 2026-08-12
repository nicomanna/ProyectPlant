import type { SensorMetric } from './sensors'

// Configuración visual de los orbes del dashboard glassmorphic.
// La clave de posición equivale a un hueco del layout orbital de la página:
// la planta queda al centro y cada métrica orbita alrededor.

export type OrbPosition = 'top' | 'right' | 'bottom' | 'left'

export interface OrbConfig {
  accent: string
  position: OrbPosition
}

export const ORB_CONFIGS = {
  soil_moisture: { accent: '#38bdf8', position: 'top' },
  light_level: { accent: '#fbbf24', position: 'right' },
  humidity: { accent: '#2dd4bf', position: 'left' },
  temperature: { accent: '#fb923c', position: 'bottom' },
} as const satisfies Record<SensorMetric, OrbConfig>