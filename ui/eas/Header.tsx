import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import { Button } from 'toolkit/chakra/button';
import { Link } from 'toolkit/chakra/link';
import CreateSchemaModal from 'ui/eas/CreateSchemaModal';
import StatsCard from 'ui/eas/StatsCard';

interface Props {
  loading: boolean;
  title: string;
  gridList: Array<{
    label: string;
    value: number;
  }>;
  description: string;
  isMakeSchemaButton?: boolean;
  isHome?: boolean;
}

const HomeHeader = ({ loading, title, description, gridList, isMakeSchemaButton = false, isHome = false }: Props) => {
  const [ isSchemaModalOpen, setIsSchemaModalOpen ] = React.useState(false);

  const handleOpenSchemaModal = React.useCallback(() => {
    setIsSchemaModalOpen(true);
  }, []);

  const handleCloseSchemaModal = React.useCallback(() => {
    setIsSchemaModalOpen(false);
  }, []);

  return (
    <Box mb={ 6 }>
      { /* 移动端布局 */ }
      <Box hideFrom="lg" px={{ base: 2, md: 0 }}>
        <Flex direction="column" gap={ 4 }>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gapY={ 2 }>
            <Box>
              <Text fontSize="22px" fontWeight="bold" mb={ 1 }>
                { title }
              </Text>
              <Text fontSize="14px" fontWeight="400" color="text.secondary">
                { description }
              </Text>
            </Box>

            <StatsCard
              data={ gridList }
              loading={ loading }
            />
          </Box>

          {
            isMakeSchemaButton && (
              <Button
                variant="solid"
                colorScheme="blue"
                size="md"
                w="100%"
                onClick={ handleOpenSchemaModal }
              >
                Create Schema
              </Button>
            )
          }
        </Flex>
      </Box>

      { /* 桌面端布局 */ }
      <Box hideBelow="lg">
        <Flex justifyContent="space-between" alignItems="center" flex={ isHome ? '1' : 'inherit' }>
          <Flex alignItems="center" gap={ 12 } flex={ isHome ? '1' : 'inherit' } justifyContent={ isHome ? 'space-between' : 'inherit' }>
            <Box>
              <Text fontSize="22px" fontWeight="bold" mb={ 1 }>
                { title }
              </Text>
              <Text fontSize="14px" fontWeight="400" color="text.secondary">
                { description }
              </Text>
            </Box>

            <StatsCard
              data={ gridList }
              loading={ loading }
            />
          </Flex>

          {
            isHome && (
              <Flex flex={ 1 / 1.3 } justifyContent="end" pr={ 10 }>
                <Link
                  color="link"
                  fontSize={{ base: 'xs', sm: 'sm' }}
                  fontWeight={ 500 }
                  textAlign="right"
                  mt={ 4 }
                  target="_blank"
                  href="https://docs.xone.org/developers/tools/attest/eas"
                >
                  What is Eas?
                </Link>
              </Flex>
            )
          }

          {
            isMakeSchemaButton && (
              <Button
                variant="solid"
                colorScheme="blue"
                size="sm"
                onClick={ handleOpenSchemaModal }
              >
                Create Schema
              </Button>
            )
          }
        </Flex>
      </Box>

      { /* Create Schema Modal */ }
      <CreateSchemaModal
        isOpen={ isSchemaModalOpen }
        onClose={ handleCloseSchemaModal }
      />
    </Box>
  );
};

export default HomeHeader;
