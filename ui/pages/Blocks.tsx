/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import React from 'react';
import { animateScroll } from 'react-scroll';

import type { Block } from 'types/api/block';
import type { RoutedTab } from 'ui/shared/Tabs/types';

import useIsMobile from 'lib/hooks/useIsMobile';
import getQueryParamString from 'lib/router/getQueryParamString';
import { BLOCK } from 'stubs/block';
import { generateListStub } from 'stubs/utils';
import BlocksContent from 'ui/blocks/BlocksContent';
import BlocksTabSlot from 'ui/blocks/BlocksTabSlot';
import PageTitle from 'ui/shared/Page/PageTitle';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import type { QueryWithPagesResult } from 'ui/shared/pagination/useQueryWithPages';
import RoutedTabs from 'ui/shared/Tabs/RoutedTabs';

const TAB_LIST_PROPS = {
  marginBottom: 0,
  pt: 6,
  pb: 6,
  marginTop: -5,
};

type NextPageParams = Record<string, unknown>;

function getPaginationParamsFromQuery(queryString: string | Array<string> | undefined) {
  if (queryString) {
    try {
      return JSON.parse(decodeURIComponent(getQueryParamString(queryString))) as NextPageParams;
    } catch (error) {}
  }

  return {};
}

const BlocksPageContent = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const tab = getQueryParamString(router.query.tab);

  const blocksQuery = useQueryWithPages({
    resourceName: 'blocks',
    filters: { type: 'block' },
    options: {
      enabled: tab === 'blocks' || !tab,
      placeholderData: generateListStub<'blocks'>(BLOCK, 50, { next_page_params: {
        block_number: 8988686,
        items_count: 50,
      } }),
    },
  });
  const reorgsQuery = useQueryWithPages({
    resourceName: 'blocks',
    filters: { type: 'reorg' },
    options: {
      enabled: tab === 'reorgs',
      placeholderData: generateListStub<'blocks'>(BLOCK, 50, { next_page_params: {
        block_number: 8988686,
        items_count: 50,
      } }),
    },
  });
  const unclesQuery = useQueryWithPages({
    resourceName: 'blocks',
    filters: { type: 'uncle' },
    options: {
      enabled: tab === 'uncles',
      placeholderData: generateListStub<'blocks'>(BLOCK, 50, { next_page_params: {
        block_number: 8988686,
        items_count: 50,
      } }),
    },
  });

  const handlePageClick = (query: QueryWithPagesResult<'blocks'>, page: number) => {
    if (query.pagination.isLoading) {
      return;
    }
    const currentPage = query.pagination.page;

    const pageParams = getPaginationParamsFromQuery(router.query.next_page_params);
    const pageQuery = {
      ...router.query,
      page: String(page),
      next_page_params: encodeURIComponent(JSON.stringify({
        end_block: pageParams.end_block,
        block_number: pageParams.block_number as number + (currentPage - page) * 50,
        ...(page === 1 ? {} : { items_count: (page - 1) * 50 }),
      })),
    };

    animateScroll.scrollToTop({ duration: 0 });
    router.push({ pathname: router.pathname, query: pageQuery }, undefined, { shallow: true }).then(() => {
      query.setPage?.(page);
    });
  };

  function filterQueryByEndBlock(query: QueryWithPagesResult<'blocks'>, endBlock: string | Array<string> | undefined): QueryWithPagesResult<'blocks'> {
    if (!endBlock || !query.data || query.data.next_page_params?.block_number === 8988686) {
      return query;
    }
    let hasNextPage = query.pagination.hasNextPage;
    const filteredItems = [] as Array<Block>;
    for (const item of query.data.items) {
      if (item.height > Number(endBlock)) {
        filteredItems.push(item);
      } else if (item.height === Number(endBlock)) {
        filteredItems.push(item);
        hasNextPage = false;
      }
    }

    return {
      ...query,
      data: {
        ...query.data,
        items: filteredItems,
      },
      pagination: {
        ...query.pagination,
        hasNextPage,
        canGoBackwards: query.pagination.page > 1,
        onPrevPageClick() {
          handlePageClick(query, query.pagination.page - 1);
        },
        resetPage() {
          handlePageClick(query, 1);
        },
      },
    };
  }

  const endBlock: string = getPaginationParamsFromQuery(router.query.next_page_params).end_block as string;
  const filteredBlocksQuery = React.useMemo(() => filterQueryByEndBlock(blocksQuery, endBlock), [ blocksQuery, endBlock ]);
  const filteredReorgsQuery = React.useMemo(() => filterQueryByEndBlock(reorgsQuery, endBlock), [ reorgsQuery, endBlock ]);
  const filteredUnclesQuery = React.useMemo(() => filterQueryByEndBlock(unclesQuery, endBlock), [ unclesQuery, endBlock ]);

  const pagination = (() => {
    if (tab === 'reorgs') {
      return filteredReorgsQuery.pagination;
    }
    if (tab === 'uncles') {
      return filteredUnclesQuery.pagination;
    }
    return filteredBlocksQuery.pagination;
  })();

  const tabs: Array<RoutedTab> = [
    { id: 'blocks', title: 'All', component: <BlocksContent type="block" query={ filteredBlocksQuery } enableSocket={ endBlock ? false : true }/> },
    { id: 'reorgs', title: 'Forked', component: <BlocksContent type="reorg" query={ filteredReorgsQuery }/> },
    { id: 'uncles', title: 'Uncles', component: <BlocksContent type="uncle" query={ filteredUnclesQuery }/> },
  ];

  return (
    <>
      <PageTitle title="Blocks" withTextAd/>
      <RoutedTabs
        tabs={ tabs }
        tabListProps={ isMobile ? undefined : TAB_LIST_PROPS }
        rightSlot={ <BlocksTabSlot pagination={ pagination }/> }
        stickyEnabled={ !isMobile }
      />
    </>
  );
};

export default BlocksPageContent;
