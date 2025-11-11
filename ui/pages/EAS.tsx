import { Box, Flex, Group, Input, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import type { HomeTotalsResponse } from '../../.history/lib/graphql/types_20251031105336';

import { GET_HOME_SCHEMA_AND_ATTESTATIONS_COUNT, GET_SCHEMA_BY_INDEX, GET_SCHEMA_BY_UID } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import { Button } from 'toolkit/chakra/button';
import { Skeleton } from 'toolkit/chakra/skeleton';
import CreateAttestationModal from 'ui/eas/CreateAttestationModal';
import HomeHeader from 'ui/eas/Header';
import HomeAttestation from 'ui/eas/home/HomeAttestation';
import IconSvg from 'ui/shared/IconSvg';

interface SchemaField {
  type: string;
  name: string;
}

interface AttestationSchemaField {
  name: string;
  type: string;
  isArray: boolean;
}

interface AttestationSchema {
  uid: string;
  schema: string;
  fields: Array<AttestationSchemaField>;
  revocable: boolean;
}

// 解析 schema 字符串（用于显示）
const parseSchemaString = (schemaStr: string): Array<SchemaField> => {
  const fields = schemaStr.split(',').map(field => field.trim());
  return fields.map(field => {
    const match = field.match(/^(\w+(?:\[\])?)\s+(\w+)$/);
    if (match) {
      const [ , type, name ] = match;
      return { type, name };
    }
    return null;
  }).filter((field): field is SchemaField => field !== null);
};

// 解析 schema 字符串（用于 CreateAttestationModal）
const parseSchemaForModal = (schemaStr: string): Array<AttestationSchemaField> => {
  const fields = schemaStr.split(',').map(field => field.trim());
  return fields.map(field => {
    const match = field.match(/^(\w+)(\[\])?\s+(\w+)$/);
    if (match) {
      const [ , type, arrayBrackets, name ] = match;
      return {
        name,
        type: arrayBrackets ? type : type,
        isArray: Boolean(arrayBrackets),
      };
    }
    return null;
  }).filter((field): field is AttestationSchemaField => field !== null);
};

interface Schema {
  id: string;
  index: string;
  schema: string;
  revocable: boolean;
}

interface SearchSchemaResponse {
  schemata: Array<Schema>;
}

const EAS = () => {
  const router = useRouter();
  const [ searchInput, setSearchInput ] = React.useState('');
  const [ searchQuery, setSearchQuery ] = React.useState('');
  const [ isModalOpen, setIsModalOpen ] = React.useState(false);
  const [ selectedSchema, setSelectedSchema ] = React.useState<AttestationSchema | null>(null);

  // 判断搜索类型：如果以 0x 开头则搜索 UID，否则搜索 index
  const isUidSearch = React.useMemo(() => {
    return searchQuery.toLowerCase().startsWith('0x');
  }, [ searchQuery ]);

  // 根据搜索类型选择查询和变量
  const searchQueryGraphQL = React.useMemo(() => {
    return isUidSearch ? GET_SCHEMA_BY_UID : GET_SCHEMA_BY_INDEX;
  }, [ isUidSearch ]);

  const searchVariables = React.useMemo(() => {
    return isUidSearch ? { uid: searchQuery } : { index: searchQuery };
  }, [ searchQuery, isUidSearch ]);

  const { data: searchResults, loading: loadingSearch } = useEasGraphQL<SearchSchemaResponse>({
    query: searchQueryGraphQL,
    variables: searchVariables,
    enabled: searchQuery.length > 0,
  });

  const { data, loading } = useEasGraphQL<HomeTotalsResponse>({
    query: GET_HOME_SCHEMA_AND_ATTESTATIONS_COUNT,
    enabled: true,
  });

  // 从 GraphQL 响应中提取数据
  const totalAttestations = React.useMemo(() => {
    if (!data?.aggregateAttestation?._count?._all) return 0;
    return data.aggregateAttestation._count._all;
  }, [ data ]);

  const totalSchemas = React.useMemo(() => {
    if (!data?.aggregateSchema?._count?._all) return 0;
    return data.aggregateSchema._count._all;
  }, [ data ]);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleSearch = React.useCallback(() => {
    const trimmedInput = searchInput.trim();
    if (trimmedInput) {
      setSearchQuery(trimmedInput);
    } else {
      setSearchQuery('');
    }
  }, [ searchInput ]);

  const handleKeyPress = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [ handleSearch ]);

  const handleSchemaClick = React.useCallback((schemaIndex: string) => {
    router.push({ pathname: '/eas/schemaDetail/[index]', query: { index: schemaIndex } });
  }, [ router ]);

  const handleCloseModal = React.useCallback(() => {
    setIsModalOpen(false);
    setSelectedSchema(null);
  }, []);

  const createAttestationClickHandler = React.useCallback((schema: Schema) => {
    return () => {
      const fields = parseSchemaForModal(schema.schema);
      setSelectedSchema({
        uid: schema.id,
        schema: schema.schema,
        fields,
        revocable: schema.revocable,
      });
      setIsModalOpen(true);
    };
  }, []);

  const createSchemaClickHandler = React.useCallback((schemaIndex: string) => {
    return () => handleSchemaClick(schemaIndex);
  }, [ handleSchemaClick ]);

  // 获取要显示的 schemas（仅搜索结果，后端已限制 10 条）
  const displayedSchemas = React.useMemo(() => {
    if (searchQuery && searchResults?.schemata) {
      return searchResults.schemata;
    }
    return [];
  }, [ searchQuery, searchResults ]);

  const isLoading = loadingSearch;

  return (
    <Box pb={{ base: 6, md: 8 }}>
      <HomeHeader
        loading={ loading }
        isHome
        title="Dashboard"
        description="Showing the most recent EAS activity."
        gridList={ [ { label: 'Total Attestations', value: totalAttestations }, { label: 'Total Schemas', value: totalSchemas } ] }
      />

      <Flex
        gap={ 5 }
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <Box
          bg="bg.subtle"
          borderRadius="lg"
          p={{ base: 4, md: 5 }}
          borderWidth="1px"
          borderColor="divider"
          w={{ base: '100%', lg: '46%' }}
        >
          <VStack gap={ 5 } align="stretch">
            { /* 标题 */ }
            <Box>
              <Text fontSize="16px" fontWeight="600" mb={ 1 }>
                Search Schema
              </Text>
              <Text fontSize="xs" color="text.secondary" lineHeight="1.5">
                Enter schema number or UID to search
              </Text>
            </Box>

            { /* 搜索框 */ }
            <Box
              overflow="hidden"
              border="1px solid"
              borderColor="border.muted"
              borderRadius="xl"
              transition="all 0.2s"
            >
              <Group attached w="full">
                <Input
                  placeholder="Please enter # / UID"
                  value={ searchInput }
                  onChange={ handleSearchChange }
                  onKeyPress={ handleKeyPress }
                  size="xl"
                  bg="bg"
                  border="none"
                  _focus={{ border: 'none', boxShadow: 'none' }}
                />
                <Button
                  colorPalette="blue"
                  size="xl"
                  onClick={ handleSearch }
                  px={{ base: 4, md: 6 }}
                  borderRadius="none"
                >
                  <IconSvg name="search" boxSize={ 5 }/>
                </Button>
              </Group>
            </Box>

            { /* 分隔线 */ }
            <Box h="1px" bg="divider" opacity={ 0.6 } display={{ base: 'none', md: 'block' }}/>

            { /* 提示信息 */ }
            <Box fontSize="sm">
              <Text fontWeight="600" mb={ 3 } fontSize="xs" color="text.secondary" textTransform="uppercase" letterSpacing="wider">
                Search Rules
              </Text>
              <VStack gap={ 2 } align="stretch" color="text.secondary" lineHeight="1.7">
                <Flex alignItems="center" gap={ 2 }>
                  <Box w="5px" h="5px" bg="purple.500" borderRadius="full" flexShrink={ 0 }/>
                  <Text flex={ 1 }>
                    Starts with <Text as="span" fontWeight="600" fontFamily="mono" color="purple.600" _dark={{ color: 'purple.400' }}>0x</Text> → UID search
                  </Text>
                </Flex>
                <Flex alignItems="center" gap={ 2 }>
                  <Box w="5px" h="5px" bg="green.500" borderRadius="full" flexShrink={ 0 }/>
                  <Text flex={ 1 }>Enter numbers → Index search</Text>
                </Flex>
                <Flex alignItems="center" gap={ 2 }>
                  <Box w="5px" h="5px" bg="gray.400" borderRadius="full" flexShrink={ 0 }/>
                  <Text flex={ 1 }>Maximum 10 results</Text>
                </Flex>
              </VStack>
            </Box>
          </VStack>
        </Box>

        <Box w={{ base: '100%', lg: '54%' }} h="270px">
          { searchQuery && (
            <Box mb={ 2 }>
              <Flex align="center" justify="space-between" mb={ 2 }>
                <Flex align="center" gap={ 2 }>
                  <Text fontSize="18px" fontWeight="600">
                    Search Results
                  </Text>
                  <Box
                    px={ 2.5 }
                    py={ 1 }
                    bg={ isUidSearch ? 'purple.subtle' : 'green.subtle' }
                    borderRadius="md"
                    display="inline-flex"
                    alignItems="center"
                    gap={ 1.5 }
                  >
                    <Box
                      w="6px"
                      h="6px"
                      bg={ isUidSearch ? 'purple.500' : 'green.500' }
                      borderRadius="full"
                    />
                    <Text
                      fontSize="xs"
                      color={ isUidSearch ? 'purple.fg' : 'green.fg' }
                      fontWeight="600"
                      letterSpacing="wide"
                    >
                      { isUidSearch ? 'UID' : 'INDEX' }
                    </Text>
                  </Box>
                </Flex>
                <Text fontSize="sm" color="text.secondary" fontWeight="500">
                  { displayedSchemas.length } results
                </Text>
              </Flex>
              <Box h="2px" bg="divider" borderRadius="full"/>
            </Box>
          ) }

          { /* 加载状态 */ }
          { isLoading && (
            <VStack gap={ 4 } align="stretch">
              { [ ...Array(3) ].map((_, index) => (
                <Skeleton key={ index } loading height="full" borderRadius="lg"/>
              )) }
            </VStack>
          ) }

          { /* 搜索结果 */ }
          { !isLoading && displayedSchemas.length > 0 && (
            <Box
              h="100%"
              overflowY="auto"
              pr={ 2 }
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'var(--chakra-colors-gray-300)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'var(--chakra-colors-gray-400)',
                },
              }}
            >
              <VStack gap={ 4 } align="stretch">
                { displayedSchemas.map((schema) => {
                  const parsedFields = parseSchemaString(schema.schema);
                  return (
                    <Box
                      key={ schema.id }
                      bg="bg.subtle"
                      borderRadius="lg"
                      p={{ base: 4, md: 5 }}
                      pb={{ base: 3, md: 3 }}
                      borderWidth="1px"
                      borderColor="divider"
                      transition="all 0.2s ease"
                      _hover={{
                        borderColor: 'border',
                        shadow: 'sm',
                      }}
                    >
                      { /* 顶部：编号 + UID */ }
                      <Flex
                        align="center"
                        gap={ 4 }
                        mb={ 5 }
                      >
                        <Flex
                          align="center"
                          justify="center"
                          bg="blue.subtle"
                          color="blue.fg"
                          minW="48px"
                          h="48px"
                          px="10px"
                          borderRadius="md"
                          fontWeight="600"
                          fontSize="lg"
                          flexShrink={ 0 }
                        >
                          #{ schema.index }
                        </Flex>
                        <Box flex={ 1 } minW={ 0 }>
                          <Text
                            fontSize="sm"
                            fontWeight="700"
                            color="fg"
                            mb={ 1.5 }
                            textTransform="uppercase"
                            letterSpacing="wide"
                          >
                            Schema #{ schema.index }
                          </Text>
                          <Text
                            fontSize="xs"
                            fontFamily="mono"
                            color="text.secondary"
                            wordBreak="break-all"
                            lineHeight="1.5"
                          >
                            { schema.id }
                          </Text>
                        </Box>
                      </Flex>

                      { /* 分隔线 */ }
                      <Box h="1px" border="1px solid" borderColor="border.muted" mb={ 4 } opacity={ 0.6 }/>

                      { /* Schema 字段 */ }
                      <Box mb={ 4 }>
                        <Flex align="center" gap={ 2 } mb={ 3 }>
                          <Box w="3px" h="3px" bg="blue.500" borderRadius="full"/>
                          <Text
                            fontSize="xs"
                            fontWeight="600"
                            color="text.secondary"
                            textTransform="uppercase"
                            letterSpacing="wider"
                          >
                            Fields ({ parsedFields.length })
                          </Text>
                        </Flex>
                        <Flex wrap="wrap" gap={ 3 }>
                          { parsedFields && parsedFields.length > 0 ? (
                            parsedFields.map((field, index) => (
                              <Box
                                key={ index }
                                px={ 3 }
                                py={ 2 }
                                bg="bg"
                                borderRadius="md"
                                fontSize="xs"
                                borderWidth="1px"
                                borderColor="divider"
                              >
                                <Text
                                  as="span"
                                  color="blue.600"
                                  _dark={{ color: 'blue.400' }}
                                  fontWeight="600"
                                  fontFamily="mono"
                                >
                                  { field.type }
                                </Text>
                                { ' ' }
                                <Text as="span" fontWeight="600" color="fg" ml={ 1 }>
                                  { field.name }
                                </Text>
                              </Box>
                            ))
                          ) : (
                            <Text fontSize="sm" color="text.secondary" fontStyle="italic">
                              No fields
                            </Text>
                          ) }
                        </Flex>
                      </Box>

                      { /* 分隔线 */ }
                      <Box h="1px" border="1px solid" borderColor="border.muted" mb={ 2 } opacity={ 0.6 }/>

                      { /* 底部信息和按钮 */ }
                      <Flex justify="space-between" align="center" gap={ 3 }>
                        <Flex align="center" gap={ 1.5 }>
                          <Box
                            w="6px"
                            h="6px"
                            bg={ schema.revocable ? 'green.500' : 'orange.500' }
                            borderRadius="full"
                          />
                          <Text fontSize="xs" color="text.secondary" fontWeight="500">
                            { schema.revocable ? 'Revocable' : 'Non-revocable' }
                          </Text>
                        </Flex>
                        <Flex gap={ 2 }>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={ createSchemaClickHandler(schema.index) }
                          >
                            Details
                          </Button>
                          <Button
                            colorPalette="blue"
                            size="sm"
                            onClick={ createAttestationClickHandler(schema) }
                          >
                            Use Schema
                          </Button>
                        </Flex>
                      </Flex>
                    </Box>
                  );
                }) }
              </VStack>
            </Box>
          ) }

          { /* 无结果或初始状态 */ }
          { !isLoading && displayedSchemas.length === 0 && (
            <Box
              textAlign="center"
              py={ searchQuery ? 14 : 16 }
              px={ 6 }
              bg="bg.subtle"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="divider"
            >
              <Flex
                align="center"
                justify="center"
                w="80px"
                h="80px"
                bg={ searchQuery ? 'orange.50' : 'blue.50' }
                _dark={{
                  bg: searchQuery ? 'orange.950' : 'blue.950',
                  borderColor: searchQuery ? 'orange.800' : 'blue.800',
                }}
                borderRadius="full"
                mx="auto"
                mb={ 5 }
                borderWidth="2px"
                borderColor={ searchQuery ? 'orange.200' : 'blue.200' }
              >
                <IconSvg
                  name={ searchQuery ? 'info_filled' : 'search' }
                  boxSize={ 10 }
                  color={ searchQuery ? 'orange.500' : 'blue.500' }
                />
              </Flex>
              <Text fontSize="20px" fontWeight="600" color="fg" lineHeight="1.4" mb={ searchQuery ? '6px' : '10px' }>
                { searchQuery ? 'No matching Schema found' : 'Start searching' }
              </Text>
              <Text fontSize="sm" color="text.secondary" maxW="360px" mx="auto" lineHeight="1.7">
                { searchQuery ? 'Try using different keywords or check the input format' : 'Enter a Schema number or UID on the left to start searching' }
              </Text>
            </Box>
          ) }
        </Box>
      </Flex>

      <Box mt={{ base: 16, md: 8 }}>
        <HomeAttestation/>
      </Box>

      { /* CreateAttestationModal */ }
      { selectedSchema && (
        <CreateAttestationModal
          isOpen={ isModalOpen }
          onClose={ handleCloseModal }
          schema={ selectedSchema }
        />
      ) }
    </Box>
  );
};

export default EAS;
