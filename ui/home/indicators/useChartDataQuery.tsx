import { useQuery } from '@tanstack/react-query';

import type { ChainIndicatorId } from 'types/homepage';
import type { TimeChartData, TimeChartDataItem, TimeChartItemRaw } from 'ui/shared/chart/types';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';

import prepareChartItems from './utils/prepareChartItems';

const rollupFeature = config.features.rollup;
const isOptimisticRollup = rollupFeature.isEnabled && rollupFeature.type === 'optimistic';
const isArbitrumRollup = rollupFeature.isEnabled && rollupFeature.type === 'arbitrum';

const CHART_ITEMS: Record<ChainIndicatorId, Pick<TimeChartDataItem, 'name' | 'valueFormatter'>> = {
  daily_txs: {
    name: 'Tx/day',
    valueFormatter: (x: number) => x.toLocaleString(undefined, { maximumFractionDigits: 2, notation: 'compact' }),
  },
  daily_operational_txs: {
    name: 'Tx/day',
    valueFormatter: (x: number) => x.toLocaleString(undefined, { maximumFractionDigits: 2, notation: 'compact' }),
  },
  coin_price: {
    name: `${ config.chain.currency.symbol } price`,
    valueFormatter: (x: number) => '$' + x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
  },
  secondary_coin_price: {
    name: `${ config.chain.currency.symbol } price`,
    valueFormatter: (x: number) => '$' + x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
  },
  market_cap: {
    name: 'Market cap',
    valueFormatter: (x: number) => '$' + x.toLocaleString(undefined, { maximumFractionDigits: 2 }),
  },
  tvl: {
    name: 'TVL',
    valueFormatter: (x: number) => '$' + x.toLocaleString(undefined, { maximumFractionDigits: 2, notation: 'compact' }),
  },
};

const isStatsFeatureEnabled = config.features.stats.isEnabled;

// 使用配置的市场数据API地址
const MARKET_API_URL = `${ config.apis.xone?.endpoint }/api/v2/stats/charts/market`;

// 定义市场数据的类型
interface MarketDataItem {
  closing_price: string;
  date: string;
  market_cap: string;
  tvl: string | null;
}

interface MarketDataResponse {
  chartdata: Array<MarketDataItem>;
}

// 自定义的市场数据获取函数
const fetchMarketData = async(): Promise<MarketDataResponse> => {
  const response = await fetch(MARKET_API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch market data');
  }
  const data = await response.json() as MarketDataResponse;
  return data;
};

type UseFetchChartDataResult = {
  isError: boolean;
  isPending: boolean;
  data: TimeChartData;
};

function getChartData(indicatorId: ChainIndicatorId, data: Array<TimeChartItemRaw>): TimeChartData {
  return [ {
    items: prepareChartItems(data),
    name: CHART_ITEMS[indicatorId].name,
    valueFormatter: CHART_ITEMS[indicatorId].valueFormatter,
  } ];
}

export default function useChartDataQuery(indicatorId: ChainIndicatorId): UseFetchChartDataResult {
  const statsDailyTxsQuery = useApiQuery('stats:pages_main', {
    queryOptions: {
      refetchOnMount: false,
      enabled: isStatsFeatureEnabled && indicatorId === 'daily_txs',
      select: (data) => data.daily_new_transactions?.chart.map((item) => ({ date: new Date(item.date), value: Number(item.value) })) || [],
    },
  });

  const statsDailyOperationalTxsQuery = useApiQuery('stats:pages_main', {
    queryOptions: {
      refetchOnMount: false,
      enabled: isStatsFeatureEnabled && indicatorId === 'daily_operational_txs',
      select: (data) => {
        if (isArbitrumRollup) {
          return data.daily_new_operational_transactions?.chart.map((item) => ({ date: new Date(item.date), value: Number(item.value) })) || [];
        } else if (isOptimisticRollup) {
          return data.op_stack_daily_new_operational_transactions?.chart.map((item) => ({ date: new Date(item.date), value: Number(item.value) })) || [];
        }
        return [];
      },
    },
  });

  const apiDailyTxsQuery = useApiQuery('general:stats_charts_txs', {
    queryOptions: {
      refetchOnMount: false,
      enabled: !isStatsFeatureEnabled && indicatorId === 'daily_txs',
      select: (data) => data.chart_data.map((item) => ({ date: new Date(item.date), value: item.transactions_count })),
    },
  });

  // 使用硬编码API的币价查询
  const coinPriceQuery = useQuery({
    queryKey: [ 'market-chart-data', 'coin_price' ],
    queryFn: fetchMarketData,
    enabled: indicatorId === 'coin_price',
    refetchOnMount: false,
    select: (data) => data.chartdata.map((item) => ({ date: new Date(item.date), value: parseFloat(item.closing_price) })),
  });

  const secondaryCoinPriceQuery = useApiQuery('general:stats_charts_secondary_coin_price', {
    queryOptions: {
      refetchOnMount: false,
      enabled: indicatorId === 'secondary_coin_price',
      select: (data) => data.chart_data.map((item) => ({ date: new Date(item.date), value: item.closing_price })),
    },
  });

  // 使用硬编码API的市值查询
  const marketCapQuery = useQuery({
    queryKey: [ 'market-chart-data', 'market_cap' ],
    queryFn: fetchMarketData,
    enabled: indicatorId === 'market_cap',
    refetchOnMount: false,
    select: (data) => data.chartdata.map((item) => ({
      date: new Date(item.date),
      value: item.market_cap ? parseFloat(item.market_cap) : null,
    })),
  });

  // 使用硬编码API的TVL查询
  const tvlQuery = useQuery({
    queryKey: [ 'market-chart-data', 'tvl' ],
    queryFn: fetchMarketData,
    enabled: indicatorId === 'tvl',
    refetchOnMount: false,
    select: (data) => data.chartdata.map((item) => ({
      date: new Date(item.date),
      value: item.tvl !== undefined && item.tvl !== null ? parseFloat(item.tvl) : 0,
    })),
  });

  switch (indicatorId) {
    case 'daily_txs': {
      const query = isStatsFeatureEnabled ? statsDailyTxsQuery : apiDailyTxsQuery;
      return {
        data: getChartData(indicatorId, query.data || []),
        isError: query.isError,
        isPending: query.isPending,
      };
    }
    case 'daily_operational_txs': {
      return {
        data: getChartData(indicatorId, statsDailyOperationalTxsQuery.data || []),
        isError: statsDailyOperationalTxsQuery.isError,
        isPending: statsDailyOperationalTxsQuery.isPending,
      };
    }
    case 'coin_price': {
      return {
        data: getChartData(indicatorId, coinPriceQuery.data || []),
        isError: coinPriceQuery.isError,
        isPending: coinPriceQuery.isPending,
      };
    }
    case 'secondary_coin_price': {
      return {
        data: getChartData(indicatorId, secondaryCoinPriceQuery.data || []),
        isError: secondaryCoinPriceQuery.isError,
        isPending: secondaryCoinPriceQuery.isPending,
      };
    }
    case 'market_cap': {
      return {
        data: getChartData(indicatorId, marketCapQuery.data || []),
        isError: marketCapQuery.isError,
        isPending: marketCapQuery.isPending,
      };
    }
    case 'tvl': {
      return {
        data: getChartData(indicatorId, tvlQuery.data || []),
        isError: tvlQuery.isError,
        isPending: tvlQuery.isPending,
      };
    }
  }
}
