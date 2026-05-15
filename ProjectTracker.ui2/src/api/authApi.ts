import { apiClient } from './client'
import type { User } from '@/types'

export const authApi = {
  me: () => apiClient.get<User>('/api/auth/me'),

  login: (email: string, password: string) =>
    apiClient.post<User>('/api/auth/login', { email, password }),

  register: (tenantName: string, displayName: string, email: string, password: string) =>
    apiClient.post<User>('/api/auth/register', { tenantName, displayName, email, password }),

  logout: () => apiClient.post<void>('/api/auth/logout', {}),
}
