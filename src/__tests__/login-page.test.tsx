/**
 * W11 — Login page + LINE callback page tests
 *
 * Covers:
 * - LoginPage: branding, form, loading state, auth-redirect, submit success/error,
 *              LINE login (configured / not configured), demo button
 * - LineCallbackPage: loading, success, error (LINE error param, no code, bad state),
 *                     loginWithLine exception, back-to-login button
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../app/login/page'
import LineCallbackPage from '../app/auth/line/callback/page'

// ---------------------------------------------------------------------------
// Mock next/navigation — controlled via module-level vars
// ---------------------------------------------------------------------------
const mockPush = jest.fn()
let mockSearchParamsData: Record<string, string | null> = {}

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsData[key] ?? null,
  }),
}))

// ---------------------------------------------------------------------------
// Mock @/lib/auth/context — controlled via module-level vars
// ---------------------------------------------------------------------------
const mockLogin = jest.fn()
const mockLoginWithLine = jest.fn()
let mockIsAuthenticated = false
let mockAuthContextLoading = false

jest.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    login: mockLogin,
    loginWithLine: mockLoginWithLine,
    isAuthenticated: mockIsAuthenticated,
    isLoading: mockAuthContextLoading,
    logout: jest.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// Mock @/lib/api/client
// ---------------------------------------------------------------------------
jest.mock('@/lib/api/client', () => {
  class ApiClientError extends Error {
    status: number
    constructor(message: string, status = 400) {
      super(message)
      this.name = 'ApiClientError'
      this.status = status
    }
  }
  return { ApiClientError }
})

// Helper to create ApiClientError instances after jest.mock is set up
function makeApiClientError(message: string, status = 400): Error {
  const { ApiClientError: E } = require('@/lib/api/client')
  return new E(message, status)
}

// ---------------------------------------------------------------------------
// Mock @/lib/auth/line — controlled via module-level vars
// ---------------------------------------------------------------------------
let mockIsLineConfigured = true
const mockGetLineAuthUrl = jest.fn()
const mockVerifyLineState = jest.fn()

jest.mock('@/lib/auth/line', () => ({
  getLineAuthUrl: () => mockGetLineAuthUrl(),
  isLineConfigured: () => mockIsLineConfigured,
  verifyLineState: (state: string) => mockVerifyLineState(state),
}))

// ---------------------------------------------------------------------------
// Reset between tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  mockPush.mockClear()
  mockLogin.mockReset()
  mockLoginWithLine.mockReset()
  mockGetLineAuthUrl.mockReset()
  mockGetLineAuthUrl.mockReturnValue('https://access.line.me/oauth2/v2.1/authorize?state=abc')
  mockVerifyLineState.mockReset()
  mockVerifyLineState.mockReturnValue(true)
  mockIsAuthenticated = false
  mockAuthContextLoading = false
  mockIsLineConfigured = true
  mockSearchParamsData = {}
})

// ===========================================================================
// LOGIN PAGE TESTS
// ===========================================================================

describe('LoginPage', () => {
  describe('Rendering', () => {
    it('shows TalkToLead branding', () => {
      render(<LoginPage />)
      expect(screen.getByText('Welcome to TalkToLead')).toBeInTheDocument()
      expect(screen.getByText(/Sign in to access your manager dashboard/i)).toBeInTheDocument()
    })

    it('renders email and password fields', () => {
      render(<LoginPage />)
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('renders Sign In submit button', () => {
      render(<LoginPage />)
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
    })

    it('renders LINE login button', () => {
      render(<LoginPage />)
      expect(screen.getByRole('button', { name: /sign in with line/i })).toBeInTheDocument()
    })

    it('renders Forgot password link', () => {
      render(<LoginPage />)
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
    })

    it('renders Try demo button', () => {
      render(<LoginPage />)
      expect(screen.getByRole('button', { name: /try demo/i })).toBeInTheDocument()
    })

    it('does NOT show error banner on initial render', () => {
      render(<LoginPage />)
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument()
    })

    it('has correct input types (email / password)', () => {
      render(<LoginPage />)
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    })
  })

  describe('Auth loading state', () => {
    it('shows spinner while auth context is loading', () => {
      mockAuthContextLoading = true
      render(<LoginPage />)
      // Full form should not be visible
      expect(screen.queryByText('Welcome to TalkToLead')).not.toBeInTheDocument()
      // Spinner should be present
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Redirect when already authenticated', () => {
    it('redirects to /dashboard when already authenticated', async () => {
      mockIsAuthenticated = true
      render(<LoginPage />)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('does not redirect when not authenticated', async () => {
      render(<LoginPage />)
      await new Promise(r => setTimeout(r, 50))
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Form submission', () => {
    it('calls login with email and password on submit', async () => {
      mockLogin.mockResolvedValueOnce(undefined)
      render(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'manager@company.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'secret123' },
      })
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'manager@company.com',
          password: 'secret123',
        })
      })
    })

    it('shows Signing in... while loading', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {}))
      render(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pw' } })
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
      })
    })

    it('disables LINE button while form is submitting', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {}))
      render(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pw' } })
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in with line/i })).toBeDisabled()
      })
    })
  })

  describe('Error handling', () => {
    it('shows ApiClientError message on login failure', async () => {
      mockLogin.mockRejectedValueOnce(makeApiClientError('Invalid credentials', 401))
      render(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@y.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'bad' } })
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('shows generic error for unexpected exceptions', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Network failure'))
      render(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@y.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'bad' } })
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

      await waitFor(() => {
        expect(screen.getByText(/unexpected error/i)).toBeInTheDocument()
      })
    })

    it('re-enables Sign In button after error', async () => {
      mockLogin.mockRejectedValueOnce(new Error('fail'))
      render(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@y.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pw' } })
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^sign in$/i })).not.toBeDisabled()
      })
    })

    it('clears error on new submission', async () => {
      mockLogin
        .mockRejectedValueOnce(makeApiClientError('Bad credentials', 401))
        .mockImplementationOnce(() => new Promise(() => {}))
      render(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@y.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pw' } })

      // First submit — causes error
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
      await waitFor(() => expect(screen.getByText(/bad credentials/i)).toBeInTheDocument())

      // Second submit — clears error (now loading)
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
      await waitFor(() => expect(screen.queryByText(/bad credentials/i)).not.toBeInTheDocument())
    })

    it('shows AlertCircle icon alongside error message', async () => {
      mockLogin.mockRejectedValueOnce(makeApiClientError('Bad login', 401))
      render(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@y.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'bad' } })
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))

      await waitFor(() => expect(screen.getByText('Bad login')).toBeInTheDocument())
      // Error container should have red styling
      const errorContainer = screen.getByText('Bad login').closest('div')!
      expect(errorContainer.className).toMatch(/red/)
    })
  })

  describe('LINE Login', () => {
    it('calls getLineAuthUrl and navigates when LINE is configured', () => {
      mockIsLineConfigured = true
      mockGetLineAuthUrl.mockReturnValue('https://access.line.me/?state=xyz')
      render(<LoginPage />)

      fireEvent.click(screen.getByRole('button', { name: /sign in with line/i }))

      // getLineAuthUrl should have been called to build the URL
      expect(mockGetLineAuthUrl).toHaveBeenCalled()
      // No error should appear (navigation happened instead)
      expect(screen.queryByText(/LINE Login not configured/i)).not.toBeInTheDocument()
    })

    it('shows error when LINE is not configured', () => {
      mockIsLineConfigured = false
      render(<LoginPage />)

      fireEvent.click(screen.getByRole('button', { name: /sign in with line/i }))

      expect(screen.getByText(/LINE Login not configured/i)).toBeInTheDocument()
      expect(mockGetLineAuthUrl).not.toHaveBeenCalled()
    })

    it('shows error when getLineAuthUrl throws', () => {
      mockIsLineConfigured = true
      mockGetLineAuthUrl.mockImplementationOnce(() => {
        throw new Error('Missing LINE_CLIENT_ID')
      })
      render(<LoginPage />)

      fireEvent.click(screen.getByRole('button', { name: /sign in with line/i }))

      expect(screen.getByText(/Missing LINE_CLIENT_ID/i)).toBeInTheDocument()
    })

    it('clears error before initiating LINE login', async () => {
      // First show an error via form
      mockLogin.mockRejectedValueOnce(makeApiClientError('Wrong password', 401))
      render(<LoginPage />)

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@y.com' } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pw' } })
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
      await waitFor(() => expect(screen.getByText(/wrong password/i)).toBeInTheDocument())

      // Now click LINE — setError(null) runs first, clearing the error
      fireEvent.click(screen.getByRole('button', { name: /sign in with line/i }))
      expect(screen.queryByText(/wrong password/i)).not.toBeInTheDocument()
    })
  })

  describe('Demo login', () => {
    it('fills demo credentials on Try demo click', async () => {
      render(<LoginPage />)
      fireEvent.click(screen.getByRole('button', { name: /try demo/i }))

      await waitFor(() => {
        expect(screen.getByDisplayValue('demo@talktolead.ai')).toBeInTheDocument()
        expect(screen.getByDisplayValue('demo')).toBeInTheDocument()
      })
    })

    it('shows demo mode info message', async () => {
      render(<LoginPage />)
      fireEvent.click(screen.getByRole('button', { name: /try demo/i }))

      await waitFor(() => {
        expect(screen.getByText(/demo mode/i)).toBeInTheDocument()
      })
    })
  })
})

// ===========================================================================
// LINE CALLBACK PAGE TESTS
// ===========================================================================

describe('LineCallbackPage', () => {
  describe('Loading state', () => {
    it('shows Signing in with LINE... header while processing', async () => {
      mockSearchParamsData = { code: 'authcode123', state: 'validstate' }
      mockLoginWithLine.mockImplementation(() => new Promise(() => {}))
      render(<LineCallbackPage />)

      expect(screen.getByText(/signing in with line/i)).toBeInTheDocument()
    })

    it('shows please wait description while loading', () => {
      mockSearchParamsData = { code: 'authcode123', state: 'validstate' }
      mockLoginWithLine.mockImplementation(() => new Promise(() => {}))
      render(<LineCallbackPage />)

      expect(screen.getByText(/please wait/i)).toBeInTheDocument()
    })
  })

  describe('Success state', () => {
    it('shows Login Successful after loginWithLine resolves', async () => {
      mockSearchParamsData = { code: 'authcode123', state: 'validstate' }
      mockLoginWithLine.mockResolvedValueOnce(undefined)
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/login successful/i)).toBeInTheDocument()
      })
    })

    it('shows redirecting message in success state', async () => {
      mockSearchParamsData = { code: 'authcode123', state: 'validstate' }
      mockLoginWithLine.mockResolvedValueOnce(undefined)
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/redirecting to dashboard/i)).toBeInTheDocument()
      })
    })

    it('calls loginWithLine with correct code', async () => {
      mockSearchParamsData = { code: 'myspecialcode', state: 'validstate' }
      mockLoginWithLine.mockResolvedValueOnce(undefined)
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(mockLoginWithLine).toHaveBeenCalledWith(
          'myspecialcode',
          expect.stringContaining('/auth/line/callback')
        )
      })
    })

    it('does not show Back to Login in success state', async () => {
      mockSearchParamsData = { code: 'authcode123', state: 'validstate' }
      mockLoginWithLine.mockResolvedValueOnce(undefined)
      render(<LineCallbackPage />)

      await waitFor(() => expect(screen.getByText(/login successful/i)).toBeInTheDocument())
      expect(screen.queryByRole('button', { name: /back to login/i })).not.toBeInTheDocument()
    })
  })

  describe('Error states', () => {
    it('shows Login Failed when LINE returns error param', async () => {
      mockSearchParamsData = {
        error: 'access_denied',
        error_description: 'User denied access',
      }
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument()
        expect(screen.getByText(/user denied access/i)).toBeInTheDocument()
      })
    })

    it('shows fallback message when error_description is absent', async () => {
      mockSearchParamsData = { error: 'server_error' }
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/LINE authentication was cancelled or failed/i)).toBeInTheDocument()
      })
    })

    it('shows no authorization code error when code is missing', async () => {
      mockSearchParamsData = { state: 'validstate' }
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/no authorization code/i)).toBeInTheDocument()
      })
    })

    it('shows invalid state error when state param is missing (CSRF)', async () => {
      mockSearchParamsData = { code: 'authcode123' }
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/invalid state parameter/i)).toBeInTheDocument()
      })
    })

    it('shows invalid state error when verifyLineState returns false (CSRF)', async () => {
      mockVerifyLineState.mockReturnValueOnce(false)
      mockSearchParamsData = { code: 'authcode123', state: 'tampered_state' }
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/invalid state parameter/i)).toBeInTheDocument()
      })
    })

    it('does NOT call loginWithLine on state mismatch', async () => {
      // mockReturnValue (not Once) — StrictMode may invoke effect twice
      mockVerifyLineState.mockReturnValue(false)
      mockSearchParamsData = { code: 'authcode123', state: 'tampered' }
      render(<LineCallbackPage />)

      await waitFor(() => expect(screen.getByText(/invalid state/i)).toBeInTheDocument())
      expect(mockLoginWithLine).not.toHaveBeenCalled()
    })

    it('shows error when loginWithLine throws Error', async () => {
      mockSearchParamsData = { code: 'authcode123', state: 'validstate' }
      mockLoginWithLine.mockRejectedValueOnce(new Error('Token exchange failed'))
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/token exchange failed/i)).toBeInTheDocument()
      })
    })

    it('shows generic error when loginWithLine throws non-Error', async () => {
      mockSearchParamsData = { code: 'authcode123', state: 'validstate' }
      mockLoginWithLine.mockRejectedValueOnce('some_string_error')
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText(/failed to authenticate with LINE/i)).toBeInTheDocument()
      })
    })
  })

  describe('Back to Login button', () => {
    it('renders Back to Login button on error', async () => {
      mockSearchParamsData = { error: 'access_denied', error_description: 'Denied' }
      render(<LineCallbackPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument()
      })
    })

    it('calls router.push(/login) when Back to Login is clicked', async () => {
      mockSearchParamsData = { error: 'access_denied', error_description: 'Denied' }
      render(<LineCallbackPage />)

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument()
      )
      fireEvent.click(screen.getByRole('button', { name: /back to login/i }))

      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('does not render Back to Login in loading state', () => {
      mockSearchParamsData = { code: 'authcode123', state: 'validstate' }
      mockLoginWithLine.mockImplementation(() => new Promise(() => {}))
      render(<LineCallbackPage />)

      expect(screen.queryByRole('button', { name: /back to login/i })).not.toBeInTheDocument()
    })
  })
})
