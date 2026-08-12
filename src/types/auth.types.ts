export interface LoginRequestBody {
  password: string
}

export interface LoginSuccessResponse {
  message: string
}

export interface LoginErrorResponse {
  error: string
  message: string
}
