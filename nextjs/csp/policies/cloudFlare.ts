import type CspDev from 'csp-dev';

import { KEY_WORDS } from '../utils';

// CloudFlare analytics and Turnstile
export function cloudFlare(): CspDev.DirectiveDescriptor {
  return {
    'script-src': [
      'static.cloudflareinsights.com',
      'challenges.cloudflare.com',
      // Specific hash for Turnstile inline script (from browser error message)
      '\'sha256-3bzWVxQE32IZQKH9eh8KzyHuhXOlMrboDVVBRd0fWTU=\'',
      // Fallback: Allow inline scripts for Turnstile functionality
      // Note: This is required for Turnstile to work properly with CSP
      KEY_WORDS.UNSAFE_INLINE,
    ],
    'frame-src': [
      'challenges.cloudflare.com',
    ],
    'style-src': [
      KEY_WORDS.DATA,
      // Allow inline styles for Turnstile
      KEY_WORDS.UNSAFE_INLINE,
    ],
    'connect-src': [
      'challenges.cloudflare.com',
    ],
  };
}
