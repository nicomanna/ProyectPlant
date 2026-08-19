// Tipos para la feature de "visita diaria" (HC-SR04) — ver docs/features/puntos.md

export interface CareEvent {
  id: string
  day: string
  cared_at: string
  created_at: string
}

export interface CareIngestRequest {
  occurred_at?: string
}

export interface CareIngestResponse {
  day: string
  caredAt: string
  alreadyRecorded: boolean
}
