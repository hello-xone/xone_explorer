import { VStack, Box, useBreakpointValue } from '@chakra-ui/react';

import { useExtraNavItems, isGroupItem } from 'lib/hooks/useNavItems';

import MobileNavLinkGroup from './mobile/NavLinkGroup';
import NavLink from './vertical/NavLink';
import NavLinkGroup from './vertical/NavLinkGroup';

interface Props {
  isCollapsed?: boolean;
  onClick?: () => void;
  onGroupItemOpen?: (index: number) => () => void;
}

export default function ExtraNavItems({ isCollapsed, onClick = () => {}, onGroupItemOpen }: Props) {
  const extraNavItems = useExtraNavItems();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <VStack as="ul" gap="1" alignItems="flex-start" mt={ 6 } pt={ 4 } px={{ base: '2px', lg: 0 }} borderTopWidth="1px" borderColor="border.divider">
      { extraNavItems.map((item, index) => {
        let content;

        if (isGroupItem(item)) {
          if (isMobile && onGroupItemOpen) {
            content = (
              <MobileNavLinkGroup
                key={ item.text }
                item={ item }
                onClick={ onGroupItemOpen(index) }
              />
            );
          } else {
            content = <NavLinkGroup key={ item.text } item={ item } isExtra isCollapsed={ isCollapsed }/>;
          }
        } else {
          content = (
            <NavLink
              key={ item.text }
              item={ item }
              isCollapsed={ isCollapsed }
              isExtra
              onClick={ onClick }
            />
          );
        }

        return (
          <Box
            key={ item.text }
            w="100%"
            css={{
              '&:hover .icon-default, &:has([data-state="open"]) .icon-default': {
                opacity: '0 !important',
              },
              '&:hover .icon-hover, &:has([data-state="open"]) .icon-hover': {
                opacity: '1 !important',
              },
            }}
          >
            { content }
          </Box>
        );
      }) }
    </VStack>
  );
}
