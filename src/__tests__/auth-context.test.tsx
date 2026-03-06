/**
 * Tests for AuthProvider, useAuth, withAuth (auth/context.tsx)
 *
 * Strategy:
 * - Mock next/navigation (useRouter, usePathname)
 * - Mock @/lib/api/client (api, setAuthToken, clearAuthToken)
 * - Mock localStorage via jest.spyOn
 * - Render AuthProvider as wrapper in renderHook / render
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { AuthProvider, useAuth, withAuth, AuthUser } from '../lib/auth/context'

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
}))

// ---------------------------------------------------------------------------
// Mock @/lib/api/client
// ---------------------------------------------------------------------------
const mockApiGet = jest.fn()
const mockApiPost = jest.fn()
const mockSetAuthToken = jest.fn()
const mockClearAuthToken = jest.fn()

jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
  setAuthToken: (...args: unknown[]) => mockSetAuthToken(...args),
  clearAuthToken: () => mockClearAuthToken(),
}))

// ---------------------------------------------------------------------------
// Mock @/lib/api/config
// ---------------------------------------------------------------------------
jest.mock('@/lib/api/config', () => ({
  AUTH_TOKEN_KEY: 'auth_token',
  USER_KEY: 'auth_user',
}))

// ---------------------------------------------------------------------------
// Mock @/lib/api/endpoints
// ---------------------------------------------------------------------------
jest.mock('@/lib/api/endpoints', () => ({
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      CURRENT_USER: '/auth/me',
      GOOGLE: '/auth/google',
    },
  },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const demoUser: AuthUser = {
  id: 'demo_manager_001',
  email: 'demo@talktolead.ai',
  display_name: 'Demo Manager',
  role: 'manager',
  organization_id: 'demo_org_001',
  token_balance: 1000,
}

const realUser: AuthUser = {
  id: 'user_001',
  email: 'sales@company.com',
  display_name: 'Sales Rep',
  role: 'user',
  organization_id: 'org_001',
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

// ===========================================================================
// 1. Initialization
// ===========================================================================
describe('AuthProvider initialization', () => {
  it('starts in loading state with a pending token verification', async () => {
    // Need a token so initAuth reaches the api.get call
    localStorage.setItem('auth_token', 'pending_token')
    let resolveFetch: (val: unknown) => void
    mockApiGet.mockReturnValue(new Promise((r) => { resolveFetch = r }))

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    // Before the API call resolves, isLoading should be true
    expect(result.current.isLoading).toBe(true)

    // Clean up: resolve so no hanging promise
    act(() => { resolveFetch(realUser) })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('sets unauthenticated when no token in localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('restores user from localStorage on valid token', async () => {
    localStorage.setItem('auth_token', 'valid_token')
    localStorage.setItem('auth_user', JSON.stringify(realUser))
    mockApiGet.mockResolvedValueOnce(realUser)

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe(realUser.email)
  })

  it('clears auth when token is invalid (API throws)', async () => {
    localStorage.setItem('auth_token', 'bad_token')
    localStorage.setItem('auth_user', JSON.stringify(realUser))
    mockApiGet.mockRejectedValueOnce(new Error('401 Unauthorized'))

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    // Wait for the API rejection to propagate and clear auth
    await waitFor(() => expect(result.current.isAuthenticated).toBe(false))

    expect(result.current.user).toBeNull()
    expect(mockClearAuthToken).toHaveBeenCalled()
    expect(localStorage.getItem('auth_user')).toBeNull()
  })

  it('handles corrupted stored user JSON gracefully', async () => {
    localStorage.setItem('auth_token', 'valid_token')
    localStorage.setItem('auth_user', 'INVALID_JSON{{{{')
    mockApiGet.mockResolvedValueOnce(realUser)

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    // Should still resolve via API call
    expect(result.current.isAuthenticated).toBe(true)
  })
})

// ===========================================================================
// 2. login()
// ===========================================================================
describe('login()', () => {
  it('demo mode: sets demo user without API call', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      // Fast-forward the 1000ms demo delay
      const loginPromise = result.current.login({
        email: 'demo@talktolead.ai',
        password: 'demo',
      })
      jest.advanceTimersByTime(1100)
      await loginPromise
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('demo@talktolead.ai')
    expect(result.current.user?.role).toBe('manager')
    expect(mockSetAuthToken).toHaveBeenCalledWith('demo_token_123')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('real login: calls API and sets user', async () => {
    mockApiPost.mockResolvedValueOnce({ access_token: 'real_token_abc' })
    mockApiGet.mockResolvedValueOnce(realUser)

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login({
        email: 'sales@company.com',
        password: 'password123',
      })
    })

    expect(mockSetAuthToken).toHaveBeenCalledWith('real_token_abc')
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('sales@company.com')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('real login: throws and resets isLoading on failure', async () => {
    mockApiPost.mockRejectedValueOnce(new Error('Invalid credentials'))

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await expect(
        result.current.login({ email: 'bad@user.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials')
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
  })
})

// ===========================================================================
// 3. loginWithGoogle()
// ===========================================================================
describe('loginWithGoogle()', () => {
  it('calls google endpoint, sets token, fetches user', async () => {
    mockApiPost.mockResolvedValueOnce({ access_token: 'google_token_xyz' })
    mockApiGet.mockResolvedValueOnce(realUser)

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.loginWithGoogle('google_id_token')
    })

    expect(mockApiPost).toHaveBeenCalledWith(
      '/auth/google',
      { id_token: 'google_id_token' },
      expect.objectContaining({ skipAuth: true })
    )
    expect(mockSetAuthToken).toHaveBeenCalledWith('google_token_xyz')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('throws on Google login failure', async () => {
    mockApiPost.mockRejectedValueOnce(new Error('Google auth failed'))

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await expect(result.current.loginWithGoogle('bad_token')).rejects.toThrow(
        'Google auth failed'
      )
    })

    expect(result.current.isLoading).toBe(false)
  })
})

// ===========================================================================
// 4. loginWithLine()
// ===========================================================================
describe('loginWithLine()', () => {
  it('calls LINE token endpoint and sets user from response', async () => {
    mockApiPost.mockResolvedValueOnce({
      access_token: 'line_token_abc',
      user: { uid: 'line_user_001', username: 'LineUser', provider: 'line' },
    })

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.loginWithLine('auth_code_123', 'https://app/callback')
    })

    expect(mockApiPost).toHaveBeenCalledWith(
      '/auth/line/token',
      { code: 'auth_code_123', redirect_uri: 'https://app/callback' },
      expect.objectContaining({ skipAuth: true })
    )
    expect(mockSetAuthToken).toHaveBeenCalledWith('line_token_abc')
    expect(result.current.user?.display_name).toBe('LineUser')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
})

// ===========================================================================
// 5. logout()
// ===========================================================================
describe('logout()', () => {
  it('clears token, user, state, and redirects to /login', async () => {
    localStorage.setItem('auth_token', 'valid_token')
    localStorage.setItem('auth_user', JSON.stringify(realUser))
    mockApiGet.mockResolvedValueOnce(realUser)

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    act(() => {
      result.current.logout()
    })

    expect(mockClearAuthToken).toHaveBeenCalled()
    expect(localStorage.getItem('auth_user')).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})

// ===========================================================================
// 6. refreshUser()
// ===========================================================================
describe('refreshUser()', () => {
  it('fetches fresh user from API and updates state', async () => {
    localStorage.setItem('auth_token', 'valid_token')
    localStorage.setItem('auth_user', JSON.stringify(realUser))
    mockApiGet
      .mockResolvedValueOnce(realUser) // init
      .mockResolvedValueOnce({ ...realUser, display_name: 'Updated Name' }) // refresh

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    await act(async () => {
      await result.current.refreshUser()
    })

    expect(result.current.user?.name).toBe('Updated Name')
  })

  it('silently handles refreshUser failure (no throw)', async () => {
    localStorage.setItem('auth_token', 'valid_token')
    localStorage.setItem('auth_user', JSON.stringify(realUser))
    mockApiGet
      .mockResolvedValueOnce(realUser) // init
      .mockRejectedValueOnce(new Error('Network error')) // refresh

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    // Should not throw
    await act(async () => {
      await result.current.refreshUser()
    })

    // User state unchanged
    expect(result.current.user?.email).toBe(realUser.email)
  })
})

// ===========================================================================
// 7. useAuth() outside provider
// ===========================================================================
describe('useAuth() outside AuthProvider', () => {
  it('throws an error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
    consoleSpy.mockRestore()
  })
})

// ===========================================================================
// 8. withAuth() HOC
// ===========================================================================
describe('withAuth() HOC', () => {
  function TestComponent() {
    return <div>Protected Content</div>
  }
  const Protected = withAuth(TestComponent)

  it('shows loading spinner while isLoading=true', () => {
    // Never resolve → stays in loading
    mockApiGet.mockReturnValue(new Promise(() => {}))
    localStorage.setItem('auth_token', 'tok')

    render(
      <AuthProvider>
        <Protected />
      </AuthProvider>
    )
    // Loading spinner should be visible (animate-spin div)
    expect(document.querySelector('.animate-spin')).toBeTruthy()
  })

  it('renders null (not content) when unauthenticated after loading', async () => {
    // No token → immediately unauthenticated
    const { container } = render(
      <AuthProvider>
        <Protected />
      </AuthProvider>
    )
    await waitFor(() =>
      expect(document.querySelector('.animate-spin')).toBeFalsy()
    )
    expect(container.textContent).not.toContain('Protected Content')
  })

  it('redirects to /login when unauthenticated', async () => {
    render(
      <AuthProvider>
        <Protected />
      </AuthProvider>
    )
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'))
  })

  it('renders component when authenticated', async () => {
    localStorage.setItem('auth_token', 'valid_token')
    localStorage.setItem('auth_user', JSON.stringify(realUser))
    mockApiGet.mockResolvedValueOnce(realUser)

    render(
      <AuthProvider>
        <Protected />
      </AuthProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    )
  })
})
