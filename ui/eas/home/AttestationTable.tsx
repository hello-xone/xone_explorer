import { Box, HStack } from '@chakra-ui/react';
import React from 'react';

import type { EASItem } from '../types';

import { Badge } from 'toolkit/chakra/badge';
import { Button } from 'toolkit/chakra/button';
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
  const [ expandedRows, setExpandedRows ] = React.useState<Record<number, boolean>>({});
  const defaultShowCount = 4; // 默认显示 4 个 badges

  const toggleRow = React.useCallback((index: number) => {
    return () => {
      setExpandedRows(prev => ({
        ...prev,
        [index]: !prev[index],
      }));
    };
  }, []);

  // 计算 UID 列宽度
  const getUidColumnWidth = () => {
    if (isSchemaAttestationList) return '26%';
    if (isRevokedStatus) return '24%';
    return '29%';
  };

  return (
    <TableRoot minW="1100px">
      <TableHeaderSticky top={ top }>
        <TableRow>
          <TableColumnHeader w={ getUidColumnWidth() }>UID</TableColumnHeader>
          <TableColumnHeader w={ isRevokedStatus ? '36%' : '8%' }>Schema</TableColumnHeader>
          <TableColumnHeader w={ isRevokedStatus ? 'auto' : '100px' }>From</TableColumnHeader>
          <TableColumnHeader w={ isRevokedStatus ? 'auto' : '100px' }>To</TableColumnHeader>
          {
            isRevokedStatus && (
              <TableColumnHeader w="6%">Status</TableColumnHeader>
            )
          }
          <TableColumnHeader w="7%">Age</TableColumnHeader>
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
                          colorPalette="red"
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
            </TableCell>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading } display="inline-block">
                {
                  isRevokedStatus ? (
                    <AddressEntity
                      address={{ hash: item.from }}
                      truncation="constant"
                    />
                  ) : (
                    <>
                      <AddressEntity
                        address={{ hash: item.from }}
                        hideBelow="2xl"
                        truncation="dynamic"
                      />
                      <AddressEntity
                        address={{ hash: item.from }}
                        hideFrom="2xl"
                        truncation="constant"
                      />
                    </>
                  )
                }
              </Skeleton>
            </TableCell>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading } display="inline-block">
                {
                  isRevokedStatus ? (
                    <AddressEntity
                      address={{ hash: item.to }}
                      truncation="constant"
                    />
                  ) : (
                    <>
                      <AddressEntity
                        address={{ hash: item.to }}
                        hideBelow="2xl"
                        truncation="dynamic"
                      />
                      <AddressEntity
                        address={{ hash: item.to }}
                        hideFrom="2xl"
                        truncation="constant"
                      />
                    </>
                  )
                }
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
