import type { ApiResource } from '../types';
import type { VerifiedAddressResponse } from 'types/api/account';
import type { PoolsResponse, PoolResponse } from 'types/api/pools';
import type { TokenVerifiedInfo } from 'types/api/token';

export const CONTRACT_INFO_API_RESOURCES = {
  address_verification: {
    path: '/api/v1/chains/:chainId/verified-addresses:type',
    pathParams: [ 'chainId' as const, 'type' as const ],
  },
  verified_addresses: {
    path: '/api/v1/chains/:chainId/verified-addresses',
    pathParams: [ 'chainId' as const ],
  },
  token_verified_info: {
    path: '/api/v1/chains/:chainId/token-infos/:hash',
    pathParams: [ 'chainId' as const, 'hash' as const ],
  },
  update_token_verified_info: {
    path: '/api/v1/chains/:chainId/token-infos',
    pathParams: [ 'chainId' as const ],
  },
  pools: {
    path: '/api/v1/chains/:chainId/pools',
    pathParams: [ 'chainId' as const ],
    filterFields: [ 'query' as const, 'order' as const, 'include' as const ],
    paginated: true,
  },
  pool: {
    path: '/api/v1/chains/:chainId/pools/:hash',
    pathParams: [ 'chainId' as const, 'hash' as const ],
    filterFields: [ 'include' as const ],
  },
} satisfies Record<string, ApiResource>;

export type ContractInfoApiResourceName = `contractInfo:${ keyof typeof CONTRACT_INFO_API_RESOURCES }`;

/* eslint-disable @stylistic/indent */
export type ContractInfoApiResourcePayload<R extends ContractInfoApiResourceName> =
R extends 'contractInfo:verified_addresses' ? VerifiedAddressResponse :
R extends 'contractInfo:token_verified_info' ? TokenVerifiedInfo :
R extends 'contractInfo:update_token_verified_info' ? Boolean :
R extends 'contractInfo:pools' ? PoolsResponse :
R extends 'contractInfo:pool' ? PoolResponse :
never;
/* eslint-enable @stylistic/indent */

/* eslint-disable @stylistic/indent */
export type ContractInfoApiPaginationFilters<R extends ContractInfoApiResourceName> =
R extends 'contractInfo:pools' ? { query?: string; order?: string; include?: string; page?: string | null } :
never;
/* eslint-enable @stylistic/indent */
