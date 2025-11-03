import type { ApiResource } from '../types';
import type { AddressTag } from 'types/api/account';
import type { TokenInfo, TokenType } from 'types/api/token';
import type { TokensResponse, TokensFilters, TokensSorting } from 'types/api/tokens';

// XONE API 返回的原始数据结构
export interface XoneTokenInfo {
  address: string;
  address_hash: string;
  circulating_market_cap: string | null;
  decimals: string;
  exchange_rate: string | null;
  holders: string;
  icon_url: string | null;
  name: string;
  symbol: string;
  total_supply: string;
  type: TokenType;
  volume_24h: string | null;
  is_verified: boolean;
  is_submit_token_info: boolean;
}

// XONE API 返回的原始响应结构（包含 items 数组和分页参数）
export interface XoneTokensRawResponse {
  items: Array<XoneTokenInfo>;
  next_page_params: {
    contract_address_hash: string;
    fiat_value: string | null;
    holder_count: number;
    is_name_null: boolean;
    items_count: number;
    market_cap: string | null;
    name: string;
  } | null;
}

// 字段映射函数：将 XONE API 的字段名转换为项目期望的字段名
function transformXoneTokenInfo(xoneToken: XoneTokenInfo): TokenInfo {
  return {
    address_hash: xoneToken.address_hash || xoneToken.address,
    address: xoneToken.address || xoneToken.address_hash,
    type: xoneToken.type,
    symbol: xoneToken.symbol,
    name: xoneToken.name,
    decimals: xoneToken.decimals,
    holders_count: xoneToken.holders,
    exchange_rate: xoneToken.exchange_rate,
    total_supply: xoneToken.total_supply,
    icon_url: xoneToken.icon_url,
    circulating_market_cap: xoneToken.circulating_market_cap,
    is_submit_token_info: xoneToken.is_submit_token_info,
    is_verified: xoneToken.is_verified,
    // 项目中没有的字段设为默认值
    is_bridged: null,
    bridge_type: null,
    origin_chain_id: null,
    foreign_address: null,
    filecoin_robust_address: null,
  };
}

// 转换函数：将 XONE API 的 items 对象格式转换为项目期望的分页格式
export function transformXoneTokensResponse(rawResponse: XoneTokensRawResponse): TokensResponse {
  return {
    items: rawResponse.items.map(transformXoneTokenInfo),
    next_page_params: rawResponse.next_page_params,
  };
}

export interface TokenInfoResponse {
  data: {
    Basic_Information: Record<string, string>;
    Social_Profiles: Record<string, string>;
    Price_Data: Record<string, string>;
    metadata: Record<string, string>;
  };
  success: boolean;
}
export function transformTokenInfoResponse(rawResponse: TokenInfoResponse) {
  return rawResponse.data && rawResponse.success ? {
    ...rawResponse.data.Basic_Information,
    ...rawResponse.data.Social_Profiles,
    ...rawResponse.data.Price_Data,
    ...rawResponse.data.metadata,
  } : {};
}

export const XONE_API_RESOURCES = {
  // XONE Tokens API - 使用 api.xone.works 端点
  tokens: {
    path: '/api/v2/tokens',
    filterFields: [ 'q' as const, 'type' as const ],
    paginated: true,
  },
  private_tags_address: {
    path: '/api/account/v2/user/tags/address{/:id}',
    pathParams: [ 'id' as const ],
    filterFields: [],
    paginated: true,
  },
} satisfies Record<string, ApiResource>;

export type XoneApiResourceName = `xone:${ keyof typeof XONE_API_RESOURCES }`;

/* eslint-disable @stylistic/indent */
export type XoneApiResourcePayload<R extends XoneApiResourceName> =
  R extends 'xone:tokens' ? TokensResponse :
  R extends 'xone:private_tags_address' ? Array<AddressTag> :
  never;
/* eslint-enable @stylistic/indent */

// 用于测试的原始响应类型
/* eslint-disable @stylistic/indent */
export type XoneApiRawResourcePayload<R extends XoneApiResourceName> =
  R extends 'xone:tokens' ? XoneTokensRawResponse :
  never;
/* eslint-enable @stylistic/indent */

/* eslint-disable @stylistic/indent */
export type XoneApiPaginationFilters<R extends XoneApiResourceName> =
  R extends 'xone:tokens' ? TokensFilters :
  never;
/* eslint-enable @stylistic/indent */

/* eslint-disable @stylistic/indent */
export type XoneApiPaginationSorting<R extends XoneApiResourceName> =
  R extends 'xone:tokens' ? TokensSorting :
  never;
/* eslint-enable @stylistic/indent */
