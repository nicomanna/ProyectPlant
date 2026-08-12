'use client'

import { Droplets, Sun, Thermometer, Wind } from 'lucide-react'
import { METRIC_LABELS, METRIC_UNITS, SENSOR_METRICS, type SensorMetric } from '@/constants/sensors'
import { ORB_CONFIGS, type OrbPosition } from '@/constants/orbs'
import { computeMetricHealth, isMetricOptimal } from '@/lib/plantHealth'
import { orbColorFor, orbRingProgress } from '@/lib/orbColor'
import { MetricOrb } from './MetricOrb'
import type { SensorPanelProps } from './SensorPanel.types'

const METRIC_ICONS = {
  soil_moisture: Droplets,
  light_level: Sun,
  temperature: Thermometer,
  humidity: Wind,
} as const satisfies Record<SensorMetric, typeof Droplets>

const POSITION_CLASS: Record<OrbPosition, string> = {
  top: 'left-1/2 top-[14%] -translate-x-1/2',
  right: 'right-[7%] top-1/2 -translate-y-1/2',
  bottom: 'left-1/2 bottom-[13%] -translate-x-1/2',
  left: 'left-[7%] top-1/2 -translate-y-1/2',
}

const SIZE_CLASS = 'h-[22vw] max-h-24 min-h-16 w-[22vw] max-w-24 min-w-16 sm:h-24 sm:w-24 md:h-28 md:w-28'

export function SensorPanel({ reading, isLoading, className = '' }: SensorPanelProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {SENSOR_METRICS.map((metric) => {
          const { position, accent } = ORB_CONFIGS[metric]
          return (
            <div
              key={metric}
              className={`orb-body absolute h-[22vw] max-h-24 min-h-16 w-[22vw] max-w-24 min-w-16 animate-pulse rounded-full sm:h-24 sm:w-24 md:h-28 md:w-28 ${POSITION_CLASS[position]}`}
              style={{ ['--orb-glow' as string]: accent }}
            />
          )
        })}
      </div>
    )
  }

  if (!reading) {
    return (
      <div className={`pointer-events-none flex items-center justify-center ${className}`}>
        <p className="glass rounded-full px-5 py-3 text-sm text-white/70">
          Todavía no hay lecturas del sensor
        </p>
      </div>
    )
  }

  return (
    <div className={`pointer-events-none ${className}`}>
      {SENSOR_METRICS.map((metric) => {
        const Icon = METRIC_ICONS[metric]
        const { position, accent } = ORB_CONFIGS[metric]
        const value = reading[metric]
        const health = computeMetricHealth(metric, value)
        const optimal = isMetricOptimal(metric, value)

        return (
          <MetricOrb
            key={metric}
            label={METRIC_LABELS[metric]}
            value={value}
            unit={METRIC_UNITS[metric]}
            icon={Icon}
            ringProgress={orbRingProgress(metric, value)}
            glow={orbColorFor(metric, health)}
            accent={accent}
            optimal={optimal}
            positionClass={POSITION_CLASS[position]}
            sizeClass={SIZE_CLASS}
          />
        )
      })}
    </div>
  )
}