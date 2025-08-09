import React, { useEffect, useMemo } from 'react';
import { animateScroll } from 'react-scroll';

import type { EpochInfo } from 'types/api/epoch';
import type { RoutedTab } from 'ui/shared/Tabs/types';

import useQueryEpochs from 'lib/api/useQueryEpochs';
import useIsMobile from 'lib/hooks/useIsMobile';
import EpochsList from 'ui/epochs/Epochs';
import EpochsActionBar from 'ui/epochs/EpochsActionBar';
import PageTitle from 'ui/shared/Page/PageTitle';
import RoutedTabs from 'ui/shared/Tabs/RoutedTabs';

const TAB_LIST_PROPS = {
  marginBottom: 0,
  pt: 6,
  pb: 6,
  marginTop: -5,
  alignItems: 'center',
};

const TABS_RIGHT_SLOT_PROPS = {
  ml: 8,
  flexGrow: 1,
};

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

const Epochs = () => {
  const isMobile = useIsMobile();
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

  const tabs: Array<RoutedTab> = [
    {
      id: 'all',
      title: 'All',
      component: (
        <EpochsList
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          query={ epochQuery as any }
          actionBar={ isMobile ? actionBar : null }
        />
      ),
    },
  ].filter(Boolean);

  return (
    <>
      <PageTitle title="Epochs" withTextAd/>
      { !isMobile && actionBar }
      <RoutedTabs
        tabs={ tabs }
        tabListProps={ isMobile ? undefined : TAB_LIST_PROPS }
        rightSlotProps={ !isMobile ? TABS_RIGHT_SLOT_PROPS : undefined }
        stickyEnabled={ !isMobile }
      />
    </>
  );
};

export default Epochs;
