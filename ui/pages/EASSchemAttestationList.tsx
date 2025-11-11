import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import type { EASItem } from 'ui/eas/types';

import { GET_ATTESTATIONS_BY_SCHEMA_ID } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import { Badge } from 'toolkit/chakra/badge';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { Tooltip } from 'toolkit/chakra/tooltip';
import AttestationList from 'ui/eas/home/AttestationList';
import AttestationTable from 'ui/eas/home/AttestationTable';
import ActionBar, { ACTION_BAR_HEIGHT_DESKTOP } from 'ui/shared/ActionBar';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import DataListDisplay from 'ui/shared/DataListDisplay';
import Pagination from 'ui/shared/pagination/Pagination';

interface SchemaInfo {
  id: string;
  index: string;
  schema: string;
  time: number;
}

interface Attestation {
  id: string;
  attester: string;
  recipient: string;
  time: number;
  timeCreated: number;
  schemaId: string;
  schema: SchemaInfo;
  revoked: boolean;
}

interface Schema {
  id: string;
  index: string;
}

interface AttestationListResponse {
  schemata: Array<Schema>;
  attestations: Array<Attestation>;
  totalCount: {
    _count: {
      _all: number;
    };
  };
}

const PAGE_SIZE = 25;

const EASSchemAttestationList = () => {
  const router = useRouter();
  const id = router.query.index as string;
  const [ currentPage, setCurrentPage ] = React.useState(1);

  // 从 URL 获取页码
  React.useEffect(() => {
    const pageFromUrl = router.query.page ? Number(router.query.page) : 1;
    setCurrentPage(pageFromUrl);
  }, [ router.query.page ]);

  // 计算 skip 值
  const variables = React.useMemo(() => ({
    schemaId: id,
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  }), [ id, currentPage ]);

  // 获取 attestations 列表
  const { data, loading, error } = useEasGraphQL<AttestationListResponse>({
    query: GET_ATTESTATIONS_BY_SCHEMA_ID,
    variables,
    enabled: Boolean(id),
  });

  const schema = data?.schemata?.[0];
  const totalCount = data?.totalCount?._count?._all || 0;

  // 分页逻辑
  const hasNextPage = (currentPage * PAGE_SIZE) < totalCount;
  const canGoBackwards = currentPage > 1;
  const isPaginationVisible = totalCount > 0;

  // 分页处理函数
  const handleNextPage = React.useCallback(() => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: String(nextPage) },
    }, undefined, { shallow: true });
  }, [ currentPage, router ]);

  const handlePrevPage = React.useCallback(() => {
    const prevPage = Math.max(1, currentPage - 1);
    setCurrentPage(prevPage);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: String(prevPage) },
    }, undefined, { shallow: true });
  }, [ currentPage, router ]);

  const handleResetPage = React.useCallback(() => {
    setCurrentPage(1);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: '1' },
    }, undefined, { shallow: true });
  }, [ router ]);

  // 转换 attestations 数据为 EASItem 格式
  const attestations = React.useMemo(() => {
    if (!data?.attestations) return [];

    return data.attestations.map((att: Attestation): EASItem => {
      // 解析 schema 名称（从 schema.schema 字段提取字段名）
      const schemaName = att.schema?.schema ?
        att.schema.schema
          .split(',')
          .map(field => field.trim().split(' ')[1])
          .filter(Boolean)
          .join(', ')
          .toUpperCase() :
        undefined;

      return {
        uid: att.id,
        schema: att.schema?.schema || '',
        schemaId: `#${ att.schema?.index || schema?.index || '' }`,
        schemaName,
        from: att.attester,
        to: att.recipient,
        time: att.time,
        revoked: att.revoked,
      };
    });
  }, [ data?.attestations, schema?.index ]);

  if (error) {
    return (
      <Box p={ 6 }>
        <Text color="red.500">Error loading attestations</Text>
      </Box>
    );
  }

  const actionBar = isPaginationVisible && (
    <ActionBar alignItems="center">
      { /* 总数 */ }
      <Skeleton loading={ loading }>
        <Text fontSize="sm" color="text.secondary">
          { totalCount } { totalCount === 1 ? 'attestation' : 'attestations' } found
        </Text>
      </Skeleton>
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
          isSchemaAttestationList
          isRevokedStatus
          top={ isPaginationVisible ? ACTION_BAR_HEIGHT_DESKTOP : 0 }
        />
      </Box>

      <Box hideFrom="lg">
        <AttestationList data={ attestations } isLoading={ loading }/>
      </Box>
    </>
  );

  return (
    <Box>
      { /* 标题 */ }
      <VStack align="stretch" gapY={ 1 } gapX={ 4 } display="flex" flexDirection="row" alignItems="center" flexWrap="wrap" mb={{ base: 5, lg: 4 }}>
        <Skeleton loading={ loading }>
          <HStack gap={ 2 } flexWrap="wrap">
            <Text fontSize={{ base: '20px', lg: '24px' }} fontWeight="600">
              Attestations for Schema
            </Text>
            { schema?.index && (
              <Badge
                variant="solid"
                fontSize="md"
                px={ 3 }
                py={ 1 }
                borderRadius="md"
              >
                #{ schema.index }
              </Badge>
            ) }
          </HStack>
        </Skeleton>

        <Skeleton loading={ loading } mt={ 1 }>
          <HStack gap={ 2 }>
            <Tooltip content={ schema?.id }>
              <Text
                fontSize="sm"
                color="text.secondary"
                fontFamily="mono"
                truncate
                maxW={{ base: '280px', lg: '600px' }}
              >
                ({ schema?.id })
              </Text>
            </Tooltip>
            { schema?.id && <CopyToClipboard text={ schema.id }/> }
          </HStack>
        </Skeleton>
      </VStack>

      { /* Attestation 列表 */ }
      <DataListDisplay
        isError={ Boolean(error) }
        itemsNum={ attestations.length }
        emptyText="No attestations found for this schema."
        actionBar={ actionBar }
      >
        { content }
      </DataListDisplay>
    </Box>
  );
};

export default EASSchemAttestationList;
