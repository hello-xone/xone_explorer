import { Text } from '@chakra-ui/react';
import React from 'react';

import type { DeFiDropdownItem as TDeFiDropdownItem } from 'types/client/deFiDropdown';

import { route } from 'nextjs-routes';

import { Image } from 'toolkit/chakra/image';
import { Link } from 'toolkit/chakra/link';

type Props = {
  item: TDeFiDropdownItem & { onClick: () => void };
};

const DeFiDropdownItem = ({ item }: Props) => {
  return (
    <Link
      href={ item.dappId ? route({ pathname: '/apps/[id]', query: { id: item.dappId, action: 'connect' } }) : item.url }
      external={ !item.dappId }
      w="100%"
      h="34px"
      variant="menu"
      onClick={ item.onClick }
    >
      <Image src={ item.icon } alt="" boxSize={ 5 } objectFit="contain" mr={ 2 }></Image>
      <Text as="span" fontSize="sm">{ item.text }</Text>
    </Link>
  );
};

export default React.memo(DeFiDropdownItem);
