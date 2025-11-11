import { Box, Flex, Input, Text, useBreakpointValue, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import { GET_HOME_SCHEMA_AND_ATTESTATIONS_COUNT, GET_HOME_SCHEMAS, GET_SCHEMA_BY_INDEX, GET_SCHEMA_BY_UID } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import { Skeleton } from 'toolkit/chakra/skeleton';
import HomeHeader from 'ui/eas/Header';
import HomeAttestation from 'ui/eas/home/HomeAttestation';
import SchemaListItem, { parseSchemaString, type TopSchema } from 'ui/eas/home/SchemaListItem';
import IconSvg from 'ui/shared/IconSvg';

interface HomeTotalsResponse {
  aggregateAttestation: {
    _count: {
      _all: number;
    };
  };
  aggregateSchema: {
    _count: {
      _all: number;
    };
  };
}

interface Schema {
  id: string;
  index: string;
  schema: string;
  revocable: boolean;
}

interface SearchSchemaResponse {
  schemata: Array<Schema>;
}

interface TopSchemasResponse {
  schemata: Array<TopSchema>;
}

const EAS = () => {
  const router = useRouter();
  const [ searchInput, setSearchInput ] = React.useState('');
  const [ searchQuery, setSearchQuery ] = React.useState('');
  const [ isDropdownOpen, setIsDropdownOpen ] = React.useState(false);
  const searchBoxRef = React.useRef<HTMLDivElement>(null);
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPlaceholder = useBreakpointValue({
    base: 'Enter #12 or 0x123...',
    md: 'Enter schema number (e.g., #12) or UID (e.g., 0x123...)',
  });

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

  const { data, loading } = useEasGraphQL<HomeTotalsResponse>({
    query: GET_HOME_SCHEMA_AND_ATTESTATIONS_COUNT,
    enabled: true,
  });

  const { data: searchResults, loading: loadingSearch } = useEasGraphQL<SearchSchemaResponse>({
    query: searchQueryGraphQL,
    variables: searchVariables,
    enabled: searchQuery.length > 0,
  });

  // 获取 attestations 数量最多的前10个 schemas
  const { data: topSchemasData, loading: loadingTopSchemas } = useEasGraphQL<TopSchemasResponse>({
    query: GET_HOME_SCHEMAS,
    variables: { sortOrder: 'desc' },
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

  // 获取 top schemas 列表
  const topSchemas = React.useMemo(() => {
    if (!topSchemasData?.schemata) return [];
    return topSchemasData.schemata;
  }, [ topSchemasData ]);

  // 获取搜索结果列表
  const displayedSchemas = React.useMemo(() => {
    if (searchQuery && searchResults?.schemata) {
      return searchResults.schemata;
    }
    return [];
  }, [ searchQuery, searchResults ]);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的定时器，500ms 后执行搜索
    debounceTimerRef.current = setTimeout(() => {
      let trimmedInput = value.trim();
      // 如果输入以 # 开头，去除 # 符号
      if (trimmedInput.startsWith('#')) {
        trimmedInput = trimmedInput.substring(1).trim();
      }
      if (trimmedInput) {
        setSearchQuery(trimmedInput);
        setIsDropdownOpen(true);
      } else {
        setSearchQuery('');
        setIsDropdownOpen(false);
      }
    }, 500);
  }, []);

  const handleSchemaClick = React.useCallback((schemaIndex: string) => {
    setIsDropdownOpen(false);
    setSearchInput('');
    setSearchQuery('');
    router.push({ pathname: '/eas/schemaDetail/[index]', query: { index: schemaIndex } });
  }, [ router ]);

  const createSchemaClickHandler = React.useCallback((schemaIndex: string) => {
    return () => handleSchemaClick(schemaIndex);
  }, [ handleSchemaClick ]);

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 点击外部关闭下拉框
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 当搜索结果加载完成时，打开下拉框
  React.useEffect(() => {
    if (searchQuery && !loadingSearch && displayedSchemas.length > 0) {
      setIsDropdownOpen(true);
    }
  }, [ searchQuery, loadingSearch, displayedSchemas ]);

  return (
    <Box pb={{ base: 6, md: 8 }}>
      <HomeHeader
        loading={ loading }
        isHome
        title="Dashboard"
        description="Showing the most recent EAS activity."
        gridList={ [ { label: 'Total Attestations', value: totalAttestations }, { label: 'Total Schemas', value: totalSchemas } ] }
      />

      { /* 搜索框区域 */ }
      <Box
        mt={{ base: 2, lg: 8 }}
        mb={{ base: 6, lg: 8 }}
        display="flex"
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={ 4 }
        alignItems={{ base: 'stretch', lg: 'center' }}
      >
        <Box
          bg="bg.subtle"
          borderRadius="lg"
          p={{ base: 4, md: 5 }}
          borderWidth="1px"
          borderColor="divider"
          flex={{ base: 'auto', md: 1 / 1.25 }}
          mx={{ base: 0, lg: 'auto' }}
        >
          <VStack gap={ 4 } align="stretch">
            { /* 标题 */ }
            <Box textAlign="center">
              <Text fontSize={{ base: 'lg', md: '20px' }} fontWeight="600" mb={ 2 }>
                Search Schema
              </Text>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="text.secondary" lineHeight="1.5">
                Search by schema number (e.g., #12 or 12) or UID (e.g., 0x123...)
              </Text>
            </Box>

            { /* 搜索框带下拉 */ }
            <Box position="relative" ref={ searchBoxRef }>
              <Input
                placeholder={ searchPlaceholder }
                value={ searchInput }
                onChange={ handleSearchChange }
                size={{ base: 'md', md: 'xl' }}
                borderRadius={{ base: 'md', md: 'xl' }}
                borderWidth="2px"
                borderColor="border.muted"
                transition="all 0.2s"
                fontSize={{ base: 'sm', md: 'md' }}
                _hover={{
                  borderColor: 'border.emphasized',
                }}
                _focus={{
                  borderColor: 'red.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-red-500)',
                  _hover: {
                    borderColor: 'red.500',
                  },
                }}
              />

              { /* 下拉搜索结果 */ }
              { isDropdownOpen && (
                <Box
                  position="absolute"
                  top="calc(100% + 8px)"
                  left={ 0 }
                  right={ 0 }
                  bg="bg"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="border"
                  shadow="lg"
                  maxH="400px"
                  overflowY="auto"
                  zIndex={ 1000 }
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
                  { loadingSearch && (
                    <VStack gap={ 2 } p={{ base: 2, md: 3 }}>
                      { [ ...Array(3) ].map((_, index) => (
                        <Skeleton key={ index } loading height={{ base: '70px', md: '80px' }} borderRadius="md" w="full"/>
                      )) }
                    </VStack>
                  ) }

                  { !loadingSearch && displayedSchemas.length > 0 && (
                    <VStack gap={ 0 } align="stretch">
                      { displayedSchemas.map((schema, index) => {
                        const parsedFields = parseSchemaString(schema.schema);
                        return (
                          <Box
                            key={ schema.id }
                            p={{ base: 3, md: 4 }}
                            cursor="pointer"
                            transition="all 0.2s"
                            borderBottomWidth={ index < displayedSchemas.length - 1 ? '1px' : '0' }
                            borderColor="divider"
                            _hover={{
                              bg: 'bg.subtle',
                            }}
                            onClick={ createSchemaClickHandler(schema.index) }
                          >
                            <Flex align="center" gap={{ base: 2, md: 3 }} mb={ 2 }>
                              { /* Schema 编号 */ }
                              <Flex
                                align="center"
                                justify="center"
                                bg="red.50"
                                color="red.600"
                                _dark={{ bg: 'red.900', color: 'red.300' }}
                                px={{ base: 1.5, md: 2 }}
                                h={{ base: '32px', md: '40px' }}
                                borderRadius="md"
                                fontWeight="600"
                                fontSize={{ base: 'sm', md: 'md' }}
                                flexShrink={ 0 }
                              >
                                #{ schema.index }
                              </Flex>

                              { /* Schema 信息 */ }
                              <Box flex={ 1 } minW={ 0 }>
                                <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="700" color="fg" mb={ 0.5 }>
                                  Schema #{ schema.index }
                                </Text>
                                <Text
                                  fontSize={{ base: '2xs', md: 'xs' }}
                                  fontFamily="mono"
                                  color="text.secondary"
                                  truncate
                                >
                                  { schema.id }
                                </Text>
                              </Box>

                              { /* Revocable 状态 */ }
                              <Flex align="center" gap={ 1.5 } flexShrink={ 0 } display={{ base: 'none', sm: 'flex' }}>
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
                            </Flex>

                            { /* Schema 字段预览 */ }
                            { parsedFields && parsedFields.length > 0 && (
                              <Flex wrap="wrap" gap={{ base: 1.5, md: 2 }}>
                                { parsedFields.slice(0, 4).map((field, fieldIndex) => (
                                  <Box
                                    key={ fieldIndex }
                                    px={{ base: 1.5, md: 2 }}
                                    py={{ base: 0.5, md: 1 }}
                                    bg="bg.muted"
                                    borderRadius="sm"
                                    fontSize={{ base: '2xs', md: 'xs' }}
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
                                    <Text as="span" fontWeight="600" color="fg">
                                      { field.name }
                                    </Text>
                                  </Box>
                                )) }
                                { parsedFields.length > 4 && (
                                  <Box
                                    px={{ base: 1.5, md: 2 }}
                                    py={{ base: 0.5, md: 1 }}
                                    bg="bg.muted"
                                    borderRadius="sm"
                                    fontSize={{ base: '2xs', md: 'xs' }}
                                    color="text.secondary"
                                  >
                                    +{ parsedFields.length - 4 }
                                  </Box>
                                ) }
                              </Flex>
                            ) }
                          </Box>
                        );
                      }) }
                    </VStack>
                  ) }

                  { !loadingSearch && displayedSchemas.length === 0 && (
                    <Box p={ 6 } textAlign="center">
                      <IconSvg name="info_filled" boxSize={ 10 } color="orange.500" mb={ 3 } mx="auto"/>
                      <Text fontSize="md" fontWeight="600" color="fg" mb={ 1 }>
                        No matching Schema found
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        Try using different keywords
                      </Text>
                    </Box>
                  ) }
                </Box>
              ) }
            </Box>

            { /* 提示信息 */ }
            <Box fontSize="sm" bg="bg.muted" p={ 4 } borderRadius="md">
              <Text fontWeight="600" mb={ 2 } fontSize="xs" color="text.secondary" textTransform="uppercase" letterSpacing="wider">
                Search Tips
              </Text>
              <VStack gap={ 1.5 } align="stretch" color="text.secondary" lineHeight="1.7" fontSize="xs">
                <Flex alignItems="center" gap={ 2 }>
                  <Box w="5px" h="5px" bg="blue.500" borderRadius="full" flexShrink={ 0 }/>
                  <Text flex={ 1 }>
                    Schema number: <Text as="span" fontWeight="600" fontFamily="mono">#12</Text> or <Text as="span" fontWeight="600" fontFamily="mono">12</Text>
                  </Text>
                </Flex>
                <Flex alignItems="center" gap={ 2 }>
                  <Box w="5px" h="5px" bg="red.500" borderRadius="full" flexShrink={ 0 }/>
                  <Text flex={ 1 }>
                    Schema UID: <Text as="span" fontWeight="600" fontFamily="mono" color="red.600" _dark={{ color: 'red.400' }}>0x123...</Text>
                  </Text>
                </Flex>
                <Flex alignItems="center" gap={ 2 }>
                  <Box w="5px" h="5px" bg="gray.400" borderRadius="full" flexShrink={ 0 }/>
                  <Text flex={ 1 }>Maximum 10 results per search</Text>
                </Flex>
              </VStack>
            </Box>
          </VStack>
        </Box>

        { /* Top Schemas 列表 */ }
        <Box flex={{ base: 'auto', md: 1 }}>
          <Box
            bg="bg.subtle"
            borderRadius="lg"
            p={{ base: 4, md: 5 }}
            borderWidth="1px"
            borderColor="divider"
            h={{ base: '400px', md: '312px' }}
            display="flex"
            flexDirection="column"
          >
            <Text fontSize={{ base: 'md', md: '18px' }} fontWeight="600" mb={{ base: 3, md: 4 }}>
              Top Schemas
            </Text>

            <Box
              flex={ 1 }
              overflowY="auto"
              pr={{ base: 1, md: 2 }}
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
              { loadingTopSchemas ? (
                <VStack gap={{ base: 2, md: 3 }} align="stretch">
                  { [ ...Array(10) ].map((_, index) => (
                    <Skeleton key={ index } loading height={{ base: '55px', md: '60px' }} borderRadius="md"/>
                  )) }
                </VStack>
              ) : (
                <VStack gap={{ base: 1.5, md: 2 }} align="stretch">
                  { topSchemas.map((schema, index) => {
                    const attestationsCount = schema._count?.attestations || schema.attestations?.length || 0;
                    const parsedFields = parseSchemaString(schema.schema);

                    return (
                      <SchemaListItem
                        key={ schema.id }
                        schema={ schema }
                        attestationsCount={ attestationsCount }
                        parsedFields={ parsedFields }
                        onClick={ createSchemaClickHandler(schema.index) }
                        index={ index }
                      />
                    );
                  }) }
                </VStack>
              ) }
            </Box>
          </Box>
        </Box>
      </Box>

      <Box mt={{ base: 10, md: 8 }}>
        <HomeAttestation/>
      </Box>
    </Box>
  );
};

export default EAS;
