'use client'

import { Gift, Trophy } from 'lucide-react'
import type { WeeklyGoalProps } from './WeeklyGoal.types'

export function WeeklyGoal({
  points,
  isLoading,
  isClaiming,
  onClaim,
  className = '',
}: WeeklyGoalProps) {
  if (isLoading) {
    return <div className={`h-24 animate-pulse rounded-2xl bg-green-100 ${className}`} />
  }

  if (!points) return null

  const percent = Math.round(points.progress * 100)

  return (
    <section className={`rounded-2xl bg-white/70 px-4 py-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-green-600" aria-hidden="true" />
          <h2 className="text-sm font-medium text-gray-700">Meta semanal</h2>
        </div>
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{Math.round(points.totalPoints)}</span>
          {' / '}
          {points.targetPoints} pts
        </p>
      </div>

      <div
        className="mt-3 h-3 w-full overflow-hidden rounded-full bg-green-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de la meta semanal"
      >
        <div
          className="h-full rounded-full bg-green-500 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {points.claimed ? (
        <p className="mt-3 text-center text-sm font-medium text-green-700">
          🎉 ¡Premio de esta semana reclamado!
        </p>
      ) : points.goalReached ? (
        <button
          type="button"
          onClick={onClaim}
          disabled={isClaiming}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
        >
          <Gift className="h-4 w-4" aria-hidden="true" />
          {isClaiming ? 'Reclamando...' : '¡Reclamar premio!'}
        </button>
      ) : (
        <p className="mt-2 text-center text-xs text-gray-500">
          Faltan {Math.max(0, Math.ceil(points.targetPoints - points.totalPoints))} pts para el premio
        </p>
      )}
    </section>
  )
}
