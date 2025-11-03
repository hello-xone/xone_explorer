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
}

const SchemaTable = ({ data, isLoading, top = 0 }: Props) => {
  // 默认按 attestations 降序排序
  const [ sort, setSort ] = React.useState<SortValue>('attestations-desc');

  // 排序处理函数 - 只在降序和升序之间切换
  const handleSortToggle = React.useCallback((field: string) => {
    // field 参数用于满足 TableColumnHeaderSortable 的接口要求
    if (field === 'attestations') {
      setSort((currentSort) => {
        // 在降序和升序之间切换
        return currentSort === 'attestations-desc' ? 'attestations-asc' : 'attestations-desc';
      });
    }
  }, []);

  // 排序后的数据
  const sortedData = React.useMemo(() => {
    const dataCopy = [ ...data ];

    if (sort === 'attestations-desc') {
      return dataCopy.sort((a, b) => a.attestations - b.attestations);
    } else {
      return dataCopy.sort((a, b) => b.attestations - a.attestations);
    }
  }, [ data, sort ]);

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
          >
            Attestations
          </TableColumnHeaderSortable>
        </TableRow>
      </TableHeaderSticky>
      <TableBody>
        { sortedData.map((item, index) => (
          <TableRow key={ item.uid || index }>
            <TableCell verticalAlign="middle">
              <Skeleton loading={ isLoading }>
                <Link
                  href={ `/eas/schemaDetail/${ item.number }` }
                  fontWeight={ 600 }
                  color="link"
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
