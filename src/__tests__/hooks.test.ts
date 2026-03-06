/**
 * Tests for API hooks (hooks.ts)
 *
 * Strategy:
 * - Mock @/lib/api/client so api.get/post/put/delete are jest.fn()
 * - Wrap hooks with QueryClientProvider (fresh QueryClient per test)
 * - Use @testing-library/react renderHook + act for async state
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  queryKeys,
  useCurrentUser,
  useRecordings,
  useRecording,
  useRecordingStatus,
  useDeleteRecording,
  useContacts,
  useContact,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useManagerDashboard,
  useSubordinates,
  useSubordinateRecordings,
  useTeamSummary,
  useApiError,
} from '../lib/api/hooks'

// ---------------------------------------------------------------------------
// Mock the API client
// ---------------------------------------------------------------------------
jest.mock('@/lib/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    status: number
    code?: string
    details?: unknown
    constructor(message: string, status: number, code?: string, details?: unknown) {
      super(message)
      this.name = 'ApiClientError'
      this.status = status
      this.code = code
      this.details = details
    }
  },
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}))

// We need the mocked version — also grab ApiClientError from the mock
import { api, ApiClientError } from '@/lib/api/client'
const mockApi = api as jest.Mocked<typeof api>

// ---------------------------------------------------------------------------
// Test wrapper factory — fresh QueryClient each time
// ---------------------------------------------------------------------------
function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,       // don't retry on failure in tests
        gcTime: 0,          // no garbage-collection delay
      },
      mutations: {
        retry: false,
      },
    },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  return { wrapper: Wrapper, queryClient }
}

// ---------------------------------------------------------------------------
// Sample fixtures
// ---------------------------------------------------------------------------
const mockUser = {
  id: 1,
  uuid: 'u-uuid',
  email: 'test@example.com',
  display_name: 'Test User',
  role: 'user' as const,
  created_at: '2026-01-01T00:00:00Z',
}

const mockRecording = {
  id: 1,
  user_id: 1,
  audio_url: 'https://cdn.example.com/audio.mp3',
  status: 'completed' as const,
  created_at: '2026-01-01T00:00:00Z',
}

const mockContact = {
  id: 42,
  user_id: 1,
  first_name: 'Jane',
  last_name: 'Smith',
  primary_email: 'jane@example.com',
  created_at: '2026-01-01T00:00:00Z',
}

const mockDashboard = {
  total_recordings: 10,
  total_duration: 3600,
  active_users: 3,
  total_users: 5,
  new_contacts: 2,
  recent_activity: [],
  alerts: [],
  by_user: [],
}

const mockSubordinate = {
  id: 7,
  uuid: 's-uuid',
  email: 'sub@example.com',
  role: 'user',
  status: 'active' as const,
  created_at: '2026-01-01T00:00:00Z',
}

const mockUserSummary = {
  user_id: 7,
  user_name: 'Sub User',
  email: 'sub@example.com',
  recordings: 5,
  duration: 1200,
  contacts: 3,
  activity_level: 'medium' as const,
}

// ---------------------------------------------------------------------------
// queryKeys
// ---------------------------------------------------------------------------
describe('queryKeys', () => {
  it('user key is a constant tuple', () => {
    expect(queryKeys.user).toEqual(['user'])
  })

  it('recordings key is a constant tuple', () => {
    expect(queryKeys.recordings).toEqual(['recordings'])
  })

  it('recording(id) includes id', () => {
    expect(queryKeys.recording('123')).toEqual(['recordings', '123'])
  })

  it('contacts key is a constant tuple', () => {
    expect(queryKeys.contacts).toEqual(['contacts'])
  })

  it('contact(id) includes id', () => {
    expect(queryKeys.contact('99')).toEqual(['contacts', '99'])
  })

  it('dashboard key is a constant tuple', () => {
    expect(queryKeys.dashboard).toEqual(['dashboard'])
  })

  it('subordinates key is a constant tuple', () => {
    expect(queryKeys.subordinates).toEqual(['subordinates'])
  })

  it('subordinate(id) includes id', () => {
    expect(queryKeys.subordinate('5')).toEqual(['subordinates', '5'])
  })

  it('subordinateRecordings(id) includes id and "recordings"', () => {
    expect(queryKeys.subordinateRecordings('5')).toEqual(['subordinates', '5', 'recordings'])
  })

  it('teamSummary key is a constant tuple', () => {
    expect(queryKeys.teamSummary).toEqual(['team-summary'])
  })
})

// ---------------------------------------------------------------------------
// useCurrentUser
// ---------------------------------------------------------------------------
describe('useCurrentUser', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns user data on success', async () => {
    mockApi.get.mockResolvedValueOnce(mockUser)
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockUser)
  })

  it('calls the correct endpoint', async () => {
    mockApi.get.mockResolvedValueOnce(mockUser)
    const { wrapper } = makeWrapper()
    renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(mockApi.get).toHaveBeenCalledTimes(1))
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('user'))
  })

  it('surfaces error on API failure', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Unauthorized'))
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// useRecordings
// ---------------------------------------------------------------------------
describe('useRecordings', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns array of recordings', async () => {
    mockApi.get.mockResolvedValueOnce([mockRecording])
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRecordings(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockRecording])
  })

  it('handles empty array', async () => {
    mockApi.get.mockResolvedValueOnce([])
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRecordings(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it('surfaces error on failure', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Server error'))
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRecordings(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// useRecording
// ---------------------------------------------------------------------------
describe('useRecording', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns recording data for given id', async () => {
    mockApi.get.mockResolvedValueOnce(mockRecording)
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRecording('1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockRecording)
  })

  it('calls endpoint containing the id', async () => {
    mockApi.get.mockResolvedValueOnce(mockRecording)
    const { wrapper } = makeWrapper()
    renderHook(() => useRecording('42'), { wrapper })

    await waitFor(() => expect(mockApi.get).toHaveBeenCalledTimes(1))
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('42'))
  })

  it('is disabled when id is empty string', () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRecording(''), { wrapper })

    // enabled=false → stays in 'pending' without fetching
    expect(result.current.fetchStatus).toBe('idle')
    expect(mockApi.get).not.toHaveBeenCalled()
  })

  it('surfaces error on API failure', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Not found'))
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRecording('999'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// useRecordingStatus
// ---------------------------------------------------------------------------
describe('useRecordingStatus', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns status object on success', async () => {
    mockApi.get.mockResolvedValueOnce({ status: 'completed' })
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRecordingStatus('1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ status: 'completed' })
  })

  it('is disabled when enabled=false', () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRecordingStatus('1', false), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockApi.get).not.toHaveBeenCalled()
  })

  it('is disabled when id is empty', () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRecordingStatus(''), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
  })

  it('calls endpoint containing id and status', async () => {
    mockApi.get.mockResolvedValueOnce({ status: 'processing' })
    const { wrapper } = makeWrapper()
    renderHook(() => useRecordingStatus('77'), { wrapper })

    await waitFor(() => expect(mockApi.get).toHaveBeenCalled())
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('77'))
  })
})

// ---------------------------------------------------------------------------
// useDeleteRecording
// ---------------------------------------------------------------------------
describe('useDeleteRecording', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls delete endpoint with the recording id', async () => {
    mockApi.delete.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValue([]) // for query invalidation refetch
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteRecording(), { wrapper })

    await act(async () => {
      result.current.mutate('5')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.delete).toHaveBeenCalledWith(expect.stringContaining('5'))
  })

  it('sets error state on failure', async () => {
    mockApi.delete.mockRejectedValueOnce(new Error('Delete failed'))
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteRecording(), { wrapper })

    await act(async () => {
      result.current.mutate('5')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// useContacts
// ---------------------------------------------------------------------------
describe('useContacts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns array of contacts', async () => {
    mockApi.get.mockResolvedValueOnce([mockContact])
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockContact])
  })

  it('handles empty contact list', async () => {
    mockApi.get.mockResolvedValueOnce([])
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useContacts(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// useContact
// ---------------------------------------------------------------------------
describe('useContact', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns contact for given id', async () => {
    mockApi.get.mockResolvedValueOnce(mockContact)
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useContact('42'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockContact)
  })

  it('is disabled when id is empty', () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useContact(''), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockApi.get).not.toHaveBeenCalled()
  })

  it('calls endpoint containing the id', async () => {
    mockApi.get.mockResolvedValueOnce(mockContact)
    const { wrapper } = makeWrapper()
    renderHook(() => useContact('42'), { wrapper })

    await waitFor(() => expect(mockApi.get).toHaveBeenCalled())
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('42'))
  })
})

// ---------------------------------------------------------------------------
// useCreateContact
// ---------------------------------------------------------------------------
describe('useCreateContact', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls create endpoint with contact data', async () => {
    const newContact = { first_name: 'New', last_name: 'Person', primary_email: 'new@example.com' }
    mockApi.post.mockResolvedValueOnce({ ...mockContact, ...newContact })
    mockApi.get.mockResolvedValue([]) // refetch after invalidation
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateContact(), { wrapper })

    await act(async () => {
      result.current.mutate(newContact)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining('contact'),
      newContact
    )
  })

  it('sets error on failure', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Validation error'))
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateContact(), { wrapper })

    await act(async () => {
      result.current.mutate({ first_name: 'Bad' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// useUpdateContact
// ---------------------------------------------------------------------------
describe('useUpdateContact', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls update endpoint with id and data', async () => {
    mockApi.put.mockResolvedValueOnce({ ...mockContact, first_name: 'Updated' })
    mockApi.get.mockResolvedValue([]) // refetch
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateContact(), { wrapper })

    await act(async () => {
      result.current.mutate({ id: '42', data: { first_name: 'Updated' } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.put).toHaveBeenCalledWith(
      expect.stringContaining('42'),
      { first_name: 'Updated' }
    )
  })

  it('sets error on failure', async () => {
    mockApi.put.mockRejectedValueOnce(new Error('Not found'))
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateContact(), { wrapper })

    await act(async () => {
      result.current.mutate({ id: '999', data: {} })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// useDeleteContact
// ---------------------------------------------------------------------------
describe('useDeleteContact', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls delete endpoint with contact id', async () => {
    mockApi.delete.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValue([]) // refetch
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteContact(), { wrapper })

    await act(async () => {
      result.current.mutate('42')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.delete).toHaveBeenCalledWith(expect.stringContaining('42'))
  })

  it('sets error on failure', async () => {
    mockApi.delete.mockRejectedValueOnce(new Error('Delete failed'))
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteContact(), { wrapper })

    await act(async () => {
      result.current.mutate('42')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// useManagerDashboard
// ---------------------------------------------------------------------------
describe('useManagerDashboard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns dashboard data on success', async () => {
    mockApi.get.mockResolvedValueOnce(mockDashboard)
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useManagerDashboard(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockDashboard)
  })

  it('surfaces error on API failure', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Forbidden'))
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useManagerDashboard(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// useSubordinates
// ---------------------------------------------------------------------------
describe('useSubordinates', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns array of subordinates', async () => {
    mockApi.get.mockResolvedValueOnce([mockSubordinate])
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useSubordinates(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockSubordinate])
  })

  it('handles empty subordinates list', async () => {
    mockApi.get.mockResolvedValueOnce([])
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useSubordinates(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// useSubordinateRecordings
// ---------------------------------------------------------------------------
describe('useSubordinateRecordings', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns recordings for given subordinate id', async () => {
    mockApi.get.mockResolvedValueOnce([mockRecording])
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useSubordinateRecordings('7'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockRecording])
  })

  it('calls endpoint containing subordinate id', async () => {
    mockApi.get.mockResolvedValueOnce([mockRecording])
    const { wrapper } = makeWrapper()
    renderHook(() => useSubordinateRecordings('7'), { wrapper })

    await waitFor(() => expect(mockApi.get).toHaveBeenCalled())
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('7'))
  })

  it('is disabled when id is empty', () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useSubordinateRecordings(''), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockApi.get).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// useTeamSummary
// ---------------------------------------------------------------------------
describe('useTeamSummary', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns team summary array', async () => {
    mockApi.get.mockResolvedValueOnce([mockUserSummary])
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useTeamSummary(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockUserSummary])
  })

  it('surfaces error on failure', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Forbidden'))
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useTeamSummary(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// useApiError
// ---------------------------------------------------------------------------
describe('useApiError', () => {
  it('returns null for null', () => {
    expect(useApiError(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(useApiError(undefined)).toBeNull()
  })

  it('returns message for ApiClientError', () => {
    // Use our local mock class
    const err = new ApiClientError('Token expired', 401, 'UNAUTHORIZED')
    expect(useApiError(err)).toBe('Token expired')
  })

  it('returns message for generic Error', () => {
    expect(useApiError(new Error('Something broke'))).toBe('Something broke')
  })

  it('returns fallback message for unknown error shape', () => {
    expect(useApiError({ weird: 'object' })).toBe('An unexpected error occurred')
  })

  it('returns fallback for plain string', () => {
    expect(useApiError('raw string')).toBe('An unexpected error occurred')
  })

  it('returns fallback for number', () => {
    expect(useApiError(500)).toBe('An unexpected error occurred')
  })
})

// ---------------------------------------------------------------------------
// ApiClientError shape (re-exported from hooks)
// ---------------------------------------------------------------------------
describe('ApiClientError', () => {
  it('has the correct name', () => {
    const err = new ApiClientError('Bad request', 400)
    expect(err.name).toBe('ApiClientError')
  })

  it('stores status code', () => {
    const err = new ApiClientError('Not found', 404)
    expect(err.status).toBe(404)
  })

  it('stores optional code', () => {
    const err = new ApiClientError('Rate limited', 429, 'RATE_LIMIT')
    expect(err.code).toBe('RATE_LIMIT')
  })

  it('stores optional details', () => {
    const details = { field: 'email', issue: 'invalid' }
    const err = new ApiClientError('Validation', 422, 'VALIDATION', details)
    expect(err.details).toEqual(details)
  })

  it('is instanceof Error', () => {
    const err = new ApiClientError('Oops', 500)
    expect(err instanceof Error).toBe(true)
  })

  it('message is accessible', () => {
    const err = new ApiClientError('Unauthorized', 401)
    expect(err.message).toBe('Unauthorized')
  })
})
