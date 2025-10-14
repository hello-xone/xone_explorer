import { HStack, Text } from '@chakra-ui/react';
import React from 'react';

import type { SchemaItem } from './types';

import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { TableRoot, TableHeaderSticky, TableBody, TableRow, TableCell, TableColumnHeader } from 'toolkit/chakra/table';
import { Tooltip } from 'toolkit/chakra/tooltip';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';

interface Props {
  data: Array<SchemaItem>;
  isLoading?: boolean;
  top?: number;
}

const SchemaTable = ({ data, isLoading, top = 0 }: Props) => {
  return (
    <TableRoot minW="1100px">
      <TableHeaderSticky top={ top }>
        <TableRow>
          <TableColumnHeader w="5%">#</TableColumnHeader>
          <TableColumnHeader w="17%">UID</TableColumnHeader>
          <TableColumnHeader w="45%">Schema</TableColumnHeader>
          <TableColumnHeader w="18%">Resolver</TableColumnHeader>
          <TableColumnHeader w="8%">Attestations</TableColumnHeader>
        </TableRow>
      </TableHeaderSticky>
      <TableBody>
        { data.map((item, index) => (
          <TableRow key={ item.uid || index }>
            <TableCell>
              <Skeleton loading={ isLoading }>
                <Link
                  href={ `https://easscan.org/schema/view/${ item.uid }` }
                  target="_blank"
                  fontWeight={ 600 }
                  color="link"
                >
                  #{ item.number }
                </Link>
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton loading={ isLoading } display="inline-block" maxW="100%">
                <Tooltip content={ item.uid }>
                  <Link
                    href={ `https://easscan.org/schema/view/${ item.uid }` }
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
              <Skeleton loading={ isLoading }>
                <Tooltip content={ item.schema }>
                  <Text
                    fontSize="sm"
                    fontFamily="mono"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    { item.schema }
                  </Text>
                </Tooltip>
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton loading={ isLoading } display="inline-block">
                <AddressEntity
                  address={{ hash: item.resolver }}
                  truncation="constant"
                />
              </Skeleton>
            </TableCell>
            <TableCell>
              <Skeleton loading={ isLoading }>
                <HStack gap={ 1 }>
                  <Link
                    href={ `https://easscan.org/attestations/forSchema/${ item.uid }` }
                    target="_blank"
                    fontSize="sm"
                    fontWeight={ 600 }
                    color="link"
                  >
                    { item.attestations }
                  </Link>
                </HStack>
              </Skeleton>
            </TableCell>
          </TableRow>
        )) }
      </TableBody>
    </TableRoot>
  );
};

export default SchemaTable;
