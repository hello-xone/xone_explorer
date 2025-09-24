import { HStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';

import type { EpochInfo } from 'types/api/epoch';

import formatDateUTC from 'lib/date/utcTime';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { TableCell, TableRow } from 'toolkit/chakra/table';
import EpochEntity from 'ui/shared/entities/epoch/EpochEntity';
interface Props {
  item: EpochInfo;
  isLoading?: boolean;
};

const EpochsTableItem = ({ item, isLoading }: Props) => {
  const router = useRouter();

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isLoading) return;

    router.push({
      pathname: '/blocks',
      query: {
        page: '1',
        ...item.endBlocknumber ?
          {
            next_page_params: encodeURIComponent(JSON.stringify({
              block_number: item.endBlocknumber + 1,
              end_block: item.startBlocknumber,
            })),
          } :
          {
            next_page_params: encodeURIComponent(JSON.stringify({
              end_block: item.startBlocknumber,
            })),
          },
      },
    }, undefined, { shallow: true });
  }, [ isLoading, item.endBlocknumber, item.startBlocknumber, router ]);

  return (
    <TableRow>
      <TableCell verticalAlign="middle">
        <HStack gap={ 2 }>
          <EpochEntity onClick={ handleLinkClick } href="javascript:void(0)" number={ `#${ item.id }` } noIcon fontWeight={ 700 } isLoading={ isLoading }/>
        </HStack>
      </TableCell>
      <TableCell verticalAlign="middle">
        <Skeleton loading={ isLoading } color="text.secondary" fontWeight={ 500 }><span>{ item.startBlocknumber }</span></Skeleton>
      </TableCell>
      <TableCell verticalAlign="middle">
        <Skeleton loading={ isLoading } color="text.secondary" fontWeight={ 500 }>
          <span>{ item.endBlocknumber === 0 ? '…' : item.endBlocknumber }</span>
        </Skeleton>
      </TableCell>
      <TableCell verticalAlign="middle" isNumeric>
        <Skeleton loading={ isLoading } color="text.secondary" fontWeight={ 500 }><span>{ formatDateUTC(item.epochStart) }</span></Skeleton>
      </TableCell>
      <TableCell verticalAlign="middle" isNumeric>
        <Skeleton loading={ isLoading }>
          <Skeleton loading={ isLoading } color="text.secondary" fontWeight={ 500 }><span>{ formatDateUTC(item.epochEnd) }</span></Skeleton>
        </Skeleton>
      </TableCell>
    </TableRow>
  );
};

export default EpochsTableItem;
