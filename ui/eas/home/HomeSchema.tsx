import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import type { SchemaItem } from '../types';

import { GET_HOME_SCHEMAS } from 'lib/graphql/easQueries';
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

type SortValue = 'attestations-asc' | 'attestations-desc';

const HomeSchema = () => {
  const [ isSchemaModalOpen, setIsSchemaModalOpen ] = React.useState(false);
  const [ sort, setSort ] = React.useState<SortValue>('attestations-desc'); // 默认倒序
  const web3Wallet = useWeb3Wallet({ source: 'Smart contracts' });

  const sortOrder = React.useMemo(() => {
    return sort === 'attestations-desc' ? 'asc' : 'desc';
  }, [ sort ]);

  const { data, loading, error } = useEasGraphQL<SchemasResponse>({
    query: GET_HOME_SCHEMAS,
    variables: {
      sortOrder, // 传递排序参数到 GraphQL 查询
    },
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
        <HomeSchemaList data={ schemas } isLoading={ loading }/>
      </Box>

      { /* View all schemas 链接 */ }
      <Box textAlign="center" mt={ 6 }>
        <Link
          color="link"
          fontSize="sm"
          fontWeight={ 500 }
          href="/eas/schemas"
        >
          View all schemas
        </Link>
      </Box>
    </Box>
  ) : null;

  return (
    <Box mt={ 8 }>
      { /* 标题和按钮 */ }
      <Flex justifyContent="space-between" alignItems="center" mb={ 4 }>
        <Text fontSize="18px" fontWeight="600">
          Latest Schemas
        </Text>
        <Button
          variant="solid"
          colorScheme="blue"
          size="sm"
          onClick={ handleOpenModal }
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
