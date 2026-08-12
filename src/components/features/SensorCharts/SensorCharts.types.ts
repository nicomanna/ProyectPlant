import type { HistoryRange } from '@/constants/charts'
import type { SensorMetric } from '@/constants/sensors'
import type { HistoryPoint } from '@/types/history.types'

export interface SensorChartsProps {
  className?: string
}

export interface MetricChartProps {
  metric: SensorMetric
  points: HistoryPoint[]
  range: HistoryRange
}

export interface HistoryTableProps {
  points: HistoryPoint[]
}
