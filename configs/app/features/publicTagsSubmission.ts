import type { Feature } from './types';

import services from '../services';
import addressMetadata from './addressMetadata';

const title = 'Public tag submission';
const config: Feature<{}> = (() => {
  if (services.cloudflareTurnstile.siteKey && addressMetadata.isEnabled) {
    return Object.freeze({
      title,
      isEnabled: true,
    });
  }

  return Object.freeze({
    title,
    isEnabled: false,
  });
})();

export default config;
