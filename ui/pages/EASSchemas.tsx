import { Box, Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { animateScroll } from 'react-scroll';

import type { SchemaItem } from 'ui/eas/types';

import { GET_PAGE_SCHEMAS, GET_PAGE_SCHEMAS_BY_TIME } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import { Button } from 'toolkit/chakra/button';
import ActionBar, { ACTION_BAR_HEIGHT_DESKTOP } from 'ui/shared/ActionBar';
import DataListDisplay from 'ui/shared/DataListDisplay';
import Pagination from 'ui/shared/pagination/Pagination';

import HomeHeader from '../eas/Header';
import SchemaList from '../eas/home/SchemaList';
import SchemaTable from '../eas/home/SchemaTable';

const PAGE_SIZE = 10;

type SortValue = 'attestations-asc' | 'attestations-desc' | null;

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
  const [ sort, setSort ] = React.useState<SortValue>(null); // 默认为 null（按时间排序）

  // 从 URL 获取页码
  React.useEffect(() => {
    const pageFromUrl = router.query.page ? Number(router.query.page) : 1;
    setCurrentPage(pageFromUrl);
  }, [ router.query.page ]);

  // 根据 sort 值决定使用哪个查询和参数
  const queryConfig = React.useMemo(() => {
    const skip = (currentPage - 1) * PAGE_SIZE;
    const take = PAGE_SIZE;

    if (sort === null) {
      // 当 sort 为 null 时，只按时间排序（从大到小），不涉及 attestations 数量
      return {
        query: GET_PAGE_SCHEMAS_BY_TIME,
        variables: { skip, take },
      };
    } else {
      // 当 sort 有值时，按 attestations 数量排序
      const sortOrder = sort === 'attestations-asc' ? 'desc' : 'asc';
      return {
        query: GET_PAGE_SCHEMAS,
        variables: { skip, take, sortOrder },
      };
    }
  }, [ currentPage, sort ]);

  // 获取数据
  const { data, loading, error } = useEasGraphQL<SchemasResponse>({
    query: queryConfig.query,
    variables: queryConfig.variables,
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

  const handleSortChange = React.useCallback((newSort: SortValue) => {
    setSort(newSort);
    // 排序改变时重置到第一页
    setCurrentPage(1);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: undefined },
    }, undefined, { shallow: true });
  }, [ router ]);

  // 移动端排序按钮点击处理
  const handleSortToLatest = React.useCallback(() => {
    handleSortChange(null);
  }, [ handleSortChange ]);

  const handleSortToMostDesc = React.useCallback(() => {
    handleSortChange('attestations-desc');
  }, [ handleSortChange ]);

  const handleSortToLeastAsc = React.useCallback(() => {
    handleSortChange('attestations-asc');
  }, [ handleSortChange ]);

  const actionBar = isPaginationVisible && (
    <ActionBar>
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
      { /* 桌面端表格视图 */ }
      <Box hideBelow="lg">
        <SchemaTable
          data={ schemas }
          isLoading={ loading }
          top={ isPaginationVisible ? ACTION_BAR_HEIGHT_DESKTOP : 0 }
          sort={ sort }
          onSortChange={ handleSortChange }
        />
      </Box>

      { /* 移动端列表视图 */ }
      <Box hideFrom="lg">
        { /* 移动端排序控制 */ }
        <Flex
          mb={ 3 }
          gap={{ base: 1.5, sm: 2 }}
          align="center"
          justify="space-between"
          flexWrap="wrap"
        >
          <Text
            fontSize={{ base: 'xs', sm: 'sm' }}
            fontWeight="medium"
            color="fg.muted"
            flexShrink={ 0 }
          >
            Sort by:
          </Text>
          <Flex gap={{ base: 1.5, sm: 2 }} align="center" flexWrap="wrap">
            <Button
              size="sm"
              variant={ sort === null ? 'solid' : 'outline' }
              colorPalette={ sort === null ? 'blue' : 'gray' }
              onClick={ handleSortToLatest }
              fontSize={{ base: '2xs', sm: 'xs' }}
              px={{ base: 2, sm: 3 }}
              h={{ base: '28px', sm: '32px' }}
            >
              Latest
            </Button>
            <Button
              size="sm"
              variant={ sort === 'attestations-desc' ? 'solid' : 'outline' }
              colorPalette={ sort === 'attestations-desc' ? 'blue' : 'gray' }
              onClick={ handleSortToMostDesc }
              fontSize={{ base: '2xs', sm: 'xs' }}
              px={{ base: 2, sm: 3 }}
              h={{ base: '28px', sm: '32px' }}
            >
              Most ↓
            </Button>
            <Button
              size="sm"
              variant={ sort === 'attestations-asc' ? 'solid' : 'outline' }
              colorPalette={ sort === 'attestations-asc' ? 'blue' : 'gray' }
              onClick={ handleSortToLeastAsc }
              fontSize={{ base: '2xs', sm: 'xs' }}
              px={{ base: 2, sm: 3 }}
              h={{ base: '28px', sm: '32px' }}
            >
              Least ↑
            </Button>
          </Flex>
        </Flex>

        <SchemaList data={ schemas } isLoading={ loading }/>
      </Box>
    </>
  );

  return (
    <>
      <HomeHeader
        loading={ loading }
        isMakeSchemaButton
        title="Schemas"
        description="Showing the most recent schemas."
        gridList={ [
          { label: 'Total Schemas', value: totalCount },
        ] }
      />
      <Box mt={{ base: 7, lg: 0 }}>
        <DataListDisplay
          isError={ Boolean(error) }
          itemsNum={ schemas.length }
          emptyText="There are no schemas."
          actionBar={ actionBar }
        >
          { content }
        </DataListDisplay>
      </Box>
    </>
  );
};

export default EASSchemas;
