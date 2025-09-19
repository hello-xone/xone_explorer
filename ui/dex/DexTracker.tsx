import { Box, Flex } from '@chakra-ui/react';
import React from 'react';

import type { Pool } from 'types/api/pools';

import { FilterInput } from 'toolkit/components/filters/FilterInput';
import { apos } from 'toolkit/utils/htmlEntities';
import ActionBar, { ACTION_BAR_HEIGHT_DESKTOP } from 'ui/shared/ActionBar';
import DataListDisplay from 'ui/shared/DataListDisplay';
import PageTitle from 'ui/shared/Page/PageTitle';
import Pagination from 'ui/shared/pagination/Pagination';

import DexTransfersListItem from './DexTrackerListItem';
import DexTransfersTable from './DexTrackerTable';

const DexTracker = () => {
  const [ searchTerm, setSearchTerm ] = React.useState<string>('');
  const [ currentPage, setCurrentPage ] = React.useState(1);
  const [ itemsPerPage, setItemsPerPage ] = React.useState(10);
  const [ isLoading ] = React.useState(false);

  // Mock 数据生成函数
  const createMockPool = (overrides: Partial<Pool>) => ({
    pool_id: '0x1234567890abcdef1234567890abcdef12345678',
    base_token_symbol: 'XONE',
    quote_token_symbol: 'WETH',
    liquidity: '1250000',
    dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
    is_contract: false,
    chain_id: '1',
    base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
    base_token_icon_url: null,
    quote_token_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    quote_token_icon_url: null,
    exchange_rate: '0.0008',
    fdv_usd: '1250000',
    market_cap_usd: '1000000',
    price_change_24h: '2.5',
    token_0_address: '0x1234567890abcdef1234567890abcdef12345678',
    token_1_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    base_token_fully_diluted_valuation_usd: '1250000',
    base_token_market_cap_usd: '1000000',
    quote_token_fully_diluted_valuation_usd: '2000000000',
    quote_token_market_cap_usd: '2000000000',
    coin_gecko_terminal_url: '',
    ...overrides,
  });

  // Mock 数据
  const mockData = React.useMemo(() => {
    const pools = [
      createMockPool({
        pool_id: '0x01416842ca5d3e1234567890abcdef1234567890',
        base_token_symbol: 'LINK',
        quote_token_symbol: 'WETH',
        liquidity: '18480000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x514910771af9ca656af840dff83e8264ecf986ca',
      }),
      createMockPool({
        pool_id: '0x1234567890abcdef1234567890abcdef12345678',
        base_token_symbol: 'ONDO',
        quote_token_symbol: 'WETH',
        liquidity: '8230000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c',
      }),
      createMockPool({
        pool_id: '0xabcdef1234567890abcdef1234567890abcdef12',
        base_token_symbol: 'TRUMP',
        quote_token_symbol: 'WETH',
        liquidity: '8140000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      }),
      createMockPool({
        pool_id: '0x9876543210fedcba9876543210fedcba98765432',
        base_token_symbol: 'CAT',
        quote_token_symbol: 'WETH',
        liquidity: '7820000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
      createMockPool({
        pool_id: '0xfedcba9876543210fedcba9876543210fedcba98',
        base_token_symbol: 'PEPE',
        quote_token_symbol: 'WETH',
        liquidity: '6860000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
      }),
      createMockPool({
        pool_id: '0x1111111111111111111111111111111111111111',
        base_token_symbol: 'SHIB',
        quote_token_symbol: 'WETH',
        liquidity: '6830000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
      }),
      createMockPool({
        pool_id: '0x2222222222222222222222222222222222222222',
        base_token_symbol: 'DOGE',
        quote_token_symbol: 'WETH',
        liquidity: '6690000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x4206931337dc273a630d328da6441786bfad668f',
      }),
      createMockPool({
        pool_id: '0x3333333333333333333333333333333333333333',
        base_token_symbol: 'WIF',
        quote_token_symbol: 'WETH',
        liquidity: '6460000000',
        dex: { id: 'pancakeswap-v3', name: 'Pancakeswap V3 (Ethereum)' },
        base_token_address: '0x768d7cbfc344c6fe46fc4e110ab4df2c5c86e6db',
      }),
      createMockPool({
        pool_id: '0x4444444444444444444444444444444444444444',
        base_token_symbol: 'FLOKI',
        quote_token_symbol: 'WETH',
        liquidity: '5300000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0xcf0c122c6b73ff809c693db761e7baebe62b6a2e',
      }),
      createMockPool({
        pool_id: '0x5555555555555555555555555555555555555555',
        base_token_symbol: 'BONK',
        quote_token_symbol: 'WETH',
        liquidity: '5080000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1151cb3d6059204834e4644ac44b17b4e6c9b6b',
      }),
      createMockPool({
        pool_id: '0x6666666666666666666666666666666666666666',
        base_token_symbol: 'MEME',
        quote_token_symbol: 'WETH',
        liquidity: '4500000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
      createMockPool({
        pool_id: '0x7777777777777777777777777777777777777777',
        base_token_symbol: 'AI',
        quote_token_symbol: 'WETH',
        liquidity: '4200000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
      createMockPool({
        pool_id: '0x8888888888888888888888888888888888888888',
        base_token_symbol: 'GME',
        quote_token_symbol: 'WETH',
        liquidity: '3800000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
      createMockPool({
        pool_id: '0x9999999999999999999999999999999999999999',
        base_token_symbol: 'AMC',
        quote_token_symbol: 'WETH',
        liquidity: '3500000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
      createMockPool({
        pool_id: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        base_token_symbol: 'BB',
        quote_token_symbol: 'WETH',
        liquidity: '3200000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
      createMockPool({
        pool_id: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        base_token_symbol: 'CC',
        quote_token_symbol: 'WETH',
        liquidity: '3000000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
      createMockPool({
        pool_id: '0xcccccccccccccccccccccccccccccccccccccccc',
        base_token_symbol: 'DD',
        quote_token_symbol: 'WETH',
        liquidity: '2800000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
      createMockPool({
        pool_id: '0xdddddddddddddddddddddddddddddddddddddddd',
        base_token_symbol: 'EE',
        quote_token_symbol: 'WETH',
        liquidity: '2600000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
      createMockPool({
        pool_id: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        base_token_symbol: 'FF',
        quote_token_symbol: 'WETH',
        liquidity: '2400000000',
        dex: { id: 'uniswap-v3', name: 'Uniswap V3' },
        base_token_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
    ];

    // 根据搜索词过滤数据
    if (searchTerm) {
      return pools.filter(pool =>
        pool.base_token_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.quote_token_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.dex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.pool_id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return pools;
  }, [ searchTerm ]);

  // 分页逻辑
  const totalPages = Math.ceil(mockData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = mockData.slice(startIndex, endIndex);

  // 分页信息
  const paginationInfo = {
    totalItems: mockData.length,
    currentPage,
    totalPages,
    itemsPerPage,
    startItem: startIndex + 1,
    endItem: Math.min(endIndex, mockData.length),
  };

  const handleSearchTermChange = React.useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // 重置到第一页
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = React.useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 重置到第一页
  }, []);

  const content = (
    <>
      <Box hideFrom="lg">
        { currentItems.map((item, index) => (
          <DexTransfersListItem
            key={ item.pool_id + index }
            isLoading={ isLoading }
            item={ item }
          />
        )) }
      </Box>
      <Box hideBelow="lg">
        <DexTransfersTable
          items={ currentItems }
          top={ totalPages > 1 ? ACTION_BAR_HEIGHT_DESKTOP : 0 }
          isLoading={ isLoading }
          page={ currentPage }
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

  const paginationProps = {
    page: currentPage,
    onPageChange: handlePageChange,
    onNextPageClick: () => handlePageChange(currentPage + 1),
    onPrevPageClick: () => handlePageChange(currentPage - 1),
    resetPage: () => handlePageChange(1),
    hasPages: totalPages > 1,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    canGoBackwards: currentPage > 1,
    isLoading: isLoading,
    isVisible: true,
    // 添加分页信息显示
    showInfo: true,
    infoText: `${ paginationInfo.startItem }-${ paginationInfo.endItem } of ${ paginationInfo.totalItems }`,
    // 添加每页显示数量选择
    itemsPerPage: itemsPerPage,
    onItemsPerPageChange: handleItemsPerPageChange,
    itemsPerPageOptions: [ 10, 25, 50, 100 ],
  };

  const actionBar = (
    <>
      <Flex mb={ 6 } display={{ base: 'flex', lg: 'none' }}>
        { filter }
      </Flex>
      <ActionBar
        mt={ -6 }
        display="flex"
      >
        <Box hideBelow="lg">
          { filter }
        </Box>
        <Pagination { ...paginationProps } ml="auto"/>
      </ActionBar>
    </>
  );

  return (
    <>
      <PageTitle
        title="DEX Tracker"
        withTextAd
      />
      <DataListDisplay
        isError={ false }
        itemsNum={ currentItems.length }
        emptyText="There are no DEX pools."
        actionBar={ actionBar }
        filterProps={{
          emptyFilteredText: `Couldn${ apos }t find DEX pools that matches your filter query.`,
          hasActiveFilters: Boolean(searchTerm),
        }}
      >
        { content }
      </DataListDisplay>
    </>
  );
};

export default React.memo(DexTracker);
