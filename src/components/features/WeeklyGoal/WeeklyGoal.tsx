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
    return <div className={`glass h-24 animate-pulse rounded-2xl ${className}`} />
  }

  if (!points) return null

  const percent = Math.round(points.progress * 100)

  return (
    <section className={`glass rounded-2xl px-4 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-300" aria-hidden="true" />
          <h2 className="text-sm font-medium text-foreground">Meta semanal</h2>
        </div>
        <p className="text-sm text-white/50">
          <span className="font-semibold text-foreground">{Math.round(points.totalPoints)}</span>
          {' / '}
          {points.targetPoints} pts
        </p>
      </div>

      <div
        className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de la meta semanal"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {points.claimed ? (
        <p className="mt-3 text-center text-sm font-medium text-emerald-300">
          🎉 ¡Premio de esta semana reclamado!
        </p>
      ) : points.goalReached ? (
        <button
          type="button"
          onClick={onClaim}
          disabled={isClaiming}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
        >
          <Gift className="h-4 w-4" aria-hidden="true" />
          {isClaiming ? 'Reclamando...' : '¡Reclamar premio!'}
        </button>
      ) : (
        <p className="mt-2 text-center text-xs text-white/50">
          Faltan {Math.max(0, Math.ceil(points.targetPoints - points.totalPoints))} pts para el premio
        </p>
      )}
    </section>
  )
}