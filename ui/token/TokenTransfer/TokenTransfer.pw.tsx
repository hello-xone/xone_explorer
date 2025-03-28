import { Box } from '@chakra-ui/react';
import React from 'react';

import * as tokenTransferMock from 'mocks/tokens/tokenTransfer';
import { test, expect } from 'playwright/lib';

import TokenTransfer from './TokenTransfer';

test('erc20 +@mobile', async({ render }) => {
  const component = await render(
    <Box pt={{ base: '134px', lg: '100px' }}>
      <TokenTransfer

        // @ts-ignore:
        transfersQuery={{
          data: {
            items: [ tokenTransferMock.erc20 ],
            next_page_params: null,
          },

          // @ts-ignore:
          pagination: { page: 1, isVisible: true },
        }}
      />
    </Box>,
  );

  await expect(component).toHaveScreenshot();
});

test('erc721 +@mobile', async({ render }) => {
  const component = await render(
    <Box pt={{ base: '134px', lg: '100px' }}>
      <TokenTransfer

        // @ts-ignore:
        transfersQuery={{
          data: {
            items: [ tokenTransferMock.erc721 ],
            next_page_params: null,
          },

          // @ts-ignore:
          pagination: { page: 1, isVisible: true },
        }}
      />
    </Box>,
  );

  await expect(component).toHaveScreenshot();
});

test('erc1155 +@mobile', async({ render }) => {
  const component = await render(
    <Box pt={{ base: '134px', lg: '100px' }}>
      <TokenTransfer

        // @ts-ignore:
        transfersQuery={{
          data: {
            items: [
              tokenTransferMock.erc1155A,
              tokenTransferMock.erc1155B,
              tokenTransferMock.erc1155C,
              tokenTransferMock.erc1155D,
            ],
            next_page_params: null,
          },

          // @ts-ignore:
          pagination: { page: 1, isVisible: true },
        }}
      />
    </Box>,
  );

  await expect(component).toHaveScreenshot();
});
