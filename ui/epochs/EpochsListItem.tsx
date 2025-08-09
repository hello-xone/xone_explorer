import { HStack, Skeleton } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';

import type { EpochInfo } from 'types/api/epoch';

import formatDateUTC from 'lib/date/utcTime';
import * as EntityBase from 'ui/shared/entities/base/components';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';

type Props = {
  epoch: EpochInfo;
  isLoading?: boolean;
};

const EpochsListItem = ({ epoch, isLoading }: Props) => {
  const { id, startBlocknumber, endBlocknumber, epochStart, epochEnd } = epoch;

  const router = useRouter();

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isLoading) return;
    router.push({
      pathname: '/blocks',
      query: {
        page: '1',
        ...epoch.endBlocknumber ?
          {
            next_page_params: encodeURIComponent(JSON.stringify({
              block_number: epoch.endBlocknumber + 1,
              end_block: epoch.startBlocknumber,
            })),
          } :
          {
            next_page_params: encodeURIComponent(JSON.stringify({
              end_block: epoch.startBlocknumber,
            })),
          },
      },
    }, undefined, { shallow: true });
  }, [ epoch.endBlocknumber, epoch.startBlocknumber, isLoading, router ]);

  return (
    <ListItemMobile rowGap={ 3 }>
      <HStack spacing={ 3 }>
        <EntityBase.Link href="/blocks" onClick={ handleLinkClick }>
          { /* <IconSvg
            name="checkered_flag"
            boxSize={5}
            p="1px"
            isLoading={isLoading}
            flexShrink={0}
          /> */ }
          <Skeleton isLoaded={ !isLoading } fontSize="sm">
            <span>#{ id }</span>
          </Skeleton>
        </EntityBase.Link>
      </HStack>

      <HStack spacing={ 3 }>
        <Skeleton isLoaded={ !isLoading } fontSize="sm" fontWeight={ 500 }>
          Start Block Number
        </Skeleton>
        <Skeleton isLoaded={ !isLoading } fontSize="sm" color="text_secondary">
          <span>{ startBlocknumber }</span>
        </Skeleton>
      </HStack>

      <HStack spacing={ 3 }>
        <Skeleton isLoaded={ !isLoading } fontSize="sm" fontWeight={ 500 }>
          End Block Number
        </Skeleton>
        <Skeleton isLoaded={ !isLoading } fontSize="sm" color="text_secondary">
          <span>{ endBlocknumber === 0 ? '…' : endBlocknumber }</span>
        </Skeleton>
      </HStack>

      <HStack spacing={ 3 }>
        <Skeleton isLoaded={ !isLoading } fontSize="sm" fontWeight={ 500 }>
          Start Time (UTC+0)
        </Skeleton>
        <Skeleton isLoaded={ !isLoading } fontSize="sm" color="text_secondary">
          <span>{ formatDateUTC(epochStart) }</span>
        </Skeleton>
      </HStack>

      <HStack spacing={ 3 }>
        <Skeleton isLoaded={ !isLoading } fontSize="sm" fontWeight={ 500 }>
          End Time (UTC+0)
        </Skeleton>
        <Skeleton isLoaded={ !isLoading } fontSize="sm" color="text_secondary">
          <span>{ formatDateUTC(epochEnd) }</span>
        </Skeleton>
      </HStack>
    </ListItemMobile>
  );
};

export default EpochsListItem;
