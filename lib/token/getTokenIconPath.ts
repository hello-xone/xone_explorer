import config from 'configs/app';
import { getEnvValue } from 'configs/app/utils';

/**
 * 获取当前环境对应的链名称
 * @returns 链名称字符串，用于构建 token icon 路径
 */
function getChainName(): string {
  return config.chain.isTestnet ? 'xone_testnet' : 'xone';
}

/**
 * 构建 token 图标的完整路径
 * @param tokenAddress - token 的合约地址
 * @returns 完整的 token 图标 URL，如果环境变量未配置则返回 undefined
 */
export function getTokenIconPath(tokenAddress: string): string | undefined {
  const basePath = getEnvValue('NEXT_PUBLIC_TOKEN_ICON_BASE_PATH');

  if (!basePath) {
    return undefined;
  }

  const chainName = getChainName();

  return basePath
    .replace('[address]', tokenAddress)
    .replace('[chain]', chainName);
}

export default getTokenIconPath;
