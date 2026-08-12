'use client'

import { useState } from 'react'
import { BarChart3, Table2 } from 'lucide-react'
import { HISTORY_RANGES, HISTORY_RANGE_KEYS } from '@/constants/charts'
import { SENSOR_METRICS } from '@/constants/sensors'
import { useSensorHistory } from '@/hooks/useSensorHistory'
import { MetricChart } from './MetricChart'
import { HistoryTable } from './HistoryTable'
import type { SensorChartsProps } from './SensorCharts.types'

export function SensorCharts({ className = '' }: SensorChartsProps) {
  const { history, range, setRange, isRefreshing, isLoading, error } = useSensorHistory()
  const [showTable, setShowTable] = useState(false)

  return (
    <section className={className}>
      {/* Una sola fila de filtros para toda la sección: nunca un filtro por
          tarjeta. Cambiar el rango re-renderiza los cuatro gráficos. */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div
          className="flex gap-1 rounded-xl bg-white/70 p-1"
          role="group"
          aria-label="Rango de tiempo"
        >
          {HISTORY_RANGE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              aria-pressed={range === key}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                range === key
                  ? 'bg-green-600 text-white'
                  : 'text-[#52514e] hover:bg-green-100'
              }`}
            >
              {HISTORY_RANGES[key].label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowTable((current) => !current)}
          className="flex items-center gap-1.5 rounded-xl bg-white/70 px-3 py-1.5 text-xs font-medium text-[#52514e] transition-colors hover:bg-green-100"
        >
          {showTable ? (
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {showTable ? 'Ver gráficos' : 'Ver tabla'}
        </button>
      </div>

      {error && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</p>
      )}

      {isLoading && !error && (
        <div className="grid gap-3 sm:grid-cols-2">
          {SENSOR_METRICS.map((metric) => (
            <div key={metric} className="h-40 animate-pulse rounded-2xl bg-green-100" />
          ))}
        </div>
      )}

      {history && !error && (
        // Al cambiar de rango se mantiene el render anterior atenuado en vez de
        // volver al skeleton: sin salto de layout.
        <div className={isRefreshing ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
          {showTable ? (
            <HistoryTable points={history.points} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {SENSOR_METRICS.map((metric) => (
                <MetricChart
                  key={metric}
                  metric={metric}
                  points={history.points}
                  range={history.range}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
