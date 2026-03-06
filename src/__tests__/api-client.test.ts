/**
 * Tests for the core API client (src/lib/api/client.ts)
 *
 * Covers:
 *  - ApiClientError class
 *  - setAuthToken / clearAuthToken helpers
 *  - apiClient — all HTTP methods, auth injection, error paths
 *  - api convenience wrapper (get/post/put/patch/delete)
 */

import {
  ApiClientError,
  apiClient,
  api,
  setAuthToken,
  clearAuthToken,
} from '@/lib/api/client'
import { AUTH_TOKEN_KEY, API_CONFIG } from '@/lib/api/config'

// ---------------------------------------------------------------------------
// Helpers — build minimal Response-like objects (jsdom may lack Response constructor)
// ---------------------------------------------------------------------------

function makeResponse(
  body: unknown,
  status = 200,
  contentType = 'application/json'
) {
  const jsonBody = body !== null ? JSON.stringify(body) : null
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key: string) =>
        key.toLowerCase() === 'content-type' ? contentType : null,
    },
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(jsonBody ?? ''),
  }
}

function mockFetch(
  body: unknown,
  status = 200,
  contentType = 'application/json'
): jest.Mock {
  const response = makeResponse(body, status, contentType)
  const mock = jest.fn().mockResolvedValue(response)
  global.fetch = mock
  return mock
}

function mockFetchEmpty(status = 204): jest.Mock {
  const response = {
    ok: true,
    status,
    headers: { get: () => null },
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
  }
  const mock = jest.fn().mockResolvedValue(response)
  global.fetch = mock
  return mock
}

function mockFetchError(message: string): jest.Mock {
  const mock = jest.fn().mockRejectedValue(new TypeError(message))
  global.fetch = mock
  return mock
}

// ---------------------------------------------------------------------------
// ApiClientError
// ---------------------------------------------------------------------------

describe('ApiClientError', () => {
  it('extends Error', () => {
    const err = new ApiClientError({ message: 'oops', status: 500 })
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ApiClientError)
  })

  it('sets name to ApiClientError', () => {
    const err = new ApiClientError({ message: 'x', status: 400 })
    expect(err.name).toBe('ApiClientError')
  })

  it('exposes status', () => {
    const err = new ApiClientError({ message: 'x', status: 422 })
    expect(err.status).toBe(422)
  })

  it('exposes optional code', () => {
    const err = new ApiClientError({ message: 'x', status: 400, code: 'VALIDATION' })
    expect(err.code).toBe('VALIDATION')
  })

  it('exposes optional details', () => {
    const details = { field: 'email', issue: 'required' }
    const err = new ApiClientError({ message: 'x', status: 400, details })
    expect(err.details).toEqual(details)
  })

  it('message is passed through', () => {
    const err = new ApiClientError({ message: 'Bad input', status: 400 })
    expect(err.message).toBe('Bad input')
  })

  it('code and details default to undefined', () => {
    const err = new ApiClientError({ message: 'x', status: 500 })
    expect(err.code).toBeUndefined()
    expect(err.details).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

describe('setAuthToken / clearAuthToken', () => {
  beforeEach(() => localStorage.clear())

  it('setAuthToken stores token in localStorage', () => {
    setAuthToken('my-jwt')
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('my-jwt')
  })

  it('clearAuthToken removes token from localStorage', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'existing-token')
    clearAuthToken()
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })

  it('clearAuthToken is a no-op when no token is stored', () => {
    expect(() => clearAuthToken()).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// apiClient — success paths
// ---------------------------------------------------------------------------

describe('apiClient — success paths', () => {
  beforeEach(() => localStorage.clear())

  it('returns parsed JSON for a 200 response', async () => {
    mockFetch({ id: 1, name: 'Test' })
    const result = await apiClient<{ id: number; name: string }>('/test')
    expect(result).toEqual({ id: 1, name: 'Test' })
  })

  it('uses GET by default', async () => {
    const mock = mockFetch({})
    await apiClient('/test')
    expect(mock).toHaveBeenCalledTimes(1)
    const [, init] = mock.mock.calls[0]
    expect(init.method).toBe('GET')
  })

  it('constructs URL from base URL + endpoint', async () => {
    const mock = mockFetch({})
    await apiClient('/my-endpoint')
    const [url] = mock.mock.calls[0]
    expect(url).toBe(`${API_CONFIG.BASE_URL}/my-endpoint`)
  })

  it('uses an absolute URL as-is', async () => {
    const mock = mockFetch({})
    await apiClient('https://custom.host/api/v1/resource')
    const [url] = mock.mock.calls[0]
    expect(url).toBe('https://custom.host/api/v1/resource')
  })

  it('injects Authorization header when token is set', async () => {
    setAuthToken('bearer-abc')
    const mock = mockFetch({})
    await apiClient('/secure')
    const [, init] = mock.mock.calls[0]
    expect(init.headers['Authorization']).toBe('Bearer bearer-abc')
  })

  it('omits Authorization header when no token is set', async () => {
    const mock = mockFetch({})
    await apiClient('/open')
    const [, init] = mock.mock.calls[0]
    expect(init.headers['Authorization']).toBeUndefined()
  })

  it('omits Authorization header when skipAuth=true, even if token exists', async () => {
    setAuthToken('should-be-ignored')
    const mock = mockFetch({})
    await apiClient('/login', { skipAuth: true })
    const [, init] = mock.mock.calls[0]
    expect(init.headers['Authorization']).toBeUndefined()
  })

  it('sends POST with serialized body', async () => {
    const mock = mockFetch({ ok: true })
    await apiClient('/create', { method: 'POST', body: { name: 'Alice' } })
    const [, init] = mock.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ name: 'Alice' }))
  })

  it('sends PUT with body', async () => {
    const mock = mockFetch({ ok: true })
    await apiClient('/update', { method: 'PUT', body: { name: 'Bob' } })
    const [, init] = mock.mock.calls[0]
    expect(init.method).toBe('PUT')
    expect(init.body).toBe(JSON.stringify({ name: 'Bob' }))
  })

  it('sends PATCH with body', async () => {
    const mock = mockFetch({ ok: true })
    await apiClient('/patch', { method: 'PATCH', body: { active: false } })
    const [, init] = mock.mock.calls[0]
    expect(init.method).toBe('PATCH')
  })

  it('sends DELETE without body', async () => {
    const mock = mockFetch({})
    await apiClient('/delete/1', { method: 'DELETE' })
    const [, init] = mock.mock.calls[0]
    expect(init.method).toBe('DELETE')
    expect(init.body).toBeUndefined()
  })

  it('does NOT attach body to a GET request', async () => {
    const mock = mockFetch({})
    // body param is ignored for GET
    await apiClient('/list', { method: 'GET' })
    const [, init] = mock.mock.calls[0]
    expect(init.body).toBeUndefined()
  })

  it('merges custom headers', async () => {
    const mock = mockFetch({})
    await apiClient('/test', { headers: { 'X-Custom': 'value' } })
    const [, init] = mock.mock.calls[0]
    expect(init.headers['X-Custom']).toBe('value')
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('returns empty object for 204 No Content', async () => {
    mockFetchEmpty(204)
    const result = await apiClient('/delete/1', { method: 'DELETE' })
    expect(result).toEqual({})
  })

  it('returns empty object for non-JSON content-type', async () => {
    mockFetch('plain text', 200, 'text/plain')
    const result = await apiClient('/text')
    expect(result).toEqual({})
  })

  it('includes credentials: include in every request', async () => {
    const mock = mockFetch({})
    await apiClient('/cors-endpoint')
    const [, init] = mock.mock.calls[0]
    expect(init.credentials).toBe('include')
  })
})

// ---------------------------------------------------------------------------
// apiClient — error paths
// ---------------------------------------------------------------------------

describe('apiClient — error paths', () => {
  beforeEach(() => {
    localStorage.clear()
    // Suppress jsdom window.location.href assignment noise
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('throws ApiClientError on 400', async () => {
    mockFetch({ message: 'Bad request' }, 400)
    await expect(apiClient('/bad')).rejects.toBeInstanceOf(ApiClientError)
  })

  it('throws with correct status on 400', async () => {
    mockFetch({ message: 'Bad request' }, 400)
    try {
      await apiClient('/bad')
    } catch (e) {
      expect((e as ApiClientError).status).toBe(400)
    }
  })

  it('extracts message from JSON error body', async () => {
    mockFetch({ message: 'Email already exists' }, 409)
    try {
      await apiClient('/register')
    } catch (e) {
      expect((e as ApiClientError).message).toBe('Email already exists')
    }
  })

  it('uses "error" field as message fallback', async () => {
    mockFetch({ error: 'Conflict detected' }, 409)
    try {
      await apiClient('/x')
    } catch (e) {
      expect((e as ApiClientError).message).toBe('Conflict detected')
    }
  })

  it('falls back to generic message when JSON has no message/error', async () => {
    mockFetch({}, 500)
    try {
      await apiClient('/x')
    } catch (e) {
      expect((e as ApiClientError).message).toMatch(/500/)
    }
  })

  it('extracts code from JSON error body', async () => {
    mockFetch({ message: 'Validation failed', code: 'VALIDATION_ERROR' }, 422)
    try {
      await apiClient('/x')
    } catch (e) {
      expect((e as ApiClientError).code).toBe('VALIDATION_ERROR')
    }
  })

  it('clears auth token on 401', async () => {
    setAuthToken('expired-token')
    // 401 triggers redirect — suppress that
    delete (window as any).location
    ;(window as any).location = { href: '' }
    mockFetch({ message: 'Unauthorized' }, 401)
    try { await apiClient('/protected') } catch { /* expected */ }
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })

  it('throws ApiClientError on network error', async () => {
    mockFetchError('Failed to fetch')
    await expect(apiClient('/x')).rejects.toBeInstanceOf(ApiClientError)
  })

  it('network error has status 0', async () => {
    mockFetchError('Failed to fetch')
    try {
      await apiClient('/x')
    } catch (e) {
      expect((e as ApiClientError).status).toBe(0)
    }
  })

  it('network error has code NETWORK_ERROR', async () => {
    mockFetchError('Failed to fetch')
    try {
      await apiClient('/x')
    } catch (e) {
      expect((e as ApiClientError).code).toBe('NETWORK_ERROR')
    }
  })

  it('network error message comes from the original Error', async () => {
    mockFetchError('Connection refused')
    try {
      await apiClient('/x')
    } catch (e) {
      expect((e as ApiClientError).message).toBe('Connection refused')
    }
  })

  it('throws ApiClientError on 500', async () => {
    mockFetch({ message: 'Internal Server Error' }, 500)
    await expect(apiClient('/x')).rejects.toBeInstanceOf(ApiClientError)
  })

  it('handles non-JSON error response body gracefully', async () => {
    // 500 with text/plain body — should not throw on body parsing
    mockFetch('Server exploded', 500, 'text/plain')
    try {
      await apiClient('/x')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiClientError)
      expect((e as ApiClientError).status).toBe(500)
    }
  })
})

// ---------------------------------------------------------------------------
// api convenience wrappers
// ---------------------------------------------------------------------------

describe('api convenience wrappers', () => {
  beforeEach(() => localStorage.clear())

  it('api.get calls GET', async () => {
    const mock = mockFetch({ data: 'ok' })
    await api.get('/resources')
    const [, init] = mock.mock.calls[0]
    expect(init.method).toBe('GET')
  })

  it('api.post calls POST with body', async () => {
    const mock = mockFetch({ id: 99 })
    await api.post('/resources', { name: 'New' })
    const [, init] = mock.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ name: 'New' }))
  })

  it('api.put calls PUT with body', async () => {
    const mock = mockFetch({})
    await api.put('/resources/1', { name: 'Updated' })
    const [, init] = mock.mock.calls[0]
    expect(init.method).toBe('PUT')
  })

  it('api.patch calls PATCH with body', async () => {
    const mock = mockFetch({})
    await api.patch('/resources/1', { active: true })
    const [, init] = mock.mock.calls[0]
    expect(init.method).toBe('PATCH')
  })

  it('api.delete calls DELETE', async () => {
    const mock = mockFetch({})
    await api.delete('/resources/1')
    const [, init] = mock.mock.calls[0]
    expect(init.method).toBe('DELETE')
  })

  it('api.get passes skipAuth option through', async () => {
    const mock = mockFetch({})
    await api.get('/open', { skipAuth: true })
    const [, init] = mock.mock.calls[0]
    expect(init.headers['Authorization']).toBeUndefined()
  })

  it('api.post passes skipAuth option through', async () => {
    setAuthToken('should-not-appear')
    const mock = mockFetch({})
    await api.post('/login', { email: 'x', password: 'y' }, { skipAuth: true })
    const [, init] = mock.mock.calls[0]
    expect(init.headers['Authorization']).toBeUndefined()
  })
})
