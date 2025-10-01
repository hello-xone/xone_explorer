import { Web3Kit, ChainType } from '@tokenup/web3kit';

export type IConnectRes = Array<string>;

/**
 * 连接 TokenUP 钱包
 * @param chainId 链 ID
 * @returns 连接的账户地址数组
 */
export async function connectTokenUP(chainId: string): Promise<IConnectRes> {
  if (typeof window === 'undefined') {
    throw new Error('TokenUP wallet is not installed');
  }

  const web3Kit = new Web3Kit();
  const serRes: IConnectRes = await web3Kit.request({
    chainType: ChainType.EVM,
    methodName: 'eth_requestAccounts',
    params: [
      {
        chainId: chainId, // Specify the chainId of the connection
      },
    ],
  });
  return serRes;
}

/**
 * 检查是否安装了 TokenUP 钱包
 * @returns 是否安装
 */
export function isTokenUPInstalled(): boolean {
  const web3Kit = new Web3Kit();
  return Boolean(web3Kit);
}

/**
 * 获取当前连接的账户
 * @returns 账户地址
 */
export async function getTokenUPAccount(): Promise<string | null> {
  if (!isTokenUPInstalled()) return null;

  try {
    const web3Kit = new Web3Kit();
    const accounts = await web3Kit.request({
      chainType: ChainType.EVM,
      methodName: 'eth_accounts',
      params: [],
    });
    return Array.isArray(accounts) && accounts.length > 0 ? (accounts[0] as string) : null;
  } catch {
    return null;
  }
}
