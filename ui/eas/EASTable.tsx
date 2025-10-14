import { HStack } from '@chakra-ui/react';
import React from 'react';

import type { EASItem } from './types';

import { Badge } from 'toolkit/chakra/badge';
import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { TableRoot, TableHeaderSticky, TableBody, TableRow, TableCell, TableColumnHeader } from 'toolkit/chakra/table';
import { Tooltip } from 'toolkit/chakra/tooltip';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import TimeWithTooltip from 'ui/shared/time/TimeWithTooltip';

interface Props {
  data: Array<EASItem>;
  isLoading?: boolean;
  top: number;
}

const EASTable = ({ data, isLoading, top }: Props) => {
  return (
    <TableRoot minW="1100px">
      <TableHeaderSticky top={ top }>
        <TableRow>
          <TableColumnHeader w="15%">UID</TableColumnHeader>
          <TableColumnHeader w="20%">Schema</TableColumnHeader>
          <TableColumnHeader w="15%">From</TableColumnHeader>
          <TableColumnHeader w="15%">To</TableColumnHeader>
          <TableColumnHeader w="12%">Type</TableColumnHeader>
          <TableColumnHeader w="6%">Age</TableColumnHeader>
        </TableRow>
      </TableHeaderSticky>
      <TableBody>
        { data.map((item, index) => (
          <TableRow key={ item.uid || index }>
            <TableCell>
              <Skeleton loading={ isLoading } display="inline-block" maxW="100%">
                <Tooltip content={ item.uid }>
                  <Link
                    href={ `https://easscan.org/attestation/view/${ item.uid }` }
                    target="_blank"
                    fontFamily="mono"
                    fontSize="sm"
                    display="block"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    { item.uid }
                  </Link>
                </Tooltip>
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton loading={ isLoading } display="inline-block">
                <HStack gap={ 2 } flexWrap="wrap">
                  <Link
                    href={ `https://easscan.org/schema/view/${ item.schema }` }
                    target="_blank"
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
                  { item.schemaName && item.schemaName.split(' ').map((word, idx) => (
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
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton loading={ isLoading } display="inline-block">
                <AddressEntity
                  address={{ hash: item.from }}
                  truncation="constant"
                />
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton loading={ isLoading } display="inline-block">
                <AddressEntity
                  address={{ hash: item.to }}
                  truncation="constant"
                />
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton loading={ isLoading } display="inline-block">
                <Badge
                  colorPalette={ item.type === 'ONCHAIN' ? 'blue' : 'purple' }
                  variant="subtle"
                  fontSize="xs"
                >
                  { item.type }
                </Badge>
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton loading={ isLoading } fontSize="sm">
                { item.time ? (
                  <TimeWithTooltip
                    timestamp={ new Date(item.time * 1000).toISOString() }
                    enableIncrement
                    isLoading={ isLoading }
                  />
                ) : '-' }
              </Skeleton>
            </TableCell>
          </TableRow>
        )) }
      </TableBody>
    </TableRoot>
  );
};

export default EASTable;
