'use client'

import { Droplets, Sun, Thermometer, Wind } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_COLORS, CHART_MARKS } from '@/constants/charts'
import {
  METRIC_LABELS,
  METRIC_UNITS,
  SENSOR_RANGES,
  type SensorMetric,
} from '@/constants/sensors'
import { formatBucketFull, formatBucketTick } from '@/lib/history'
import type { MetricChartProps } from './SensorCharts.types'

const METRIC_ICONS = {
  soil_moisture: Droplets,
  light_level: Sun,
  temperature: Thermometer,
  humidity: Wind,
} as const satisfies Record<SensorMetric, typeof Droplets>

/**
 * El dominio del eje Y siempre incluye la banda óptima completa, incluso si los
 * datos nunca la tocaron: si no, la banda queda fuera de cuadro y el gráfico
 * pierde justo la referencia que lo hace legible.
 */
function computeDomain(values: number[], optimalMin: number, optimalMax: number): [number, number] {
  const low = Math.min(optimalMin, ...values)
  const high = Math.max(optimalMax, ...values)
  const padding = Math.max(2, (high - low) * 0.15)

  return [Math.floor(low - padding), Math.ceil(high + padding)]
}

export function MetricChart({ metric, points, range }: MetricChartProps) {
  const Icon = METRIC_ICONS[metric]
  const unit = METRIC_UNITS[metric]
  const { optimalMin, optimalMax } = SENSOR_RANGES[metric]

  const values = points
    .map((point) => point[metric])
    .filter((value): value is number => value !== null)

  const lastPoint = [...points].reverse().find((point) => point[metric] !== null)
  const lastValue = lastPoint ? lastPoint[metric] : null

  return (
    <section className="rounded-2xl bg-white px-3 pt-3 pb-1 shadow-sm">
      <header className="flex items-baseline justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-[#898781]" aria-hidden="true" />
          <h3 className="text-xs font-medium text-[#52514e]">{METRIC_LABELS[metric]}</h3>
        </div>
        {lastValue !== null && (
          <p className="text-sm font-semibold text-[#0b0b0b]">
            {lastValue.toFixed(1)}
            <span className="ml-0.5 text-xs font-normal text-[#898781]">{unit}</span>
          </p>
        )}
      </header>

      {values.length === 0 ? (
        <p className="py-10 text-center text-xs text-[#898781]">Sin datos en este rango</p>
      ) : (
        // El alto incluye la banda del eje X, así la tarjeta no genera
        // un scroll vertical interno.
        <ResponsiveContainer width="100%" height={132}>
          <LineChart data={points} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
            <ReferenceArea
              y1={optimalMin}
              y2={optimalMax}
              fill={CHART_COLORS.optimalBand}
              fillOpacity={CHART_COLORS.optimalBandOpacity}
              stroke="none"
              ifOverflow="hidden"
            />

            {/* Grilla hairline sólida, solo horizontal, recesiva. */}
            <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} strokeWidth={1} />

            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickCount={4}
              tickFormatter={(value: number) => formatBucketTick(value, range)}
              tick={{ fill: CHART_COLORS.muted, fontSize: 10 }}
              stroke={CHART_COLORS.axis}
              tickLine={false}
            />

            <YAxis
              domain={computeDomain(values, optimalMin, optimalMax)}
              tickCount={3}
              tick={{ fill: CHART_COLORS.muted, fontSize: 10 }}
              stroke={CHART_COLORS.axis}
              tickLine={false}
              width={44}
            />

            <Tooltip
              cursor={{ stroke: CHART_COLORS.axis, strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${CHART_COLORS.grid}`,
                background: CHART_COLORS.surface,
                boxShadow: '0 2px 8px rgba(11,11,11,0.08)',
                fontSize: 12,
                padding: '6px 10px',
              }}
              labelStyle={{ color: CHART_COLORS.muted, fontSize: 11 }}
              itemStyle={{ color: CHART_COLORS.ink }}
              labelFormatter={(value) => formatBucketFull(Number(value))}
              formatter={(value) => [`${Number(value).toFixed(1)} ${unit}`, METRIC_LABELS[metric]]}
            />

            <Line
              dataKey={metric}
              name={METRIC_LABELS[metric]}
              type="monotone"
              stroke={CHART_COLORS.series}
              strokeWidth={CHART_MARKS.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              // Los huecos son huecos: la línea se corta, no se interpola.
              connectNulls={false}
              activeDot={{
                r: CHART_MARKS.endDotRadius,
                stroke: CHART_COLORS.surface,
                strokeWidth: CHART_MARKS.endDotRingWidth,
              }}
              isAnimationActive={false}
            />

            {/* Punto final: ancla visual de dónde termina la serie. */}
            {lastPoint && lastValue !== null && (
              <ReferenceDot
                x={lastPoint.t}
                y={lastValue}
                r={CHART_MARKS.endDotRadius}
                fill={CHART_COLORS.series}
                stroke={CHART_COLORS.surface}
                strokeWidth={CHART_MARKS.endDotRingWidth}
                ifOverflow="extendDomain"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}
