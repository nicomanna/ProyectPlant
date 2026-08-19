import type { WeeklyPrize } from '@/constants/prizes'

export interface DailyPoints {
  day: string
  soil_points: number
  light_points: number
  temp_points: number
  humidity_points: number
  care_points: number
  total_points: number
  reading_count: number
}

export interface WeeklyGoal {
  id: string
  week_start: string
  target_points: number
  claimed_at: string | null
  created_at: string
}

export interface PointsResponse {
  weekStart: string
  weekNumber: number
  today: string
  days: DailyPoints[]
  totalPoints: number
  targetPoints: number
  progress: number
  goalReached: boolean
  claimed: boolean
  prize: WeeklyPrize
}

export interface ClaimResponse {
  claimed: boolean
  claimedAt: string
  weekNumber: number
  prize: WeeklyPrize
  message: string
}
