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
  ].filter(link => Boolean(link.url));
}
