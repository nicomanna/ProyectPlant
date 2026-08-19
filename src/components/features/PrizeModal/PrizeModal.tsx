'use client'

import { Heart, PackageCheck, Ticket, X } from 'lucide-react'
import type { PrizeModalProps } from './PrizeModal.types'

const DESC = {
  carta: 'Una carta para vos. Este premio no se vence ni se canjea.',
  vale: 'Un vale para canjear cuando quieras.',
} as const

export function PrizeModal({ prize, weekNumber, isClaiming, onClaim, onClose }: PrizeModalProps) {
  const isCarta = prize.type === 'carta'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Premio de la semana ${weekNumber}`}
    >
      {/* Scrim: fondo oscuro semi-transparente detrás del vidrio */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Cerrar premio"
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

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
          {isCarta ? (
            <Heart className="h-8 w-8 text-rose-300" aria-hidden="true" />
          ) : (
            <Ticket className="h-8 w-8 text-amber-300" aria-hidden="true" />
          )}
        </div>

        <p className="mt-4 text-center text-xs font-semibold uppercase tracking-wider text-white/50">
          Premio de la semana {weekNumber}
        </p>
        <h2 className="mt-1 text-center text-xl font-bold text-white">{prize.title}</h2>
        <p className="mt-1 text-center text-xs text-white/50">{DESC[prize.type]}</p>

        <div className="mt-5 rounded-2xl bg-white/5 px-4 py-4">
          <p className="whitespace-pre-line text-center text-sm leading-relaxed text-white/85">
            {prize.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClaim}
          disabled={isClaiming}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
        >
          <PackageCheck className="h-4 w-4" aria-hidden="true" />
          {isClaiming ? 'Marcando...' : 'Marcar como Canjeado'}
        </button>
      </div>
    </div>
  )
}