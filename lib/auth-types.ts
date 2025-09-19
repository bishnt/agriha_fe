export type AgentStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: number
  email: string | null
  phone: string | null
  firstname: string
  lastname: string
  is_verified: boolean
  is_customer: boolean
  is_superadmin: boolean
  is_agent: boolean
  agent_status?: AgentStatus
  account_created: string
}

export interface LoginResponse {
  success: boolean
  message: string
  accessToken?: string
  refreshToken?: string
}

export interface Session {
  user: User
  accessToken: string
  refreshToken: string
  expires: string
}

