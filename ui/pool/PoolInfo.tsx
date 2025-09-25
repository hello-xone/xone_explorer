import { Box, Flex, Text, chakra } from '@chakra-ui/react';
import React, { useState, useCallback, useMemo } from 'react';

import type { Pool, PoolV2 } from 'types/api/pools';

import { Button } from 'toolkit/chakra/button';
import { Skeleton } from 'toolkit/chakra/skeleton';
import * as DetailedInfo from 'ui/shared/DetailedInfo/DetailedInfo';
import DetailedInfoSponsoredItem from 'ui/shared/DetailedInfo/DetailedInfoSponsoredItem';
import TokenEntity from 'ui/shared/entities/token/TokenEntity';

type Props = {
  data: Pool;
  isPlaceholderData: boolean;
  poolV2Data?: PoolV2; // 新的详细数据格式
};

// 时间范围类型
type TimeRange = 'm5' | 'm15' | 'm30' | 'h1' | 'h6' | 'h24';

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: 'm5', label: '5m' },
  { value: 'm15', label: '15m' },
  { value: 'm30', label: '30m' },
  { value: 'h1', label: '1h' },
  { value: 'h6', label: '6h' },
  { value: 'h24', label: '24h' },
];

const PoolInfo = ({ data, isPlaceholderData, poolV2Data }: Props) => {
  const [ selectedTimeRange, setSelectedTimeRange ] = useState<TimeRange>('h24');

  // 格式化百分比变化的辅助函数
  const formatPercentageChange = useCallback((value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const color = numValue >= 0 ? 'green.500' : 'red.500';
    const sign = numValue >= 0 ? '+' : '';
    return (
      <chakra.span color={ color }>
        { sign }{ numValue.toFixed(2) }%
      </chakra.span>
    );
  }, []);

  // 格式化数字的辅助函数
  const formatNumber = useCallback((value: string | number, options?: Intl.NumberFormatOptions) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toLocaleString(undefined, { maximumFractionDigits: 2, ...options });
  }, []);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setSelectedTimeRange(range);
  }, []);

  const timeRangeButtons = useMemo(() => {
    const createClickHandler = (value: TimeRange) => () => handleTimeRangeChange(value);
    return TIME_RANGE_OPTIONS.map((option) => (
      <Button
        key={ option.value }
        size="sm"
        variant={ selectedTimeRange === option.value ? 'solid' : 'outline' }
        onClick={ createClickHandler(option.value) }
        loading={ isPlaceholderData }
      >
        { option.label }
      </Button>
    ));
  }, [ selectedTimeRange, isPlaceholderData, handleTimeRangeChange ]);

  return (
    <DetailedInfo.Container>
      { /* 基本信息部分 */ }
      <DetailedInfo.ItemLabel
        isLoading={ isPlaceholderData }
        hint="The base token in a liquidity pool pair"
      >
        Base token
      </DetailedInfo.ItemLabel>
      <DetailedInfo.ItemValue>
        <TokenEntity
          token={{
            type: 'ERC-20',
            address_hash: data.base_token_address,
            name: data.base_token_symbol,
            symbol: data.base_token_symbol,
            icon_url: data.base_token_icon_url,
          }}
          isLoading={ isPlaceholderData }
          query={{ from_pool: 'true', pool_id: data.pool_id }}
        />
      </DetailedInfo.ItemValue>

      <DetailedInfo.ItemLabel
        isLoading={ isPlaceholderData }
        hint="The quote token in a liquidity pool pair"
      >
        Quote token
      </DetailedInfo.ItemLabel>
      <DetailedInfo.ItemValue>
        <TokenEntity
          token={{
            type: 'ERC-20',
            address_hash: data.quote_token_address,
            name: data.quote_token_symbol,
            symbol: data.quote_token_symbol,
            icon_url: data.quote_token_icon_url,
          }}
          isLoading={ isPlaceholderData }
          query={{ from_pool: 'true', pool_id: data.pool_id }}
        />
      </DetailedInfo.ItemValue>

      { /* 价格信息部分 */ }
      { poolV2Data && (
        <>
          <DetailedInfo.ItemLabel
            isLoading={ isPlaceholderData }
            hint="Current price of base token in USD"
          >
            Base token price (USD)
          </DetailedInfo.ItemLabel>
          <DetailedInfo.ItemValue>
            <Skeleton loading={ isPlaceholderData }>
              ${ formatNumber(poolV2Data.attributes.base_token_price_usd, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 12,
                notation: parseFloat(poolV2Data.attributes.base_token_price_usd) < 0.01 ? 'scientific' : 'standard',
              }) }
            </Skeleton>
          </DetailedInfo.ItemValue>

          <DetailedInfo.ItemLabel
            isLoading={ isPlaceholderData }
            hint="Current price of quote token in USD"
          >
            Quote token price (USD)
          </DetailedInfo.ItemLabel>
          <DetailedInfo.ItemValue>
            <Skeleton loading={ isPlaceholderData }>
              ${ formatNumber(poolV2Data.attributes.quote_token_price_usd, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              }) }
            </Skeleton>
          </DetailedInfo.ItemValue>

          <DetailedInfo.ItemLabel
            isLoading={ isPlaceholderData }
            hint="Price of base token in quote token units"
          >
            Base/Quote price
          </DetailedInfo.ItemLabel>
          <DetailedInfo.ItemValue>
            <Skeleton loading={ isPlaceholderData }>
              { formatNumber(poolV2Data.attributes.base_token_price_quote_token, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 12,
                notation: parseFloat(poolV2Data.attributes.base_token_price_quote_token) < 0.01 ? 'scientific' : 'standard',
              }) } { data.quote_token_symbol }
            </Skeleton>
          </DetailedInfo.ItemValue>
        </>
      ) }

      { /* 市值信息 */ }
      <DetailedInfo.ItemLabel
        isLoading={ isPlaceholderData }
        hint="Fully Diluted Valuation: theoretical market cap if all tokens were in circulation"
      >
        Base token FDV
      </DetailedInfo.ItemLabel>
      <DetailedInfo.ItemValue>
        <Skeleton loading={ isPlaceholderData }>
          { data.base_token_fully_diluted_valuation_usd ?
            `$${ formatNumber(data.base_token_fully_diluted_valuation_usd, { notation: 'compact' }) }` :
            'N/A'
          }
        </Skeleton>
      </DetailedInfo.ItemValue>

      <DetailedInfo.ItemLabel
        isLoading={ isPlaceholderData }
        hint="Current market capitalization of the base token"
      >
        Base token market cap
      </DetailedInfo.ItemLabel>
      <DetailedInfo.ItemValue>
        <Skeleton loading={ isPlaceholderData }>
          { data.base_token_market_cap_usd ?
            `$${ formatNumber(data.base_token_market_cap_usd, { notation: 'compact' }) }` :
            'N/A'
          }
        </Skeleton>
      </DetailedInfo.ItemValue>

      { /* 流动性信息 */ }
      <DetailedInfo.ItemLabel
        isLoading={ isPlaceholderData }
        hint="Current liquidity of the pool"
      >
        Liquidity
      </DetailedInfo.ItemLabel>
      <DetailedInfo.ItemValue>
        <Skeleton loading={ isPlaceholderData }>
          ${ formatNumber(data.liquidity, { notation: 'compact' }) }
        </Skeleton>
      </DetailedInfo.ItemValue>

      { /* DEX 信息 */ }
      <DetailedInfo.ItemLabel
        isLoading={ isPlaceholderData }
        hint="DEX where the pool is traded"
      >
        DEX
      </DetailedInfo.ItemLabel>
      <DetailedInfo.ItemValue>
        <Skeleton loading={ isPlaceholderData }>
          { data.dex.name }
        </Skeleton>
      </DetailedInfo.ItemValue>

      { /* 时间范围选择器和动态数据 */ }
      { poolV2Data && (
        <>
          <DetailedInfo.ItemLabel
            isLoading={ isPlaceholderData }
            hint="Select time range to view price changes, volume and trading activity"
          >
            Time range
          </DetailedInfo.ItemLabel>
          <DetailedInfo.ItemValue>
            <Flex gap={ 2 } flexWrap="wrap">
              { timeRangeButtons }
            </Flex>
          </DetailedInfo.ItemValue>

          { /* 价格变化 */ }
          <DetailedInfo.ItemLabel
            isLoading={ isPlaceholderData }
            hint={ `Price change percentage in the last ${ TIME_RANGE_OPTIONS.find(o => o.value === selectedTimeRange)?.label }` }
          >
            Price change ({ TIME_RANGE_OPTIONS.find(o => o.value === selectedTimeRange)?.label })
          </DetailedInfo.ItemLabel>
          <DetailedInfo.ItemValue>
            <Skeleton loading={ isPlaceholderData }>
              { formatPercentageChange(poolV2Data.attributes.price_change_percentage[selectedTimeRange]) }
            </Skeleton>
          </DetailedInfo.ItemValue>

          { /* 交易量 */ }
          <DetailedInfo.ItemLabel
            isLoading={ isPlaceholderData }
            hint={ `Trading volume in USD for the last ${ TIME_RANGE_OPTIONS.find(o => o.value === selectedTimeRange)?.label }` }
          >
            Volume ({ TIME_RANGE_OPTIONS.find(o => o.value === selectedTimeRange)?.label })
          </DetailedInfo.ItemLabel>
          <DetailedInfo.ItemValue>
            <Skeleton loading={ isPlaceholderData }>
              ${ formatNumber(poolV2Data.attributes.volume_usd[selectedTimeRange], { notation: 'compact' }) }
            </Skeleton>
          </DetailedInfo.ItemValue>

          { /* 交易统计 */ }
          <DetailedInfo.ItemLabel
            isLoading={ isPlaceholderData }
            hint={ `Number of buy and sell transactions in the last ${ TIME_RANGE_OPTIONS.find(o => o.value === selectedTimeRange)?.label }` }
          >
            Transactions ({ TIME_RANGE_OPTIONS.find(o => o.value === selectedTimeRange)?.label })
          </DetailedInfo.ItemLabel>
          <DetailedInfo.ItemValue>
            <Skeleton loading={ isPlaceholderData }>
              <Flex gap={ 4 } alignItems="center" flexWrap="wrap">
                <Box>
                  <Text fontSize="sm" color="text.secondary">Buys:</Text>
                  <Text fontWeight="semibold" color="green.500">
                    { poolV2Data.attributes.transactions[selectedTimeRange].buys }
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="text.secondary">Sells:</Text>
                  <Text fontWeight="semibold" color="red.500">
                    { poolV2Data.attributes.transactions[selectedTimeRange].sells }
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="text.secondary">Buyers:</Text>
                  <Text fontWeight="semibold">
                    { poolV2Data.attributes.transactions[selectedTimeRange].buyers }
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="text.secondary">Sellers:</Text>
                  <Text fontWeight="semibold">
                    { poolV2Data.attributes.transactions[selectedTimeRange].sellers }
                  </Text>
                </Box>
              </Flex>
            </Skeleton>
          </DetailedInfo.ItemValue>

          { /* 池创建时间 */ }
          <DetailedInfo.ItemLabel
            isLoading={ isPlaceholderData }
            hint="When this liquidity pool was created"
          >
            Pool created
          </DetailedInfo.ItemLabel>
          <DetailedInfo.ItemValue>
            <Skeleton loading={ isPlaceholderData }>
              { new Date(poolV2Data.attributes.pool_created_at).toLocaleString() }
            </Skeleton>
          </DetailedInfo.ItemValue>

          { /* 费用信息（如果有） */ }
          { poolV2Data.attributes.pool_fee_percentage && (
            <>
              <DetailedInfo.ItemLabel
                isLoading={ isPlaceholderData }
                hint="Trading fee percentage for this pool"
              >
                Pool fee
              </DetailedInfo.ItemLabel>
              <DetailedInfo.ItemValue>
                <Skeleton loading={ isPlaceholderData }>
                  { poolV2Data.attributes.pool_fee_percentage }%
                </Skeleton>
              </DetailedInfo.ItemValue>
            </>
          ) }
        </>
      ) }

      <DetailedInfoSponsoredItem isLoading={ isPlaceholderData }/>
    </DetailedInfo.Container>
  );
};

export default PoolInfo;
