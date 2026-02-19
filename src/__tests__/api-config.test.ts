/**
 * Tests for API Configuration
 */

import { API_CONFIG, AUTH_TOKEN_KEY, USER_KEY } from '@/lib/api/config'
import { ENDPOINTS } from '@/lib/api/endpoints'

describe('API Configuration', () => {
  describe('API_CONFIG', () => {
    it('should have a valid base URL', () => {
      expect(API_CONFIG.BASE_URL).toBeDefined()
      expect(typeof API_CONFIG.BASE_URL).toBe('string')
      // Should be either localhost or production URL
      expect(API_CONFIG.BASE_URL).toMatch(/^https?:\/\//)
    })

    it('should have a timeout configured', () => {
      expect(API_CONFIG.TIMEOUT).toBeDefined()
      expect(typeof API_CONFIG.TIMEOUT).toBe('number')
      expect(API_CONFIG.TIMEOUT).toBeGreaterThan(0)
    })
  })

  describe('Storage Keys', () => {
    it('should have AUTH_TOKEN_KEY defined', () => {
      expect(AUTH_TOKEN_KEY).toBeDefined()
      expect(typeof AUTH_TOKEN_KEY).toBe('string')
      expect(AUTH_TOKEN_KEY.length).toBeGreaterThan(0)
    })

    it('should have USER_KEY defined', () => {
      expect(USER_KEY).toBeDefined()
      expect(typeof USER_KEY).toBe('string')
      expect(USER_KEY.length).toBeGreaterThan(0)
    })
  })
})

describe('API Endpoints', () => {
  describe('AUTH endpoints', () => {
    it('should have login endpoint', () => {
      expect(ENDPOINTS.AUTH.LOGIN).toBeDefined()
      expect(ENDPOINTS.AUTH.LOGIN).toContain('login')
    })

    it('should have register endpoint', () => {
      expect(ENDPOINTS.AUTH.REGISTER).toBeDefined()
    })

    it('should have current user endpoint', () => {
      expect(ENDPOINTS.AUTH.CURRENT_USER).toBeDefined()
    })

    it('should have Google auth endpoint', () => {
      expect(ENDPOINTS.AUTH.GOOGLE).toBeDefined()
    })

    it('should have get role endpoint', () => {
      expect(ENDPOINTS.AUTH.GET_ROLE).toBeDefined()
    })

    it('should have create org endpoint', () => {
      expect(ENDPOINTS.AUTH.CREATE_ORG).toBeDefined()
    })

    it('should have join org endpoint', () => {
      expect(ENDPOINTS.AUTH.JOIN_ORG).toBeDefined()
    })
  })

  describe('VOICE endpoints', () => {
    it('should have list endpoint', () => {
      expect(ENDPOINTS.VOICE.LIST).toBeDefined()
    })

    it('should have detail endpoint function', () => {
      expect(typeof ENDPOINTS.VOICE.DETAIL).toBe('function')
      const detailUrl = ENDPOINTS.VOICE.DETAIL('123')
      expect(detailUrl).toContain('123')
    })

    it('should have status endpoint function', () => {
      expect(typeof ENDPOINTS.VOICE.STATUS).toBe('function')
      const statusUrl = ENDPOINTS.VOICE.STATUS('456')
      expect(statusUrl).toContain('456')
      expect(statusUrl).toContain('status')
    })

    it('should have signed URL endpoint function', () => {
      expect(typeof ENDPOINTS.VOICE.SIGNED_URL).toBe('function')
      const signedUrl = ENDPOINTS.VOICE.SIGNED_URL('789')
      expect(signedUrl).toContain('789')
    })

    it('should have link contact endpoint function', () => {
      expect(typeof ENDPOINTS.VOICE.LINK_CONTACT).toBe('function')
    })

    it('should have transcription endpoint function', () => {
      expect(typeof ENDPOINTS.VOICE.TRANSCRIPTION).toBe('function')
      const transcriptUrl = ENDPOINTS.VOICE.TRANSCRIPTION('abc')
      expect(transcriptUrl).toContain('abc')
    })

    it('should have translate endpoint function', () => {
      expect(typeof ENDPOINTS.VOICE.TRANSLATE).toBe('function')
    })
  })

  describe('CONTACTS endpoints', () => {
    it('should have list endpoint', () => {
      expect(ENDPOINTS.CONTACTS.LIST).toBeDefined()
    })

    it('should have create endpoint', () => {
      expect(ENDPOINTS.CONTACTS.CREATE).toBeDefined()
    })

    it('should have detail endpoint function', () => {
      expect(typeof ENDPOINTS.CONTACTS.DETAIL).toBe('function')
      const detailUrl = ENDPOINTS.CONTACTS.DETAIL('789')
      expect(detailUrl).toContain('789')
    })

    it('should have update endpoint function', () => {
      expect(typeof ENDPOINTS.CONTACTS.UPDATE).toBe('function')
    })

    it('should have delete endpoint function', () => {
      expect(typeof ENDPOINTS.CONTACTS.DELETE).toBe('function')
    })

    it('should have communications endpoint function', () => {
      expect(typeof ENDPOINTS.CONTACTS.COMMUNICATIONS).toBe('function')
    })

    it('should have export CSV endpoint', () => {
      expect(ENDPOINTS.CONTACTS.EXPORT_CSV).toBeDefined()
    })

    it('should have export ZIP endpoint', () => {
      expect(ENDPOINTS.CONTACTS.EXPORT_ZIP).toBeDefined()
    })

    it('should have sync endpoint', () => {
      expect(ENDPOINTS.CONTACTS.SYNC).toBeDefined()
    })
  })

  describe('MANAGER endpoints', () => {
    it('should have dashboard endpoint', () => {
      expect(ENDPOINTS.MANAGER.DASHBOARD).toBeDefined()
    })

    it('should have subordinates endpoint', () => {
      expect(ENDPOINTS.MANAGER.SUBORDINATES).toBeDefined()
    })

    it('should have subordinate recordings endpoint function', () => {
      expect(typeof ENDPOINTS.MANAGER.SUBORDINATE_RECORDINGS).toBe('function')
    })

    it('should have team summary endpoint', () => {
      expect(ENDPOINTS.MANAGER.TEAM_SUMMARY).toBeDefined()
    })
  })

  describe('OCR endpoints', () => {
    it('should have namecard endpoint', () => {
      expect(ENDPOINTS.OCR.NAMECARD).toBeDefined()
    })

    it('should have add back endpoint function', () => {
      expect(typeof ENDPOINTS.OCR.ADD_BACK).toBe('function')
    })
  })

  describe('USER endpoints', () => {
    it('should have role endpoint', () => {
      expect(ENDPOINTS.USER.ROLE).toBeDefined()
    })

    it('should have tokens endpoint', () => {
      expect(ENDPOINTS.USER.TOKENS).toBeDefined()
    })

    it('should have purchase tokens endpoint', () => {
      expect(ENDPOINTS.USER.PURCHASE_TOKENS).toBeDefined()
    })
  })
})
