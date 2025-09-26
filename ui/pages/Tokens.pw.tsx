import { Box } from '@chakra-ui/react';
import React from 'react';

import type { TokenInfo } from 'types/api/token';

import { transformXoneTokensResponse } from 'lib/api/services/xone';
import type { XoneTokenInfo, XoneTokensRawResponse } from 'lib/api/services/xone';
import * as tokens from 'mocks/tokens/tokenInfo';
import { ENVS_MAP } from 'playwright/fixtures/mockEnvs';
import { test, expect } from 'playwright/lib';

import Tokens from './Tokens';

test.beforeEach(async({ mockTextAd, mockAssetResponse }) => {
  await mockTextAd();
  await mockAssetResponse(tokens.tokenInfoERC20a.icon_url as string, './playwright/mocks/image_svg.svg');
});

function convertToXoneFormat(tokenInfo: TokenInfo): XoneTokenInfo {
  return {
    address: tokenInfo.address_hash,
    circulating_market_cap: tokenInfo.circulating_market_cap,
    decimals: tokenInfo.decimals || '18',
    exchange_rate: tokenInfo.exchange_rate,
    holders: tokenInfo.holders_count || '0',
    icon_url: tokenInfo.icon_url,
    name: tokenInfo.name || 'Unknown',
    symbol: tokenInfo.symbol || 'UNK',
    total_supply: tokenInfo.total_supply || '0',
    type: tokenInfo.type,
    volume_24h: null,
  };
}

// XONE API 返回的原始响应格式（包含 items 对象）
const allTokensRaw: XoneTokensRawResponse = {
  items: [
    convertToXoneFormat(tokens.tokenInfoERC20a),
    convertToXoneFormat(tokens.tokenInfoERC20b),
    convertToXoneFormat(tokens.tokenInfoERC20c),
    convertToXoneFormat(tokens.tokenInfoERC20d),
    convertToXoneFormat(tokens.tokenInfoERC721a),
    convertToXoneFormat(tokens.tokenInfoERC721b),
    convertToXoneFormat(tokens.tokenInfoERC721c),
    convertToXoneFormat(tokens.tokenInfoERC1155a),
    convertToXoneFormat(tokens.tokenInfoERC1155b),
    convertToXoneFormat(tokens.tokenInfoERC1155WithoutName),
  ],
  next_page_params: null,
};

// FIXME: test is flaky, screenshot in docker container is different from local
test.skip('base view +@mobile +@dark-mode', async({ render, mockApiResponse }) => {

  await mockApiResponse('xone:tokens', transformXoneTokensResponse(allTokensRaw));

  const component = await render(
    <div>
      <Box h={{ base: '134px', lg: 6 }}/>
      <Tokens/>
    </div>,
  );

  await expect(component).toHaveScreenshot();
});

test('with search +@mobile +@dark-mode', async({ render, mockApiResponse }) => {

  await mockApiResponse('xone:tokens', transformXoneTokensResponse(allTokensRaw));
  await mockApiResponse('xone:tokens', transformXoneTokensResponse({
    items: [ convertToXoneFormat(tokens.tokenInfoERC20a) ],
    next_page_params: null,
  }), { queryParams: { q: 'foo' } });

  const component = await render(
    <div>
      <Box h={{ base: '134px', lg: 6 }}/>
      <Tokens/>
    </div>,
  );

  await component.getByRole('textbox', { name: 'Token name or symbol' }).focus();
  await component.getByRole('textbox', { name: 'Token name or symbol' }).fill('foo');
  await component.getByRole('textbox', { name: 'Token name or symbol' }).blur();

  await expect(component).toHaveScreenshot();
});

test.describe('bridged tokens', () => {
  const bridgedTokens = {
    items: [
      tokens.bridgedTokenA,
      tokens.bridgedTokenB,
      tokens.bridgedTokenC,
    ],
    next_page_params: {
      holders_count: 1,
      items_count: 1,
      name: 'a',
      market_cap: null,
    },
  };
  const bridgedFilteredTokens = {
    items: [
      tokens.bridgedTokenC,
    ],
    next_page_params: null,
  };
  const hooksConfig = {
    router: {
      query: { tab: 'bridged' },
    },
  };

  test('base view', async({ render, page, mockApiResponse, mockEnvs }) => {
    await mockEnvs(ENVS_MAP.bridgedTokens);
    await mockApiResponse('general:tokens_bridged', {
      ...bridgedTokens,
      next_page_params: {
        contract_address_hash: '',
        fiat_value: null,
        holder_count: bridgedTokens.next_page_params.holders_count,
        is_name_null: false,
        items_count: bridgedTokens.next_page_params.items_count,
        market_cap: null,
        name: bridgedTokens.next_page_params.name,
      },
    });
    await mockApiResponse('general:tokens_bridged', bridgedFilteredTokens, { queryParams: { chain_ids: '99' } });

    const component = await render(
      <div>
        <Box h={{ base: '134px', lg: 6 }}/>
        <Tokens/>
      </div>,
      { hooksConfig },
    );

    await expect(component).toHaveScreenshot();

    await component.getByRole('button', { name: /filter/i }).click();
    await page.locator('label').filter({ hasText: /poa/i }).click();
    await page.click('body');

    await expect(component).toHaveScreenshot();
  });
});
