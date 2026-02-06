// User Types
export type UserRole = 'admin' | 'manager' | 'salesperson'
export type UserStatus = 'active' | 'invited' | 'disabled'

export interface User {
  id: string
  organizationId: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  status: UserStatus
  deviceIds: string[]
  createdAt: string
  lastActiveAt: string
}

// Organization Types
export type PlanType = 'trial' | 'starter' | 'pro' | 'enterprise'

export interface Organization {
  id: string
  name: string
  plan: PlanType
  createdAt: string
}

// Recording Types
export type RecordingStatus = 'uploading' | 'processing' | 'ready' | 'failed'

export interface Recording {
  id: string
  organizationId: string
  userId: string
  userName: string
  userAvatar?: string
  deviceId?: string
  audioUrl: string
  duration: number
  fileSize: number
  recordedAt: string
  uploadedAt: string
  status: RecordingStatus
  transcription?: string
  summary?: string
  contactId?: string
  contactName?: string
  businessCards: BusinessCard[]
  location?: GeoPoint
  tags: string[]
  notes?: string
}

// Business Card Types
export interface BusinessCard {
  id: string
  recordingId: string
  imageUrl: string
  capturedAt: string
  timestampOffset: number
  extractedData?: {
    name?: string
    company?: string
    title?: string
    email?: string
    phone?: string
    address?: string
  }
  contactId?: string
}

// Contact Types
export type ContactStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'

export interface Contact {
  id: string
  organizationId: string
  createdByUserId: string
  createdByUserName: string
  name: string
  company?: string
  title?: string
  email?: string
  phone?: string
  status: ContactStatus
  assignedToUserId?: string
  assignedToUserName?: string
  recordingIds: string[]
  recordingCount: number
  businessCardIds: string[]
  source: 'recording' | 'business_card' | 'manual' | 'import'
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// Location Types
export interface GeoPoint {
  lat: number
  lng: number
  address?: string
}

// Activity Types
export type ActivityLevel = 'high' | 'medium' | 'low' | 'none'

export interface DailyActivity {
  userId: string
  userName: string
  userAvatar?: string
  date: string
  recordingsCount: number
  totalDuration: number
  contactsAdded: number
  businessCardsScanned: number
  isLowActivity: boolean
  activityLevel: ActivityLevel
}

// Team Summary Types
export interface TeamSummary {
  organizationId: string
  period: 'day' | 'week' | 'month'
  startDate: string
  totalRecordings: number
  totalDuration: number
  activeUsers: number
  totalUsers: number
  newContacts: number
  byUser: UserSummary[]
}

export interface UserSummary {
  userId: string
  userName: string
  userAvatar?: string
  recordings: number
  duration: number
  contacts: number
  activityLevel: ActivityLevel
}

// Alert Types
export type AlertType = 'no_activity' | 'low_activity' | 'target_missed' | 'device_offline'
export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  userId: string
  userName: string
  userAvatar?: string
  message: string
  details?: string
  createdAt: string
  isRead: boolean
}

// Recent Activity Types
export type ActivityType = 'recording_uploaded' | 'contact_added' | 'business_card_scanned' | 'recording_completed'

export interface RecentActivity {
  id: string
  type: ActivityType
  userId: string
  userName: string
  userAvatar?: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}
