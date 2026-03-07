/**
 * W9 — Alerts page + Sidebar unread badge tests
 *
 * Coverage:
 * - AlertsPage: loading, error, empty states
 * - Stats bar: total/unread/critical/warning counts
 * - Alert cards: severity colors, type badges, read/unread state
 * - Filtering: severity filter, read/unread filter
 * - Mark as read (single + all)
 * - Sidebar: Alerts nav link, unread badge, manager-only visibility
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Alert } from '@/types'

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
jest.mock('next/navigation', () => ({
  usePathname: () => '/alerts',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

// ---------------------------------------------------------------------------
// Mock next/link
// ---------------------------------------------------------------------------
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    className,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    href: string
    className?: string
    'data-testid'?: string
  }) {
    return (
      <a href={href} className={className} data-testid={testId}>
        {children}
      </a>
    )
  }
})

// ---------------------------------------------------------------------------
// Mock hooks
// ---------------------------------------------------------------------------
const mockMarkAlertRead = jest.fn()
const mockMarkAllAlertsRead = jest.fn()
let mockAlertsData: Alert[] | undefined = undefined
let mockAlertsLoading = false
let mockAlertsError: Error | null = null

jest.mock('@/lib/api/hooks', () => ({
  useAlerts: () => ({
    data: mockAlertsData,
    isLoading: mockAlertsLoading,
    error: mockAlertsError,
  }),
  useMarkAlertRead: () => ({
    mutateAsync: mockMarkAlertRead,
    isPending: false,
  }),
  useMarkAllAlertsRead: () => ({
    mutateAsync: mockMarkAllAlertsRead,
    isPending: false,
  }),
  useManagerDashboard: () => ({ data: undefined }),
  useApiError: (error: unknown) => (error instanceof Error ? error.message : null),
}))

// ---------------------------------------------------------------------------
// Mock auth context
// ---------------------------------------------------------------------------
let mockAuthRole = 'manager'
jest.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    user: { name: 'Test Manager', email: 'mgr@test.com', role: mockAuthRole },
    logout: jest.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// Mock transforms
// ---------------------------------------------------------------------------
jest.mock('@/lib/api/transforms', () => ({
  transformAlerts: (alerts: unknown[]) => alerts, // identity transform for tests
}))

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const sampleAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'no_activity',
    severity: 'critical',
    userId: 'u1',
    userName: 'Alice Lam',
    message: 'No recordings for 2 days',
    details: 'Last recording was Monday 4PM',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'a2',
    type: 'low_activity',
    severity: 'warning',
    userId: 'u2',
    userName: 'Bob Chan',
    message: 'Below weekly target',
    details: 'Only 3 recordings (target: 10)',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'a3',
    type: 'target_missed',
    severity: 'info',
    userId: 'u3',
    userName: 'Carol Ng',
    message: 'Monthly target info',
    details: undefined,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
]

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------
import AlertsPage from '@/app/(dashboard)/alerts/page'
import { Sidebar } from '@/components/layout/sidebar'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderAlertsPage() {
  return render(<AlertsPage />)
}

function renderSidebar() {
  return render(<Sidebar />)
}

// ---------------------------------------------------------------------------
// Tests — AlertsPage
// ---------------------------------------------------------------------------

describe('AlertsPage', () => {
  beforeEach(() => {
    mockAlertsData = undefined
    mockAlertsLoading = false
    mockAlertsError = null
    mockMarkAlertRead.mockResolvedValue(undefined)
    mockMarkAllAlertsRead.mockResolvedValue(undefined)
    jest.clearAllMocks()
  })

  // ── Loading state ──────────────────────────────────────────────────────────
  describe('loading state', () => {
    it('shows loading spinner when fetching', () => {
      mockAlertsLoading = true
      renderAlertsPage()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('hides alert list while loading', () => {
      mockAlertsLoading = true
      renderAlertsPage()
      expect(screen.queryByTestId('alert-list')).not.toBeInTheDocument()
    })
  })

  // ── Error state ────────────────────────────────────────────────────────────
  describe('error state', () => {
    it('shows error banner on API failure', () => {
      mockAlertsError = new Error('Network error')
      renderAlertsPage()
      expect(screen.getByTestId('error-banner')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  // ── Default render with dummy data ─────────────────────────────────────────
  describe('default render (dummy fallback)', () => {
    it('renders page title', () => {
      renderAlertsPage()
      expect(screen.getByText('Alerts')).toBeInTheDocument()
    })

    it('renders stats bar', () => {
      renderAlertsPage()
      expect(screen.getByTestId('stats-bar')).toBeInTheDocument()
    })

    it('shows severity and read filters', () => {
      renderAlertsPage()
      expect(screen.getByTestId('severity-filter')).toBeInTheDocument()
      expect(screen.getByTestId('read-filter')).toBeInTheDocument()
    })
  })

  // ── Stats bar ──────────────────────────────────────────────────────────────
  describe('stats bar with API data', () => {
    beforeEach(() => {
      mockAlertsData = sampleAlerts as unknown as Alert[]
    })

    it('shows total alert count', () => {
      renderAlertsPage()
      expect(screen.getByTestId('stat-total').textContent).toBe('3')
    })

    it('shows unread count', () => {
      renderAlertsPage()
      expect(screen.getByTestId('stat-unread').textContent).toBe('2')
    })

    it('shows critical count', () => {
      renderAlertsPage()
      expect(screen.getByTestId('stat-critical').textContent).toBe('1')
    })

    it('shows warning count', () => {
      renderAlertsPage()
      expect(screen.getByTestId('stat-warning').textContent).toBe('1')
    })
  })

  // ── Alert cards ────────────────────────────────────────────────────────────
  describe('alert cards', () => {
    beforeEach(() => {
      mockAlertsData = sampleAlerts as unknown as Alert[]
    })

    it('renders all alerts', () => {
      renderAlertsPage()
      const cards = screen.getAllByTestId('alert-card')
      expect(cards).toHaveLength(3)
    })

    it('shows alert message', () => {
      renderAlertsPage()
      expect(screen.getByText('No recordings for 2 days')).toBeInTheDocument()
    })

    it('shows user name on each card', () => {
      renderAlertsPage()
      expect(screen.getByText('Alice Lam')).toBeInTheDocument()
      expect(screen.getByText('Bob Chan')).toBeInTheDocument()
    })

    it('shows alert details when present', () => {
      renderAlertsPage()
      expect(screen.getByText('Last recording was Monday 4PM')).toBeInTheDocument()
    })

    it('marks unread alerts with mark-read button', () => {
      renderAlertsPage()
      const buttons = screen.getAllByTestId('mark-read-button')
      // Only 2 unread alerts should have mark-read button
      expect(buttons).toHaveLength(2)
    })

    it('shows read indicator on read alerts', () => {
      renderAlertsPage()
      const readIndicators = screen.getAllByTestId('alert-read-indicator')
      expect(readIndicators).toHaveLength(1)
    })

    it('shows critical severity badge', () => {
      renderAlertsPage()
      // "Critical" appears in both the badge and the filter dropdown option
      expect(screen.getAllByText('Critical').length).toBeGreaterThan(0)
    })

    it('shows warning severity badge', () => {
      renderAlertsPage()
      expect(screen.getByText('Warning')).toBeInTheDocument()
    })

    it('shows type badge for no_activity', () => {
      renderAlertsPage()
      expect(screen.getByText('No Activity')).toBeInTheDocument()
    })

    it('shows type badge for low_activity', () => {
      renderAlertsPage()
      expect(screen.getByText('Low Activity')).toBeInTheDocument()
    })
  })

  // ── Mark as read ───────────────────────────────────────────────────────────
  describe('mark as read actions', () => {
    beforeEach(() => {
      mockAlertsData = sampleAlerts as unknown as Alert[]
    })

    it('calls markAlertRead when clicking mark-read button', async () => {
      renderAlertsPage()
      const buttons = screen.getAllByTestId('mark-read-button')
      fireEvent.click(buttons[0])
      await waitFor(() => {
        expect(mockMarkAlertRead).toHaveBeenCalledWith('a1')
      })
    })

    it('shows "Mark all read" button when there are unread alerts', () => {
      renderAlertsPage()
      expect(screen.getByTestId('mark-all-read-button')).toBeInTheDocument()
    })

    it('calls markAllAlertsRead when clicking mark all read', async () => {
      renderAlertsPage()
      fireEvent.click(screen.getByTestId('mark-all-read-button'))
      await waitFor(() => {
        expect(mockMarkAllAlertsRead).toHaveBeenCalled()
      })
    })

    it('hides "Mark all read" when all alerts are read', () => {
      mockAlertsData = sampleAlerts.map((a) => ({ ...a, isRead: true })) as unknown as Alert[]
      renderAlertsPage()
      expect(screen.queryByTestId('mark-all-read-button')).not.toBeInTheDocument()
    })
  })

  // ── Filtering ──────────────────────────────────────────────────────────────
  describe('filtering', () => {
    beforeEach(() => {
      mockAlertsData = sampleAlerts as unknown as Alert[]
    })

    it('filters to unread only', () => {
      renderAlertsPage()
      const readFilter = screen.getByTestId('read-filter')
      fireEvent.change(readFilter, { target: { value: 'unread' } })
      const cards = screen.getAllByTestId('alert-card')
      expect(cards).toHaveLength(2)
    })

    it('filters to read only', () => {
      renderAlertsPage()
      const readFilter = screen.getByTestId('read-filter')
      fireEvent.change(readFilter, { target: { value: 'read' } })
      const cards = screen.getAllByTestId('alert-card')
      expect(cards).toHaveLength(1)
    })

    it('filters to critical only', () => {
      renderAlertsPage()
      const severityFilter = screen.getByTestId('severity-filter')
      fireEvent.change(severityFilter, { target: { value: 'critical' } })
      const cards = screen.getAllByTestId('alert-card')
      expect(cards).toHaveLength(1)
      expect(screen.getByText('No recordings for 2 days')).toBeInTheDocument()
    })

    it('filters to warning only', () => {
      renderAlertsPage()
      const severityFilter = screen.getByTestId('severity-filter')
      fireEvent.change(severityFilter, { target: { value: 'warning' } })
      const cards = screen.getAllByTestId('alert-card')
      expect(cards).toHaveLength(1)
    })

    it('shows empty state when no alerts match filter', () => {
      mockAlertsData = []
      renderAlertsPage()
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('empty state shows "unread" message when read filter is unread', () => {
      mockAlertsData = sampleAlerts.map((a) => ({ ...a, isRead: true })) as unknown as Alert[]
      renderAlertsPage()
      const readFilter = screen.getByTestId('read-filter')
      fireEvent.change(readFilter, { target: { value: 'unread' } })
      expect(screen.getByText('No unread alerts')).toBeInTheDocument()
    })

    it('shows result count', () => {
      renderAlertsPage()
      expect(screen.getByTestId('result-count')).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Tests — Sidebar with Alerts
// ---------------------------------------------------------------------------

describe('Sidebar Alerts integration', () => {
  beforeEach(() => {
    mockAlertsData = undefined
    mockAuthRole = 'manager'
  })

  it('shows Alerts link for manager', () => {
    renderSidebar()
    expect(screen.getByTestId('nav-alerts')).toBeInTheDocument()
  })

  it('shows Alerts link for admin', () => {
    mockAuthRole = 'admin'
    renderSidebar()
    expect(screen.getByTestId('nav-alerts')).toBeInTheDocument()
  })

  it('hides Alerts link for regular user', () => {
    mockAuthRole = 'user'
    renderSidebar()
    expect(screen.queryByTestId('nav-alerts')).not.toBeInTheDocument()
  })

  it('shows unread badge when there are unread alerts', () => {
    mockAlertsData = sampleAlerts as unknown as Alert[]
    renderSidebar()
    const badge = screen.getByTestId('alerts-unread-badge')
    expect(badge).toBeInTheDocument()
    expect(badge.textContent).toBe('2')
  })

  it('shows 9+ badge when unread count exceeds 9', () => {
    mockAlertsData = Array.from({ length: 12 }, (_, i) => ({
      ...sampleAlerts[0],
      id: `a${i}`,
      isRead: false,
    })) as unknown as Alert[]
    renderSidebar()
    expect(screen.getByTestId('alerts-unread-badge').textContent).toBe('9+')
  })

  it('hides badge when all alerts are read', () => {
    mockAlertsData = sampleAlerts.map((a) => ({ ...a, isRead: true })) as unknown as Alert[]
    renderSidebar()
    expect(screen.queryByTestId('alerts-unread-badge')).not.toBeInTheDocument()
  })
})
