import type { Feature } from './types';

import services from '../services';
import { getEnvValue } from '../utils';

const title = 'My account';

const config: Feature<{ isEnabled: true; turnstileSiteKey: string }> = (() => {
  if (getEnvValue('NEXT_PUBLIC_IS_ACCOUNT_SUPPORTED') === 'true' && services.cloudflareTurnstile.siteKey) {
    return Object.freeze({
      title,
      isEnabled: true,
      turnstileSiteKey: services.cloudflareTurnstile.siteKey,
    });
  }

  return Object.freeze({
    title,
    isEnabled: false,
  });
})();

export default config;
