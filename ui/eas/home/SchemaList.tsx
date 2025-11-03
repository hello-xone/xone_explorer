import { Box, Flex, HStack } from '@chakra-ui/react';
import React from 'react';

import type { SchemaItem } from '../types';

import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import SchemaFieldBadges from 'ui/eas/SchemaFieldBadges';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';

interface Props {
  data: Array<SchemaItem>;
  isLoading?: boolean;
}

const SchemaList = ({ data, isLoading }: Props) => {
  return (
    <Box>
      { data.map((item, index) => (
        <ListItemMobile key={ item.uid || index } rowGap={ 3 }>
          <Flex justifyContent="space-between" alignItems="flex-start">
            <Skeleton loading={ isLoading } fontWeight={ 700 }>
              <Link
                href={ `/eas/schemaDetail/${ item.number }` }
                fontSize="lg"
                fontWeight={ 700 }
                color="link"
              >
                #{ item.number }
              </Link>
            </Skeleton>
          </Flex>

          <Box>
            <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 } mb={ 1 }>
              UID:
            </Skeleton>
            <Skeleton loading={ isLoading } fontSize="sm">
              <Link
                href={ `/eas/schemaDetail/${ item.number }` }
                fontFamily="mono"
                fontSize="sm"
              >
                { item.uid?.slice(0, 10) }...{ item.uid?.slice(-8) }
              </Link>
            </Skeleton>
          </Box>

          <Box>
            <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 } mb={ 1 }>
              Schema:
            </Skeleton>
            <SchemaFieldBadges
              schema={ item.schema }
              isLoading={ isLoading }
            />
          </Box>

          <Box>
            <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 } mb={ 1 }>
              Resolver:
            </Skeleton>
            <Skeleton loading={ isLoading } fontSize="sm">
              { item.resolver }
            </Skeleton>
          </Box>

          <HStack gap={ 2 }>
            <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 }>
              Attestations:
            </Skeleton>
            <Skeleton loading={ isLoading } fontSize="sm">
              <Link
                href={ `/eas/schemAttestationList/${ item?.uid }` }
                fontWeight={ 600 }
                color="link"
              >
                { item.attestations }
              </Link>
            </Skeleton>
          </HStack>
        </ListItemMobile>
      )) }
    </Box>
  );
};

export default SchemaList;
