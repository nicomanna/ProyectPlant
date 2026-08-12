'use client'

import { METRIC_LABELS, METRIC_UNITS, SENSOR_METRICS } from '@/constants/sensors'
import { formatBucketFull } from '@/lib/history'
import type { HistoryTableProps } from './SensorCharts.types'

/**
 * Gemela accesible de los gráficos: ningún valor queda disponible solo por
 * hover. Muestra los buckets con datos, del más reciente al más viejo.
 */
export function HistoryTable({ points }: HistoryTableProps) {
  const rows = [...points]
    .reverse()
    .filter((point) => SENSOR_METRICS.some((metric) => point[metric] !== null))

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-[#898781]">
        Sin datos en este rango
      </p>
    )
  }

  return (
    <div className="max-h-80 overflow-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full text-left text-xs tabular-nums">
        <caption className="sr-only">Histórico de lecturas del sensor</caption>
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-[#e1e0d9] text-[#898781]">
            <th scope="col" className="px-3 py-2 font-medium">
              Momento
            </th>
            {SENSOR_METRICS.map((metric) => (
              <th key={metric} scope="col" className="px-2 py-2 text-right font-medium">
                {METRIC_LABELS[metric]}
                <span className="ml-0.5 font-normal">({METRIC_UNITS[metric]})</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((point) => (
            <tr key={point.t} className="border-b border-[#e1e0d9] last:border-0">
              <th scope="row" className="px-3 py-1.5 font-normal text-[#52514e]">
                {formatBucketFull(point.t)}
              </th>
              {SENSOR_METRICS.map((metric) => (
                <td key={metric} className="px-2 py-1.5 text-right text-[#0b0b0b]">
                  {point[metric] === null ? '—' : point[metric]?.toFixed(1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
