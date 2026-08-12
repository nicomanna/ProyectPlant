'use client'

import type { ComponentType } from 'react'

interface MetricOrbProps {
  label: string
  value: number | null
  unit: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  ringProgress: number
  glow: string
  accent: string
  optimal: boolean
  positionClass: string
  sizeClass: string
}

export function MetricOrb({
  label,
  value,
  unit,
  icon: Icon,
  ringProgress,
  glow,
  accent,
  optimal,
  positionClass,
  sizeClass,
}: MetricOrbProps) {
  const radius = 30
  const strokeWidth = 5
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(1, Math.max(0, ringProgress)))

  return (
    <div
      className={`absolute flex items-center justify-center ${positionClass} ${sizeClass}`}
      style={{ ['--orb-glow' as string]: glow }}
    >
      <div className="relative h-full w-full">
        <div className="orb-body absolute inset-0 rounded-full" aria-hidden="true" />

        {/* Anillo de progreso volumétrico dentro del orbe */}
        <svg
          viewBox="0 0 80 80"
          className="absolute inset-0 h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        {/* Contenido del orbe */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
          <Icon className="h-4 w-4 text-white/80" aria-hidden />
          <p className="flex items-baseline tabular-nums">
            <span className="text-[15px] font-bold text-white">
              {value === null ? '—' : value.toFixed(1)}
            </span>
            <span className="ml-0.5 text-[10px] font-medium text-white/60">{unit}</span>
          </p>
          <p
            className={`max-w-full px-1 text-[10px] font-medium leading-tight ${
              optimal ? 'text-emerald-300/90' : 'text-amber-300/90'
            }`}
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}