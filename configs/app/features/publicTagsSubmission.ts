import type { Feature } from './types';

import apis from '../apis';
import services from '../services';
import addressMetadata from './addressMetadata';

const title = 'Public tag submission';

const config: Feature<{}> = (() => {
  console.log('services.cloudflareTurnstile.siteKey', services.cloudflareTurnstile.siteKey);
  console.log('addressMetadata.isEnabled', addressMetadata.isEnabled);
  console.log('apis.admin', apis.admin);
  if (services.cloudflareTurnstile.siteKey && addressMetadata.isEnabled && apis.admin) {
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
