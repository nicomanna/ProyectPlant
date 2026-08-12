'use client'

import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_HISTORY_RANGE, type HistoryRange } from '@/constants/charts'
import type { SensorHistoryResponse } from '@/types/history.types'

interface UseSensorHistoryResult {
  history: SensorHistoryResponse | null
  range: HistoryRange
  setRange: (range: HistoryRange) => void
  /** true mientras se re-piden datos teniendo ya un render previo en pantalla. */
  isRefreshing: boolean
  isLoading: boolean
  error: string | null
}

export function useSensorHistory(): UseSensorHistoryResult {
  const [range, setRange] = useState<HistoryRange>(DEFAULT_HISTORY_RANGE)
  const [history, setHistory] = useState<SensorHistoryResponse | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async (target: HistoryRange, signal: AbortSignal) => {
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/sensors/history?range=${target}`, { signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      setHistory(await response.json())
      setError(null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('No se pudo cargar el histórico')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    // Encolada como microtarea para que los setState queden en una
    // continuación y no en el cuerpo del efecto (`set-state-in-effect`).
    queueMicrotask(() => fetchHistory(range, controller.signal))
    return () => controller.abort()
  }, [fetchHistory, range])

  return {
    history,
    range,
    setRange,
    isRefreshing,
    // Solo es "carga" la primera vez: al cambiar de rango ya hay algo en
    // pantalla y se mantiene atenuado en vez de mostrar un skeleton.
    isLoading: isRefreshing && history === null,
    error,
  }
}
