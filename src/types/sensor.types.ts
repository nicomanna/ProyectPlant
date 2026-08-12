// Tipos para la feature de sensores

export interface SensorReading {
  id: string
  device_id: string
  soil_moisture: number
  light_level: number
  temperature: number
  humidity: number
  recorded_at: string
  created_at: string
}

export interface SensorReadingInput {
  soil_moisture: number
  light_level: number
  temperature: number
  humidity: number
  recorded_at?: string
  device_id?: string
}

export interface SensorIngestRequest {
  soil_moisture: number
  light_level: number
  temperature: number
  humidity: number
  recorded_at?: string
}

export interface SensorLatestResponse {
  reading: SensorReading | null
  health: number
}

export interface SensorErrorResponse {
  error: string
}
