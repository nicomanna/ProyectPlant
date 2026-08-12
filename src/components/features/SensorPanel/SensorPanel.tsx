'use client'

import { Droplets, Sun, Thermometer, Wind } from 'lucide-react'
import { METRIC_LABELS, METRIC_UNITS, SENSOR_METRICS, type SensorMetric } from '@/constants/sensors'
import { isMetricOptimal } from '@/lib/plantHealth'
import type { SensorPanelProps } from './SensorPanel.types'

const METRIC_ICONS = {
  soil_moisture: Droplets,
  light_level: Sun,
  temperature: Thermometer,
  humidity: Wind,
} as const satisfies Record<SensorMetric, typeof Droplets>

export function SensorPanel({ reading, isLoading, className = '' }: SensorPanelProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {SENSOR_METRICS.map((metric) => (
          <div key={metric} className="h-20 animate-pulse rounded-2xl bg-green-100" />
        ))}
      </div>
    )
  }

  if (!reading) {
    return (
      <div className={`rounded-2xl bg-white/70 px-4 py-6 text-center ${className}`}>
        <p className="text-sm text-gray-500">Todavía no hay lecturas del sensor</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {SENSOR_METRICS.map((metric) => {
        const Icon = METRIC_ICONS[metric]
        const value = reading[metric]
        const optimal = isMetricOptimal(metric, value)

        return (
          <div key={metric} className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon
                className={`h-4 w-4 ${optimal ? 'text-green-600' : 'text-amber-600'}`}
                aria-hidden="true"
              />
              <span className="text-xs text-gray-500">{METRIC_LABELS[metric]}</span>
            </div>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {value.toFixed(1)}
              <span className="ml-0.5 text-sm font-normal text-gray-500">
                {METRIC_UNITS[metric]}
              </span>
            </p>
            <p className={`text-xs ${optimal ? 'text-green-600' : 'text-amber-600'}`}>
              {optimal ? 'En rango' : 'Fuera de rango'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
