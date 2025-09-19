import { getEnvValue } from './utils';

export default Object.freeze({
  cloudflareTurnstile: {
    siteKey: getEnvValue('NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY'),
  },
});
