export type PoolsResponse = {
  data: Array<PoolV2>;
  included: Array<Token | Dex>;
};

export type PoolResponse = {
  data: PoolV2;
  included: Array<Token | Dex>;
};

export type PoolV2 = {
  id: string;
  type: 'pool';
  attributes: {
    base_token_price_usd: string;
    base_token_price_native_currency: string;
    quote_token_price_usd: string;
    quote_token_price_native_currency: string;
    base_token_price_quote_token: string;
    quote_token_price_base_token: string;
    address: string;
    name: string;
    pool_name: string;
    pool_fee_percentage: string | null;
    pool_created_at: string;
    fdv_usd: string;
    market_cap_usd: string | null;
    price_change_percentage: {
      m5: string;
      m15: string;
      m30: string;
      h1: string;
      h6: string;
      h24: string;
    };
    transactions: {
      m5: { buys: number; sells: number; buyers: number; sellers: number };
      m15: { buys: number; sells: number; buyers: number; sellers: number };
      m30: { buys: number; sells: number; buyers: number; sellers: number };
      h1: { buys: number; sells: number; buyers: number; sellers: number };
      h6: { buys: number; sells: number; buyers: number; sellers: number };
      h24: { buys: number; sells: number; buyers: number; sellers: number };
    };
    volume_usd: {
      m5: string;
      m15: string;
      m30: string;
      h1: string;
      h6: string;
      h24: string;
    };
    reserve_in_usd: string;
    locked_liquidity_percentage: string | null;
  };
  relationships: {
    base_token: { data: { id: string; type: 'token' } };
    quote_token: { data: { id: string; type: 'token' } };
    dex: { data: { id: string; type: 'dex' } };
  };
};

export type Token = {
  id: string;
  type: 'token';
  attributes: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    image_url: string | null;
    coingecko_coin_id: string | null;
  };
};

export type Dex = {
  id: string;
  type: 'dex';
  attributes: {
    name: string;
  };
};

// 保留原有的 Pool 类型用于向后兼容
export type Pool = {
  pool_id: string;
  is_contract: boolean;
  chain_id: string;
  base_token_address: string;
  base_token_symbol: string;
  base_token_address_icon: string;
  quote_token_address: string;
  quote_token_symbol: string;
  quote_token_address_icon: string;
  base_token_fully_diluted_valuation_usd: string | null;
  base_token_market_cap_usd: string | null;
  quote_token_fully_diluted_valuation_usd: string | null;
  quote_token_market_cap_usd: string | null;
  liquidity: string;
  dex: {
    id: string;
    name: string;
  };
  fee?: string;
  coin_gecko_terminal_url: string;
};
