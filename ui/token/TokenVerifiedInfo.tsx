import type { UseQueryResult } from '@tanstack/react-query';
import React from 'react';

import type { TokenVerifiedInfo as V2TokenVerifiedInfo } from 'types/api/token';

import type { ResourceError } from 'lib/api/resources';
import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';

import TokenProjectInfo from './TokenProjectInfo';

interface Props {
  verifiedInfoQuery: UseQueryResult<V2TokenVerifiedInfo, ResourceError<unknown>>;
}

const TokenVerifiedInfo = ({ verifiedInfoQuery }: Props) => {

  const { data, isPending, isError } = verifiedInfoQuery;

  const content = (() => {

    if (isPending) {
      return (
        <>
          <Skeleton loading w="100px" h="30px" borderRadius="base"/>
          <Skeleton loading w="100px" h="30px" borderRadius="base"/>
          <Skeleton loading w="70px" h="30px" borderRadius="base"/>
        </>
      );
    }

    if (isError) {
      return null;
    }

    const websiteLink = (() => {
      try {
        const url = new URL(data.website);
        return (
          <Link external href={ data.website } variant="underlaid" flexShrink={ 0 } textStyle="sm">
            { url.host }
          </Link>
        );
      } catch (error) {
        return null;
      }
    })();

    return (
      <>
        { websiteLink }
        <TokenProjectInfo data={ data }/>
      </>
    );
  })();

  return content;
};

export default React.memo(TokenVerifiedInfo);
