import { Box, Flex, HStack } from '@chakra-ui/react';
import React from 'react';

import type { SchemaItem } from '../types';

import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import SchemaFieldBadges from 'ui/eas/SchemaFieldBadges';
import IconSvg from 'ui/shared/IconSvg';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';

interface Props {
  data: Array<SchemaItem>;
  isLoading?: boolean;
}

// 截断地址显示函数
const truncateAddress = (address: string, startChars = 10, endChars = 8): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars + 3) return address;
  return `${ address.slice(0, startChars) }...${ address.slice(-endChars) }`;
};

const SchemaList = ({ data, isLoading }: Props) => {
  // 管理每个 resolver 的展开/收起状态
  const [ expandedResolvers, setExpandedResolvers ] = React.useState<Record<number, boolean>>({});

  // 切换 resolver 展开/收起状态
  const toggleResolver = React.useCallback((index: number) => {
    return () => {
      setExpandedResolvers(prev => ({
        ...prev,
        [index]: !prev[index],
      }));
    };
  }, []);

  return (
    <Box>
      { data.map((item, index) => {
        const isExpanded = expandedResolvers[index];
        const shouldTruncate = item.resolver && item.resolver.length > 21;

        return (
          <ListItemMobile key={ item.uid || index } rowGap={ 3 }>
            <Flex justifyContent="space-between" alignItems="flex-start">
              <Skeleton loading={ isLoading } fontWeight={ 700 }>
                <Link
                  href={ `/eas/schemaDetail/${ item.number }` }
                  fontSize="lg"
                  fontWeight={ 700 }
                  color="link"
                >
                  #{ item.number }
                </Link>
              </Skeleton>
            </Flex>

            <Box>
              <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 } mb={ 1 }>
                UID:
              </Skeleton>
              <Skeleton loading={ isLoading } fontSize="sm">
                <Link
                  href={ `/eas/schemaDetail/${ item.number }` }
                  fontFamily="mono"
                  fontSize="sm"
                >
                  { item.uid?.slice(0, 10) }...{ item.uid?.slice(-8) }
                </Link>
              </Skeleton>
            </Box>

            <Box>
              <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 } mb={ 1 }>
                Schema:
              </Skeleton>
              <SchemaFieldBadges
                schema={ item.schema }
                isLoading={ isLoading }
              />
            </Box>

            <Box>
              <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 } mb={ 1 }>
                Resolver:
              </Skeleton>
              <Skeleton loading={ isLoading } fontSize="sm">
                <Flex align="center" gap={ 1 }>
                  <Box
                    fontFamily="mono"
                    fontSize="sm"
                    wordBreak={ isExpanded ? 'break-all' : 'normal' }
                    lineHeight="1.5"
                  >
                    { shouldTruncate && !isExpanded ?
                      truncateAddress(item.resolver, 10, 8) :
                      item.resolver }
                  </Box>
                  { shouldTruncate && (
                    <Box
                      as="button"
                      onClick={ toggleResolver(index) }
                      cursor="pointer"
                      color="link"
                      _hover={{ opacity: 0.8 }}
                      transition="opacity 0.2s"
                      flexShrink={ 0 }
                      ml={ 1 }
                    >
                      <IconSvg
                        name="arrows/east-mini"
                        boxSize={ 6 }
                        transform={ isExpanded ? 'rotate(-90deg)' : 'rotate(90deg)' }
                        mb="2px"
                      />
                    </Box>
                  ) }
                </Flex>
              </Skeleton>
            </Box>

            <HStack gap={ 2 }>
              <Skeleton loading={ isLoading } fontSize="sm" color="text_secondary" fontWeight={ 500 }>
                Attestations:
              </Skeleton>
              <Skeleton loading={ isLoading } fontSize="sm">
                <Link
                  href={ `/eas/schemAttestationList/${ item?.uid }` }
                  fontWeight={ 600 }
                  color="link"
                >
                  { item.attestations }
                </Link>
              </Skeleton>
            </HStack>
          </ListItemMobile>
        );
      }) }
    </Box>
  );
};

export default SchemaList;
