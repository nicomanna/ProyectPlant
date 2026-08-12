'use client'

import { useCallback, useEffect, useState } from 'react'
import { SENSOR_POLL_INTERVAL_MS } from '@/constants/sensors'
import type { SensorLatestResponse, SensorReading } from '@/types/sensor.types'

interface UseSensorDataResult {
  reading: SensorReading | null
  health: number
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useSensorData(): UseSensorDataResult {
  const [reading, setReading] = useState<SensorReading | null>(null)
  const [health, setHealth] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLatest = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/sensors/latest', { signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data: SensorLatestResponse = await response.json()
      setReading(data.reading)
      setHealth(data.health)
      setError(null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('No se pudieron cargar los datos de la planta')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    // La primera carga se encola como microtarea en vez de llamarse en el
    // cuerpo del efecto: así las actualizaciones de estado quedan siempre en
    // una continuación (igual que las del intervalo) y no en el render del
    // efecto. Regla `react-hooks/set-state-in-effect`.
    queueMicrotask(() => fetchLatest(controller.signal))

    const interval = setInterval(() => fetchLatest(), SENSOR_POLL_INTERVAL_MS)

    return () => {
      controller.abort()
      clearInterval(interval)
    }
  }, [fetchLatest])

  const refresh = useCallback(() => {
    fetchLatest()
  }, [fetchLatest])

  return { reading, health, isLoading, error, refresh }
}
