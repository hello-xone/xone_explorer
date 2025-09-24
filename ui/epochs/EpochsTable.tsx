import React from 'react';

import type { EpochInfo } from 'types/api/epoch';

import { TableBody, TableColumnHeader, TableHeaderSticky, TableRoot, TableRow } from 'toolkit/chakra/table';

import EpochsTableItem from './EpochsTableItem';

interface Props {
  items: Array<EpochInfo>;
  isLoading?: boolean;
  top: number;
};

const EpochsTable = ({ items, isLoading, top }: Props) => {
  return (
    <TableRoot minW="1100px">
      <TableHeaderSticky top={ top }>
        <TableRow>
          <TableColumnHeader w="20%">Epoch Number</TableColumnHeader>
          <TableColumnHeader w="20%">Start Block Number</TableColumnHeader>
          <TableColumnHeader w="20%" isNumeric>End Block Number</TableColumnHeader>
          <TableColumnHeader w="20%" isNumeric>Start Time (UTC+0)</TableColumnHeader>
          <TableColumnHeader w="20%" isNumeric>End Time (UTC+0)</TableColumnHeader>
        </TableRow>
      </TableHeaderSticky>
      <TableBody>
        { items.map((item, index) => {
          return (
            <EpochsTableItem
              key={ item.id + (isLoading ? String(index) : '') }
              item={ item }
              isLoading={ isLoading }
            />
          );
        }) }
      </TableBody>
    </TableRoot>
  );
};

export default EpochsTable;
