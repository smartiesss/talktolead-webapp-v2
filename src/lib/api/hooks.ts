"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiClientError } from './client'
import { ENDPOINTS } from './endpoints'

// =============================================================================
// Types - Based on backend models
// =============================================================================

export interface ApiUser {
  id: number
  uuid: string
  email: string
  display_name?: string
  role: 'user' | 'manager' | 'admin'
  organization_id?: number
  manager_id?: number
  subscription_tier?: string
  subscription_status?: string
  token_balance?: number
  created_at: string
  updated_at?: string
}

export interface ApiRecording {
  id: number
  user_id: number
  user?: ApiUser
  audio_url: string
  duration?: number
  waveform?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  contact_id?: number
  contact?: ApiContact
  transcription?: ApiTranscription
  created_at: string
  updated_at?: string
}

export interface ApiTranscription {
  id: number
  recording_id: number
  text?: string | TranscriptionSegment[]
  minutes?: MeetingMinutes
  executive_summary?: ExecutiveSummary
  duration?: number
  token_usage?: number
  created_at: string
}

interface TranscriptionSegment {
  start: number
  end: number
  text: string
  speaker?: string
}

interface MeetingMinutes {
  summary?: string
  key_points?: string[]
  action_items?: string[]
  decisions?: string[]
}

interface ExecutiveSummary {
  summary?: string
  sentiment?: string
  topics?: string[]
}

export interface ApiContact {
  id: number
  user_id: number
  company_id?: number
  first_name?: string
  last_name?: string
  primary_email?: string
  work_phone?: string
  mobile_number?: string
  fax_number?: string
  job_title?: string
  notes?: string
  linkedin?: string
  instagram?: string
  facebook?: string
  crm_id?: string
  crm_provider?: string
  languages?: ApiContactLanguage[]
  created_at: string
  updated_at?: string
}

export interface ApiContactLanguage {
  id: number
  contact_id: number
  language_code: string
  first_name?: string
  last_name?: string
  job_title?: string
  company?: string
  address?: string
}

export interface ApiManagerDashboard {
  total_recordings: number
  total_duration: number
  active_users: number
  total_users: number
  new_contacts: number
  recent_activity: ApiRecentActivity[]
  alerts: ApiAlert[]
  by_user: ApiUserSummary[]
}

export interface ApiUserSummary {
  user_id: number
  user_name: string
  email: string
  recordings: number
  duration: number
  contacts: number
  activity_level: 'high' | 'medium' | 'low' | 'none'
  last_active?: string
}

export interface ApiRecentActivity {
  id: number
  type: string
  user_id: number
  user_name: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface ApiAlert {
  id: number
  type: 'no_activity' | 'low_activity' | 'target_missed' | 'device_offline'
  severity: 'critical' | 'warning' | 'info'
  user_id: number
  user_name: string
  message: string
  details?: string
  created_at: string
  is_read: boolean
}

export interface ApiSubordinate {
  id: number
  uuid: string
  email: string
  display_name?: string
  role: string
  status: 'active' | 'invited' | 'disabled'
  recordings_count?: number
  contacts_count?: number
  last_active_at?: string
  created_at: string
}

// =============================================================================
// Query Keys
// =============================================================================

export const queryKeys = {
  user: ['user'] as const,
  recordings: ['recordings'] as const,
  recording: (id: string) => ['recordings', id] as const,
  contacts: ['contacts'] as const,
  contact: (id: string) => ['contacts', id] as const,
  dashboard: ['dashboard'] as const,
  subordinates: ['subordinates'] as const,
  subordinate: (id: string) => ['subordinates', id] as const,
  subordinateRecordings: (id: string) => ['subordinates', id, 'recordings'] as const,
  teamSummary: ['team-summary'] as const,
}

// =============================================================================
// Auth Hooks
// =============================================================================

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => api.get<ApiUser>(ENDPOINTS.AUTH.CURRENT_USER),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// =============================================================================
// Recording Hooks
// =============================================================================

export function useRecordings() {
  return useQuery({
    queryKey: queryKeys.recordings,
    queryFn: () => api.get<ApiRecording[]>(ENDPOINTS.VOICE.LIST),
  })
}

export function useRecording(id: string) {
  return useQuery({
    queryKey: queryKeys.recording(id),
    queryFn: () => api.get<ApiRecording>(ENDPOINTS.VOICE.DETAIL(id)),
    enabled: !!id,
  })
}

export function useRecordingStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.recording(id), 'status'],
    queryFn: () => api.get<{ status: string }>(ENDPOINTS.VOICE.STATUS(id)),
    enabled: enabled && !!id,
    refetchInterval: (data) => {
      // Poll while processing
      const status = data?.state?.data?.status
      return status === 'processing' || status === 'pending' ? 3000 : false
    },
  })
}

export function useDeleteRecording() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.delete(ENDPOINTS.VOICE.DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recordings })
    },
  })
}

// =============================================================================
// Contact Hooks
// =============================================================================

export function useContacts() {
  return useQuery({
    queryKey: queryKeys.contacts,
    queryFn: () => api.get<ApiContact[]>(ENDPOINTS.CONTACTS.LIST),
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: queryKeys.contact(id),
    queryFn: () => api.get<ApiContact>(ENDPOINTS.CONTACTS.DETAIL(id)),
    enabled: !!id,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<ApiContact>) => 
      api.post<ApiContact>(ENDPOINTS.CONTACTS.CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiContact> }) => 
      api.put<ApiContact>(ENDPOINTS.CONTACTS.UPDATE(id), data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contact(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.delete(ENDPOINTS.CONTACTS.DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
    },
  })
}

// =============================================================================
// Manager Dashboard Hooks
// =============================================================================

export function useManagerDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.get<ApiManagerDashboard>(ENDPOINTS.MANAGER.DASHBOARD),
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useSubordinates() {
  return useQuery({
    queryKey: queryKeys.subordinates,
    queryFn: () => api.get<ApiSubordinate[]>(ENDPOINTS.MANAGER.SUBORDINATES),
  })
}

export function useSubordinateRecordings(id: string) {
  return useQuery({
    queryKey: queryKeys.subordinateRecordings(id),
    queryFn: () => api.get<ApiRecording[]>(ENDPOINTS.MANAGER.SUBORDINATE_RECORDINGS(id)),
    enabled: !!id,
  })
}

export function useTeamSummary() {
  return useQuery({
    queryKey: queryKeys.teamSummary,
    queryFn: () => api.get<ApiUserSummary[]>(ENDPOINTS.MANAGER.TEAM_SUMMARY),
  })
}

// =============================================================================
// Utility hook for error handling
// =============================================================================

export function useApiError(error: unknown): string | null {
  if (!error) return null
  
  if (error instanceof ApiClientError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}
