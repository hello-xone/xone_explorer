import { Table, Tbody, Th, Tr } from '@chakra-ui/react';
import React from 'react';

import type { EpochInfo } from 'types/api/epoch';

import { ACTION_BAR_HEIGHT_DESKTOP } from 'ui/shared/ActionBar';
import { default as Thead } from 'ui/shared/TheadSticky';

import TokensTableItem from './EpochsTableItem';

type Props = {
  items: Array<EpochInfo>;
  isLoading?: boolean;
  top?: number;
};

const TokensTable = ({ items, isLoading, top }: Props) => {
  return (
    <Table>
      <Thead top={ top ?? ACTION_BAR_HEIGHT_DESKTOP }>
        <Tr>
          <Th w="20%">Epoch Number</Th>
          <Th isNumeric w="20%">
            Start Block Number
          </Th>
          <Th isNumeric w="20%">
            End Block Number
          </Th>
          <Th isNumeric w="20%">
            Start Time (UTC+0)
          </Th>
          <Th isNumeric w="20%">
            End Time (UTC+0)
          </Th>

        </Tr>
      </Thead>
      <Tbody>
        { items.map((item, index) => (
          <TokensTableItem
            key={ String(item.id) + (isLoading ? index : '') }
            epoch={ item }
            isLoading={ isLoading }
          />
        )) }
      </Tbody>
    </Table>
  );
};

export default TokensTable;
