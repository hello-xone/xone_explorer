import { Flex, Box, Text, HStack, VStack } from '@chakra-ui/react';
import React from 'react';

import type { Pool } from 'types/api/pools';

import { route } from 'nextjs-routes';

import getItemIndex from 'lib/getItemIndex';
import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { TableCell, TableRow } from 'toolkit/chakra/table';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import HashStringShorten from 'ui/shared/HashStringShorten';
import IconSvg from 'ui/shared/IconSvg';

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
  overlapOffset = 14,
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
  index: number;
  page: number;
  isLoading?: boolean;
};

const DexTrackerTableItem = ({
  item,
  page,
  index,
  isLoading,
}: Props) => {
  return (
    <TableRow>
      <TableCell>
        <Flex gap={ 3 } alignItems="center">
          <Skeleton loading={ isLoading }>
            <Text px={ 2 } fontSize="sm" color="text.secondary">
              { getItemIndex(index, page) }
            </Text>
          </Skeleton>

          <VStack align="start" gap={ 3 }>
            <Skeleton loading={ isLoading } display="flex" alignItems="center" gap={ 3 }>
              { /* Token Icons with Configurable Overlap Effect */ }
              <TokenIconsOverlap
                tokens={ [
                  { symbol: item.base_token_symbol, bg: 'gray.100', color: 'gray.600' },
                  { symbol: item.quote_token_symbol, bg: 'blue.100', color: 'blue.600' },
                ] }
                overlapOffset={ 16 }
                iconSize={ 24 }
                containerWidth={ 40 }
              />
              <Text fontWeight="bold" fontSize="sm" color="blue.600">
                { item.base_token_symbol } / { item.quote_token_symbol } (0.3%)
              </Text>
            </Skeleton>

            <HStack gap={ 2 }>
              <Skeleton loading={ isLoading }>
                <HStack gap={ 1 }>
                  <Link
                    href={ route({ pathname: '/address/[hash]', query: { hash: item.pool_id } }) }
                    color="text.secondary"
                    _hover={{ color: 'blue.400' }}
                    title={ item.pool_id }
                  >
                    <HashStringShorten hash={ item.pool_id } type="long"/>
                  </Link>
                  <CopyToClipboard text={ item.pool_id }/>
                </HStack>
              </Skeleton>
            </HStack>
          </VStack>
        </Flex>
      </TableCell>

      <TableCell>
        <Skeleton loading={ isLoading }>
          <Text fontSize="sm">{ item.dex.name }</Text>
        </Skeleton>
      </TableCell>

      <TableCell isNumeric>
        <Skeleton loading={ isLoading }>
          <Text fontWeight={ 500 } fontSize="sm">
            ${ Number(item.liquidity).toLocaleString(undefined, { maximumFractionDigits: 2, notation: 'compact' }) }
          </Text>
        </Skeleton>
      </TableCell>

      <TableCell>
        <Skeleton loading={ isLoading } display="flex" justifyContent="center">
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
        </Skeleton>
      </TableCell>
    </TableRow>
  );
};

export default DexTrackerTableItem;
