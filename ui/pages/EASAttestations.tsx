import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { animateScroll } from 'react-scroll';

import type { EASItem } from 'ui/eas/types';

import { GET_PAGE_ATTESTATIONS } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import ActionBar, { ACTION_BAR_HEIGHT_DESKTOP } from 'ui/shared/ActionBar';
import DataListDisplay from 'ui/shared/DataListDisplay';
import Pagination from 'ui/shared/pagination/Pagination';

import HomeHeader from '../eas/Header';
import AttestationList from '../eas/home/AttestationList';
import AttestationTable from '../eas/home/AttestationTable';

const PAGE_SIZE = 100;

interface Schema {
  id: string;
  index: string;
  schema: string;
  time: number;
}

interface Attestation {
  id: string;
  attester: string;
  recipient: string;
  refUID?: string;
  revocable: boolean;
  revocationTime?: number;
  expirationTime?: number;
  time: number;
  timeCreated: number;
  txid: string;
  data: string;
  schemaId: string;
  ipfsHash?: string;
  isOffchain: boolean;
  schema: Schema;
}

interface AttestationsResponse {
  attestations: Array<Attestation>;
  aggregateAttestation: {
    _count: {
      _all: number;
    };
  };
}

const EASAttestations = () => {
  const router = useRouter();
  const [ currentPage, setCurrentPage ] = React.useState(1);

  // 从 URL 获取页码
  React.useEffect(() => {
    const pageFromUrl = router.query.page ? Number(router.query.page) : 1;
    setCurrentPage(pageFromUrl);
  }, [ router.query.page ]);

  // 计算 skip 值并使用 useMemo 缓存 variables
  const variables = React.useMemo(() => {
    const vars = {
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    };
    return vars;
  }, [ currentPage ]);

  // 获取数据
  const { data, loading, error } = useEasGraphQL<AttestationsResponse>({
    query: GET_PAGE_ATTESTATIONS,
    variables,
    enabled: true,
  });

  // 转换数据格式
  const attestations = React.useMemo(() => {
    if (!data?.attestations) return [];

    return data.attestations.map((item): EASItem => {
      const schemaId = item.schema?.index ? `#${ item.schema.index }` : '';

      return {
        uid: item.id,
        schema: item.schema?.id || item.schemaId,
        schemaId,
        schemaName: '',
        from: item.attester,
        to: item.recipient,
        time: item.time || item.timeCreated || undefined,
      };
    });
  }, [ data ]);

  // 总数和分页逻辑
  const totalCount = data?.aggregateAttestation?._count?._all || 0;
  const hasNextPage = (currentPage * PAGE_SIZE) < totalCount;
  const canGoBackwards = currentPage > 1;
  const isPaginationVisible = totalCount > 0;

  // 分页处理函数
  const handleNextPage = React.useCallback(() => {
    if (!hasNextPage) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    animateScroll.scrollToTop({ duration: 300 });
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: nextPage.toString() },
    }, undefined, { shallow: true });
  }, [ currentPage, hasNextPage, router ]);

  const handlePrevPage = React.useCallback(() => {
    if (!canGoBackwards) return;

    const prevPage = Math.max(1, currentPage - 1);
    setCurrentPage(prevPage);
    animateScroll.scrollToTop({ duration: 300 });

    if (prevPage === 1) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, page: undefined },
      }, undefined, { shallow: true });
    } else {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, page: prevPage.toString() },
      }, undefined, { shallow: true });
    }
  }, [ currentPage, canGoBackwards, router ]);

  const handleResetPage = React.useCallback(() => {
    setCurrentPage(1);
    animateScroll.scrollToTop({ duration: 300 });
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: undefined },
    }, undefined, { shallow: true });
  }, [ router ]);

  const actionBar = isPaginationVisible && (
    <ActionBar mt={ -6 }>
      <Pagination
        ml="auto"
        page={ currentPage }
        onNextPageClick={ handleNextPage }
        onPrevPageClick={ handlePrevPage }
        resetPage={ handleResetPage }
        hasPages={ currentPage > 1 }
        hasNextPage={ hasNextPage }
        canGoBackwards={ canGoBackwards }
        isLoading={ loading }
        isVisible={ isPaginationVisible }
      />
    </ActionBar>
  );

  const content = (
    <>
      <Box hideBelow="lg">
        <AttestationTable
          data={ attestations }
          isLoading={ loading }
          top={ isPaginationVisible ? ACTION_BAR_HEIGHT_DESKTOP : 0 }
        />
      </Box>

      <Box hideFrom="lg">
        <AttestationList data={ attestations } isLoading={ loading }/>
      </Box>
    </>
  );

  return (
    <>
      <HomeHeader
        loading={ loading }
        title="Attestations"
        description="Showing the most recent attestations."
        gridList={ [
          { label: 'Total Attestations', value: totalCount },
        ] }
      />
      <DataListDisplay
        isError={ Boolean(error) }
        itemsNum={ attestations.length }
        emptyText="There are no attestations."
        actionBar={ actionBar }
      >
        { content }
      </DataListDisplay>
    </>
  );
};

export default EASAttestations;
