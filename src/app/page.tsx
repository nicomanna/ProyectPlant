'use client'

import { Plant3DViewer } from '@/components/features/PlantAvatar'
import { ConfettiPreview } from '@/components/features/ConfettiPreview'
import { PrizeModal } from '@/components/features/PrizeModal'
import { SensorCharts } from '@/components/features/SensorCharts'
import { SensorPanel } from '@/components/features/SensorPanel'
import { WeeklyGoal, WeeklyGoalModal } from '@/components/features/WeeklyGoal'
import { useCallback, useState } from 'react'
import { useSensorData } from '@/hooks/useSensorData'
import { usePoints } from '@/hooks/usePoints'
import { useCelebration } from '@/hooks/useCelebration'
import { fireCelebration } from '@/lib/confetti'

export default function DashboardPage() {
  const { reading, health, isLoading: sensorsLoading, error: sensorsError } = useSensorData()
  const { points, isLoading: pointsLoading, isClaiming, claim } = usePoints()
  const [isPrizeOpen, setIsPrizeOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Festeja el cruce de los 700 pts con el dashboard abierto.
  useCelebration(points?.goalReached)

  const handleOpenPrize = useCallback(() => setIsPrizeOpen(true), [])
  const handleClosePrize = useCallback(() => setIsPrizeOpen(false), [])
  const handleOpenDetail = useCallback(() => setIsDetailOpen(true), [])
  const handleCloseDetail = useCallback(() => setIsDetailOpen(false), [])

  const handleClaim = useCallback(async () => {
    // El confeti va después de que el servidor confirmó el reclamo, nunca antes.
    if (await claim()) {
      setIsPrizeOpen(false)
      await fireCelebration('claim')
    }
  }, [claim])

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      {/* Preview de debug del confeti: /?preview=claim o /?preview=reach */}
      <ConfettiPreview />

      {/* Neblina volumétrica de fondo */}
      <div className="fog pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Escena inmersiva: la planta es el foco, los orbes orbitan alrededor */}
      <section className="relative z-10 flex flex-col items-center">
        <div className="mt-4 flex w-full items-center justify-between px-5">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Plant Tamagotchi</h1>
            <p className="text-sm text-white/50">Arrastrá para girar la planta</p>
          </div>
          <WeeklyGoal
            points={points}
            isLoading={pointsLoading}
            isClaiming={isClaiming}
            onOpenPrize={handleOpenPrize}
            onOpenDetail={handleOpenDetail}
            className="w-64"
          />
        </div>
      </section>

      {/* Modal de premio semanal (glassmorphism) */}
      {isPrizeOpen && points && (
        <PrizeModal
          prize={points.prize}
          weekNumber={points.weekNumber}
          isClaiming={isClaiming}
          onClaim={handleClaim}
          onClose={handleClosePrize}
        />
      )}

      {/* Modal de tareas de la meta semanal (glassmorphism) */}
      {isDetailOpen && points && (
        <WeeklyGoalModal points={points} reading={reading} onClose={handleCloseDetail} />
      )}

      {/* Stage de la planta + orbes ornamentales */}
      <section className="relative z-10 min-h-[62vh] flex-1">
        <Plant3DViewer
          health={health}
          className="absolute inset-0 h-full w-full"
        />
        <SensorPanel
          reading={reading}
          isLoading={sensorsLoading}
          className="absolute inset-0"
        />
      </section>

      {sensorsError && (
        <p className="relative z-10 mx-5 mb-2 rounded-xl bg-red-500/15 px-4 py-2 text-center text-sm text-red-300">
          {sensorsError}
        </p>
      )}

      {/* Gráficos históricos al pie, fuera del pliegue inmersivo */}
      <SensorCharts className="relative z-10 mx-5 mb-6 w-[calc(100%-2.5rem)] max-w-5xl self-center" />
    </main>
  )
}