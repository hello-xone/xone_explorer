import type { Feature } from './types';
import type { DeFiDropdownItem } from 'types/client/deFiDropdown';

const items = [
  { text: 'RainLink', icon: 'static/rainlink.svg', link: 'https://rainlink.co', dappId: 'rainlink' },
  { text: 'SwapX', icon: 'static/Swap.svg', link: 'https://swapx.exchange/en', dappId: 'swapx' },
];

const title = 'Bridge & Swap';

const config: Feature<{ items: Array<DeFiDropdownItem> }> =
  items.length > 0 ?
    Object.freeze({
      title,
      isEnabled: true,
      items,
    }) :
    Object.freeze({
      title,
      isEnabled: false,
    });

export default config;
