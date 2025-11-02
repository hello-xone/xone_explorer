import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

interface StatItem {
  label: string;
  value: number;
}

interface Props {
  data: Array<StatItem>;
  loading?: boolean;
}

const StatsCard = ({ data, loading = false }: Props) => {
  return (
    <Flex
      alignItems="center"
    >
      { data.map((item, index) => (
        <Box
          key={ index }
          textAlign="start"
          py={ 2 }
          mr={ 10 }
        >
          <Text
            fontSize="34px"
            fontWeight="bold"
            color="text.primary"
            lineHeight="1.2"
          >
            { loading ? '...' : item.value.toLocaleString() }
          </Text>
          <Text
            fontSize="14px"
            color="text.secondary"
            fontWeight="400"
          >
            { item.label }
          </Text>
        </Box>
      )) }
    </Flex>
  );
};

export default StatsCard;
