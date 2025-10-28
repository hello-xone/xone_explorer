import type { EpochInfo } from 'types/api/epoch';

import config from 'configs/app';
import useFetch from 'lib/hooks/useFetch';

const DEFAULT_PAGE_LIMIT = 50;

interface EpochListResponse {
  code: number;
  data: {
    epochInfoss: Array<EpochInfo>;
    total: number;
  };
  msg: string;
}

const useQueryEpochs = () => {
  const fetch = useFetch();

  const fetchEpochs = async(pagination: { page: number; limit: number }) => {
    const { page, limit = DEFAULT_PAGE_LIMIT } = pagination;
    try {
      const res = (await fetch(
        `${ config.app.epochApiHost }/api/v1/epochInfos/list`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: {
            sort: '-id',
            limit,
            page, // Adjust for 0-based index
          },
        },
      )) as EpochListResponse;
      return res.data;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch epochs:', error);
      return {
        epochInfoss: [],
        total: 0,
      };
    }
  };

  return {
    fetchEpochs,
  };
};

export default useQueryEpochs;
