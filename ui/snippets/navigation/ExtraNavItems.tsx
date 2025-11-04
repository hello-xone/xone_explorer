import { VStack } from '@chakra-ui/react';

import { useExtraNavItems } from 'lib/hooks/useNavItems';

import NavLink from './vertical/NavLink';

interface Props {
  isCollapsed?: boolean;
  onClick?: () => void;
}

export default function ExtraNavItems({ isCollapsed, onClick = () => {} }: Props) {
  const extraNavItems = useExtraNavItems();
  return (
    <VStack as="ul" gap="1" alignItems="flex-start" mt={ 6 } pt={ 4 } borderTopWidth="1px" borderColor="border.divider">
      { extraNavItems.map((item) => {
        return (
          <NavLink
            key={ item.text }
            item={ item }
            isCollapsed={ isCollapsed }
            isExtra
            onClick={ onClick }
          />
        );
      }) }
    </VStack>
  );
}
