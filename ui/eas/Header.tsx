import { Box, Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import { Button } from 'toolkit/chakra/button';
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
  isMakeAttestationButton?: boolean;
  isMakeSchemaButton?: boolean;
}

const HomeHeader = ({ loading, title, description, gridList, isMakeAttestationButton = false, isMakeSchemaButton = false }: Props) => {
  const router = useRouter();
  const [ isSchemaModalOpen, setIsSchemaModalOpen ] = React.useState(false);

  const handleMakeAttestation = React.useCallback(() => {
    router.push('/eas/attestationCreate');
  }, [ router ]);

  const handleOpenSchemaModal = React.useCallback(() => {
    setIsSchemaModalOpen(true);
  }, []);

  const handleCloseSchemaModal = React.useCallback(() => {
    setIsSchemaModalOpen(false);
  }, []);

  return (
    <Box mb={ 6 }>
      { /* 移动端布局 */ }
      <Box hideFrom="lg">
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
            isMakeAttestationButton && (
              <Button
                variant="solid"
                colorScheme="blue"
                size="md"
                w="100%"
                onClick={ handleMakeAttestation }
              >
                Make Attestation
              </Button>
            )
          }

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
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap={ 12 }>
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
            isMakeAttestationButton && (
              <Button
                variant="solid"
                colorScheme="blue"
                size="sm"
                onClick={ handleMakeAttestation }
              >
                Make Attestation
              </Button>
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
