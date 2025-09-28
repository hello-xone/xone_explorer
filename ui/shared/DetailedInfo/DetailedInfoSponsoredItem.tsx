import { Box } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import { ads } from 'configs/app/features/ads';
import * as cookies from 'lib/cookies';

import AdSwiperCarousel from '../ad/AdSwiperCarousel';
import * as DetailedInfo from './DetailedInfo';

const feature = config.features.adsBanner;

interface Props {
  isLoading?: boolean;
}

const DetailedInfoSponsoredItem = ({ isLoading }: Props) => {
  const hasAdblockCookie = cookies.get(cookies.NAMES.ADBLOCK_DETECTED);

  if (!feature.isEnabled || hasAdblockCookie === 'true') {
    return null;
  }

  return (
    <>
      <DetailedInfo.ItemLabel
        hint="Sponsored banner advertisement"
        isLoading={ isLoading }
      >
        Sponsored
      </DetailedInfo.ItemLabel>
      <DetailedInfo.ItemValue mt={{ base: 0, lg: 1 }}>
        <Box
          w="100%"
          borderRadius="md"
          overflow="hidden"
        >
          <AdSwiperCarousel showArrows={ false } ads={ ads } autoPlayInterval={ 5000 } showDots={ true }/>
        </Box>
      </DetailedInfo.ItemValue>
    </>
  );
};

export default React.memo(DetailedInfoSponsoredItem);
