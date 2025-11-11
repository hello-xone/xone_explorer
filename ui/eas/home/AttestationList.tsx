import { Box, Flex, HStack } from '@chakra-ui/react';
import React from 'react';

import type { EASItem } from '../types';

import { Badge } from 'toolkit/chakra/badge';
import { Button } from 'toolkit/chakra/button';
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
  const [ expandedRows, setExpandedRows ] = React.useState<Record<number, boolean>>({});
  const defaultShowCount = 2; // 默认显示 2 个 badges

  const toggleRow = React.useCallback((index: number) => {
    return () => {
      setExpandedRows(prev => ({
        ...prev,
        [index]: !prev[index],
      }));
    };
  }, []);
  return (
    <Box>
      { data.map((item, index) => (
        <ListItemMobile key={ item.uid || index } rowGap={ 3 }>
          <Flex justifyContent="space-between" alignItems="flex-start">
            <Skeleton loading={ isLoading } fontWeight={ 700 }>
              <Link
                href={ `/eas/attestationDetail/${ item.uid }` }
                target="_blank"
                fontFamily="mono"
                fontSize="sm"
              >
                { item.uid?.slice(0, 10) }...{ item.uid?.slice(-8) }
              </Link>
            </Skeleton>
          </Flex>

          <Box>
            <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 } mb={ 1 }>
              Schema:
            </Skeleton>
            <Skeleton loading={ isLoading }>
              { (() => {
                const isExpanded = expandedRows[index];
                const schemaFields = item.schemaName ? item.schemaName.split(', ') : [];
                const hasMoreFields = schemaFields.length > defaultShowCount;
                const displayFields = isExpanded || !hasMoreFields ? schemaFields : schemaFields.slice(0, defaultShowCount);
                const remainingCount = schemaFields.length - defaultShowCount;

                return (
                  <HStack gap={ 2 } flexWrap="wrap">
                    <Link
                      href={ `/eas/schemaDetail/${ item.schemaId.replace('#', '') }` }
                      _hover={{ textDecoration: 'none' }}
                    >
                      <Badge
                        colorPalette="purple"
                        variant="solid"
                        fontSize="xs"
                        px={ 2 }
                        py={ 1 }
                      >
                        { item.schemaId }
                      </Badge>
                    </Link>
                    { displayFields.map((word, idx) => (
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
                    { hasMoreFields && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={ toggleRow(index) }
                        minW={{ base: '70px', md: '80px' }}
                        h="26px"
                        px={ 2 }
                        fontSize="10px"
                        fontWeight={ 600 }
                        lineHeight="1.2"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="border"
                        bg="bg.subtle"
                        color="fg"
                        transition="all 0.15s"
                        _hover={{
                          borderColor: 'border.emphasized',
                          bg: 'bg.muted',
                        }}
                      >
                        { isExpanded ? 'Less ↑' : `+${ remainingCount } More` }
                      </Button>
                    ) }
                  </HStack>
                );
              })() }
            </Skeleton>
          </Box>

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
