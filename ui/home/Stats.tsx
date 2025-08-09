import { Grid, Box, Progress } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import React from 'react';

import type { HomeStatsWidgetId } from 'types/homepage';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import useQueryEpochs from 'lib/api/useQueryEpochs';
import { WEI } from 'lib/consts';
import { HOMEPAGE_STATS } from 'stubs/stats';
import GasInfoTooltip from 'ui/shared/gas/GasInfoTooltip';
import GasPrice from 'ui/shared/gas/GasPrice';
import IconSvg from 'ui/shared/IconSvg';
import type { Props as StatsWidgetProps } from 'ui/shared/stats/StatsWidget';
import StatsWidget from 'ui/shared/stats/StatsWidget';

const rollupFeature = config.features.rollup;

function getTimeRatioOfDay() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0); // 设置为本地时区的 0 点
  const elapsedMs = now.getTime() - startOfDay.getTime(); // 本地时区经过的毫秒数
  return elapsedMs / 86400000;
}

const Stats = () => {
  const { fetchEpochs } = useQueryEpochs();

  const [ hasGasTracker, setHasGasTracker ] = React.useState(
    config.features.gasTracker.isEnabled,
  );
  const { data, isPlaceholderData, isError, dataUpdatedAt } = useApiQuery(
    'stats',
    {
      queryOptions: {
        refetchOnMount: false,
        placeholderData: HOMEPAGE_STATS,
      },
    },
  );

  React.useEffect(() => {
    if (!isPlaceholderData && !data?.gas_prices?.average) {
      setHasGasTracker(false);
    }
    // should run only after initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ isPlaceholderData ]);

  const zkEvmLatestBatchQuery = useApiQuery('homepage_zkevm_latest_batch', {
    queryOptions: {
      placeholderData: 12345,
      enabled:
        rollupFeature.isEnabled &&
        rollupFeature.type === 'zkEvm' &&
        config.UI.homepage.stats.includes('latest_batch'),
    },
  });

  const zkSyncLatestBatchQuery = useApiQuery('homepage_zksync_latest_batch', {
    queryOptions: {
      placeholderData: 12345,
      enabled:
        rollupFeature.isEnabled &&
        rollupFeature.type === 'zkSync' &&
        config.UI.homepage.stats.includes('latest_batch'),
    },
  });

  const arbitrumLatestBatchQuery = useApiQuery(
    'homepage_arbitrum_latest_batch',
    {
      queryOptions: {
        placeholderData: 12345,
        enabled:
          rollupFeature.isEnabled &&
          rollupFeature.type === 'arbitrum' &&
          config.UI.homepage.stats.includes('latest_batch'),
      },
    },
  );

  const latestBatchQuery = (() => {
    if (
      !rollupFeature.isEnabled ||
      !config.UI.homepage.stats.includes('latest_batch')
    ) {
      return;
    }

    switch (rollupFeature.type) {
      case 'zkEvm':
        return zkEvmLatestBatchQuery;
      case 'zkSync':
        return zkSyncLatestBatchQuery;
      case 'arbitrum':
        return arbitrumLatestBatchQuery;
    }
  })();

  const [ currentEpoch, setCurrentEpoch ] = React.useState<number | null>(null);

  const getCurrentEpoch = async() => {
    const res = await fetchEpochs({
      limit: 1,
      page: 0,
    });
    setCurrentEpoch(res.epochInfoss[0].id);
  };

  React.useEffect(() => {
    getCurrentEpoch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isError || latestBatchQuery?.isError) {
    return null;
  }

  const isLoading = isPlaceholderData || latestBatchQuery?.isPlaceholderData;

  interface Item extends StatsWidgetProps {
    id: HomeStatsWidgetId;
  }

  const items: Array<Item> = (() => {
    if (!data) {
      return [];
    }

    const gasInfoTooltip =
      hasGasTracker && data.gas_prices && data.gas_prices.average ? (
        <GasInfoTooltip data={ data } dataUpdatedAt={ dataUpdatedAt }>
          <IconSvg
            isLoading={ isLoading }
            name="info"
            boxSize={ 5 }
            flexShrink={ 0 }
            cursor="pointer"
            color="icon_info"
            _hover={{ color: 'link_hovered' }}
          />
        </GasInfoTooltip>
      ) : null;

    // 当前时间占当天的百分比
    const currentTimePercentage = getTimeRatioOfDay();

    return [
      latestBatchQuery?.data !== undefined && {
        id: 'latest_batch' as const,
        icon: 'txn_batches_slim' as const,
        label: 'Latest batch',
        value: latestBatchQuery.data.toLocaleString(),
        href: { pathname: '/batches' as const },
        isLoading,
      },
      {
        id: 'total_blocks' as const,
        icon: 'block_slim' as const,
        label: 'Total blocks',
        value: Number(data.total_blocks).toLocaleString(),
        href: { pathname: '/blocks' as const },
        isLoading,
      },
      {
        id: 'average_block_time' as const,
        icon: 'clock-light' as const,
        label: 'Average block time',
        value: `${ (data.average_block_time / 1000).toFixed(1) }s`,
        isLoading,
      },
      {
        id: 'total_txs' as const,
        icon: 'transactions_slim' as const,
        label: 'Total transactions',
        value: Number(data.total_transactions).toLocaleString(),
        href: { pathname: '/txs' as const },
        isLoading,
      },
      data.last_output_root_size && {
        id: 'latest_l1_state_batch' as const,
        icon: 'txn_batches_slim' as const,
        label: 'Latest L1 state batch',
        value: data.last_output_root_size,
        href: { pathname: '/batches' as const },
        isLoading,
      },
      {
        id: 'wallet_addresses' as const,
        icon: 'wallet' as const,
        label: 'Wallet addresses',
        value: Number(data.total_addresses).toLocaleString(),
        isLoading,
      },
      hasGasTracker &&
      data.gas_prices && {
        id: 'gas_tracker' as const,
        icon: 'gas' as const,
        label: 'Gas tracker',
        value: data.gas_prices.average ? (
          <GasPrice data={ data.gas_prices.average }/>
        ) : (
          'N/A'
        ),
        hint: gasInfoTooltip,
        isLoading,
      },
      data.rootstock_locked_btc && {
        id: 'btc_locked' as const,
        icon: 'coins/bitcoin' as const,
        label: 'BTC Locked in 2WP',
        value: `${ BigNumber(data.rootstock_locked_btc)
          .div(WEI)
          .dp(0)
          .toFormat() } RBTC`,
        isLoading,
      },
      {
        id: 'current_epoch' as const,
        icon: 'hourglass' as const,
        label: 'Current epoch',
        value: <Box display="flex" alignItems="center" gap={ 2 }>
          <Box>
            #{ currentEpoch || '-' }
          </Box>
          <Progress
            width="100px"
            value={ currentTimePercentage * 100 }
            size="sm"
            colorScheme="blue"
            bg="gray.200"
            borderRadius="md"
          />
          <Box fontSize="xs">
            { (currentTimePercentage * 100).toFixed(1) }%
          </Box>
        </Box>,
        href: { pathname: '/epochs' as const },
        isLoading: currentEpoch === null,
      },
    ]
      .filter(Boolean)
      .filter(({ id }) => config.UI.homepage.stats.includes(id))
      .sort((a, b) => {
        const indexA = config.UI.homepage.stats.indexOf(a.id);
        const indexB = config.UI.homepage.stats.indexOf(b.id);
        if (indexA > indexB) {
          return 1;
        }
        if (indexA < indexB) {
          return -1;
        }
        return 0;
      });
  })();

  if (items.length === 0) {
    return null;
  }

  return (
    <Grid
      gridTemplateColumns="1fr 1fr"
      gridGap={{ base: 1, lg: 2 }}
      flexBasis="50%"
      flexGrow={ 1 }
    >
      { items.map((item, index) => (
        <StatsWidget
          key={ item.id }
          { ...item }
          isLoading={ isLoading }
          _last={
            items.length % 2 === 1 && index === items.length - 1 ?
              { gridColumn: 'span 2' } :
              undefined
          }
        />
      )) }
    </Grid>
  );
};

export default Stats;
