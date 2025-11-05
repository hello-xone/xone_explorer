import { Box, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { animateScroll } from 'react-scroll';

import type { SchemaItem } from 'ui/eas/types';

import { GET_PAGE_SCHEMAS } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import DataListDisplay from 'ui/shared/DataListDisplay';
import Pagination from 'ui/shared/pagination/Pagination';

import HomeHeader from '../eas/Header';
import SchemaList from '../eas/home/SchemaList';
import SchemaTable from '../eas/home/SchemaTable';

const PAGE_SIZE = 10;

type SortValue = 'attestations-asc' | 'attestations-desc';

interface Attestation {
  id: string;
}

interface Schema {
  id: string;
  schema: string;
  creator: string;
  resolver: string;
  revocable: boolean;
  index: string;
  time: number;
  txid: string;
  attestations: Array<Attestation>;
  _count?: {
    attestations: number;
  };
}

interface SchemasResponse {
  schemata: Array<Schema>;
  aggregateSchema: {
    _count: {
      _all: number;
    };
  };
}

const EASSchemas = () => {
  const router = useRouter();
  const [ currentPage, setCurrentPage ] = React.useState(1);
  const [ sort, setSort ] = React.useState<SortValue>('attestations-desc'); // 默认倒序

  // 从 URL 获取页码
  React.useEffect(() => {
    const pageFromUrl = router.query.page ? Number(router.query.page) : 1;
    setCurrentPage(pageFromUrl);
  }, [ router.query.page ]);

  // 将 SortValue 转换为 GraphQL 的 sortOrder 参数
  const sortOrder = React.useMemo(() => {
    return sort === 'attestations-desc' ? 'asc' : 'desc';
  }, [ sort ]);

  // 计算 skip 值并使用 useMemo 缓存 variables
  const variables = React.useMemo(() => {
    const vars = {
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      sortOrder, // 添加排序参数
    };
    return vars;
  }, [ currentPage, sortOrder ]);

  // 获取数据
  const { data, loading, error } = useEasGraphQL<SchemasResponse>({
    query: GET_PAGE_SCHEMAS,
    variables,
    enabled: true,
  });

  // 转换数据格式
  const schemas = React.useMemo(() => {
    if (!data?.schemata) return [];

    return data.schemata.map((item): SchemaItem => ({
      number: parseInt(item.index, 10),
      uid: item.id,
      schema: item.schema,
      resolver: item.resolver,
      attestations: item.attestations?.length || 0,
    }));
  }, [ data ]);

  // 总数和分页逻辑
  const totalCount = data?.aggregateSchema?._count?._all || 0;
  const hasNextPage = (currentPage * PAGE_SIZE) < totalCount;
  const canGoBackwards = currentPage > 1;

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

  const handleSortChange = React.useCallback((newSort: SortValue) => {
    setSort(newSort);
    // 排序改变时重置到第一页
    setCurrentPage(1);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: undefined },
    }, undefined, { shallow: true });
  }, [ router ]);

  return (
    <DataListDisplay
      isError={ Boolean(error) }
      itemsNum={ schemas.length }
      emptyText="There are no schemas."
    >
      <HomeHeader
        loading={ loading }
        isMakeSchemaButton
        title="Schemas"
        description="Showing the most recent schemas."
        gridList={ [
          { label: 'Total Schemas', value: totalCount },
        ] }
      />

      <Box mt={ 8 }>
        <Box hideBelow="lg">
          <SchemaTable
            data={ schemas }
            isLoading={ loading }
            top={ 0 }
            sort={ sort }
            onSortChange={ handleSortChange }
          />
        </Box>

        <Box hideFrom="lg">
          <SchemaList data={ schemas } isLoading={ loading }/>
        </Box>

        <Flex mt={ 8 } justifyContent="end">
          <Pagination
            page={ currentPage }
            onNextPageClick={ handleNextPage }
            onPrevPageClick={ handlePrevPage }
            resetPage={ handleResetPage }
            hasPages={ currentPage > 1 }
            hasNextPage={ hasNextPage }
            canGoBackwards={ canGoBackwards }
            isLoading={ loading }
            isVisible={ totalCount > 0 }
          />
        </Flex>
      </Box>
    </DataListDisplay>
  );
};

export default EASSchemas;
