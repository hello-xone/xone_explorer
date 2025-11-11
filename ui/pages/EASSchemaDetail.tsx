import { Box, Flex, Grid, GridItem, Text, VStack, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import type { EASItem } from 'ui/eas/types';

import dayjs from 'lib/date/dayjs';
import { GET_SCHEMA_DETAIL, GET_ATTESTATION_COUNTS } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import { Badge } from 'toolkit/chakra/badge';
import { Button } from 'toolkit/chakra/button';
import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { Tooltip } from 'toolkit/chakra/tooltip';
import { SCHEMA_FIELD_REGEX } from 'ui/eas/constants';
import CreateAttestationModal from 'ui/eas/CreateAttestationModal';
import AttestationList from 'ui/eas/home/AttestationList';
import AttestationTable from 'ui/eas/home/AttestationTable';
import SchemaFieldBadges from 'ui/eas/SchemaFieldBadges';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import DataListDisplay from 'ui/shared/DataListDisplay';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import TxEntity from 'ui/shared/entities/tx/TxEntity';

interface Attestation {
  id: string;
  attester: string;
  recipient: string;
  time: number;
  revoked: boolean;
  isOffchain: boolean;
  revocationTime?: number | null;
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
  _count: {
    attestations: number;
  };
}

interface SchemaDetailResponse {
  schemata: Array<Schema>;
}

interface AttestationCountsResponse {
  totalAttestations: {
    _count: {
      _all: number;
    };
  };
  revokedAttestations: {
    _count: {
      _all: number;
    };
  };
}

const EASSchemaDetail = () => {
  const router = useRouter();
  const index = router.query.index as string;
  const [ isCreateAttestationModalOpen, setIsCreateAttestationModalOpen ] = React.useState(false);

  // 第一次查询：获取 schema 详情
  const { data, loading: schemaLoading, error } = useEasGraphQL<SchemaDetailResponse>({
    query: GET_SCHEMA_DETAIL,
    variables: { index },
    enabled: Boolean(index),
  });

  const schema = data?.schemata?.[0];

  // 第二次查询：在获取到 schema.id 后查询 attestation 统计
  const { data: countsData, loading: countsLoading } = useEasGraphQL<AttestationCountsResponse>({
    query: GET_ATTESTATION_COUNTS,
    variables: { schemaId: schema?.id || '' },
    enabled: Boolean(schema?.id),
  });

  // 综合 loading 状态
  const loading = schemaLoading || countsLoading;

  // 解析 schema 字段
  const decodedSchema = React.useMemo(() => {
    if (!schema?.schema) return [];

    try {
      const fieldParts = schema.schema.split(',').map(part => part.trim());
      const fields: Array<{ type: string; name: string; isArray: boolean }> = [];

      for (const part of fieldParts) {
        const match = part.match(SCHEMA_FIELD_REGEX);
        if (match) {
          const typeStr = match[1];
          const isArray = typeStr.endsWith('[]');
          const type = isArray ? typeStr.slice(0, -2) : typeStr;

          fields.push({
            type,
            name: match[2],
            isArray,
          });
        }
      }
      return fields;
    } catch {
      return [];
    }
  }, [ schema?.schema ]);

  // 计算 attestation 统计数据
  const attestationCounts = React.useMemo(() => {
    // 使用聚合查询的结果获取准确的统计数据
    const totalCount = countsData?.totalAttestations?._count?._all || schema?._count?.attestations || 0;
    const revokedCount = countsData?.revokedAttestations?._count?._all || 0;

    return {
      total: totalCount,
      revoked: revokedCount,
    };
  }, [
    countsData?.totalAttestations?._count?._all,
    countsData?.revokedAttestations?._count?._all,
    schema?._count?.attestations,
  ]);

  // 处理打开 CreateAttestationModal
  const handleOpenCreateAttestation = React.useCallback(() => {
    setIsCreateAttestationModalOpen(true);
  }, []);

  // 处理关闭 CreateAttestationModal
  const handleCloseCreateAttestation = React.useCallback(() => {
    setIsCreateAttestationModalOpen(false);
  }, []);

  // 转换 attestations 数据为 EASItem 格式
  const attestations = React.useMemo(() => {
    if (!schema?.attestations) return [];

    return schema.attestations.map((item): EASItem => ({
      uid: item.id,
      schema: schema.id,
      schemaId: `#${ schema.index }`,
      schemaName: decodedSchema.length > 0 ? decodedSchema.map(f => f.name).join(', ').toUpperCase() : '',
      from: item.attester,
      to: item.recipient,
      time: item.time,
      revoked: item.revoked,
    }));
  }, [ schema, decodedSchema ]);

  if (error) {
    return (
      <Box p={ 8 } textAlign="center">
        <Text color="red.500">Error loading schema details</Text>
      </Box>
    );
  }

  return (
    <DataListDisplay
      isError={ Boolean(error) }
      itemsNum={ schema ? 1 : 0 }
      emptyText="Schema not found."
    >
      { /* 头部信息 */ }
      <Box mb={ 6 }>
        { /* 移动端布局 */ }
        <Box hideFrom="lg">
          <VStack align="stretch" gap={ 4 }>
            <Box>
              <HStack gap={ 2 } mb={ 2 } flexWrap="wrap">
                <Skeleton loading={ loading }>
                  <Badge
                    variant="solid"
                    fontSize="md"
                    px={ 3 }
                    py={ 1 }
                    borderRadius="md"
                    colorPalette="red"
                  >
                    #{ schema?.index || index }
                  </Badge>
                </Skeleton>
                <Skeleton loading={ loading }>
                  <Text fontSize="20px" fontWeight="bold">
                    { decodedSchema.length > 0 ?
                      decodedSchema.map(f => f.name).join(' ').toUpperCase() :
                      'SCHEMA' }
                  </Text>
                </Skeleton>
              </HStack>
              <Skeleton loading={ loading }>
                <HStack gap={ 2 }>
                  <Tooltip content={ schema?.id }>
                    <Text fontSize="sm" color="text.secondary" fontFamily="mono" truncate maxW="280px">
                      { schema?.id }
                    </Text>
                  </Tooltip>
                  { schema?.id && <CopyToClipboard text={ schema.id }/> }
                </HStack>
              </Skeleton>
            </Box>

            <Skeleton loading={ loading }>
              <Button
                variant="solid"
                colorScheme="blue"
                size="md"
                w="100%"
                onClick={ handleOpenCreateAttestation }
                disabled={ !schema || loading }
              >
                Attest with Schema
              </Button>
            </Skeleton>
          </VStack>
        </Box>

        { /* 桌面端布局 */ }
        <Flex hideBelow="lg" justifyContent="space-between" alignItems="flex-start" gap={ 4 }>
          <Box>
            <HStack gap={ 3 } mb={ 2 }>
              <Skeleton loading={ loading }>
                <Badge
                  variant="solid"
                  fontSize="md"
                  px={ 3 }
                  py={ 1 }
                  borderRadius="md"
                  colorPalette="red"
                >
                  #{ schema?.index || index }
                </Badge>
              </Skeleton>
              <Skeleton loading={ loading }>
                <Text fontSize="24px" fontWeight="bold">
                  { decodedSchema.length > 0 ?
                    decodedSchema.map(f => f.name).join(' ').toUpperCase() :
                    'SCHEMA' }
                </Text>
              </Skeleton>
            </HStack>
            <Skeleton loading={ loading }>
              <HStack gap={ 2 }>
                <Tooltip content={ schema?.id }>
                  <Text fontSize="sm" color="text.secondary" fontFamily="mono" truncate maxW="400px">
                    { schema?.id }
                  </Text>
                </Tooltip>
                { schema?.id && <CopyToClipboard text={ schema.id }/> }
              </HStack>
            </Skeleton>
          </Box>

          <Skeleton loading={ loading }>
            <Button
              variant="solid"
              colorScheme="blue"
              size="sm"
              onClick={ handleOpenCreateAttestation }
              disabled={ !schema || loading }
            >
              Attest with Schema
            </Button>
          </Skeleton>
        </Flex>
      </Box>

      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        gap={{ base: 6, lg: 8 }}
        mt={{ base: 4, lg: 6 }}
      >
        <GridItem>
          <VStack align="stretch" gap={ 6 }>
            { /* CREATED */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                Created:
              </Text>
              <Skeleton loading={ loading }>
                <Text fontSize="sm">
                  { schema?.time ? dayjs(schema.time * 1000).format('YYYY-M-D HH:mm:ss') : '-' }
                  { schema?.time && ` (${ dayjs(schema.time * 1000).fromNow() })` }
                </Text>
              </Skeleton>
            </Box>

            { /* CREATOR */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                Creator:
              </Text>
              <Skeleton loading={ loading } hideBelow="lg">
                { schema?.creator && <AddressEntity address={{ hash: schema.creator }}/> }
              </Skeleton>
              <Skeleton loading={ loading } hideFrom="lg">
                { schema?.creator && <AddressEntity address={{ hash: schema.creator }} truncation="constant"/> }
              </Skeleton>
            </Box>

            { /* TRANSACTION ID */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                Transaction ID:
              </Text>
              <Skeleton loading={ loading } hideBelow="lg">
                { schema?.txid && <TxEntity hash={ schema.txid }/> }
              </Skeleton>
              <Skeleton loading={ loading } hideFrom="lg">
                { schema?.txid && <TxEntity hash={ schema.txid } truncation="constant"/> }
              </Skeleton>
            </Box>

            { /* RESOLVER CONTRACT */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                Resolver Contract:
              </Text>
              <Skeleton loading={ loading } hideBelow="lg">
                { schema?.resolver && <AddressEntity address={{ hash: schema.resolver }}/> }
              </Skeleton>
              <Skeleton loading={ loading } hideFrom="lg">
                { schema?.resolver && <AddressEntity address={{ hash: schema.resolver }} truncation="constant"/> }
              </Skeleton>
            </Box>

            { /* REVOCABLE ATTESTATIONS */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                Revocable Attestations:
              </Text>
              <Skeleton loading={ loading }>
                <Text fontSize="sm">{ schema?.revocable ? 'Yes' : 'No' }</Text>
              </Skeleton>
            </Box>

            { /* ATTESTATION COUNT */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                Attestation Count:
              </Text>
              <Skeleton loading={ loading }>
                <VStack align="start" gap={ 1 }>
                  <HStack>
                    <Text fontSize="lg" fontWeight="bold">{ attestationCounts.total }</Text>
                    <Text fontSize="sm">total attestations</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="lg" fontWeight="bold">{ attestationCounts.total - attestationCounts.revoked }</Text>
                    <Text fontSize="sm">attestations active</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="lg" fontWeight="bold">{ attestationCounts.revoked }</Text>
                    <Text fontSize="sm">attestations revoked</Text>
                  </HStack>
                </VStack>
              </Skeleton>
            </Box>

            { /* 说明提示框 */ }
            <Box
              bg="red.50"
              _dark={{ bg: 'red.900/30' }}
              py={ 3 }
              px={ 4 }
              borderTopRightRadius="md"
              borderBottomRightRadius="md"
              borderLeftWidth="4px"
              borderLeftColor="red.500"
            >
              <HStack gap={ 2 } align="start">
                <Text fontSize="sm" color="red.700" _dark={{ color: 'red.300' }} lineHeight="1.6">
                  Schemas define the structure and type of data that can be included in an attestation.
                </Text>
              </HStack>
            </Box>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack align="stretch" gap={ 6 }>
            { /* DECODED SCHEMA */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 3 } textTransform="uppercase">
                Decoded Schema:
              </Text>
              <SchemaFieldBadges schema={ schema?.schema || '' } isNotMore isLoading={ loading }/>
            </Box>

            { /* RAW SCHEMA */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 3 } textTransform="uppercase">
                Raw Schema:
              </Text>
              <Skeleton loading={ loading }>
                <Box
                  bg="gray.50"
                  p={ 4 }
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                  _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
                  minH="120px"
                >
                  <Text fontSize="sm" fontFamily="mono" wordBreak="break-word">
                    { schema?.schema }
                  </Text>
                </Box>
              </Skeleton>
            </Box>
          </VStack>
        </GridItem>
      </Grid>

      { /* Recent attestations */ }
      <Box mt={{ base: 8, lg: 12 }}>
        <Text fontSize={{ base: '18px', lg: '20px' }} fontWeight="600" mb={ 4 }>
          Recent attestations
        </Text>

        <DataListDisplay
          isError={ false }
          itemsNum={ attestations.length }
          emptyText="No attestations yet."
        >
          <Box hideBelow="lg">
            <AttestationTable data={ attestations } isLoading={ loading } isRevokedStatus top={ 0 }/>
          </Box>

          <Box hideFrom="lg">
            <AttestationList data={ attestations } isLoading={ loading }/>
          </Box>
        </DataListDisplay>
      </Box>

      {
        attestations.length > 0 && (
          <Box textAlign="center" mt={ 6 }>
            <Link
              color="link"
              fontSize="sm"
              fontWeight={ 500 }
              href={ `/eas/schemAttestationList/${ schema?.id }` }
            >
              View all attestations for schema
            </Link>
          </Box>
        )
      }

      { /* CreateAttestationModal */ }
      { schema && (
        <CreateAttestationModal
          isOpen={ isCreateAttestationModalOpen }
          onClose={ handleCloseCreateAttestation }
          schema={{
            uid: schema.id,
            schema: schema.schema,
            fields: decodedSchema,
            revocable: schema.revocable,
          }}
        />
      ) }
    </DataListDisplay>
  );
};

export default EASSchemaDetail;
