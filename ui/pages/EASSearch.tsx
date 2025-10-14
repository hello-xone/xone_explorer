import { Box, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import { Button } from 'toolkit/chakra/button';
import { Heading } from 'toolkit/chakra/heading';
import { Input } from 'toolkit/chakra/input';
import { InputGroup } from 'toolkit/chakra/input-group';
import IconSvg from 'ui/shared/IconSvg';

const EASSearch = () => {
  const [ searchTerm, setSearchTerm ] = React.useState('');
  const router = useRouter();

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleSearch = React.useCallback(() => {
    // TODO: 实现搜索逻辑
    if (!searchTerm.trim()) {
      return;
    }

    router.push(`/eas/detail`);
  }, [ searchTerm, router ]);

  const handleKeyPress = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }, [ handleSearch ]);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 8, md: 12 }}
      px={ 4 }
    >
      <VStack
        gap={ 8 }
        maxW="800px"
        w="100%"
      >
        { /* 标题部分 */ }
        <VStack gap={ 3 } textAlign="center" w="100%">
          <Heading
            as="h1"
            size={{ base: 'xl', md: '2xl' }}
            fontWeight={ 700 }
            letterSpacing="-0.02em"
          >
            Search for a schema
          </Heading>
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="text.secondary"
            maxW="600px"
          >
            Type in the schema # or the UID of the schema to find what you&apos;re looking for
          </Text>
        </VStack>

        { /* 搜索框 */ }
        <Box
          w="100%"
          borderRadius="xl"
          p={ 2 }
          bg="dialog.bg"
          borderWidth="1px"
          borderColor="divider"
          transition="all 0.2s"
          _hover={{
            borderColor: 'link',
          }}
          _focusWithin={{
            borderColor: 'link',
          }}
        >
          <InputGroup
            endElement={ (
              <Button
                variant="solid"
                colorScheme="blue"
                size="md"
                mr={ 1 }
                onClick={ handleSearch }
                disabled={ !searchTerm.trim() }
                gap={ 1 }
                pl={ 2 }
                pr={ 2.5 }
              >
                <IconSvg
                  name="search"
                  boxSize={ 5 }
                />
                Search
              </Button>
            ) }
          >
            <Input
              placeholder="Search by Schema # / Name / UID"
              size="lg"
              value={ searchTerm }
              onChange={ handleSearchChange }
              onKeyPress={ handleKeyPress }
              bg="transparent"
              border="none"
              fontSize="md"
              _focus={{
                boxShadow: 'none',
                outline: 'none',
              }}
              _hover={{
                border: 'none',
              }}
            />
          </InputGroup>
        </Box>

        { /* 提示文字 */ }
        <Text
          fontSize="sm"
          color="text.secondary"
          textAlign="center"
        >
          Press <Box as="kbd" px={ 2 } py={ 1 } borderRadius="sm" bg={{ _light: 'blackAlpha.100', _dark: 'whiteAlpha.100' }} fontWeight={ 600 }>Enter</Box> to search
        </Text>
      </VStack>
    </Box>
  );
};

export default EASSearch;
