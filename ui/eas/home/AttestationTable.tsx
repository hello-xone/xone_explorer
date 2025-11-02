import { Box, HStack } from '@chakra-ui/react';
import React from 'react';

import type { EASItem } from '../types';

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
  isSchemaAttestationList?: boolean;
  isRevokedStatus?: boolean;
}

const AttestationTable = ({ data, isLoading, top, isSchemaAttestationList = false, isRevokedStatus = false }: Props) => {
  return (
    <TableRoot minW="1100px">
      <TableHeaderSticky top={ top }>
        <TableRow>
          <TableColumnHeader w={ isSchemaAttestationList ? '26%' : (isRevokedStatus ? '24%' : '29%') }>UID</TableColumnHeader>
          <TableColumnHeader w={ isRevokedStatus ? '11%' : '8%' }>Schema</TableColumnHeader>
          <TableColumnHeader w="100px">From</TableColumnHeader>
          <TableColumnHeader w="100px">To</TableColumnHeader>
          {
            isRevokedStatus && (
              <TableColumnHeader w="5%">Status</TableColumnHeader>
            )
          }
          <TableColumnHeader w="4%">Age</TableColumnHeader>
        </TableRow>
      </TableHeaderSticky>
      <TableBody>
        { data.map((item, index) => (
          <TableRow key={ item.uid || index }>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading } display="inline-block" maxW="100%">
                <Tooltip content={ item.uid }>
                  <Box pr={ 4 }>
                    <Link
                      href={ `/eas/attestationDetail/${ item.uid }` }
                      fontFamily="mono"
                      fontSize="sm"
                      display="block"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      { item.uid }
                    </Link>
                  </Box>
                </Tooltip>
              </Skeleton>
            </TableCell>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading } display="inline-block">
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
              </Skeleton>
            </TableCell>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading } display="inline-block">
                <AddressEntity
                  address={{ hash: item.from }}
                  truncation="dynamic"
                />
              </Skeleton>
            </TableCell>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading } display="inline-block">
                <AddressEntity
                  address={{ hash: item.to }}
                  truncation="dynamic"
                />
              </Skeleton>
            </TableCell>
            {
              isRevokedStatus && (
                <TableCell verticalAlign="middle">
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
                </TableCell>
              )
            }
            <TableCell verticalAlign="middle">
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

export default AttestationTable;
