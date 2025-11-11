import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import type { SchemaItem } from '../types';

import { GET_HOME_SCHEMAS, GET_HOME_SCHEMAS_BY_TIME } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import useWeb3Wallet from 'lib/web3/useWallet';
import { Button } from 'toolkit/chakra/button';
import { Link } from 'toolkit/chakra/link';
import { toaster } from 'toolkit/chakra/toaster';
import CreateSchemaModal from 'ui/eas/CreateSchemaModal';
import HomeSchemaList from 'ui/eas/home/SchemaList';
import HomeSchemaTable from 'ui/eas/home/SchemaTable';
import DataListDisplay from 'ui/shared/DataListDisplay';

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
}

type SortValue = 'attestations-asc' | 'attestations-desc' | null;

const HomeSchema = () => {
  const [ isSchemaModalOpen, setIsSchemaModalOpen ] = React.useState(false);
  const [ sort, setSort ] = React.useState<SortValue>(null);
  const web3Wallet = useWeb3Wallet({ source: 'Smart contracts' });

  // 根据 sort 值决定使用哪个查询和参数
  const queryConfig = React.useMemo(() => {
    if (sort === null) {
      // 当 sort 为 null 时，只按时间排序（从大到小），不涉及 attestations 数量
      return {
        query: GET_HOME_SCHEMAS_BY_TIME,
        variables: {},
      };
    } else {
      // 当 sort 有值时，按 attestations 数量排序
      const sortOrder = sort === 'attestations-asc' ? 'desc' : 'asc';
      return {
        query: GET_HOME_SCHEMAS,
        variables: { sortOrder },
      };
    }
  }, [ sort ]);

  const { data, loading, error } = useEasGraphQL<SchemasResponse>({
    query: queryConfig.query,
    variables: queryConfig.variables,
    enabled: true,
  });

  // 将 GraphQL 返回的数据转换为 SchemaItem 格式
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

  const handleOpenModal = React.useCallback(() => {
    // 检查钱包是否已连接
    if (!web3Wallet.isConnected) {
      toaster.create({
        title: 'Please connect your wallet',
        description: 'To create a Schema, you need to connect your wallet first',
        type: 'warning',
        duration: 3000,
      });
      web3Wallet.openModal();
      return;
    }

    setIsSchemaModalOpen(true);
  }, [ web3Wallet ]);

  const handleCloseModal = React.useCallback(() => {
    setIsSchemaModalOpen(false);
  }, []);

  const handleSortChange = React.useCallback((newSort: SortValue) => {
    setSort(newSort);
  }, []);

  // 排序按钮点击处理
  const handleSortToLatest = React.useCallback(() => {
    setSort(null);
  }, []);

  const handleSortToMostDesc = React.useCallback(() => {
    setSort('attestations-desc');
  }, []);

  const handleSortToLeastAsc = React.useCallback(() => {
    setSort('attestations-asc');
  }, []);

  const content = schemas.length > 0 ? (
    <Box>
      { /* 桌面端表格视图 */ }
      <Box hideBelow="lg">
        <HomeSchemaTable
          data={ schemas }
          isLoading={ loading }
          top={ 0 }
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

        <HomeSchemaList data={ schemas } isLoading={ loading }/>
      </Box>

      { /* View all schemas 链接 */ }
      <Box textAlign="center" mt={{ base: 4, md: 6 }}>
        <Link
          color="link"
          fontSize={{ base: 'xs', sm: 'sm' }}
          fontWeight={ 500 }
          href="/eas/schemas"
        >
          View all schemas
        </Link>
      </Box>
    </Box>
  ) : null;

  return (
    <Box mt={{ base: 4, md: 8 }}>
      { /* 标题和按钮 */ }
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={ 4 }
        gap={ 2 }
        flexWrap={{ base: 'wrap', sm: 'nowrap' }}
      >
        <Text
          fontSize={{ base: '16px', sm: '18px' }}
          fontWeight="600"
          flexShrink={ 0 }
        >
          Latest Schemas
        </Text>
        <Button
          variant="solid"
          colorScheme="blue"
          size={{ base: 'xs', sm: 'sm' }}
          onClick={ handleOpenModal }
          fontSize={{ base: 'xs', sm: 'sm' }}
          px={{ base: 3, sm: 4 }}
        >
          Make Schema
        </Button>
      </Flex>

      { /* 数据列表 */ }
      <DataListDisplay
        isError={ Boolean(error) }
        itemsNum={ schemas.length }
        emptyText="There are no schemas."
      >
        { content }
      </DataListDisplay>

      { /* Create Schema Modal */ }
      <CreateSchemaModal
        isOpen={ isSchemaModalOpen }
        onClose={ handleCloseModal }
      />
    </Box>
  );
};

export default HomeSchema;
