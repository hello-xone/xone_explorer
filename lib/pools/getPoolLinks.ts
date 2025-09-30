import type { Pool } from 'types/api/pools';

type PoolLink = {
  url: string;
  image?: string;
  title: string;
};

export default function getPoolLinks(pool?: Pool): Array<PoolLink> {
  if (!pool) {
    return [];
  }
  return [
    {
      url: `https://swapx.exchange/zh/pool/v2?id=${ pool.pool_id }`,
      title: 'SwapX',
      image: '/static/swapx.svg',
    },
    {
      url: `https://www.geckoterminal.com/xone/pools/${ pool.pool_id }`,
      title: 'GeckoTerminal',
      image: 'https://raw.githubusercontent.com/blockscout/frontend-configs/main/configs/explorer-logos/geckoterminal.png',

    },
  ].filter(link => Boolean(link.url));
}
