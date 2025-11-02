import { Box, Flex, HStack } from '@chakra-ui/react';
import React from 'react';

import type { EASItem } from '../types';

import { Badge } from 'toolkit/chakra/badge';
import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';
import TimeWithTooltip from 'ui/shared/time/TimeWithTooltip';

interface Props {
  data: Array<EASItem>;
  isLoading?: boolean;
}

const AttestationList = ({ data, isLoading }: Props) => {
  return (
    <Box>
      { data.map((item, index) => (
        <ListItemMobile key={ item.uid || index } rowGap={ 3 }>
          <Flex justifyContent="space-between" alignItems="flex-start">
            <Skeleton loading={ isLoading } fontWeight={ 700 }>
              <Link
                href={ `https://easscan.org/attestation/view/${ item.uid }` }
                target="_blank"
                fontFamily="mono"
                fontSize="sm"
              >
                { item.uid?.slice(0, 10) }...{ item.uid?.slice(-8) }
              </Link>
            </Skeleton>
          </Flex>

          <HStack gap={ 2 } alignItems="center">
            <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 }>
              Schema:
            </Skeleton>
            <Skeleton loading={ isLoading }>
              <Link
                href={ `/eas/schemaDetail/${ item.schemaId.replace('#', '') }` }
                _hover={{ textDecoration: 'none' }}
              >
                <HStack gap={ 2 } flexWrap="wrap">
                  <Badge
                    colorPalette="purple"
                    variant="solid"
                    fontSize="xs"
                    px={ 2 }
                    py={ 1 }
                  >
                    { item.schemaId }
                  </Badge>
                  { item.schemaName && item.schemaName.split(', ').map((word, idx) => (
                    <Badge
                      key={ idx }
                      colorPalette="yellow"
                      variant="solid"
                      fontSize="xs"
                      px={ 2 }
                      py={ 1 }
                    >
                      { word }
                    </Badge>
                  )) }
                </HStack>
              </Link>
            </Skeleton>
          </HStack>

          <Box>
            <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 } mb={ 1 }>
              From:
            </Skeleton>
            <Skeleton loading={ isLoading } fontSize="sm">
              <AddressEntity
                address={{ hash: item.from }}
                truncation="constant"
              />
            </Skeleton>
          </Box>

          <Box>
            <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 } mb={ 1 }>
              To:
            </Skeleton>
            <Skeleton loading={ isLoading } fontSize="sm">
              <AddressEntity
                address={{ hash: item.to }}
                truncation="constant"
              />
            </Skeleton>
          </Box>

          <Box>
            <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 } mb={ 1 }>
              Status:
            </Skeleton>
            <Skeleton loading={ isLoading } fontSize="sm">
              { item.revoked && (
                <Badge colorPalette="red" variant="solid" fontSize="xs" px={ 2 } py={ 1 }>
                  Revoked
                </Badge>
              ) }
              { !item.revoked && (
                <Badge colorPalette="green" variant="solid" fontSize="xs" px={ 2 } py={ 1 }>
                  Active
                </Badge>
              ) }
            </Skeleton>
          </Box>

          { item.time && (
            <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary">
              <TimeWithTooltip
                timestamp={ new Date(item.time * 1000).toISOString() }
                enableIncrement
                isLoading={ isLoading }
              />
            </Skeleton>
          ) }
        </ListItemMobile>
      )) }
    </Box>
  );
};

export default AttestationList;
