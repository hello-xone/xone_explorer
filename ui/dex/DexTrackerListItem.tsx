import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import type { Pool } from 'types/api/pools';

import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import HashStringShorten from 'ui/shared/HashStringShorten';
import IconSvg from 'ui/shared/IconSvg';
import ListItemMobileGrid from 'ui/shared/ListItemMobile/ListItemMobileGrid';

// Token Icons Overlap Component
type TokenIcon = {
  symbol: string;
  bg: string;
  color: string;
};

type TokenIconsOverlapProps = {
  tokens: Array<TokenIcon>;
  overlapOffset?: number;
  iconSize?: number;
  containerWidth?: number;
};

const TokenIconsOverlap = ({
  tokens,
  overlapOffset = 12,
  iconSize = 24,
  containerWidth = 40,
}: TokenIconsOverlapProps) => {
  return (
    <Box position="relative" w={ `${ containerWidth }px` } h={ `${ iconSize }px` }>
      { tokens.map((token, index) => {
        // 第一个元素保持不变位置，其他元素从后往前重叠
        const leftPosition = index === 0 ? 0 : overlapOffset * index;
        const zIndex = index + 1; // 前面的元素层级更高，从后往前重叠

        return (
          <Box
            key={ `${ token.symbol }-${ index }` }
            position="absolute"
            left={ `${ leftPosition }px` }
            top="0"
            w={ `${ iconSize }px` }
            h={ `${ iconSize }px` }
            borderRadius="full"
            bg={ token.bg }
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={ zIndex }
          >
            <Text fontSize="xs" fontWeight="bold" color={ token.color }>
              { token.symbol.charAt(0) }
            </Text>
          </Box>
        );
      }) }
    </Box>
  );
};

type Props = {
  item: Pool;
  isLoading?: boolean;
};

const DexTrackerListItem = ({ item, isLoading }: Props) => {
  return (
    <ListItemMobileGrid.Container gridTemplateColumns="100px auto">

      <ListItemMobileGrid.Label isLoading={ isLoading }>Pool</ListItemMobileGrid.Label>
      <ListItemMobileGrid.Value>
        <Skeleton loading={ isLoading }>
          <Flex alignItems="center" gap={ 3 }>
            <TokenIconsOverlap
              tokens={ [
                { symbol: item.base_token_symbol, bg: 'gray.100', color: 'gray.600' },
                { symbol: item.quote_token_symbol, bg: 'blue.300', color: 'white' },
              ] }
              overlapOffset={ 16 }
              iconSize={ 24 }
              containerWidth={ 40 }
            />
            <Text fontWeight="bold" fontSize="sm" color="blue.600">
              { item.base_token_symbol } / { item.quote_token_symbol } (0.3%)
            </Text>
          </Flex>
        </Skeleton>
      </ListItemMobileGrid.Value>

      <ListItemMobileGrid.Label isLoading={ isLoading }>Contract</ListItemMobileGrid.Label>
      <ListItemMobileGrid.Value>
        <Skeleton loading={ isLoading }>
          <Flex alignItems="center" gap={ 1 }>
            <HashStringShorten hash={ item.pool_id } type="long"/>
            <CopyToClipboard text={ item.pool_id }/>
          </Flex>
        </Skeleton>
      </ListItemMobileGrid.Value>

      <ListItemMobileGrid.Label isLoading={ isLoading }>Liquidity</ListItemMobileGrid.Label>
      <ListItemMobileGrid.Value>
        <Skeleton loading={ isLoading }>
          <Text fontWeight={ 500 } fontSize="sm">
            ${ Number(item.liquidity).toLocaleString(undefined, { maximumFractionDigits: 2, notation: 'compact' }) }
          </Text>
        </Skeleton>
      </ListItemMobileGrid.Value>

      <ListItemMobileGrid.Label isLoading={ isLoading }>View in</ListItemMobileGrid.Label>
      <ListItemMobileGrid.Value>
        <Skeleton loading={ isLoading }>
          <Link
            href="https://www.geckoterminal.com/"
            external
            display="flex"
            alignItems="center"
            gap={ 2 }
            _hover={{ textDecoration: 'none' }}
          >
            <Box
              w="20px"
              h="20px"
              borderRadius="sm"
              bg="purple.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              _hover={{ bg: 'purple.600' }}
            >
              <IconSvg name="link_external" boxSize={ 3 } color="white"/>
            </Box>
            <Text fontSize="sm" color="blue.600" cursor="pointer">
              GeckoTerminal
            </Text>
          </Link>
        </Skeleton>
      </ListItemMobileGrid.Value>
    </ListItemMobileGrid.Container>
  );
};

export default DexTrackerListItem;
