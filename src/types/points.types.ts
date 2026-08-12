export interface DailyPoints {
  day: string
  soil_points: number
  light_points: number
  temp_points: number
  humidity_points: number
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
  days: DailyPoints[]
  totalPoints: number
  targetPoints: number
  progress: number
  goalReached: boolean
  claimed: boolean
}

export interface ClaimResponse {
  claimed: boolean
  claimedAt: string
  message: string
}
