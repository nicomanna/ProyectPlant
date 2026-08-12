'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PointsResponse } from '@/types/points.types'

interface UsePointsResult {
  points: PointsResponse | null
  isLoading: boolean
  error: string | null
  isClaiming: boolean
  claim: () => Promise<boolean>
  refresh: () => void
}

export function usePoints(): UsePointsResult {
  const [points, setPoints] = useState<PointsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)

  const fetchPoints = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/points', { signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      setPoints(await response.json())
      setError(null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('No se pudieron cargar los puntos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    // Encolada como microtarea para que los setState queden en una
    // continuación y no en el cuerpo del efecto (`set-state-in-effect`).
    queueMicrotask(() => fetchPoints(controller.signal))
    return () => controller.abort()
  }, [fetchPoints])

  // Devuelve true si el premio se reclamó recién (para disparar el confeti).
  const claim = useCallback(async (): Promise<boolean> => {
    setIsClaiming(true)
    try {
      const response = await fetch('/api/points/claim', { method: 'POST' })
      if (!response.ok) {
        setError('No se pudo reclamar el premio')
        return false
      }

      await fetchPoints()
      return true
    } catch {
      setError('No se pudo reclamar el premio')
      return false
    } finally {
      setIsClaiming(false)
    }
  }, [fetchPoints])

  const refresh = useCallback(() => {
    fetchPoints()
  }, [fetchPoints])

  return { points, isLoading, error, isClaiming, claim, refresh }
}
