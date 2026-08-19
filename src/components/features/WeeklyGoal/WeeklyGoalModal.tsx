'use client'

import {
  AlertCircle,
  CheckCircle2,
  Droplets,
  Heart,
  HelpCircle,
  Sun,
  Thermometer,
  Wind,
  X,
} from 'lucide-react'
import {
  METRIC_LABELS,
  METRIC_UNITS,
  SENSOR_METRICS,
  SENSOR_RANGES,
  type SensorMetric,
} from '@/constants/sensors'
import { CARE_SCORING, POINTS_SCORING } from '@/constants/points'
import { isMetricOptimal } from '@/lib/plantHealth'
import type { DailyPoints } from '@/types/points.types'
import type { WeeklyGoalModalProps } from './WeeklyGoalModal.types'

const METRIC_ICONS = {
  soil_moisture: Droplets,
  light_level: Sun,
  temperature: Thermometer,
  humidity: Wind,
} as const satisfies Record<SensorMetric, typeof Droplets>

const METRIC_POINTS_KEY = {
  soil_moisture: 'soil_points',
  light_level: 'light_points',
  temperature: 'temp_points',
  humidity: 'humidity_points',
} as const satisfies Record<SensorMetric, keyof DailyPoints>

type TaskStatus = 'achieved' | 'pending' | 'unknown'

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'achieved') {
    return <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
  }
  if (status === 'unknown') {
    return <HelpCircle className="h-5 w-5 shrink-0 text-white/30" aria-hidden="true" />
  }
  return <AlertCircle className="h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
}

export function WeeklyGoalModal({ points, reading, onClose }: WeeklyGoalModalProps) {
  const todayPoints = points.days.find((day) => day.day === points.today)
  const carePoints = todayPoints?.care_points ?? 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tareas de la meta semanal"
    >
      {/* Scrim: fondo oscuro semi-transparente detrás del vidrio */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Cerrar tareas"
      />

      <div className="glass relative w-full max-w-md rounded-3xl p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 transition-colors hover:text-white"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Meta semanal
        </p>
        <h2 className="mt-1 text-xl font-bold text-white">Tareas de hoy</h2>
        <p className="mt-1 text-sm text-white/50">
          Cumplí estas 5 tareas para sumar los 100 pts del día.
        </p>

        <ul className="mt-5 space-y-2">
          {SENSOR_METRICS.map((metric) => {
            const Icon = METRIC_ICONS[metric]
            const { optimalMin, optimalMax } = SENSOR_RANGES[metric]
            const { max } = POINTS_SCORING[metric]
            const earned = todayPoints?.[METRIC_POINTS_KEY[metric]] ?? 0
            const status: TaskStatus = !reading
              ? 'unknown'
              : isMetricOptimal(metric, reading[metric])
                ? 'achieved'
                : 'pending'

            return (
              <li
                key={metric}
                className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3"
              >
                <Icon className="h-5 w-5 shrink-0 text-white/60" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{METRIC_LABELS[metric]}</p>
                  <p className="text-xs text-white/50">
                    {optimalMin}–{optimalMax}
                    {METRIC_UNITS[metric]} · {Math.round(earned)}/{max} pts hoy
                  </p>
                </div>
                <StatusIcon status={status} />
              </li>
            )
          })}

          <li className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
            <Heart className="h-5 w-5 shrink-0 text-white/60" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Visitar a la planta</p>
              <p className="text-xs text-white/50">
                1 vez al día · {Math.round(carePoints)}/{CARE_SCORING.max} pts hoy
              </p>
            </div>
            <StatusIcon status={carePoints > 0 ? 'achieved' : 'pending'} />
          </li>
        </ul>
      </div>
    </div>
  )
}
