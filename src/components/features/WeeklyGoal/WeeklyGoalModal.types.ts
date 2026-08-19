import type { PointsResponse } from '@/types/points.types'
import type { SensorReading } from '@/types/sensor.types'

export interface WeeklyGoalModalProps {
  points: PointsResponse
  reading: SensorReading | null
  onClose: () => void
}
