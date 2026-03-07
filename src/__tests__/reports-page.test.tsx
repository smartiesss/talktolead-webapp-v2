/**
 * W6 — Reports page tests
 *
 * Strategy:
 * - Mock @/lib/api/hooks for dashboard/subordinates/recordings hooks
 * - Test: loading state, API error banner, date range selector, metrics, charts,
 *         team performance bars, CSV export buttons, dummy-data fallback
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ReportsPage from '../app/(dashboard)/reports/page'

// ---------------------------------------------------------------------------
// Next.js mocks
// ---------------------------------------------------------------------------
jest.mock('next/navigation', () => ({
  usePathname: () => '/reports',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

// ---------------------------------------------------------------------------
// Auth mock
// ---------------------------------------------------------------------------
jest.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    user: { name: 'Test Manager', email: 'mgr@test.com', role: 'manager' },
    logout: jest.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// API hooks mock
// ---------------------------------------------------------------------------
const mockUseManagerDashboard = jest.fn()
const mockUseSubordinates = jest.fn()
const mockUseRecordings = jest.fn()

jest.mock('@/lib/api/hooks', () => ({
  useManagerDashboard: () => mockUseManagerDashboard(),
  useSubordinates: () => mockUseSubordinates(),
  useRecordings: () => mockUseRecordings(),
  useApiError: (err: unknown) => (err ? 'API error' : null),
}))

// ---------------------------------------------------------------------------
// URL.createObjectURL / revokeObjectURL (not in jsdom)
// ---------------------------------------------------------------------------
const mockCreateObjectURL = jest.fn(() => 'blob:mock')
const mockRevokeObjectURL = jest.fn()
Object.defineProperty(global.URL, 'createObjectURL', { value: mockCreateObjectURL, writable: true })
Object.defineProperty(global.URL, 'revokeObjectURL', { value: mockRevokeObjectURL, writable: true })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const defaultDashboard = {
  total_recordings: 50,
  total_duration: 3600,
  active_users: 5,
  total_users: 8,
  new_contacts: 20,
  recent_activity: [],
  alerts: [],
  by_user: [
    { user_id: 1, user_name: 'Alice', email: 'a@test.com', recordings: 20, duration: 1800, contacts: 8, activity_level: 'high' as const },
    { user_id: 2, user_name: 'Bob', email: 'b@test.com', recordings: 15, duration: 900, contacts: 5, activity_level: 'medium' as const },
  ],
}

function setupHooks({
  dashLoading = false,
  subLoading = false,
  recLoading = false,
  dashError = null as unknown,
  dashData = null as unknown,
  subData = null as unknown,
  recData = null as unknown,
} = {}) {
  mockUseManagerDashboard.mockReturnValue({ data: dashData, isLoading: dashLoading, error: dashError })
  mockUseSubordinates.mockReturnValue({ data: subData, isLoading: subLoading, error: null })
  mockUseRecordings.mockReturnValue({ data: recData, isLoading: recLoading, error: null })
}

beforeEach(() => {
  jest.clearAllMocks()
  setupHooks() // default: no data, no loading, no error
})

// ===========================================================================
// 1. Page structure
// ===========================================================================
describe('ReportsPage — structure', () => {
  it('renders page title', () => {
    renderPage()
    expect(screen.getByText('Reports')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    renderPage()
    expect(screen.getByText('Analytics and exports')).toBeInTheDocument()
  })

  it('renders date range selector', () => {
    renderPage()
    // The <select> element rendered by Select component
    expect(screen.getByRole('combobox', { hidden: true })).toBeInTheDocument()
  })

  it('renders date range label with dash separator', () => {
    renderPage()
    const label = screen.getByTestId('date-range-label')
    expect(label.textContent).toMatch(/–/)
  })

  it('renders "Recording Activity" chart heading', () => {
    renderPage()
    expect(screen.getByText('Recording Activity')).toBeInTheDocument()
  })

  it('renders "Team Performance" chart heading', () => {
    renderPage()
    const elements = screen.getAllByText('Team Performance')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })
})

// ===========================================================================
// 2. Loading state
// ===========================================================================
describe('ReportsPage — loading', () => {
  it('shows loading spinner when dashboard is loading', () => {
    setupHooks({ dashLoading: true })
    renderPage()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows loading spinner when recordings are loading', () => {
    setupHooks({ recLoading: true })
    renderPage()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows loading spinner when subordinates are loading', () => {
    setupHooks({ subLoading: true })
    renderPage()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('hides spinner when not loading', () => {
    setupHooks({ dashLoading: false, subLoading: false, recLoading: false })
    renderPage()
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
  })
})

// ===========================================================================
// 3. API error banner
// ===========================================================================
describe('ReportsPage — API error banner', () => {
  it('shows alert banner when dashboard fails', () => {
    setupHooks({ dashError: new Error('Network error') })
    renderPage()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows "demo data" in alert banner', () => {
    setupHooks({ dashError: new Error('fail') })
    renderPage()
    expect(screen.getByText(/showing demo data/i)).toBeInTheDocument()
  })

  it('shows API error message in banner', () => {
    setupHooks({ dashError: new Error('fail') })
    renderPage()
    expect(screen.getByText(/API error/i)).toBeInTheDocument()
  })

  it('does not show banner when no error', () => {
    setupHooks({ dashError: null })
    renderPage()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

// ===========================================================================
// 4. Metrics grid — dummy data fallback
// ===========================================================================
describe('ReportsPage — metrics (dummy fallback)', () => {
  it('renders metrics grid container', () => {
    renderPage()
    expect(screen.getByTestId('metrics-grid')).toBeInTheDocument()
  })

  it('shows total recordings metric element', () => {
    renderPage()
    expect(screen.getByTestId('metric-recordings')).toBeInTheDocument()
  })

  it('shows hours metric element', () => {
    renderPage()
    const el = screen.getByTestId('metric-hours')
    expect(el.textContent).toMatch(/h/)
  })

  it('shows avg per salesperson metric', () => {
    renderPage()
    expect(screen.getByTestId('metric-avg')).toBeInTheDocument()
  })

  it('shows new contacts metric', () => {
    renderPage()
    expect(screen.getByTestId('metric-contacts')).toBeInTheDocument()
  })
})

// ===========================================================================
// 5. Metrics — real API data
// ===========================================================================
describe('ReportsPage — metrics from real API', () => {
  it('shows real recording count', () => {
    setupHooks({ dashData: { ...defaultDashboard, total_recordings: 99 } })
    renderPage()
    expect(screen.getByTestId('metric-recordings').textContent).toBe('99')
  })

  it('shows real new contacts count', () => {
    setupHooks({ dashData: { ...defaultDashboard, new_contacts: 42 } })
    renderPage()
    expect(screen.getByTestId('metric-contacts').textContent).toBe('42')
  })

  it('computes hours from API duration (7200 sec = 2h 0m)', () => {
    setupHooks({ dashData: { ...defaultDashboard, total_duration: 7200 } })
    renderPage()
    expect(screen.getByTestId('metric-hours').textContent).toContain('2h')
  })

  it('computes avg recordings per active user (99 / 3 = 33)', () => {
    setupHooks({ dashData: { ...defaultDashboard, total_recordings: 99, active_users: 3 } })
    renderPage()
    expect(screen.getByTestId('metric-avg').textContent).toBe('33')
  })

  it('shows 0 avg when no active users', () => {
    setupHooks({ dashData: { ...defaultDashboard, total_recordings: 99, active_users: 0 } })
    renderPage()
    expect(screen.getByTestId('metric-avg').textContent).toBe('0')
  })
})

// ===========================================================================
// 6. Activity chart
// ===========================================================================
describe('ReportsPage — activity chart', () => {
  it('renders activity chart container', () => {
    renderPage()
    expect(screen.getByTestId('activity-chart')).toBeInTheDocument()
  })

  it('renders bars for weekly activity', () => {
    renderPage()
    const chart = screen.getByTestId('activity-chart')
    const bars = chart.querySelectorAll('[data-testid^="bar-"]')
    expect(bars.length).toBeGreaterThan(0)
  })
})

// ===========================================================================
// 7. Team performance
// ===========================================================================
describe('ReportsPage — team performance', () => {
  it('renders team performance section', () => {
    renderPage()
    expect(screen.getByTestId('team-performance')).toBeInTheDocument()
  })

  it('renders team member names from API by_user', () => {
    setupHooks({ dashData: defaultDashboard })
    renderPage()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders performance bars for each user', () => {
    setupHooks({ dashData: defaultDashboard })
    renderPage()
    const perfSection = screen.getByTestId('team-performance')
    const bars = perfSection.querySelectorAll('[data-testid^="perf-bar-"]')
    expect(bars.length).toBe(2)
  })

  it('first user bar has full width (100%)', () => {
    setupHooks({ dashData: defaultDashboard })
    renderPage()
    const bar = screen.getByTestId('perf-bar-1')
    expect(bar.getAttribute('style')).toContain('100%')
  })
})

// ===========================================================================
// 8. Date range selector
// ===========================================================================
describe('ReportsPage — date range selector', () => {
  it('defaults to week range', () => {
    renderPage()
    const select = screen.getByRole('combobox', { hidden: true }) as HTMLSelectElement
    expect(select.value).toBe('week')
  })

  it('changes to month range when selected', () => {
    renderPage()
    const select = screen.getByRole('combobox', { hidden: true })
    fireEvent.change(select, { target: { value: 'month' } })
    expect((select as HTMLSelectElement).value).toBe('month')
  })

  it('shows "vs last month" trend text after switching to month', () => {
    renderPage()
    const select = screen.getByRole('combobox', { hidden: true })
    fireEvent.change(select, { target: { value: 'month' } })
    const trendTexts = screen.getAllByText(/vs last month/i)
    expect(trendTexts.length).toBeGreaterThan(0)
  })

  it('updates trend text when switching to quarter', () => {
    renderPage()
    const select = screen.getByRole('combobox', { hidden: true })
    fireEvent.change(select, { target: { value: 'quarter' } })
    const trendTexts = screen.getAllByText(/vs last quarter/i)
    expect(trendTexts.length).toBeGreaterThan(0)
  })

  it('date range label is visible after change', () => {
    renderPage()
    fireEvent.change(screen.getByRole('combobox', { hidden: true }), { target: { value: 'year' } })
    expect(screen.getByTestId('date-range-label')).toBeInTheDocument()
  })
})

// ===========================================================================
// 9. Export section
// ===========================================================================
describe('ReportsPage — export section', () => {
  it('renders export section heading', () => {
    renderPage()
    expect(screen.getByText('Export Reports')).toBeInTheDocument()
  })

  it('renders Activity Report card', () => {
    renderPage()
    expect(screen.getByText('Activity Report')).toBeInTheDocument()
  })

  it('renders Team Performance card (appears in chart + export)', () => {
    renderPage()
    const elements = screen.getAllByText('Team Performance')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Contacts Export card', () => {
    renderPage()
    expect(screen.getByText('Contacts Export')).toBeInTheDocument()
  })

  it('renders 3 CSV badges', () => {
    renderPage()
    const csvBadges = screen.getAllByText('CSV')
    expect(csvBadges).toHaveLength(3)
  })

  it('renders activity export button', () => {
    renderPage()
    expect(screen.getByTestId('export-activity')).toBeInTheDocument()
  })

  it('renders team export button', () => {
    renderPage()
    expect(screen.getByTestId('export-team')).toBeInTheDocument()
  })

  it('renders contacts export button', () => {
    renderPage()
    expect(screen.getByTestId('export-contacts')).toBeInTheDocument()
  })

  it('clicking activity export triggers CSV download', () => {
    renderPage()
    fireEvent.click(screen.getByTestId('export-activity'))
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
  })

  it('clicking team export triggers CSV download', () => {
    renderPage()
    fireEvent.click(screen.getByTestId('export-team'))
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
  })

  it('clicking contacts export triggers CSV download', () => {
    renderPage()
    fireEvent.click(screen.getByTestId('export-contacts'))
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
  })

  it('export creates Blob with text/csv content type', () => {
    renderPage()
    fireEvent.click(screen.getByTestId('export-activity'))
    const blob: Blob = mockCreateObjectURL.mock.calls[0][0]
    expect(blob.type).toContain('text/csv')
  })

  it('export cleans up object URL after download', () => {
    renderPage()
    fireEvent.click(screen.getByTestId('export-activity'))
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })
})

// ---------------------------------------------------------------------------
// Helper (defined after tests to keep `renderPage` in scope)
// ---------------------------------------------------------------------------
function renderPage() {
  return render(<ReportsPage />)
}
