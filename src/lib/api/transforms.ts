/**
 * Transform functions to convert API responses to frontend types
 * This provides a clean separation between backend and frontend data models
 */

import type { 
  ApiRecording, ApiContact, ApiSubordinate, ApiUserSummary, 
  ApiAlert, ApiRecentActivity, ApiManagerDashboard 
} from './hooks'
import type { 
  Recording, Contact, User, Alert, RecentActivity, TeamSummary, UserSummary 
} from '@/types'

// =============================================================================
// Recording Transforms
// =============================================================================

export function transformRecording(api: ApiRecording): Recording {
  // Parse transcription text
  let transcriptionText: string | undefined
  if (api.transcription?.text) {
    if (typeof api.transcription.text === 'string') {
      transcriptionText = api.transcription.text
    } else if (Array.isArray(api.transcription.text)) {
      transcriptionText = api.transcription.text.map(seg => seg.text).join(' ')
    }
  }

  // Generate summary from transcription if available
  let summary: string | undefined
  if (api.transcription?.executive_summary?.summary) {
    summary = api.transcription.executive_summary.summary
  } else if (api.transcription?.minutes?.summary) {
    summary = api.transcription.minutes.summary
  }

  return {
    id: String(api.id),
    organizationId: 'org-001', // API doesn't return this directly
    userId: String(api.user_id),
    userName: api.user?.display_name || api.user?.email || 'Unknown',
    audioUrl: api.audio_url,
    duration: api.duration || 0,
    fileSize: 0, // API doesn't return this
    recordedAt: api.created_at,
    uploadedAt: api.created_at,
    status: mapRecordingStatus(api.status),
    transcription: transcriptionText,
    summary,
    contactId: api.contact_id ? String(api.contact_id) : undefined,
    contactName: api.contact ? 
      `${api.contact.first_name || ''} ${api.contact.last_name || ''}`.trim() || 
      api.contact.primary_email : 
      undefined,
    businessCards: [], // Would need separate API call
    location: undefined,
    tags: [],
    notes: undefined,
  }
}

function mapRecordingStatus(status: string): Recording['status'] {
  const statusMap: Record<string, Recording['status']> = {
    pending: 'uploading',
    processing: 'processing',
    completed: 'ready',
    failed: 'failed',
  }
  return statusMap[status] || 'processing'
}

export function transformRecordings(recordings: ApiRecording[]): Recording[] {
  return recordings.map(transformRecording)
}

// =============================================================================
// Contact Transforms
// =============================================================================

export function transformContact(api: ApiContact): Contact {
  const fullName = [api.first_name, api.last_name].filter(Boolean).join(' ') || 
    api.primary_email || 
    'Unknown'

  // Get company from languages if available
  const primaryLanguage = api.languages?.find(l => l.language_code === 'EN') || api.languages?.[0]

  return {
    id: String(api.id),
    organizationId: 'org-001',
    createdByUserId: String(api.user_id),
    createdByUserName: '', // Would need to fetch user
    name: fullName,
    company: primaryLanguage?.company || undefined,
    title: api.job_title || primaryLanguage?.job_title,
    email: api.primary_email || undefined,
    phone: api.mobile_number || api.work_phone || undefined,
    status: 'new', // API doesn't have status
    assignedToUserId: String(api.user_id),
    assignedToUserName: '',
    recordingIds: [],
    recordingCount: 0,
    businessCardIds: [],
    source: 'manual',
    tags: [],
    notes: api.notes || undefined,
    createdAt: api.created_at,
    updatedAt: api.updated_at || api.created_at,
  }
}

export function transformContacts(contacts: ApiContact[]): Contact[] {
  return contacts.map(transformContact)
}

// =============================================================================
// User/Subordinate Transforms
// =============================================================================

export function transformSubordinate(api: ApiSubordinate): User {
  return {
    id: String(api.id),
    organizationId: 'org-001',
    email: api.email,
    name: api.display_name || api.email,
    role: api.role === 'manager' ? 'manager' : 'salesperson',
    status: api.status,
    deviceIds: [],
    createdAt: api.created_at,
    lastActiveAt: api.last_active_at || api.created_at,
  }
}

export function transformSubordinates(subordinates: ApiSubordinate[]): User[] {
  return subordinates.map(transformSubordinate)
}

// =============================================================================
// Dashboard Transforms
// =============================================================================

export function transformUserSummary(api: ApiUserSummary): UserSummary {
  return {
    userId: String(api.user_id),
    userName: api.user_name,
    recordings: api.recordings,
    duration: api.duration,
    contacts: api.contacts,
    activityLevel: api.activity_level,
  }
}

export function transformAlert(api: ApiAlert): Alert {
  return {
    id: String(api.id),
    type: api.type,
    severity: api.severity,
    userId: String(api.user_id),
    userName: api.user_name,
    message: api.message,
    details: api.details,
    createdAt: api.created_at,
    isRead: api.is_read,
  }
}

export function transformRecentActivity(api: ApiRecentActivity): RecentActivity {
  return {
    id: String(api.id),
    type: api.type as RecentActivity['type'],
    userId: String(api.user_id),
    userName: api.user_name,
    description: api.description,
    timestamp: api.timestamp,
    metadata: api.metadata,
  }
}

export function transformDashboard(api: ApiManagerDashboard): TeamSummary {
  return {
    organizationId: 'org-001',
    period: 'week',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalRecordings: api.total_recordings,
    totalDuration: api.total_duration,
    activeUsers: api.active_users,
    totalUsers: api.total_users,
    newContacts: api.new_contacts,
    byUser: api.by_user.map(transformUserSummary),
  }
}

export function transformAlerts(alerts: ApiAlert[]): Alert[] {
  return alerts.map(transformAlert)
}

export function transformRecentActivities(activities: ApiRecentActivity[]): RecentActivity[] {
  return activities.map(transformRecentActivity)
}
