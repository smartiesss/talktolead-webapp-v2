// API Endpoints - Based on backend at https://manage.talktolead.ai

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE: '/auth/google',
    CURRENT_USER: '/auth/current_user',
    GET_ROLE: '/auth/get_user_role',
    CREATE_ORG: '/auth/create_organization',
    JOIN_ORG: '/auth/join_organization',
  },

  // Voice Recordings
  VOICE: {
    LIST: '/api/voice/recordings',
    DETAIL: (id: string) => `/api/voice/recordings/${id}`,
    STATUS: (id: string) => `/api/voice/recordings/${id}/status`,
    SIGNED_URL: (id: string) => `/api/voice/recordings/${id}/signed-url`,
    LINK_CONTACT: (id: string) => `/api/voice/recordings/${id}/contacts`,
    DELETE: (id: string) => `/api/voice/recordings/${id}`,
    TRANSCRIPTION: (id: string) => `/api/voice/transcriptions/${id}`,
    TRANSLATE: (id: string) => `/api/voice/transcriptions/${id}/translations`,
  },

  // Contacts
  CONTACTS: {
    LIST: '/api/contact/',
    DETAIL: (id: string) => `/api/contact/${id}`,
    CREATE: '/api/contact/',
    UPDATE: (id: string) => `/api/contact/${id}`,
    DELETE: (id: string) => `/api/contact/${id}`,
    COMMUNICATIONS: (id: string) => `/api/contact/${id}/communications`,
    EXPORT_CSV: '/api/contact/export/csv',
    EXPORT_ZIP: '/api/contact/export/zip',
    EXPORT_STATUS: '/api/contact/export/check-status',
    SYNC: '/api/contact/sync',
  },

  // Manager Dashboard
  MANAGER: {
    DASHBOARD: '/api/manager/dashboard',
    SUBORDINATES: '/api/manager/subordinates',
    SUBORDINATE_RECORDINGS: (id: string) => `/api/manager/subordinates/${id}/recordings`,
    TEAM_SUMMARY: '/api/manager/team-summary',
  },

  // OCR
  OCR: {
    NAMECARD: '/api/ocr/namecard',
    ADD_BACK: (id: string) => `/api/ocr/namecard/${id}/add_back`,
  },

  // User
  USER: {
    ROLE: '/api/user/role',
    TOKENS: '/api/user/tokens',
    PURCHASE_TOKENS: '/api/user/tokens/purchase',
  },
} as const
