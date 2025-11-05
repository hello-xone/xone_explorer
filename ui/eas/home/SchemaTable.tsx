import { HStack } from '@chakra-ui/react';
import React from 'react';

import type { SchemaItem } from '../types';

import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { TableRoot, TableHeaderSticky, TableBody, TableRow, TableCell, TableColumnHeader, TableColumnHeaderSortable } from 'toolkit/chakra/table';
import { Tooltip } from 'toolkit/chakra/tooltip';
import SchemaFieldBadges from 'ui/eas/SchemaFieldBadges';

type SortValue = 'attestations-asc' | 'attestations-desc';

interface Props {
  data: Array<SchemaItem>;
  isLoading?: boolean;
  top?: number;
  sort?: SortValue;
  onSortChange?: (sort: SortValue) => void;
}

const SchemaTable = ({ data, isLoading, top = 0, sort = 'attestations-desc', onSortChange }: Props) => {
  // 排序处理函数 - 只在降序和升序之间切换
  const handleSortToggle = React.useCallback((field: string) => {
    // field 参数用于满足 TableColumnHeaderSortable 的接口要求
    if (field === 'attestations' && onSortChange) {
      // 在降序和升序之间切换
      const newSort: SortValue = sort === 'attestations-desc' ? 'attestations-asc' : 'attestations-desc';
      onSortChange(newSort);
    }
  }, [ sort, onSortChange ]);

  return (
    <TableRoot minW="1100px">
      <TableHeaderSticky top={ top }>
        <TableRow>
          <TableColumnHeader w="3%">#</TableColumnHeader>
          <TableColumnHeader w="20%">UID</TableColumnHeader>
          <TableColumnHeader w="30%">Schema</TableColumnHeader>
          <TableColumnHeader w="25%">Resolver</TableColumnHeader>
          <TableColumnHeaderSortable
            w="6%"
            isNumeric
            sortField="attestations"
            sortValue={ sort }
            onSortToggle={ handleSortToggle }
            indicatorPosition="left"
            style={{ paddingRight: '25px' }}
          >
            Attestations
          </TableColumnHeaderSortable>
        </TableRow>
      </TableHeaderSticky>
      <TableBody>
        { data.map((item, index) => (
          <TableRow key={ item.uid || index }>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading }>
                <Link
                  href={ `/eas/schemaDetail/${ item.number }` }
                  fontWeight={ 600 }
                  color="link"
                  mb="7px"
                >
                  #{ item.number }
                </Link>
              </Skeleton>
            </TableCell>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading } display="inline-block" maxW="100%">
                <Tooltip content={ item.uid }>
                  <Link
                    href={ `/eas/schemaDetail/${ item.number }` }
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
            <TableCell verticalAlign="middle">
              <SchemaFieldBadges
                schema={ item.schema }
                isLoading={ isLoading }
              />
            </TableCell>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading } display="inline-block">
                { item.resolver }
              </Skeleton>
            </TableCell>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading }>
                <HStack gap={ 1 }>
                  <Link
                    href={ `/eas/schemAttestationList/${ item?.uid }` }
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
