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

// Tokens re-expresados para fondo oscuro carbón. La serie conserva el hue
// validado por la skill `dataviz` (`CHART_COLORS.series`); solo los hues de
// marco/tinta cambian a tonos claros legibles sobre el vidrio oscuro.
const DARK = {
  card: 'rgba(255,255,255,0.06)',
  grid: 'rgba(255,255,255,0.10)',
  axis: 'rgba(255,255,255,0.22)',
  muted: '#b6bdc7',
  ink: '#e8eaed',
  surface: '#23272d',
}

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
    <section className="glass rounded-2xl px-3 pt-3 pb-1">
      <header className="flex items-baseline justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />
          <h3 className="text-xs font-medium text-white/80">{METRIC_LABELS[metric]}</h3>
        </div>
        {lastValue !== null && (
          <p className="text-sm font-semibold text-white">
            {lastValue.toFixed(1)}
            <span className="ml-0.5 text-xs font-normal text-white/40">{unit}</span>
          </p>
        )}
      </header>

      {values.length === 0 ? (
        <p className="py-10 text-center text-xs text-white/40">Sin datos en este rango</p>
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
            <CartesianGrid vertical={false} stroke={DARK.grid} strokeWidth={1} />

            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickCount={4}
              tickFormatter={(value: number) => formatBucketTick(value, range)}
              tick={{ fill: DARK.muted, fontSize: 10 }}
              stroke={DARK.axis}
              tickLine={false}
            />

            <YAxis
              domain={computeDomain(values, optimalMin, optimalMax)}
              tickCount={3}
              tick={{ fill: DARK.muted, fontSize: 10 }}
              stroke={DARK.axis}
              tickLine={false}
              width={44}
            />

            <Tooltip
              cursor={{ stroke: DARK.axis, strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${DARK.grid}`,
                background: DARK.surface,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                fontSize: 12,
                padding: '6px 10px',
              }}
              labelStyle={{ color: DARK.muted, fontSize: 11 }}
              itemStyle={{ color: DARK.ink }}
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
