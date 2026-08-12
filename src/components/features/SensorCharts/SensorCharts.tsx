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
          className="flex gap-1 rounded-xl bg-white/10 p-1"
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
                  ? 'bg-emerald-500 text-emerald-950'
                  : 'text-white/60 hover:bg-white/10'
              }`}
            >
              {HISTORY_RANGES[key].label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowTable((current) => !current)}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/15"
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
        <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      {isLoading && !error && (
        <div className="grid gap-3 sm:grid-cols-2">
          {SENSOR_METRICS.map((metric) => (
            <div key={metric} className="glass h-40 animate-pulse rounded-2xl" />
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
