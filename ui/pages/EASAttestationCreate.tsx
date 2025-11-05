import { Box, Flex, Grid, Group, Input, Separator, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import { GET_LATEST_4_SCHEMAS, GET_SCHEMA_BY_INDEX_UID } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import { Button } from 'toolkit/chakra/button';
import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import CreateAttestationModal from 'ui/eas/CreateAttestationModal';
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

interface LatestSchemasResponse {
  schemata: Array<Schema>;
}

interface SearchSchemaResponse {
  schemata: Array<Schema>;
}

const EASAttestationCreate = () => {
  const router = useRouter();
  const [ searchInput, setSearchInput ] = React.useState('');
  const [ searchQuery, setSearchQuery ] = React.useState('');
  const [ isModalOpen, setIsModalOpen ] = React.useState(false);
  const [ selectedSchema, setSelectedSchema ] = React.useState<AttestationSchema | null>(null);

  // 获取最新的 4 个 schemas - 使用 useMemo 确保 variables 引用稳定
  const latestSchemasVariables = React.useMemo(() => ({}), []);
  const { data: latestSchemas, loading: loadingLatest } = useEasGraphQL<LatestSchemasResponse>({
    query: GET_LATEST_4_SCHEMAS,
    variables: latestSchemasVariables,
  });

  // 搜索 schema - 使用 useMemo 确保只在 searchQuery 变化时才创建新的 variables
  const searchVariables = React.useMemo(() => ({
    index: searchQuery,
    uid: searchQuery,
  }), [ searchQuery ]);

  const { data: searchResults, loading: loadingSearch } = useEasGraphQL<SearchSchemaResponse>({
    query: GET_SCHEMA_BY_INDEX_UID,
    variables: searchVariables,
    enabled: searchQuery.length > 0,
  });

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

  const handleViewAllSchemas = React.useCallback(() => {
    router.push('/eas/schemas');
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

  const displayedSchemas = latestSchemas?.schemata;
  const isLoading = searchQuery ? loadingSearch : loadingLatest;

  return (
    <Box py={{ base: 4, md: 8 }}>
      <VStack gap={{ base: 6, md: 8 }} align="stretch" maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
        { /* 页面标题 */ }
        <Box textAlign="center" pt={{ base: 2, md: 6 }} pb={{ base: 0, md: 2 }}>
          <Text
            fontSize="xs"
            fontWeight="600"
            color="blue.500"
            mb={{ base: 2, md: 3 }}
            textTransform="uppercase"
            letterSpacing="0.1em"
          >
            Make an Attestation
          </Text>
          <Text
            fontSize="3xl"
            fontWeight="700"
            lineHeight="1.2"
            mb={{ base: 2, md: 3 }}
            color="fg"
            px={{ base: 2, md: 0 }}
          >
            Choose your attestation schema
          </Text>
        </Box>

        { /* 搜索区域 */ }
        <Box
          bg="bg.subtle"
          borderRadius={{ base: 'lg', md: 'xl' }}
          p={{ base: 4, md: 8 }}
          borderWidth="1px"
          borderColor="border"
        >
          <VStack gap={{ base: 4, md: 5 }} align="stretch">
            <Box textAlign="center" mb={{ base: 0, md: 1 }}>
              <Text
                fontSize="xl"
                fontWeight="600"
                mb={{ base: 1, md: 2 }}
                lineHeight="1.4"
                color="fg"
              >
                Search for a schema
              </Text>
              <Text
                fontSize="sm"
                color="fg.muted"
                lineHeight="1.5"
                px={{ base: 2, md: 0 }}
              >
                Enter the schema number (#) or UID to get started
              </Text>
            </Box>

            { /* 搜索框 */ }
            <Box
              overflow="hidden"
              border="1px solid"
              borderColor="border.muted"
              borderRadius={{ base: 'md', md: 'lg' }}
              transition="all 0.2s"
              _hover={{ borderColor: 'border', shadow: 'sm' }}
              _focusWithin={{ borderColor: 'border', shadow: 'md' }}
            >
              <Group attached w="full">
                <Input
                  placeholder="Search by Schema # / UID"
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
                  px={ 6 }
                  borderRadius="none"
                >
                  <IconSvg name="search" boxSize={ 5 }/>
                </Button>
              </Group>
            </Box>

            { /* 搜索结果 */ }
            { searchQuery && (
              <Box mt={ 4 }>
                { loadingSearch && (
                  <Skeleton loading height="300px" borderRadius="xl"/>
                ) }
                { !loadingSearch && searchResults?.schemata && searchResults.schemata.length > 0 && (
                  <VStack gap={{ base: 3, md: 4 }} align="stretch">
                    { searchResults.schemata.map((schema) => {
                      const parsedFields = parseSchemaString(schema.schema);
                      return (
                        <Box
                          key={ schema.id }
                          bg="bg.muted"
                          borderRadius={{ base: 'lg', md: 'xl' }}
                          p={{ base: 4, md: 6 }}
                          borderWidth="1px"
                          borderColor="border.muted"
                        >
                          { /* 顶部：编号 + 标题 + UID */ }
                          <Flex align="center" gap={{ base: 3, md: 5 }} mb={{ base: 4, md: 6 }}>
                            <Flex
                              align="center"
                              justify="center"
                              bg="blue.100"
                              color="blue.700"
                              _dark={{ bg: 'blue.900', color: 'blue.200' }}
                              minW={{ base: '56px', md: '72px' }}
                              h={{ base: '56px', md: '72px' }}
                              borderRadius={{ base: 'md', md: 'lg' }}
                              fontWeight="700"
                              fontSize="2xl"
                              flexShrink={ 0 }
                            >
                              #{ schema.index }
                            </Flex>
                            <Box flex={ 1 } minW={ 0 }>
                              <Text
                                fontSize="md"
                                fontWeight="600"
                                color="fg.muted"
                                mb={{ base: 1, md: 2 }}
                                textTransform="uppercase"
                                letterSpacing="0.05em"
                              >
                                Schema #{ schema.index }
                              </Text>
                              <Text
                                fontSize="sm"
                                fontFamily="mono"
                                color="blue.500"
                                _dark={{ color: 'blue.400' }}
                                wordBreak="break-all"
                                lineHeight="1.5"
                              >
                                { schema.id }
                              </Text>
                            </Box>
                          </Flex>

                          <Separator mb={{ base: 4, md: 5 }}/>

                          { /* Schema 字段 */ }
                          <Box mb={{ base: 4, md: 6 }}>
                            <Text
                              fontSize="xs"
                              fontWeight="600"
                              color="fg.muted"
                              mb={{ base: 3, md: 4 }}
                              textTransform="uppercase"
                              letterSpacing="0.1em"
                            >
                              Schema Fields
                            </Text>
                            <Flex wrap="wrap" gap={{ base: 2, md: 3 }}>
                              { parsedFields && parsedFields.length > 0 ? (
                                parsedFields.map((field, index) => (
                                  <Box
                                    key={ index }
                                    px={{ base: 3, md: 4 }}
                                    py={{ base: 2, md: 3 }}
                                    bg="bg"
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor="border.muted"
                                  >
                                    <Text
                                      fontSize="xs"
                                      color="blue.500"
                                      mb={ 1 }
                                      textTransform="uppercase"
                                      fontWeight="600"
                                      letterSpacing="0.05em"
                                    >
                                      { field.type }
                                    </Text>
                                    <Text
                                      fontSize="md"
                                      fontWeight="600"
                                      color="fg"
                                      lineHeight="1.4"
                                    >
                                      { field.name }
                                    </Text>
                                  </Box>
                                ))
                              ) : (
                                <Text fontSize="sm" color="fg.muted" lineHeight="1.5">
                                  No fields
                                </Text>
                              ) }
                            </Flex>
                          </Box>

                          <Separator mb={{ base: 4, md: 5 }}/>

                          { /* 底部按钮 */ }
                          <Flex justify={{ base: 'stretch', md: 'flex-end' }}>
                            <Button
                              colorPalette="blue"
                              size={{ base: 'md', md: 'lg' }}
                              onClick={ createAttestationClickHandler(schema) }
                              px={{ base: 4, md: 6 }}
                              fontWeight="600"
                              w={{ base: 'full', md: 'auto' }}
                            >
                              Use This Schema
                            </Button>
                          </Flex>
                        </Box>
                      );
                    }) }
                  </VStack>
                ) }
                { !loadingSearch && (!searchResults?.schemata || searchResults.schemata.length === 0) && (
                  <Box textAlign="center" py={ 6 }>
                    <Text fontSize="sm" color="fg.muted">
                      No schema found. Please try another search.
                    </Text>
                  </Box>
                ) }
              </Box>
            ) }
          </VStack>
        </Box>

        { /* 特色 Schemas */ }
        <Box pt={{ base: 2, md: 4 }} hidden={ displayedSchemas?.length === 0 }>
          <Box textAlign="center" mb={{ base: 4, md: 6 }}>
            <Text
              fontSize="xs"
              fontWeight="600"
              color="blue.500"
              mb={{ base: 2, md: 3 }}
              textTransform="uppercase"
              letterSpacing="0.1em"
            >
              Featured Schemas
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="700"
              lineHeight="1.3"
              mb={{ base: 1, md: 2 }}
              color="fg"
              px={{ base: 2, md: 0 }}
            >
              Don't know the UID or #?
            </Text>
            <Text
              fontSize="md"
              color="fg.muted"
              lineHeight="1.6"
              maxW="580px"
              mx="auto"
              px={{ base: 2, md: 0 }}
            >
              Explore our curated selection of popular schemas
            </Text>
          </Box>

          { isLoading && (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={{ base: 3, md: 4 }}>
              { [ ...Array(4) ].map((_, index) => (
                <Skeleton key={ index } loading height={{ base: '80px', md: '94px' }} borderRadius="lg"/>
              )) }
            </Grid>
          ) }

          { !isLoading && (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={{ base: 3, md: 5 }}>
              { displayedSchemas?.map((schema) => (
                <Flex
                  key={ schema.id }
                  align="center"
                  gap={{ base: 3, md: 5 }}
                  p={{ base: 4, md: 6 }}
                  borderRadius={{ base: 'lg', md: 'xl' }}
                  cursor="pointer"
                  bg="bg.muted"
                  borderWidth="1px"
                  borderColor="border.muted"
                  onClick={ createSchemaClickHandler(schema.index) }
                  transition="all 0.2s"
                  _hover={{
                    borderColor: 'border',
                    shadow: 'sm',
                  }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    bg="blue.100"
                    color="blue.700"
                    _dark={{ bg: 'blue.900', color: 'blue.200' }}
                    minW={{ base: '56px', md: '68px' }}
                    h={{ base: '56px', md: '68px' }}
                    borderRadius={{ base: 'md', md: 'lg' }}
                    fontWeight="700"
                    fontSize="2xl"
                    flexShrink={ 0 }
                  >
                    #{ schema.index }
                  </Flex>
                  <Box flex={ 1 } minW={ 0 }>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="fg"
                      mb={{ base: 1, md: 2 }}
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                      lineClamp={ 1 }
                    >
                      { schema.schema }
                    </Text>
                    <Text
                      fontSize="xs"
                      fontFamily="mono"
                      color="blue.500"
                      _dark={{ color: 'blue.400' }}
                      wordBreak="break-all"
                      lineClamp={ 1 }
                      lineHeight="1.5"
                    >
                      { schema.id }
                    </Text>
                  </Box>
                </Flex>
              )) }
            </Grid>
          ) }

          <Box textAlign="center" mt={{ base: 6, md: 10 }}>
            <Link
              onClick={ handleViewAllSchemas }
              color="link"
              fontSize="sm"
              fontWeight={ 500 }
            >
              View all schemas
            </Link>
          </Box>
        </Box>
      </VStack>

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

export default EASAttestationCreate;
