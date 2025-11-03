import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import type { SchemaItem } from '../types';

import { GET_HOME_SCHEMAS } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import { Button } from 'toolkit/chakra/button';
import { Link } from 'toolkit/chakra/link';
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
}

interface SchemasResponse {
  schemata: Array<Schema>;
}

const HomeSchema = () => {
  const [ isSchemaModalOpen, setIsSchemaModalOpen ] = React.useState(false);

  const { data, loading, error } = useEasGraphQL<SchemasResponse>({
    query: GET_HOME_SCHEMAS,
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
    setIsSchemaModalOpen(true);
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setIsSchemaModalOpen(false);
  }, []);

  const content = schemas.length > 0 ? (
    <Box>
      { /* 桌面端表格视图 */ }
      <Box hideBelow="lg">
        <HomeSchemaTable data={ schemas } isLoading={ loading } top={ 0 }/>
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
