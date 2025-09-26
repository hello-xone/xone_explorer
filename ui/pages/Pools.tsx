import { Box, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';

import type { Pool, PoolV2, Token, Dex, PoolsResponse } from 'types/api/pools';

import config from 'configs/app';
import useDebounce from 'lib/hooks/useDebounce';
import getQueryParamString from 'lib/router/getQueryParamString';
import { FilterInput } from 'toolkit/components/filters/FilterInput';
import { apos } from 'toolkit/utils/htmlEntities';
import PoolsListItem from 'ui/pools/PoolsListItem';
import PoolsTable from 'ui/pools/PoolsTable';
import ActionBar, { ACTION_BAR_HEIGHT_DESKTOP } from 'ui/shared/ActionBar';
import DataListDisplay from 'ui/shared/DataListDisplay';
import PageTitle from 'ui/shared/Page/PageTitle';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';

const Pools = () => {
  const router = useRouter();
  const q = getQueryParamString(router.query.query);

  const [ searchTerm, setSearchTerm ] = React.useState<string>(q ?? '');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 添加排序状态
  const [ sortOrder, setSortOrder ] = React.useState<'asc' | 'desc'>('desc');

  // 获取当前 chain_id
  const currentChainId = config.chain.id?.toString() ?? '';

  // 直接使用 useQueryWithPages
  const poolsQuery = useQueryWithPages({
    resourceName: 'contractInfo:pools',
    pathParams: { chainId: currentChainId },
    filters: {
      query: debouncedSearchTerm,
      order: 'h24_volume_usd_desc',
      include: 'base_token,quote_token,dex',
    },
  });

  // 转换数据的逻辑直接在这里
  const transformedData = useMemo((): Array<Pool> | undefined => {
    if (!poolsQuery.data) {
      return undefined;
    }

    let pools: Array<Pool>;

    // 如果数据是新格式，转换它
    if ('data' in poolsQuery.data && 'included' in poolsQuery.data) {
      const poolsResponse = poolsQuery.data as PoolsResponse;
      const tokens = poolsResponse.included.filter((item): item is Token => item.type === 'token');
      const dexes = poolsResponse.included.filter((item): item is Dex => item.type === 'dex');

      pools = poolsResponse.data.map((poolV2: PoolV2) => {
        const baseToken = tokens.find(token => token.id === poolV2.relationships.base_token.data.id);
        const quoteToken = tokens.find(token => token.id === poolV2.relationships.quote_token.data.id);
        const dex = dexes.find(dex => dex.id === poolV2.relationships.dex.data.id);

        if (!baseToken || !quoteToken || !dex) {
          throw new Error('Missing required token or dex data');
        }

        return {
          pool_id: poolV2.attributes.address,
          is_contract: true,
          chain_id: currentChainId,
          base_token_address: baseToken.attributes.address,
          base_token_symbol: baseToken.attributes.symbol,
          base_token_icon_url: baseToken.attributes.image_url,
          quote_token_address: quoteToken.attributes.address,
          quote_token_symbol: quoteToken.attributes.symbol,
          quote_token_icon_url: quoteToken.attributes.image_url,
          base_token_fully_diluted_valuation_usd: poolV2.attributes.fdv_usd,
          base_token_market_cap_usd: poolV2.attributes.market_cap_usd,
          quote_token_fully_diluted_valuation_usd: null,
          quote_token_market_cap_usd: null,
          liquidity: poolV2.attributes.reserve_in_usd,
          dex: {
            id: dex.id,
            name: dex.attributes.name,
          },
          coin_gecko_terminal_url: '',
        };
      });
    } else {
      // 如果是旧格式，返回 items
      pools = (poolsQuery.data as { items?: Array<Pool> })?.items || [];
    }

    // 根据 Liquidity 排序
    return pools.sort((a, b) => {
      const liquidityA = parseFloat(a.liquidity) || 0;
      const liquidityB = parseFloat(b.liquidity) || 0;

      return sortOrder === 'desc' ? liquidityB - liquidityA : liquidityA - liquidityB;
    });
  }, [ poolsQuery.data, currentChainId, sortOrder ]);

  const handleSearchTermChange = React.useCallback((value: string) => {
    poolsQuery.onFilterChange({ query: value });
    setSearchTerm(value);
  }, [ poolsQuery ]);

  // 处理排序点击
  const handleSortChange = React.useCallback(() => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  }, []);

  const content = (
    <>
      <Box hideFrom="lg">
        { transformedData?.map((item: Pool, index: number) => (
          <PoolsListItem
            key={ item.pool_id + (poolsQuery.isPlaceholderData ? index : '') }
            isLoading={ poolsQuery.isPlaceholderData }
            item={ item }
          />
        )) }
      </Box>
      <Box hideBelow="lg">
        <PoolsTable
          items={ transformedData ?? [] }
          top={ poolsQuery.pagination.isVisible ? ACTION_BAR_HEIGHT_DESKTOP : 0 }
          isLoading={ poolsQuery.isPlaceholderData }
          page={ poolsQuery.pagination.page }
          sortOrder={ sortOrder }
          onSortChange={ handleSortChange }
        />
      </Box>
    </>
  );

  const filter = (
    <FilterInput
      w={{ base: '100%', lg: '360px' }}
      size="sm"
      onChange={ handleSearchTermChange }
      placeholder="Pair, token symbol or token address"
      initialValue={ searchTerm }
    />
  );

  const actionBar = (
    <>
      <Flex mb={ 6 } display={{ base: 'flex', lg: 'none' }}>
        { filter }
      </Flex>
      <ActionBar
        mt={ -6 }
        display={{ base: poolsQuery.pagination.isVisible ? 'flex' : 'none', lg: 'flex' }}
      >
        <Box hideBelow="lg">
          { filter }
        </Box>
        <Pagination { ...poolsQuery.pagination } ml="auto"/>
      </ActionBar>
    </>
  );

  return (
    <>
      <PageTitle
        title="DEX tracker"
        withTextAd
      />
      <DataListDisplay
        isError={ poolsQuery.isError }
        itemsNum={ transformedData?.length }
        emptyText="There are no pools."
        actionBar={ actionBar }
        filterProps={{
          emptyFilteredText: `Couldn${ apos }t find pools that matches your filter query.`,
          hasActiveFilters: Boolean(debouncedSearchTerm),
        }}
      >
        { content }
      </DataListDisplay>
    </>
  );
};

export default Pools;
