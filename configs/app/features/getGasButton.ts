import type { Feature } from './types';

import marketplace from './marketplace';

const value = {
  name: 'Need gas?',
  url_template: 'https://faucet.xone.org/',
  dapp_id: '',
  logo: 'https://blockscout-content.s3.amazonaws.com/smolrefuel-logo-action-button.png',
};

const title = 'Get gas button';
const config: Feature<{
  name: string;
  logoUrl?: string;
  url: string;
  dappId?: string;
}> = (() => {
  if (value) {
    return Object.freeze({
      title,
      isEnabled: true,
      name: value.name,
      logoUrl: value.logo,
      url: value.url_template,
      dappId: marketplace.isEnabled ? value.dapp_id : undefined,
    });
  }

  return Object.freeze({
    title,
    isEnabled: false,
  });
})();

export default config;
