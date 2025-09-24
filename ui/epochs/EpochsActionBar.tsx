import React from 'react';

import type { PaginationParams } from 'ui/shared/pagination/types';

import ActionBar from 'ui/shared/ActionBar';
import Pagination from 'ui/shared/pagination/Pagination';

interface Props {
  pagination: PaginationParams;
  inTabsSlot?: boolean;
}

const TokensActionBar = ({ pagination, inTabsSlot }: Props) => {
  return (
    <ActionBar
      mt={ inTabsSlot ? 0 : -6 }
      py={{ lg: inTabsSlot ? 0 : undefined }}
      justifyContent={ inTabsSlot ? 'space-between' : undefined }
      display={{ base: pagination.isVisible ? 'flex' : 'none', lg: 'flex' }}
    >
      <Pagination { ...pagination } ml={ inTabsSlot ? 8 : 'auto' }/>
    </ActionBar>
  );
};

export default React.memo(TokensActionBar);
