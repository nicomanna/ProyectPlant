import type { WeeklyPrize } from '@/constants/prizes'

export interface PrizeModalProps {
  prize: WeeklyPrize
  weekNumber: number
  isClaiming: boolean
  onClaim: () => void
  onClose: () => void
}