/**
 * W5 — Detail page tests: RecordingDetailPage, ContactDetailPage, TeamMemberDetailPage
 *
 * All three pages were refactored from dummy data → real API hooks (W5).
 * Tests verify: loading states, error states, successful renders with real API data.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}))

// ---------------------------------------------------------------------------
// Mock next/link
// ---------------------------------------------------------------------------
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

// ---------------------------------------------------------------------------
// Mock React.use (params is a Promise in Next.js 15)
// ---------------------------------------------------------------------------
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  use: (val: unknown) => val,
}))

// ---------------------------------------------------------------------------
// Shared mock API data
// ---------------------------------------------------------------------------
const mockRecording = {
  id: 42,
  user_id: 1,
  audio_url: 'https://storage.example.com/audio/42.m4a',
  duration: 185,
  status: 'completed' as const,
  contact_id: 7,
  contact: {
    id: 7,
    user_id: 1,
    first_name: 'Jane',
    last_name: 'Smith',
    primary_email: 'jane@example.com',
    job_title: 'CTO',
    created_at: '2026-03-01T10:00:00Z',
  },
  transcription: {
    id: 1,
    recording_id: 42,
    text: 'Hello, this is the transcription of the meeting.',
    executive_summary: { summary: 'Key decisions were made about Q2 strategy.' },
    minutes: {
      key_points: ['Budget approved', 'Q2 roadmap finalized'],
      action_items: ['Send follow-up email', 'Schedule next meeting'],
    },
    created_at: '2026-03-01T10:05:00Z',
  },
  user: { id: 1, uuid: 'abc', email: 'sales@example.com', display_name: 'Alex Chan', role: 'user' as const, created_at: '2026-01-01T00:00:00Z' },
  created_at: '2026-03-01T10:00:00Z',
}

const mockContact = {
  id: 7,
  user_id: 1,
  first_name: 'Jane',
  last_name: 'Smith',
  primary_email: 'jane@example.com',
  work_phone: '+852 9999 8888',
  job_title: 'CTO',
  notes: 'Met at expo. Very interested.',
  linkedin: 'https://linkedin.com/in/janesmith',
  languages: [
    { id: 1, contact_id: 7, language_code: 'en', first_name: 'Jane', last_name: 'Smith', company: 'TechCorp', job_title: 'CTO', address: 'HK' },
    { id: 2, contact_id: 7, language_code: 'zh', first_name: '陳大文', last_name: '', company: '科技公司', job_title: '首席技術官', address: '香港' },
  ],
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-02T10:00:00Z',
}

const mockSubordinates = [
  {
    id: 5,
    uuid: 'sub-uuid-5',
    email: 'bob@example.com',
    display_name: 'Bob Lee',
    role: 'user',
    status: 'active' as const,
    recordings_count: 12,
    contacts_count: 8,
    last_active_at: '2026-03-06T09:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
  },
]

const mockSubRecordings = [
  {
    id: 101,
    user_id: 5,
    audio_url: 'https://storage.example.com/audio/101.m4a',
    duration: 120,
    status: 'completed' as const,
    contact_id: undefined,
    contact: undefined,
    created_at: '2026-03-05T14:00:00Z',
  },
  {
    id: 102,
    user_id: 5,
    audio_url: 'https://storage.example.com/audio/102.m4a',
    duration: 90,
    status: 'processing' as const,
    contact_id: undefined,
    contact: undefined,
    created_at: '2026-03-06T08:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Mock @/lib/api/hooks
// ---------------------------------------------------------------------------
const mockUseRecording = jest.fn()
const mockUseRecordingStatus = jest.fn()
const mockUseContact = jest.fn()
const mockUseRecordings = jest.fn()
const mockUseSubordinates = jest.fn()
const mockUseSubordinateRecordings = jest.fn()

jest.mock('@/lib/api/hooks', () => ({
  useRecording: (...args: unknown[]) => mockUseRecording(...args),
  useRecordingStatus: (...args: unknown[]) => mockUseRecordingStatus(...args),
  useContact: (...args: unknown[]) => mockUseContact(...args),
  useRecordings: () => mockUseRecordings(),
  useSubordinates: () => mockUseSubordinates(),
  useSubordinateRecordings: (...args: unknown[]) => mockUseSubordinateRecordings(...args),
  useApiError: (err: unknown) => (err ? 'An error occurred' : null),
}))

// ---------------------------------------------------------------------------
// Lazy imports (after mocks are set up)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RecordingDetailPage = require('../app/(dashboard)/recordings/[id]/page').default
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ContactDetailPage = require('../app/(dashboard)/contacts/[id]/page').default
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TeamMemberDetailPage = require('../app/(dashboard)/team/[id]/page').default

// ---------------------------------------------------------------------------
// RecordingDetailPage tests
// ---------------------------------------------------------------------------
describe('RecordingDetailPage', () => {
  // Pass plain object — with use: (val) => val mock, this gives { id: '42' } directly
  const params = { id: '42' }

  beforeEach(() => {
    mockUseRecordingStatus.mockReturnValue({ data: undefined })
  })

  test('shows loading spinner while fetching', () => {
    mockUseRecording.mockReturnValue({ isLoading: true, data: undefined, error: null })
    render(<RecordingDetailPage params={params} />)
    expect(screen.getByText(/loading recording/i)).toBeInTheDocument()
  })

  test('shows error state on fetch failure', () => {
    mockUseRecording.mockReturnValue({
      isLoading: false,
      data: undefined,
      error: { status: 500, message: 'Server error' },
      refetch: jest.fn(),
    })
    render(<RecordingDetailPage params={params} />)
    expect(screen.getByText(/failed to load recording/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  test('renders recording detail with API data', () => {
    mockUseRecording.mockReturnValue({ isLoading: false, data: mockRecording, error: null })
    render(<RecordingDetailPage params={params} />)
    expect(screen.getByText('Alex Chan')).toBeInTheDocument()
    // "completed" appears in badge + details card
    expect(screen.getAllByText('completed').length).toBeGreaterThan(0)
  })

  test('renders transcription text', () => {
    mockUseRecording.mockReturnValue({ isLoading: false, data: mockRecording, error: null })
    render(<RecordingDetailPage params={params} />)
    expect(screen.getByText(/Hello, this is the transcription/i)).toBeInTheDocument()
  })

  test('renders AI summary', () => {
    mockUseRecording.mockReturnValue({ isLoading: false, data: mockRecording, error: null })
    render(<RecordingDetailPage params={params} />)
    expect(screen.getByText(/Key decisions were made/i)).toBeInTheDocument()
  })

  test('renders linked contact with link', () => {
    mockUseRecording.mockReturnValue({ isLoading: false, data: mockRecording, error: null })
    render(<RecordingDetailPage params={params} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('CTO')).toBeInTheDocument()
  })

  test('renders key points and action items from minutes', () => {
    mockUseRecording.mockReturnValue({ isLoading: false, data: mockRecording, error: null })
    render(<RecordingDetailPage params={params} />)
    expect(screen.getByText('Budget approved')).toBeInTheDocument()
    expect(screen.getByText('Send follow-up email')).toBeInTheDocument()
  })

  test('shows processing status with spinner', () => {
    const processingRecording = { ...mockRecording, status: 'processing' as const, transcription: undefined }
    mockUseRecording.mockReturnValue({ isLoading: false, data: processingRecording, error: null })
    render(<RecordingDetailPage params={params} />)
    // "processing" appears in badge + details card + message
    expect(screen.getAllByText('processing').length).toBeGreaterThan(0)
    expect(screen.getByText(/processing — transcription will appear shortly/i)).toBeInTheDocument()
  })

  test('shows "no contact linked" when contact_id is null', () => {
    const noContactRecording = { ...mockRecording, contact_id: undefined, contact: undefined }
    mockUseRecording.mockReturnValue({ isLoading: false, data: noContactRecording, error: null })
    render(<RecordingDetailPage params={params} />)
    expect(screen.getByText(/no contact linked/i)).toBeInTheDocument()
  })

  test('renders back navigation link', () => {
    mockUseRecording.mockReturnValue({ isLoading: false, data: mockRecording, error: null })
    render(<RecordingDetailPage params={params} />)
    const backLink = screen.getByText(/back to recordings/i).closest('a')
    expect(backLink).toHaveAttribute('href', '/recordings')
  })

  test('renders duration in details card', () => {
    mockUseRecording.mockReturnValue({ isLoading: false, data: mockRecording, error: null })
    render(<RecordingDetailPage params={params} />)
    // 185 seconds = 3m 5s
    expect(screen.getAllByText(/3:05/i).length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// ContactDetailPage tests
// ---------------------------------------------------------------------------
describe('ContactDetailPage', () => {
  const params = { id: '7' }

  beforeEach(() => {
    mockUseRecordings.mockReturnValue({ data: [] })
  })

  test('shows loading spinner while fetching', () => {
    mockUseContact.mockReturnValue({ isLoading: true, data: undefined, error: null })
    render(<ContactDetailPage params={params} />)
    expect(screen.getByText(/loading contact/i)).toBeInTheDocument()
  })

  test('shows error state on fetch failure', () => {
    mockUseContact.mockReturnValue({
      isLoading: false,
      data: undefined,
      error: { status: 500 },
      refetch: jest.fn(),
    })
    render(<ContactDetailPage params={params} />)
    expect(screen.getByText(/failed to load contact/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  test('renders contact name and job title', () => {
    mockUseContact.mockReturnValue({ isLoading: false, data: mockContact, error: null })
    render(<ContactDetailPage params={params} />)
    // "Jane Smith" may appear in header + language section
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0)
    expect(screen.getAllByText('CTO').length).toBeGreaterThan(0)
  })

  test('renders email as mailto link', () => {
    mockUseContact.mockReturnValue({ isLoading: false, data: mockContact, error: null })
    render(<ContactDetailPage params={params} />)
    const emailLink = screen.getAllByText('jane@example.com')[0]
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:jane@example.com')
  })

  test('renders phone number as tel link', () => {
    mockUseContact.mockReturnValue({ isLoading: false, data: mockContact, error: null })
    render(<ContactDetailPage params={params} />)
    const phoneLink = screen.getByText('+852 9999 8888')
    expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:+852 9999 8888')
  })

  test('renders notes section', () => {
    mockUseContact.mockReturnValue({ isLoading: false, data: mockContact, error: null })
    render(<ContactDetailPage params={params} />)
    expect(screen.getByText('Met at expo. Very interested.')).toBeInTheDocument()
  })

  test('renders multi-language section', () => {
    mockUseContact.mockReturnValue({ isLoading: false, data: mockContact, error: null })
    render(<ContactDetailPage params={params} />)
    // language_code is lowercase in DOM; CSS `uppercase` class handles visual transform
    expect(screen.getByText('en')).toBeInTheDocument()
    expect(screen.getByText('zh')).toBeInTheDocument()
    expect(screen.getByText('陳大文')).toBeInTheDocument()
    expect(screen.getByText('科技公司')).toBeInTheDocument()
  })

  test('renders related recordings count when linked recordings exist', () => {
    mockUseContact.mockReturnValue({ isLoading: false, data: mockContact, error: null })
    mockUseRecordings.mockReturnValue({
      data: [
        { ...mockRecording, contact_id: 7 },
        { ...mockRecording, id: 43, contact_id: 7 },
        { ...mockRecording, id: 44, contact_id: 99 }, // different contact
      ],
    })
    render(<ContactDetailPage params={params} />)
    expect(screen.getByText(/Recordings \(2\)/i)).toBeInTheDocument()
  })

  test('shows "no recordings for this contact" when none', () => {
    mockUseContact.mockReturnValue({ isLoading: false, data: mockContact, error: null })
    render(<ContactDetailPage params={params} />)
    expect(screen.getByText(/no recordings for this contact/i)).toBeInTheDocument()
  })

  test('renders back navigation link', () => {
    mockUseContact.mockReturnValue({ isLoading: false, data: mockContact, error: null })
    render(<ContactDetailPage params={params} />)
    const backLink = screen.getByText(/back to contacts/i).closest('a')
    expect(backLink).toHaveAttribute('href', '/contacts')
  })

  test('renders LinkedIn button when present', () => {
    mockUseContact.mockReturnValue({ isLoading: false, data: mockContact, error: null })
    render(<ContactDetailPage params={params} />)
    // LinkedIn link exists
    const linkedInLinks = document.querySelectorAll('a[href="https://linkedin.com/in/janesmith"]')
    expect(linkedInLinks.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// TeamMemberDetailPage tests
// ---------------------------------------------------------------------------
describe('TeamMemberDetailPage', () => {
  const params = { id: '5' }

  test('shows loading spinner while fetching team', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: true, data: undefined, error: null })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: true, data: undefined, error: null })
    render(<TeamMemberDetailPage params={params} />)
    expect(screen.getByText(/loading team member/i)).toBeInTheDocument()
  })

  test('shows error state when team fetch fails', () => {
    mockUseSubordinates.mockReturnValue({
      isLoading: false, data: undefined, error: { status: 500 }
    })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: false, data: undefined, error: null })
    render(<TeamMemberDetailPage params={params} />)
    expect(screen.getByText(/failed to load team data/i)).toBeInTheDocument()
  })

  test('renders team member name and email', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: false, data: mockSubordinates, error: null })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: false, data: mockSubRecordings, error: null })
    render(<TeamMemberDetailPage params={params} />)
    expect(screen.getByText('Bob Lee')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  test('renders active badge for active user', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: false, data: mockSubordinates, error: null })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: false, data: mockSubRecordings, error: null })
    render(<TeamMemberDetailPage params={params} />)
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  test('renders recordings count stat', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: false, data: mockSubordinates, error: null })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: false, data: mockSubRecordings, error: null })
    render(<TeamMemberDetailPage params={params} />)
    // recordings_count is 12 from mock, shown in stats
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  test('renders contacts count stat', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: false, data: mockSubordinates, error: null })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: false, data: mockSubRecordings, error: null })
    render(<TeamMemberDetailPage params={params} />)
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  test('renders recordings list with status badges', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: false, data: mockSubordinates, error: null })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: false, data: mockSubRecordings, error: null })
    render(<TeamMemberDetailPage params={params} />)
    expect(screen.getByText('completed')).toBeInTheDocument()
    expect(screen.getByText('processing')).toBeInTheDocument()
  })

  test('renders "no recordings yet" when empty', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: false, data: mockSubordinates, error: null })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: false, data: [], error: null })
    render(<TeamMemberDetailPage params={params} />)
    expect(screen.getByText(/no recordings yet/i)).toBeInTheDocument()
  })

  test('renders back navigation link', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: false, data: mockSubordinates, error: null })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: false, data: [], error: null })
    render(<TeamMemberDetailPage params={params} />)
    const backLink = screen.getByText(/back to team/i).closest('a')
    expect(backLink).toHaveAttribute('href', '/team')
  })

  test('renders completed recordings count in stats card', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: false, data: mockSubordinates, error: null })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: false, data: mockSubRecordings, error: null })
    render(<TeamMemberDetailPage params={params} />)
    // 1 completed recording out of 2
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  test('shows recordings loading state', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: false, data: mockSubordinates, error: null })
    mockUseSubordinateRecordings.mockReturnValue({ isLoading: true, data: undefined, error: null })
    render(<TeamMemberDetailPage params={params} />)
    expect(screen.getByText(/loading recordings/i)).toBeInTheDocument()
  })

  test('shows recordings error state', () => {
    mockUseSubordinates.mockReturnValue({ isLoading: false, data: mockSubordinates, error: null })
    mockUseSubordinateRecordings.mockReturnValue({
      isLoading: false, data: undefined, error: { status: 500 }
    })
    render(<TeamMemberDetailPage params={params} />)
    // useApiError mock returns 'An error occurred' for any truthy error
    expect(screen.getByText('An error occurred')).toBeInTheDocument()
  })
})
