import { Box, Grid, Text } from '@chakra-ui/react';
import React from 'react';

import type { EASStats as EASStatsType } from './types';

import { Skeleton } from 'toolkit/chakra/skeleton';

interface Props {
  stats: EASStatsType;
  isLoading?: boolean;
}

const StatCard = ({ label, value, isLoading }: { label: string; value: number; isLoading?: boolean }) => (
  <Box
    p={ 6 }
    borderWidth="1px"
    borderRadius="md"
    borderColor="divider"
    bg="dialog.bg"
  >
    <Skeleton loading={ isLoading } mb={ 2 }>
      <Text
        fontSize="3xl"
        fontWeight="700"
        color="text"
      >
        { value.toLocaleString() }
      </Text>
    </Skeleton>
    <Skeleton loading={ isLoading }>
      <Text
        fontSize="sm"
        color="text.secondary"
        fontWeight={ 500 }
      >
        { label }
      </Text>
    </Skeleton>
  </Box>
);

const EASStats = ({ stats, isLoading }: Props) => {
  return (
    <Grid
      templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
      gap={ 4 }
      mb={ 6 }
    >
      <StatCard
        label="Total Attestations"
        value={ stats.totalAttestations }
        isLoading={ isLoading }
      />
      <StatCard
        label="Total Schemas"
        value={ stats.totalSchemas }
        isLoading={ isLoading }
      />
      <StatCard
        label="Unique Attestors"
        value={ stats.uniqueAttestors }
        isLoading={ isLoading }
      />
    </Grid>
  );
};

export default React.memo(EASStats);
