import type { Feature } from './types';
import type { DeFiDropdownItem } from 'types/client/deFiDropdown';

const items = [
  { text: 'RainLink', icon: 'static/rainlink.svg', url: 'https://rainlink.co' },
  { text: 'SwapX', icon: 'static/Swap.svg', url: 'https://swapx.exchange/en' },
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
