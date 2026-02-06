import { API_CONFIG, AUTH_TOKEN_KEY } from './config'

export type ApiError = {
  message: string
  status: number
  code?: string
  details?: unknown
}

export class ApiClientError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiClientError'
    this.status = error.status
    this.code = error.code
    this.details = error.details
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
  skipAuth?: boolean
}

/**
 * Get the auth token from localStorage (client-side only)
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

/**
 * Set the auth token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }
}

/**
 * Clear the auth token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

/**
 * Core API client for making authenticated requests
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_CONFIG.BASE_URL}${endpoint}`

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = getAuthToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Include cookies for CORS
  }

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, requestInit)

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    if (!response.ok) {
      let errorData: ApiError = {
        message: `Request failed with status ${response.status}`,
        status: response.status,
      }

      if (isJson) {
        try {
          const jsonError = await response.json()
          errorData = {
            message: jsonError.message || jsonError.error || errorData.message,
            status: response.status,
            code: jsonError.code,
            details: jsonError.details || jsonError,
          }
        } catch {
          // Use default error
        }
      }

      // Handle 401 - clear token and potentially redirect
      if (response.status === 401) {
        clearAuthToken()
        if (typeof window !== 'undefined') {
          // Redirect to login
          window.location.href = '/login'
        }
      }

      throw new ApiClientError(errorData)
    }

    // Handle empty responses
    if (response.status === 204 || !isJson) {
      return {} as T
    }

    return await response.json() as T
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    // Network errors or other issues
    throw new ApiClientError({
      message: error instanceof Error ? error.message : 'Network error',
      status: 0,
      code: 'NETWORK_ERROR',
    })
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
}
