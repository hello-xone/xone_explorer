import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import multichainConfig from 'configs/multichain';
import { useMultichainContext } from 'lib/contexts/multichain';
import type { Params as FetchParams } from 'lib/hooks/useFetch';

import type { ResourceError, ResourceName, ResourcePathParams, ResourcePayload } from './resources';
import type { XoneTokensRawResponse } from './services/xone';
import { transformXoneTokensResponse } from './services/xone';
import useApiFetch from './useApiFetch';

// 为general:stats添加的特殊处理函数类型
type StatsResponseInterceptor = (
  data: ResourcePayload<'general:stats'>,
  fetch: ReturnType<typeof useApiFetch>
) => Promise<ResourcePayload<'general:stats'>>;

export interface Params<R extends ResourceName, E = unknown, D = ResourcePayload<R>> {
  pathParams?: ResourcePathParams<R>;
  queryParams?: Record<string, string | Array<string> | number | boolean | undefined>;
  fetchParams?: Pick<FetchParams, 'body' | 'method' | 'headers'>;
  queryOptions?: Partial<Omit<UseQueryOptions<ResourcePayload<R>, ResourceError<E>, D>, 'queryFn'>>;
  logError?: boolean;
  chainSlug?: string;
  // 添加可选的响应拦截器
  responseInterceptor?: R extends 'general:stats' ? StatsResponseInterceptor : undefined;
}

export interface GetResourceKeyParams<R extends ResourceName, E = unknown, D = ResourcePayload<R>>
  extends Pick<Params<R, E, D>, 'pathParams' | 'queryParams'> {
  chainSlug?: string;
}

export function getResourceKey<R extends ResourceName>(resource: R, { pathParams, queryParams, chainSlug }: GetResourceKeyParams<R> = {}) {
  if (pathParams || queryParams) {
    return [ resource, chainSlug, { ...pathParams, ...queryParams } ].filter(Boolean);
  }

  return [ resource, chainSlug ].filter(Boolean);
}

/**
 * 默认的general:stats响应拦截器，当coin_price为空时，从general:stats_charts_market获取价格
 */
const defaultStatsResponseInterceptor: StatsResponseInterceptor = async(data, fetch) => {
  if (data.coin_price === null || data.coin_price === undefined || data.coin_price === '') {
    try {
      const chartRes = (await fetch('xonePublic:chart')) as ResourcePayload<'xonePublic:chart'>;
      if (chartRes && chartRes.code === 0 && chartRes.data) {
        return {
          ...data,
          coin_price: chartRes.data.current_price.toString(),
          coin_price_change_percentage: Number(chartRes.data.price_fluctuation.toFixed(2)),
          market_cap: chartRes.data.market_cap?.toString(),
          tvl: chartRes.data.transactions_today.toString(),
        };
      }
    } catch (error) {
      return data;
    }
  }

  // 如果不需要或无法更新价格，返回原始数据
  return data;
};

export default function useApiQuery<R extends ResourceName, E = unknown, D = ResourcePayload<R>>(
  resource: R,
  { queryOptions, pathParams, queryParams, fetchParams, logError, chainSlug, responseInterceptor }: Params<R, E, D> = {},
) {
  const apiFetch = useApiFetch();
  const { chain } = useMultichainContext() ||
    { chain: chainSlug ? multichainConfig()?.chains.find((chain) => chain.slug === chainSlug) : undefined };

  return useQuery<ResourcePayload<R>, ResourceError<E>, D>({
    queryKey: queryOptions?.queryKey || getResourceKey(resource, { pathParams, queryParams, chainSlug: chain?.slug }),
    queryFn: async({ signal }) => {
      // 执行原始API请求
      const response = await apiFetch(resource, { pathParams, queryParams, chain, logError, fetchParams: { ...fetchParams, signal } });

      // 对于general:stats资源，应用响应拦截器
      if (resource === 'general:stats') {
        // 使用提供的拦截器或默认拦截器
        const interceptor = (responseInterceptor as StatsResponseInterceptor) || defaultStatsResponseInterceptor;
        return interceptor(response as ResourcePayload<'general:stats'>, apiFetch) as Promise<ResourcePayload<R>>;
      }

      // 对于xone:tokens资源，转换数组格式为分页格式
      if (resource === 'xone:tokens') {
        const rawResponse = response as XoneTokensRawResponse;
        return transformXoneTokensResponse(rawResponse) as ResourcePayload<R>;
      }

      return response as Promise<ResourcePayload<R>>;
    },
    ...queryOptions,
  });
}
