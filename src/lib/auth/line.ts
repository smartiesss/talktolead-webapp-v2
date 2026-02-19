/**
 * LINE OAuth Integration for TalkToLead Webapp
 * 
 * LINE Login flow:
 * 1. Redirect user to LINE authorization URL
 * 2. User approves, LINE redirects back with code
 * 3. Exchange code for access token via backend
 * 4. Receive JWT and user info
 */

const LINE_CHANNEL_ID = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '';
const LINE_CALLBACK_URL = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL || 'http://localhost:3000/auth/line/callback';

/**
 * Generate LINE OAuth authorization URL
 * Redirects user to LINE login page
 */
export function getLineAuthUrl(): string {
  if (!LINE_CHANNEL_ID) {
    throw new Error('LINE_CHANNEL_ID not configured');
  }

  // Generate random state for CSRF protection
  const state = generateRandomState();
  sessionStorage.setItem('line_oauth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINE_CHANNEL_ID,
    redirect_uri: LINE_CALLBACK_URL,
    state: state,
    scope: 'profile openid',
  });

  return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
}

/**
 * Verify LINE OAuth callback state
 */
export function verifyLineState(state: string): boolean {
  const savedState = sessionStorage.getItem('line_oauth_state');
  sessionStorage.removeItem('line_oauth_state');
  return savedState === state;
}

/**
 * Generate random state for CSRF protection
 */
function generateRandomState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if LINE OAuth is configured
 */
export function isLineConfigured(): boolean {
  return !!LINE_CHANNEL_ID;
}
