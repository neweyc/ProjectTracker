import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/api/authApi'
import { ApiError } from '@/api/client'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (tenantName: string, displayName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearUser = useCallback(() => setUser(null), [])

  // Check existing session on mount
  useEffect(() => {
    authApi.me()
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) return
        console.error('Failed to restore session:', err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  // Listen for 401s from any API call — session expired or invalidated
  useEffect(() => {
    window.addEventListener('auth:unauthorized', clearUser)
    return () => window.removeEventListener('auth:unauthorized', clearUser)
  }, [clearUser])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password)
    setUser(result)
  }, [])

  const register = useCallback(async (
    tenantName: string, displayName: string, email: string, password: string
  ) => {
    const result = await authApi.register(tenantName, displayName, email, password)
    setUser(result)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {})
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
