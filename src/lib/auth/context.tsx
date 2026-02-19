"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api, setAuthToken, clearAuthToken } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { AUTH_TOKEN_KEY, USER_KEY } from '@/lib/api/config'

// User type from backend
export interface AuthUser {
  id: string
  uuid?: string
  email: string
  display_name?: string
  name?: string
  role: 'user' | 'manager' | 'admin'
  organization_id?: string
  avatar?: string
  subscription_tier?: string
  token_balance?: number
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  refresh_token?: string
  user?: AuthUser
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  loginWithLine: (code: string, redirectUri: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY)

      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false })
        return
      }

      // Try to use stored user first for instant UI
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setState({ user, isLoading: false, isAuthenticated: true })
        } catch {
          // Invalid stored user, continue to fetch
        }
      }

      // Verify token and get fresh user data
      try {
        const user = await api.get<AuthUser>(ENDPOINTS.AUTH.CURRENT_USER)
        localStorage.setItem(USER_KEY, JSON.stringify(user))
        setState({ 
          user: { ...user, name: user.display_name || user.email }, 
          isLoading: false, 
          isAuthenticated: true 
        })
      } catch (error) {
        console.error('Failed to fetch current user:', error)
        // Token invalid, clear everything
        clearAuthToken()
        localStorage.removeItem(USER_KEY)
        setState({ user: null, isLoading: false, isAuthenticated: false })
      }
    }

    initAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Demo mode for testing - check for demo credentials
      if (credentials.email === 'demo@talktolead.ai' && credentials.password === 'demo') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Use demo user data
        const demoUser: AuthUser = {
          id: 'demo_manager_001',
          email: 'demo@talktolead.ai',
          display_name: 'Demo Manager',
          role: 'manager',
          organization_id: 'demo_org_001',
          token_balance: 1000
        }
        
        // Set a fake token
        setAuthToken('demo_token_123')
        localStorage.setItem(USER_KEY, JSON.stringify(demoUser))

        setState({
          user: { ...demoUser, name: demoUser.display_name || demoUser.email },
          isLoading: false,
          isAuthenticated: true,
        })

        router.push('/dashboard')
        return
      }

      // Real authentication
      const response = await api.post<LoginResponse>(
        ENDPOINTS.AUTH.LOGIN, 
        credentials,
        { skipAuth: true }
      )

      if (response.access_token) {
        setAuthToken(response.access_token)

        // Fetch user data
        const user = await api.get<AuthUser>(ENDPOINTS.AUTH.CURRENT_USER)
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        setState({
          user: { ...user, name: user.display_name || user.email },
          isLoading: false,
          isAuthenticated: true,
        })

        router.push('/dashboard')
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [router])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await api.post<LoginResponse>(
        ENDPOINTS.AUTH.GOOGLE,
        { id_token: idToken },
        { skipAuth: true }
      )

      if (response.access_token) {
        setAuthToken(response.access_token)

        // Fetch user data
        const user = await api.get<AuthUser>(ENDPOINTS.AUTH.CURRENT_USER)
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        setState({
          user: { ...user, name: user.display_name || user.email },
          isLoading: false,
          isAuthenticated: true,
        })

        router.push('/dashboard')
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [router])

  const loginWithLine = useCallback(async (code: string, redirectUri: string) => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await api.post<LoginResponse & { user?: { uid: string; username: string; provider: string } }>(
        '/auth/line/token',
        { code, redirect_uri: redirectUri },
        { skipAuth: true }
      )

      if (response.access_token) {
        setAuthToken(response.access_token)

        // Use LINE user info from response
        const lineUser = response.user
        const user: AuthUser = {
          id: lineUser?.uid || '',
          email: '', // LINE doesn't provide email
          display_name: lineUser?.username || 'LINE User',
          role: 'user',
        }
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        setState({
          user: { ...user, name: user.display_name || 'LINE User' },
          isLoading: false,
          isAuthenticated: true,
        })

        router.push('/dashboard')
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [router])

  const logout = useCallback(() => {
    clearAuthToken()
    localStorage.removeItem(USER_KEY)
    setState({ user: null, isLoading: false, isAuthenticated: false })
    router.push('/login')
  }, [router])

  const refreshUser = useCallback(async () => {
    try {
      const user = await api.get<AuthUser>(ENDPOINTS.AUTH.CURRENT_USER)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      setState(prev => ({ 
        ...prev, 
        user: { ...user, name: user.display_name || user.email } 
      }))
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [])

  const value: AuthContextValue = {
    ...state,
    login,
    loginWithGoogle,
    loginWithLine,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login')
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}
