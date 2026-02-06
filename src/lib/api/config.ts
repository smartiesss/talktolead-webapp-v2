// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://manage.talktolead.ai',
  TIMEOUT: 30000,
} as const

// Auth token storage key
export const AUTH_TOKEN_KEY = 'talktolead_auth_token'
export const REFRESH_TOKEN_KEY = 'talktolead_refresh_token'
export const USER_KEY = 'talktolead_user'
