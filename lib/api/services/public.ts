import type { ApiResource } from '../types';

export const XONEPUBLIC_API_RESOURCES = {
  subscribe: {
    path: '/emailsub/subscribe',
  },
  chart: {
    path: '/coindata/chart',
  },
} satisfies Record<string, ApiResource>;

export type XonePublicApiResourceName = `xonePublic:${ keyof typeof XONEPUBLIC_API_RESOURCES }`;

export interface XonePublicBaseResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ChartResponse {
  circulating_supply: number;
  current_price: number;
  market_cap: number;
  price_fluctuation: number;
  total_accounts: number;
  transaction_amounts_today: number;
  transactions_today: number;
}

/* eslint-disable @stylistic/indent */
export type XonePublicApiResourcePayload<R extends XonePublicApiResourceName> =
  R extends 'xonePublic:subscribe' ? boolean :
  R extends 'xonePublic:chart' ? XonePublicBaseResponse<ChartResponse> :
  never;
/* eslint-enable @stylistic/indent */
