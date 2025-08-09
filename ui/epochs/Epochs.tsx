import { Hide, Show } from '@chakra-ui/react';
import React from 'react';

import DataFetchAlert from 'ui/shared/DataFetchAlert';
import DataListDisplay from 'ui/shared/DataListDisplay';
import type { QueryWithPagesResult } from 'ui/shared/pagination/useQueryWithPages';

import EpochsListItem from './EpochsListItem';
import EpochsTable from './EpochsTable';

interface Props {
  query: QueryWithPagesResult<'epochs'>;
  actionBar?: React.ReactNode;
  description?: React.ReactNode;
  tableTop?: number;
}

const Epochs = ({ query, actionBar, description, tableTop }: Props) => {

  const { isError, isPlaceholderData, data, pagination } = query;

  if (isError) {
    return <DataFetchAlert/>;
  }

  const content = data?.epochInfoss ? (
    <>
      <Show below="lg" ssr={ false }>
        { description }
        { data.epochInfoss.map((epoch, index) => (
          <EpochsListItem
            key={ String(epoch.id) + (isPlaceholderData ? index : '') }
            epoch={ epoch }
            isLoading={ isPlaceholderData }
          />
        )) }
      </Show>
      <Hide below="lg" ssr={ false }>
        { description }
        <EpochsTable
          items={ data.epochInfoss }
          isLoading={ isPlaceholderData }
          top={ tableTop }
        />
      </Hide>
    </>
  ) : null;

  return (
    <DataListDisplay
      isError={ isError }
      items={ data?.epochInfoss }
      emptyText="There are no epochs."
      content={ content }
      actionBar={ pagination.isVisible ? actionBar : null }
    />
  );
};

export default Epochs;
