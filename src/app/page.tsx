'use client'

import { Plant3DViewer } from '@/components/features/PlantAvatar'
import { SensorCharts } from '@/components/features/SensorCharts'
import { SensorPanel } from '@/components/features/SensorPanel'
import { WeeklyGoal } from '@/components/features/WeeklyGoal'
import { useCallback } from 'react'
import { useSensorData } from '@/hooks/useSensorData'
import { usePoints } from '@/hooks/usePoints'
import { useCelebration } from '@/hooks/useCelebration'
import { fireCelebration } from '@/lib/confetti'

export default function DashboardPage() {
  const { reading, health, isLoading: sensorsLoading, error: sensorsError } = useSensorData()
  const { points, isLoading: pointsLoading, isClaiming, claim } = usePoints()

  // Festeja el cruce de los 700 pts con el dashboard abierto.
  useCelebration(points?.goalReached)

  const handleClaim = useCallback(async () => {
    // El confeti va después de que el servidor confirmó el reclamo, nunca antes.
    if (await claim()) await fireCelebration('claim')
  }, [claim])

  return (
    <main className="flex min-h-screen flex-col items-center gap-1 bg-green-50 px-4 py-8">
      <h1 className="text-lg font-semibold text-gray-900">Plant Tamagotchi</h1>
      <p className="text-sm text-gray-500">Arrastrá para girar la planta</p>

      <Plant3DViewer health={health} className="mt-2 h-[40vh] w-full max-w-md" />

      {sensorsError && (
        <p className="mt-2 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-700">
          {sensorsError}
        </p>
      )}

      <WeeklyGoal
        points={points}
        isLoading={pointsLoading}
        isClaiming={isClaiming}
        onClaim={handleClaim}
        className="mt-4 w-full max-w-md"
      />

      <SensorPanel reading={reading} isLoading={sensorsLoading} className="mt-3 w-full max-w-md" />

      <SensorCharts className="mt-6 w-full max-w-md" />
    </main>
  )
}
