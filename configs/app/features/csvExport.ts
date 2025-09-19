import type { Feature } from './types';

import services from '../services';

const title = 'Export data to CSV file';

const config: Feature<{ turnstile: { siteKey: string } }> = (() => {
  if (services.cloudflareTurnstile.siteKey) {
    return Object.freeze({
      title,
      isEnabled: true,
      turnstile: {
        siteKey: services.cloudflareTurnstile.siteKey,
      },
    });
  }
  return Object.freeze({
    title,
    isEnabled: false,
  });
})();

export default config;
