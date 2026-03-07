/**
 * Tests for layout components: Header, Sidebar
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../components/layout/header'
import { Sidebar } from '../components/layout/sidebar'
import { AuthUser } from '../lib/auth/context'

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
let mockPathname = '/dashboard'
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
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
const mockLogout = jest.fn()
let mockUser: AuthUser | null = {
  id: 'user_001',
  email: 'test@example.com',
  name: 'Jane Doe',
  display_name: 'Jane Doe',
  role: 'user',
}

jest.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}))

// ---------------------------------------------------------------------------
// Mock useAlerts (used by Sidebar for unread badge)
// ---------------------------------------------------------------------------
jest.mock('@/lib/api/hooks', () => ({
  useAlerts: () => ({ data: undefined }),
}))

jest.mock('@/lib/api/transforms', () => ({
  transformAlerts: (alerts: unknown[]) => alerts,
}))

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function renderSidebar() {
  return render(<Sidebar />)
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks()
  mockPathname = '/dashboard'
  mockUser = {
    id: 'user_001',
    email: 'test@example.com',
    name: 'Jane Doe',
    display_name: 'Jane Doe',
    role: 'user',
  }
})

// ===========================================================================
// Header
// ===========================================================================
describe('Header component', () => {
  it('renders the title', () => {
    render(<Header title="Recordings" />)
    expect(screen.getByRole('heading', { name: /recordings/i })).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<Header title="Dashboard" subtitle="Overview of your activity" />)
    expect(screen.getByText('Overview of your activity')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    render(<Header title="Settings" />)
    // Only one element (the h1)
    expect(screen.queryByText(/overview/i)).not.toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<Header title="Contacts" />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders notification bell button', () => {
    render(<Header title="Contacts" />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders notification badge with count 3', () => {
    render(<Header title="Contacts" />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})

// ===========================================================================
// Sidebar — navigation links
// ===========================================================================
describe('Sidebar navigation links', () => {
  it('renders all 6 nav items', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Recordings')).toBeInTheDocument()
    expect(screen.getByText('Contacts')).toBeInTheDocument()
    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('active item has active class when pathname matches exactly', () => {
    mockPathname = '/dashboard'
    renderSidebar()
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink.className).toContain('bg-primary')
  })

  it('active item matches sub-paths', () => {
    mockPathname = '/recordings/123'
    renderSidebar()
    const recLink = screen.getByRole('link', { name: /recordings/i })
    expect(recLink.className).toContain('bg-primary')
  })

  it('non-active item does not have active class', () => {
    mockPathname = '/dashboard'
    renderSidebar()
    const contactsLink = screen.getByRole('link', { name: /^contacts$/i })
    expect(contactsLink.className).not.toContain('bg-primary')
  })

  it('nav links have correct hrefs', () => {
    renderSidebar()
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard'
    )
    expect(screen.getByRole('link', { name: /recordings/i })).toHaveAttribute(
      'href',
      '/recordings'
    )
    expect(screen.getByRole('link', { name: /^contacts$/i })).toHaveAttribute(
      'href',
      '/contacts'
    )
    expect(screen.getByRole('link', { name: /team/i })).toHaveAttribute(
      'href',
      '/team'
    )
  })
})

// ===========================================================================
// Sidebar — branding
// ===========================================================================
describe('Sidebar branding', () => {
  it('renders TalkToLead logo text', () => {
    renderSidebar()
    expect(screen.getByText('TalkToLead')).toBeInTheDocument()
  })
})

// ===========================================================================
// Sidebar — user info
// ===========================================================================
describe('Sidebar user info', () => {
  it('shows user full name', () => {
    renderSidebar()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('shows role label for user role', () => {
    renderSidebar()
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('shows role label for manager', () => {
    mockUser = { ...mockUser!, role: 'manager', display_name: 'Boss Man', name: 'Boss Man' }
    renderSidebar()
    expect(screen.getByText('Manager')).toBeInTheDocument()
  })

  it('shows role label for admin', () => {
    mockUser = { ...mockUser!, role: 'admin', display_name: 'Admin', name: 'Admin' }
    renderSidebar()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
  })

  it('shows initials JD for Jane Doe', () => {
    renderSidebar()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows first 2 chars of single-word name', () => {
    mockUser = { ...mockUser!, name: 'Alice', display_name: 'Alice' }
    renderSidebar()
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('falls back to email initials when no name', () => {
    mockUser = { ...mockUser!, name: undefined, display_name: undefined }
    renderSidebar()
    // email is test@example.com → 'TE'
    expect(screen.getByText('TE')).toBeInTheDocument()
  })

  it('shows U when user is null', () => {
    mockUser = null
    renderSidebar()
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('shows email when no name set', () => {
    mockUser = { ...mockUser!, name: undefined, display_name: undefined }
    renderSidebar()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })
})

// ===========================================================================
// Sidebar — sign out
// ===========================================================================
describe('Sidebar sign out', () => {
  it('renders Sign Out button', () => {
    renderSidebar()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('calls logout when Sign Out is clicked', () => {
    renderSidebar()
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
