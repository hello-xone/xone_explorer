import { Box } from '@chakra-ui/react';
import React, { useEffect, useMemo } from 'react';
import { animateScroll } from 'react-scroll';

import type { EpochInfo } from 'types/api/epoch';

import useQueryEpochs from 'lib/api/useQueryEpochs';
import EpochsActionBar from 'ui/epochs/EpochsActionBar';
import EpochsListItem from 'ui/epochs/EpochsListItem';
import EpochsTable from 'ui/epochs/EpochsTable';
import { ACTION_BAR_HEIGHT_DESKTOP } from 'ui/shared/ActionBar';
import DataFetchAlert from 'ui/shared/DataFetchAlert';
import DataListDisplay from 'ui/shared/DataListDisplay';
import PageTitle from 'ui/shared/Page/PageTitle';

const PAGE_LIMIT = 50;

interface EpochListResponse {
  code: number;
  data: {
    epochInfoss: Array<EpochInfo>;
    total: number;
  };
  msg: string;
}

type PaginationState = {
  page: number;
  hasPages: boolean;
  hasNextPage: boolean;
  canGoBackwards: boolean;
  isLoading: boolean;
  isVisible: boolean;
};

type PaginationUpdate = Partial<PaginationState>;

const EpochsPageContent = () => {
  const { fetchEpochs } = useQueryEpochs();

  const [ epochData, setEpochData ] = React.useState<
    EpochListResponse['data'] | null
  >(null);
  const [ pagination, setPagination ] = React.useState<PaginationState>({
    page: 1,
    hasPages: false,
    hasNextPage: false,
    canGoBackwards: false,
    isLoading: true,
    isVisible: true,
  });

  const onNextPageClick = () => {
    if (!pagination.hasNextPage) return;

    updatePagination({
      page: pagination.page + 1,
    });
  };
  const onPrevPageClick = () => {
    if (!pagination.canGoBackwards) return;

    updatePagination({
      page: pagination.page - 1,
    });
  };

  const resetPage = () => {
    updatePagination({
      page: 1,
    });
  };

  const updatePagination = (newData: PaginationUpdate) => {
    setPagination({
      ...pagination,
      ...newData,
    });
  };
  useEffect(() => {
    setEpochData(null);
    const fetchData = async() => {
      updatePagination({
        isLoading: true,
      });
      const res = await fetchEpochs({
        limit: PAGE_LIMIT,
        page: pagination.page - 1, // Adjust for 0-based index
      });
      animateScroll.scrollToTop({ duration: 0 }); // Scroll to top after fetching new data
      setEpochData(res);
      const epochLength = res.epochInfoss.length;
      if (epochLength > 0) {
        updatePagination({
          hasPages: false,
          hasNextPage: epochLength === PAGE_LIMIT,
          canGoBackwards: pagination.page - 1 > 0,
          isLoading: false,
        });
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ pagination.page ]);

  const epochQuery = useMemo(() => {
    return {
      isError: false,
      isPlaceholderData: pagination.isLoading,
      data: epochData || {
        epochInfoss: Array(PAGE_LIMIT).fill({
          id: 1,
          epochStart: 1672531200,
          epochEnd: 1672617600,
          startBlocknumber: 123456,
          endBlocknumber: 123457,
        } as EpochInfo),
        total: 0,
      },
      pagination,
    };
  }, [ epochData, pagination ]);

  const actionBar = (
    <EpochsActionBar
      pagination={{
        ...pagination,
        onNextPageClick,
        onPrevPageClick,
        resetPage,
      }}
    />
  );

  const content = (() => {
    if (epochQuery.isError) {
      return <DataFetchAlert/>;
    }

    return epochData?.epochInfoss ? (
      <>
        <Box hideBelow="lg">
          <EpochsTable
            items={ epochData?.epochInfoss }
            top={ pagination.isVisible ? ACTION_BAR_HEIGHT_DESKTOP : 0 }
            isLoading={ epochQuery.isPlaceholderData }
          />
        </Box>
        <Box hideFrom="lg">
          { epochData.epochInfoss.map((item, index) => (
            <EpochsListItem
              key={ item.id + (epochQuery.isPlaceholderData ? String(index) : '') }
              epoch={ item }
              isLoading={ epochQuery.isPlaceholderData }
            />
          )) }
        </Box>
      </>
    ) : null;
  })();

  return (
    <>
      <PageTitle title="Epochs" withTextAd/>
      <DataListDisplay
        isError={ epochQuery.isError }
        itemsNum={ epochQuery.data.epochInfoss.length }
        emptyText="There are no epochs."
        actionBar={ pagination.isVisible ? actionBar : null }
      >
        { content }
      </DataListDisplay>
    </>
  );
};

export default EpochsPageContent;
