import type { SensorReading } from '@/types/sensor.types'

export interface SensorPanelProps {
  reading: SensorReading | null
  isLoading: boolean
  className?: string
}
