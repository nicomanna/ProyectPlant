import type { PointsResponse } from '@/types/points.types'

export interface WeeklyGoalProps {
  points: PointsResponse | null
  isLoading: boolean
  isClaiming: boolean
  onClaim: () => void
  className?: string
}
