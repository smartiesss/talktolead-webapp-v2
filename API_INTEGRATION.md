# TalkToLead Web App - API Integration

**Date:** 2026-02-07  
**Status:** Implemented with fallback to demo data

---

## Overview

This document describes the API integration between the TalkToLead web app and the backend at `https://manage.talktolead.ai`.

## Architecture

### API Client Layer

```
src/lib/api/
├── config.ts      # API configuration & constants
├── client.ts      # Fetch wrapper with auth handling
├── endpoints.ts   # API endpoint definitions
├── hooks.ts       # TanStack Query hooks
├── transforms.ts  # API → Frontend type transformations
└── index.ts       # Re-exports
```

### Auth Layer

```
src/lib/auth/
└── context.tsx    # React context for auth state
```

---

## Integrated Endpoints

### ✅ Authentication

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/auth/login` | POST | ✅ Implemented | Email/password login |
| `/auth/google` | POST | 🔸 Partial | Needs Firebase client setup |
| `/auth/current_user` | GET | ✅ Implemented | Get current user profile |

### ✅ Manager Dashboard

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/manager/dashboard` | GET | ✅ Implemented | Team stats, alerts, activity |
| `/api/manager/subordinates` | GET | ✅ Implemented | List team members |
| `/api/manager/subordinates/:id/recordings` | GET | ✅ Implemented | Member's recordings |
| `/api/manager/team-summary` | GET | ✅ Implemented | Team summary stats |

### ✅ Recordings

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/voice/recordings` | GET | ✅ Implemented | List all recordings |
| `/api/voice/recordings/:id` | GET | ✅ Implemented | Recording detail |
| `/api/voice/recordings/:id/status` | GET | ✅ Implemented | Status polling |
| `/api/voice/recordings/:id` | DELETE | ✅ Implemented | Delete recording |

### ✅ Contacts

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/contact/` | GET | ✅ Implemented | List contacts |
| `/api/contact/:id` | GET | ✅ Implemented | Contact detail |
| `/api/contact/` | POST | ✅ Implemented | Create contact |
| `/api/contact/:id` | PUT | ✅ Implemented | Update contact |
| `/api/contact/:id` | DELETE | ✅ Implemented | Delete contact |

### 📋 Not Yet Implemented

| Endpoint | Method | Notes |
|----------|--------|-------|
| `/api/ocr/namecard` | POST | Business card OCR |
| `/api/contact/export/*` | POST | CSV/ZIP exports |
| `/api/user/tokens` | GET/POST | Token management |
| `/auth/create_organization` | POST | Org creation |
| `/auth/join_organization` | POST | Org joining |

---

## Auth Flow Implementation

### Token Storage
- **Access Token:** `localStorage.talktolead_auth_token`
- **User Data:** `localStorage.talktolead_user`

### Authentication Flow

1. User enters credentials on `/login`
2. POST to `/auth/login` with `{ email, password }`
3. Backend returns `{ access_token, refresh_token?, user? }`
4. Token stored in localStorage
5. Fetch user profile from `/auth/current_user`
6. Redirect to `/dashboard`

### Protected Routes

Dashboard routes (`/dashboard`, `/recordings`, `/contacts`, `/team`, etc.) are protected by:

1. `AuthProvider` wrapping the app
2. `DashboardLayout` checking `isAuthenticated`
3. Redirect to `/login` if not authenticated

### Token Handling

- Bearer token sent in `Authorization` header
- 401 responses trigger logout and redirect
- Token cleared on logout

---

## Data Flow

### Fallback Pattern

All pages implement a graceful fallback pattern:

```tsx
const { data: apiData, isLoading, error } = useApiHook()

// Transform API data or use dummy data as fallback
const data = apiData ? transformData(apiData) : dummyData

// Show error banner but still render with fallback data
{error && <ErrorBanner message={error.message} />}
```

This ensures the UI always renders, even when:
- Backend is unavailable
- CORS issues occur
- API returns errors

### Type Transformation

API responses are transformed to frontend types:

```tsx
// API type (snake_case)
interface ApiRecording {
  id: number
  user_id: number
  audio_url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  ...
}

// Frontend type (camelCase)
interface Recording {
  id: string
  userId: string
  audioUrl: string
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  ...
}
```

---

## Usage Examples

### Using API Hooks

```tsx
import { useRecordings, useContacts, useManagerDashboard } from '@/lib/api/hooks'
import { transformRecordings } from '@/lib/api/transforms'

function RecordingsPage() {
  const { data, isLoading, error } = useRecordings()
  
  const recordings = data ? transformRecordings(data) : []
  
  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />
  
  return <RecordingsList recordings={recordings} />
}
```

### Using Auth Context

```tsx
import { useAuth } from '@/lib/auth/context'

function ProfileButton() {
  const { user, logout, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) return <LoginButton />
  
  return (
    <div>
      <span>{user?.name}</span>
      <button onClick={logout}>Sign Out</button>
    </div>
  )
}
```

### Direct API Calls

```tsx
import { api } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'

// GET request
const recordings = await api.get(ENDPOINTS.VOICE.LIST)

// POST request
const newContact = await api.post(ENDPOINTS.CONTACTS.CREATE, {
  first_name: 'John',
  last_name: 'Doe',
  primary_email: 'john@example.com'
})
```

---

## Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=https://manage.talktolead.ai
```

Default: `https://manage.talktolead.ai`

---

## Known Issues & CORS

### CORS Configuration

The backend may need to allow the following origins:

```python
# Backend CORS config
CORS_ORIGINS = [
    "http://localhost:3000",
    "https://your-production-domain.com"
]
```

### Current Workarounds

1. **Fallback to Demo Data:** If API fails, demo data is shown
2. **Error Banners:** Users see clear indication when using demo data
3. **Credentials Include:** `credentials: 'include'` for cookie-based auth

### Troubleshooting

If API calls fail:

1. Check browser console for CORS errors
2. Verify backend CORS allows the frontend origin
3. Ensure backend is running at `https://manage.talktolead.ai`
4. Check if token is properly set in localStorage

---

## Files Modified

| File | Changes |
|------|---------|
| `src/app/providers.tsx` | Added AuthProvider |
| `src/app/login/page.tsx` | Real login with API |
| `src/app/(dashboard)/layout.tsx` | Auth protection |
| `src/app/(dashboard)/dashboard/page.tsx` | API integration |
| `src/app/(dashboard)/recordings/page.tsx` | API integration |
| `src/app/(dashboard)/contacts/page.tsx` | API integration |
| `src/app/(dashboard)/team/page.tsx` | API integration |
| `src/components/layout/sidebar.tsx` | User info + logout |

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/api/config.ts` | API configuration |
| `src/lib/api/client.ts` | Fetch wrapper |
| `src/lib/api/endpoints.ts` | API endpoints |
| `src/lib/api/hooks.ts` | TanStack Query hooks |
| `src/lib/api/transforms.ts` | Data transformations |
| `src/lib/api/index.ts` | Module exports |
| `src/lib/auth/context.tsx` | Auth React context |

---

## Next Steps

1. **Firebase Setup:** Configure Firebase client for Google OAuth
2. **Real-time Updates:** Add WebSocket for transcription status
3. **Offline Support:** Cache API responses with service worker
4. **Error Recovery:** Implement retry logic with exponential backoff
5. **Token Refresh:** Add refresh token rotation

---

## Testing the Integration

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Try demo" to see demo credentials
4. Observe API calls in Network tab (they will fail with CORS if backend not configured)
5. App will fallback to demo data with a warning banner
