import { Td, Tr, Skeleton } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';

import type { EpochInfo } from 'types/api/epoch';

import formatDateUTC from 'lib/date/utcTime';
import * as EntityBase from 'ui/shared/entities/base/components';

type Props = {
  epoch: EpochInfo;
  isLoading?: boolean;
};

const TokensTableItem = ({ epoch, isLoading }: Props) => {
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
    <Tr role="group">
      <Td>
        <EntityBase.Link href="/blocks" onClick={ handleLinkClick }>
          { /* <IconSvg
            name="checkered_flag"
            boxSize={5}
            p="1px"
            isLoading={isLoading}
            flexShrink={0}
          /> */ }
          <Skeleton
            isLoaded={ !isLoading }
            fontSize="sm"
            lineHeight="24px"
            fontWeight={ 500 }
            display="inline-block"
          >
            #{ id }
          </Skeleton>
        </EntityBase.Link>
      </Td>
      <Td isNumeric>
        <Skeleton
          isLoaded={ !isLoading }
          fontSize="sm"
          lineHeight="24px"
          fontWeight={ 500 }
          display="inline-block"
        >
          { startBlocknumber }
        </Skeleton>
      </Td>
      <Td isNumeric>
        <Skeleton
          isLoaded={ !isLoading }
          fontSize="sm"
          lineHeight="24px"
          fontWeight={ 500 }
          display="inline-block"
        >
          { endBlocknumber === 0 ? '…' : endBlocknumber }
        </Skeleton>
      </Td>
      <Td isNumeric maxWidth="300px" width="300px">
        <Skeleton
          isLoaded={ !isLoading }
          fontSize="sm"
          lineHeight="24px"
          fontWeight={ 500 }
          display="inline-block"
        >
          { formatDateUTC(epochStart) }
        </Skeleton>
      </Td>

      <Td isNumeric maxWidth="300px" width="300px">
        <Skeleton
          isLoaded={ !isLoading }
          fontSize="sm"
          lineHeight="24px"
          fontWeight={ 500 }
          display="inline-block"
        >
          { formatDateUTC(epochEnd) }
        </Skeleton>
      </Td>
    </Tr>
  );
};

export default TokensTableItem;
