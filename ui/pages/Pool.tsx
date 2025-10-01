import { Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';

import type { Pool, Token, Dex, PoolResponse } from 'types/api/pools';

import config from 'configs/app';
import getCheckedSummedAddress from 'lib/address/getCheckedSummedAddress';
import useApiQuery from 'lib/api/useApiQuery';
import throwOnResourceLoadError from 'lib/errors/throwOnResourceLoadError';
import getPoolLinks from 'lib/pools/getPoolLinks';
import { getPoolTitle } from 'lib/pools/getPoolTitle';
import getQueryParamString from 'lib/router/getQueryParamString';
import * as addressStubs from 'stubs/address';
import { Image } from 'toolkit/chakra/image';
import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { Tag } from 'toolkit/chakra/tag';
import PoolInfo from 'ui/pool/PoolInfo';
import isCustomAppError from 'ui/shared/AppError/isCustomAppError';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import DataFetchAlert from 'ui/shared/DataFetchAlert';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import * as PoolEntity from 'ui/shared/entities/pool/PoolEntity';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';
import InfoButton from 'ui/shared/InfoButton';
import PageTitle from 'ui/shared/Page/PageTitle';
import VerifyWith from 'ui/shared/VerifyWith';

const PoolPage = () => {
  const router = useRouter();
  const hash = getQueryParamString(router.query.hash);

  // 获取当前 chain_id
  const currentChainId = config.chain.id?.toString() ?? '';

  // 获取单个 pool 数据，使用 include 参数获取关联的 token 和 dex 信息
  const poolQuery = useApiQuery('contractInfo:pool', {
    pathParams: { hash: hash || '', chainId: currentChainId },
    queryParams: { include: 'base_token,quote_token,dex' },
    queryOptions: {
      refetchOnMount: false,
    },
  });

  // 转换数据的逻辑直接在这里
  const transformedData = useMemo((): Pool | undefined => {
    // 如果是旧格式（向后兼容）
    if (poolQuery.data && 'pool_id' in poolQuery.data) {
      return poolQuery.data as unknown as Pool;
    }

    // 处理新格式的 PoolResponse
    if (poolQuery.data && 'data' in poolQuery.data && 'included' in poolQuery.data) {
      const poolResponse = poolQuery.data as PoolResponse;
      const tokens = poolResponse.included.filter((item): item is Token => item.type === 'token');
      const dexes = poolResponse.included.filter((item): item is Dex => item.type === 'dex');

      const poolData = poolResponse.data;
      const baseToken = tokens.find(token => token.id === poolData.relationships.base_token.data.id);
      const quoteToken = tokens.find(token => token.id === poolData.relationships.quote_token.data.id);
      const dex = dexes.find(dexItem => dexItem.id === poolData.relationships.dex.data.id);

      if (!baseToken || !quoteToken || !dex) {
        throw new Error('Missing required token or dex data');
      }

      return {
        pool_id: poolData.attributes.address,
        is_contract: true,
        chain_id: currentChainId,
        base_token_address: baseToken.attributes.address,
        base_token_symbol: baseToken.attributes.symbol,
        base_token_address_icon: getCheckedSummedAddress(baseToken.id.replace('xone_', '')),
        quote_token_address_icon: getCheckedSummedAddress(quoteToken.id.replace('xone_', '')),
        quote_token_address: quoteToken.attributes.address,
        quote_token_symbol: quoteToken.attributes.symbol,
        base_token_fully_diluted_valuation_usd: poolData.attributes.fdv_usd,
        base_token_market_cap_usd: poolData.attributes.market_cap_usd,
        quote_token_fully_diluted_valuation_usd: null,
        quote_token_market_cap_usd: null,
        liquidity: poolData.attributes.reserve_in_usd,
        dex: {
          id: dex.id,
          name: dex.attributes.name,
        },
        coin_gecko_terminal_url: '',
      };
    }

    return undefined;
  }, [ poolQuery.data, currentChainId ]);

  const data = transformedData;
  const isPlaceholderData = poolQuery.isPlaceholderData;
  const isError = poolQuery.isError;
  const error = poolQuery.error;

  const addressQuery = useApiQuery('general:address', {
    pathParams: { hash: data?.pool_id },
    queryOptions: {
      enabled: Boolean(data?.is_contract),
      placeholderData: addressStubs.ADDRESS_INFO,
    },
  });

  // 获取原始 PoolV2 数据用于传递给 PoolInfo
  const poolV2Data = React.useMemo(() => {
    if (poolQuery.data && 'data' in poolQuery.data) {
      const poolResponse = poolQuery.data as PoolResponse;
      return poolResponse.data;
    }
    return undefined;
  }, [ poolQuery.data ]);

  const content = (() => {
    if (isError) {
      if (error && isCustomAppError(error)) {
        throwOnResourceLoadError({ resource: 'contractInfo:pool', error, isError: true });
      }

      return <DataFetchAlert/>;
    }

    if (!data) {
      return null;
    }

    return (
      <PoolInfo
        data={ data }
        isPlaceholderData={ isPlaceholderData }
        poolV2Data={ poolV2Data }
      />
    );
  })();

  const externalLinks = getPoolLinks(data);
  const hasLinks = externalLinks.length > 0;

  const externalLinksComponents = React.useMemo(() => {
    return externalLinks
      .map((link) => {
        return (
          <Link external h="34px" key={ link.url } href={ link.url } alignItems="center" display="inline-flex" minW="120px">
            { link.image ? <Image boxSize={ 5 } mr={ 2 } src={ link.image } alt={ `${ link.title } icon` }/> : null }
            { link.title }
          </Link>
        );
      });
  }, [ externalLinks ]);

  const poolIdOrContract = React.useMemo(() => {
    if (data?.is_contract && addressQuery.data) {
      return <AddressEntity address={ addressQuery.data } isLoading={ addressQuery.isPlaceholderData }/>;
    } else if (data?.pool_id) {
      return (
        <Skeleton loading={ isPlaceholderData } display="flex" alignItems="center" overflow="hidden">
          <Flex overflow="hidden">
            <HashStringShortenDynamic hash={ data?.pool_id }/>
          </Flex>
          <CopyToClipboard text={ data?.pool_id }/>
        </Skeleton>
      );
    }

    return null;
  }, [ data, isPlaceholderData, addressQuery.isPlaceholderData, addressQuery.data ]);

  const titleSecondRow = (
    <Flex alignItems="center" justifyContent="space-between" w="100%">
      { poolIdOrContract }
      <Flex gap={ 2 } ml={ 2 }>
        <InfoButton>
          { `This Liquidity Provider (LP) token represents ${ data?.base_token_symbol }/${ data?.quote_token_symbol } pairing.` }
        </InfoButton>
        { hasLinks && (
          <VerifyWith
            links={ externalLinksComponents }
            label="Verify with"
            longText="View in"
            shortText=""
          />
        ) }
      </Flex>
    </Flex>
  );

  const poolTitle = data ? getPoolTitle(data) : '';

  return (
    <>
      <PageTitle
        title={ poolTitle }
        beforeTitle={ data ? (
          <PoolEntity.Icon
            pool={ data }
            isLoading={ isPlaceholderData }
            variant="heading"
          />
        ) : null }
        contentAfter={ <Skeleton loading={ isPlaceholderData }><Tag>Pool</Tag></Skeleton> }
        secondRow={ titleSecondRow }
        isLoading={ isPlaceholderData }
        withTextAd
      />
      { content }
    </>
  );
};

export default PoolPage;
