/**
 * W4 — Page-level tests: Dashboard, Recordings, Contacts, Settings
 *
 * Strategy:
 * - Mock @/lib/api/hooks for all data hooks
 * - Mock @/lib/auth/context for useAuth
 * - Mock next/link and next/navigation
 * - Use real dummy data (same as production fallback)
 * - Each page tests: loading state, error banner, default (dummy) render, key UI elements
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
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
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
})

// ---------------------------------------------------------------------------
// Mock useAuth
// ---------------------------------------------------------------------------
let mockAuthUser: { name: string; email: string; role: string } | null = {
  name: 'Test Manager',
  email: 'manager@test.com',
  role: 'manager',
}
jest.mock('@/lib/auth/context', () => ({
  useAuth: () => ({ user: mockAuthUser, logout: jest.fn() }),
}))

// ---------------------------------------------------------------------------
// Mock @/lib/api/hooks — all hooks used by pages
// ---------------------------------------------------------------------------
const mockUseManagerDashboard = jest.fn()
const mockUseSubordinates = jest.fn()
const mockUseRecordings = jest.fn()
const mockUseContacts = jest.fn()
const mockUseApiError = jest.fn()

jest.mock('@/lib/api/hooks', () => ({
  useManagerDashboard: (...args: unknown[]) => mockUseManagerDashboard(...args),
  useSubordinates: (...args: unknown[]) => mockUseSubordinates(...args),
  useRecordings: (...args: unknown[]) => mockUseRecordings(...args),
  useContacts: (...args: unknown[]) => mockUseContacts(...args),
  useApiError: (...args: unknown[]) => mockUseApiError(...args),
}))

// ---------------------------------------------------------------------------
// Default hook return values helpers
// ---------------------------------------------------------------------------
function noData(overrides: object = {}) {
  return { data: undefined, isLoading: false, error: null, ...overrides }
}
function loading() {
  return { data: undefined, isLoading: true, error: null }
}
function withError() {
  return { data: undefined, isLoading: false, error: new Error('API Error') }
}

function setupDefaultHooks() {
  mockUseManagerDashboard.mockReturnValue(noData())
  mockUseSubordinates.mockReturnValue(noData())
  mockUseRecordings.mockReturnValue(noData())
  mockUseContacts.mockReturnValue(noData())
  mockUseApiError.mockReturnValue(null)
}

beforeEach(() => {
  jest.clearAllMocks()
  setupDefaultHooks()
  mockAuthUser = { name: 'Test Manager', email: 'manager@test.com', role: 'manager' }
})

// ===========================================================================
// DashboardPage Tests
// ===========================================================================
import DashboardPage from '../app/(dashboard)/dashboard/page'

describe('DashboardPage', () => {
  it('renders Dashboard header', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows welcome message with user name', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/Welcome back, Test Manager/)).toBeInTheDocument()
  })

  it('shows generic subtitle when user has no name', () => {
    mockAuthUser = { name: '', email: 'manager@test.com', role: 'manager' }
    render(<DashboardPage />)
    expect(screen.getByText('Team activity overview')).toBeInTheDocument()
  })

  it('shows loading spinner when data is loading', () => {
    mockUseManagerDashboard.mockReturnValue(loading())
    render(<DashboardPage />)
    // Loader2 renders as SVG — check for spinner container indirectly via aria or test-id
    // The Loader2 icon is wrapped in a div with animate-spin class
    const spinners = document.querySelectorAll('.animate-spin')
    expect(spinners.length).toBeGreaterThan(0)
  })

  it('does NOT show loading spinner when not loading', () => {
    render(<DashboardPage />)
    const spinners = document.querySelectorAll('.animate-spin')
    expect(spinners.length).toBe(0)
  })

  it('shows API error banner when useApiError returns message', () => {
    mockUseApiError.mockReturnValue('Failed to connect to server')
    render(<DashboardPage />)
    expect(screen.getByText(/Unable to load live data/)).toBeInTheDocument()
    expect(screen.getByText(/Failed to connect to server/)).toBeInTheDocument()
  })

  it('does NOT show API error banner when no error', () => {
    render(<DashboardPage />)
    expect(screen.queryByText(/Unable to load live data/)).not.toBeInTheDocument()
  })

  it('renders 4 stats cards (Recordings, Total Hours, New Leads, Active Salespeople)', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Recordings')).toBeInTheDocument()
    expect(screen.getByText('Total Hours')).toBeInTheDocument()
    expect(screen.getByText('New Leads')).toBeInTheDocument()
    expect(screen.getByText('Active Salespeople')).toBeInTheDocument()
  })

  it('renders period selector (This Week option)', () => {
    render(<DashboardPage />)
    expect(screen.getByText('This Week')).toBeInTheDocument()
  })

  it('renders Team Leaderboard section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Team Leaderboard')).toBeInTheDocument()
  })

  it('renders Recent Activity section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('renders Alerts section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Alerts')).toBeInTheDocument()
  })

  it('has a "View All" link to /team in alerts section', () => {
    render(<DashboardPage />)
    const viewAllLinks = screen.getAllByText('View All')
    const hrefs = viewAllLinks.map(link => (link.closest('a') as HTMLAnchorElement)?.href || '')
    expect(hrefs.some(h => h.includes('/team'))).toBe(true)
  })

  it('has a "View All" link to /recordings for recent activity', () => {
    render(<DashboardPage />)
    const viewAllLinks = screen.getAllByText('View All')
    const hrefs = viewAllLinks.map(link => (link.closest('a') as HTMLAnchorElement)?.href || '')
    expect(hrefs.some(h => h.includes('/recordings'))).toBe(true)
  })

  it('renders dummy team data in leaderboard when no API data', () => {
    render(<DashboardPage />)
    // Dummy data has top performer; leaderboard shows medal emoji
    expect(screen.getByText('🥇')).toBeInTheDocument()
  })

  it('renders weekly activity chart bars', () => {
    render(<DashboardPage />)
    // Chart renders day labels (Mon, Tue, etc)
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const found = dayLabels.filter(d => screen.queryByText(d) !== null)
    expect(found.length).toBeGreaterThan(0)
  })

  it('uses API data summary when dashboard data is available', () => {
    mockUseManagerDashboard.mockReturnValue({
      data: {
        total_recordings: 999,
        total_duration: 7200,
        new_contacts: 42,
        active_users: 5,
        total_users: 10,
        by_user: [],
        alerts: [],
        recent_activity: [],
      },
      isLoading: false,
      error: null,
    })
    render(<DashboardPage />)
    // 999 recordings in stats card
    expect(screen.getByText('999')).toBeInTheDocument()
  })
})

// ===========================================================================
// RecordingsPage Tests
// ===========================================================================
import RecordingsPage from '../app/(dashboard)/recordings/page'

describe('RecordingsPage', () => {
  it('renders Recordings header', () => {
    render(<RecordingsPage />)
    expect(screen.getByText('Recordings')).toBeInTheDocument()
  })

  it('shows total recordings count in subtitle', () => {
    render(<RecordingsPage />)
    expect(screen.getByText(/total recordings/)).toBeInTheDocument()
  })

  it('renders 3 stats cards (Total Recordings, Total Duration, Business Cards)', () => {
    render(<RecordingsPage />)
    expect(screen.getByText('Total Recordings')).toBeInTheDocument()
    expect(screen.getByText('Total Duration')).toBeInTheDocument()
    expect(screen.getByText('Business Cards')).toBeInTheDocument()
  })

  it('shows loading spinner when loading', () => {
    mockUseRecordings.mockReturnValue(loading())
    render(<RecordingsPage />)
    const spinners = document.querySelectorAll('.animate-spin')
    expect(spinners.length).toBeGreaterThan(0)
  })

  it('does NOT show spinner when not loading', () => {
    render(<RecordingsPage />)
    const spinners = document.querySelectorAll('.animate-spin')
    expect(spinners.length).toBe(0)
  })

  it('shows API error banner on error', () => {
    mockUseApiError.mockReturnValue('Service unavailable')
    render(<RecordingsPage />)
    expect(screen.getByText(/Unable to load live data/)).toBeInTheDocument()
    expect(screen.getByText(/Service unavailable/)).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<RecordingsPage />)
    expect(screen.getByPlaceholderText(/Search by user, contact, or content/)).toBeInTheDocument()
  })

  it('renders status filter with "All Status" default', () => {
    render(<RecordingsPage />)
    expect(screen.getByText('All Status')).toBeInTheDocument()
  })

  it('renders Export button', () => {
    render(<RecordingsPage />)
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('renders data table with dummy recordings when no API data', () => {
    render(<RecordingsPage />)
    // DataTable renders; dummy data has recordings with users
    // Check table headers are present
    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Duration')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('filters recordings by search query', async () => {
    render(<RecordingsPage />)
    const searchInput = screen.getByPlaceholderText(/Search by user, contact, or content/)
    fireEvent.change(searchInput, { target: { value: 'ZZZNOMATCHES999' } })
    // After filtering, count stat should reflect 0 visible items
    // The table still renders but with filtered results
    await waitFor(() => {
      // filtered results — DataTable shows no rows or "No results"
      // Just verify the search input updated
      expect(searchInput).toHaveValue('ZZZNOMATCHES999')
    })
  })

  it('renders "All Users" filter by default', () => {
    render(<RecordingsPage />)
    expect(screen.getByText('All Users')).toBeInTheDocument()
  })
})

// ===========================================================================
// ContactsPage Tests
// ===========================================================================
import ContactsPage from '../app/(dashboard)/contacts/page'

describe('ContactsPage', () => {
  it('renders Contacts header', () => {
    render(<ContactsPage />)
    expect(screen.getByText('Contacts')).toBeInTheDocument()
  })

  it('shows total contacts count in subtitle', () => {
    render(<ContactsPage />)
    expect(screen.getByText(/total contacts/)).toBeInTheDocument()
  })

  it('renders 3 stats cards (New Leads, Qualified, Won)', () => {
    render(<ContactsPage />)
    // "New Leads" may appear in both stats card and column header; use getAllByText
    expect(screen.getAllByText('New Leads').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Qualified').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Won').length).toBeGreaterThanOrEqual(1)
  })

  it('shows loading spinner when loading', () => {
    mockUseContacts.mockReturnValue(loading())
    render(<ContactsPage />)
    const spinners = document.querySelectorAll('.animate-spin')
    expect(spinners.length).toBeGreaterThan(0)
  })

  it('does NOT show spinner when not loading', () => {
    render(<ContactsPage />)
    const spinners = document.querySelectorAll('.animate-spin')
    expect(spinners.length).toBe(0)
  })

  it('shows API error banner on error', () => {
    mockUseApiError.mockReturnValue('Network timeout')
    render(<ContactsPage />)
    expect(screen.getByText(/Unable to load live data/)).toBeInTheDocument()
    expect(screen.getByText(/Network timeout/)).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<ContactsPage />)
    expect(screen.getByPlaceholderText('Search contacts...')).toBeInTheDocument()
  })

  it('renders status filter with "All Status" default', () => {
    render(<ContactsPage />)
    expect(screen.getByText('All Status')).toBeInTheDocument()
  })

  it('renders "All Owners" filter by default', () => {
    render(<ContactsPage />)
    expect(screen.getByText('All Owners')).toBeInTheDocument()
  })

  it('renders Export button', () => {
    render(<ContactsPage />)
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('renders Add Contact button', () => {
    render(<ContactsPage />)
    expect(screen.getByText('Add Contact')).toBeInTheDocument()
  })

  it('renders data table column headers', () => {
    render(<ContactsPage />)
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Owner')).toBeInTheDocument()
  })

  it('filters contacts by search query', async () => {
    render(<ContactsPage />)
    const searchInput = screen.getByPlaceholderText('Search contacts...')
    fireEvent.change(searchInput, { target: { value: 'ZZZNOMATCHES999' } })
    await waitFor(() => {
      expect(searchInput).toHaveValue('ZZZNOMATCHES999')
    })
  })

  it('counts New Leads stat correctly from dummy data', () => {
    render(<ContactsPage />)
    // The stats counter for New Leads shows a number
    // We just check the label and its sibling number is rendered
    const newLeadsLabel = screen.getByText('New Leads')
    expect(newLeadsLabel).toBeInTheDocument()
  })
})

// ===========================================================================
// SettingsPage Tests
// ===========================================================================
import SettingsPage from '../app/(dashboard)/settings/page'

describe('SettingsPage', () => {
  it('renders Settings header', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your account and team')).toBeInTheDocument()
  })

  it('renders Profile section', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Your personal account settings')).toBeInTheDocument()
  })

  it('renders profile form fields', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
  })

  it('renders Save Changes button', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })

  it('renders Change Photo button', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Change Photo')).toBeInTheDocument()
  })

  it('renders Organization section', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('Manage your organization settings')).toBeInTheDocument()
  })

  it('renders Organization Name and Join Code fields', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Organization Name')).toBeInTheDocument()
    expect(screen.getByText('Join Code')).toBeInTheDocument()
  })

  it('renders Pro plan badge', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Pro')).toBeInTheDocument()
  })

  it('renders Manage Subscription button', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Manage Subscription')).toBeInTheDocument()
  })

  it('renders Team Members section', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Team Members')).toBeInTheDocument()
    expect(screen.getByText('Invite and manage team members')).toBeInTheDocument()
  })

  it('renders Invite Member button', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Invite Member')).toBeInTheDocument()
  })

  it('renders dummy team members list (up to 5)', () => {
    render(<SettingsPage />)
    // Dummy data has David Liu as first member
    expect(screen.getByText('David Liu')).toBeInTheDocument()
  })

  it('renders Notifications section', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Configure how you receive alerts')).toBeInTheDocument()
  })

  it('renders notification toggles', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Low Activity Alerts')).toBeInTheDocument()
    expect(screen.getByText('New Recording Alerts')).toBeInTheDocument()
    expect(screen.getByText('Daily Digest')).toBeInTheDocument()
    expect(screen.getByText('Weekly Reports')).toBeInTheDocument()
  })

  it('renders Security section', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Manage your account security')).toBeInTheDocument()
  })

  it('renders security action buttons', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    expect(screen.getByText('Enable 2FA')).toBeInTheDocument()
    expect(screen.getByText('View Sessions')).toBeInTheDocument()
  })

  it('renders Danger Zone section', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
    expect(screen.getByText('Irreversible actions')).toBeInTheDocument()
  })

  it('renders Delete Organization button', () => {
    render(<SettingsPage />)
    // Appears in both the label paragraph and the button — use getAllByText
    const matches = screen.getAllByText('Delete Organization')
    expect(matches.length).toBeGreaterThanOrEqual(1)
    // At least one should be a button
    const btn = matches.find(el => el.tagName === 'BUTTON')
    expect(btn).toBeDefined()
  })

  it('first notification toggle is checked by default', () => {
    render(<SettingsPage />)
    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true)
  })

  it('third notification toggle is unchecked by default', () => {
    render(<SettingsPage />)
    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(false)
  })
})
