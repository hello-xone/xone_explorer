import BigNumber from 'bignumber.js';

/**
 * 格式化代币价格显示
 * @param exchangeRate - 价格字符串
 * @returns 格式化后的价格字符串
 */
export function formatTokenPrice(exchangeRate: string | null): string {
  if (!exchangeRate || exchangeRate === '0' || exchangeRate === 'null') {
    return '';
  }

  const price = Number(exchangeRate);
  if (isNaN(price) || price === 0) {
    return '';
  }

  // 对于非常小的价格，显示更多小数位
  if (price < 0.000001) {
    return `$${ price.toExponential(2) }`;
  } else if (price < 0.01) {
    return `$${ price.toFixed(6) }`;
  } else if (price < 1) {
    return `$${ price.toFixed(4) }`;
  } else if (price < 1000) {
    return `$${ price.toFixed(2) }`;
  } else {
    return `$${ price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) }`;
  }
}

/**
 * 格式化代币市值显示
 * @param marketCap - 市值字符串
 * @returns 格式化后的市值字符串
 */
export function formatTokenMarketCap(marketCap: string | null): string {
  if (!marketCap || marketCap === '0' || marketCap === 'null') {
    return '';
  }

  try {
    const value = new BigNumber(marketCap);
    if (value.isNaN() || value.isZero()) {
      return '';
    }

    // 转换为数字进行格式化
    const numValue = value.toNumber();

    if (numValue >= 1e12) {
      return `$${ (numValue / 1e12).toFixed(2) }T`;
    } else if (numValue >= 1e9) {
      return `$${ (numValue / 1e9).toFixed(2) }B`;
    } else if (numValue >= 1e6) {
      return `$${ (numValue / 1e6).toFixed(2) }M`;
    } else if (numValue >= 1e3) {
      return `$${ (numValue / 1e3).toFixed(2) }K`;
    } else {
      return `$${ numValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) }`;
    }
  } catch (error) {
    return '';
  }
}

/**
 * 格式化持有者数量显示
 * @param holdersCount - 持有者数量字符串
 * @returns 格式化后的持有者数量字符串
 */
export function formatTokenHolders(holdersCount: string | null): string {
  if (!holdersCount || holdersCount === '0') {
    return '0';
  }

  const count = Number(holdersCount);
  if (isNaN(count)) {
    return holdersCount;
  }

  return count.toLocaleString();
}
