import { Web3Kit, ChainType } from '@tokenup/web3kit';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { http } from 'viem';
import type { CreateConfigParameters, Transport } from 'wagmi';
import { createConfig, fallback } from 'wagmi';

// 移除 TokenUPConnector 类实现，将在其他地方正确实现

import appConfig from 'configs/app';
import multichainConfig from 'configs/multichain';
import { currentChain, parentChain } from 'lib/web3/chains';

import { connectTokenUP, isTokenUPInstalled, getTokenUPAccount } from './tokenup';

const feature = appConfig.features.blockchainInteraction;

// TokenUP钱包连接器函数 - 符合wagmi的CreateConnectorFn类型
function createTokenUpConnector() {
  return () => ({
    id: 'tokenup',
    name: 'TokenUP',
    type: 'injected' as const,
    // iconUrl: () => `/static/tokenup.png`,
    icon: `/static/tokenup.png`,
    iconUrl: `/static/tokenup.png`,
    iconBackground: '#FFFFFF',

    // 检查钱包是否已安装
    detect: async() => {
      if (typeof window === 'undefined') return false;
      return isTokenUPInstalled();
    },

    // 检查钱包是否已连接
    isAuthorized: async() => {
      try {
        const account = await getTokenUPAccount();
        return Boolean(account);
      } catch {
        return false;
      }
    },

    // 连接钱包
    connect: async() => {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }

      if (!isTokenUPInstalled()) {
        throw new Error('TokenUP wallet is not installed');
      }
      const accounts = await connectTokenUP(appConfig.chain.id || '3721');

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from TokenUP');
      }

      // 确保返回的类型符合wagmi要求
      return {
        accounts: accounts as ReadonlyArray<`0x${ string }`>,
        chainId: parseInt(appConfig.chain.id || '3721', 10),
      };
    },

    // 断开连接
    disconnect: async() => {
      return;
    },

    // 获取当前账户
    getAccount: async() => {
      const account = await getTokenUPAccount();
      if (!account) {
        throw new Error('Not connected to TokenUP');
      }
      return account;
    },

    // 获取账户列表
    getAccounts: async() => {
      const account = await getTokenUPAccount();
      return (account ? [ account ] : []) as ReadonlyArray<`0x${ string }`>;
    },

    // 获取当前链ID
    getChainId: async() => {
      return parseInt(appConfig.chain.id || '1', 10);
    },

    // 获取提供者
    getProvider: async() => {
      if (!isTokenUPInstalled()) {
        throw new Error('TokenUP wallet is not installed');
      }

      // 创建符合EIP-1193标准的provider对象，包装Web3Kit功能
      const web3Kit = new Web3Kit();

      // 创建一个标准的EIP-1193 provider对象
      const provider = {
        // 实现request方法，这是EIP-1193的核心方法
        request: async(args: { method: string; params?: Array<unknown> }) => {
          // 处理eth_sendTransaction特殊情况，确保正确传递参数
          if (args.method === 'eth_sendTransaction' && args.params) {
            const txHash = await web3Kit.request({
              chainType: ChainType.EVM,
              methodName: args.method,
              params: args.params,
            });
            return txHash;
          }

          // 处理其他方法
          return await web3Kit.request({
            chainType: ChainType.EVM,
            methodName: args.method,
            params: args.params || [],
          });
        },

        // 实现发送方法别名（一些库可能会使用）
        send: async(method: string, params?: Array<unknown>) => {
          return await provider.request({ method, params });
        },

        // 实现标准的事件监听方法
        on: () => {},
        removeListener: () => {},

        // 添加isMetaMask标志，一些库会检查这个标志
        isMetaMask: false,

        // 添加isTokenUP标志，便于识别
        isTokenUP: true,
      };

      return provider;
    },

    // 账户变化监听
    onAccountsChanged: () => {},

    // 链变化监听
    onChainChanged: () => {},

    // 断开连接监听
    onDisconnect: () => {},

    // 消息监听
    onMessage: () => {},

    // 发送交易
    sendTransaction: async(args: {
      from: `0x${ string }`;
      to?: `0x${ string }`;
      data?: `0x${ string }`;
      value?: bigint;
      gas?: bigint;
      gasPrice?: bigint;
    }) => {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }
      if (!isTokenUPInstalled()) {
        throw new Error('TokenUP wallet is not installed');
      }

      const web3Kit = new Web3Kit();
      // 发送交易并返回交易哈希
      const txHash = await web3Kit.request({
        chainType: ChainType.EVM,
        methodName: 'eth_sendTransaction',
        params: [ args ],
      });
      return txHash as string;
    },

    // 签名消息
    signMessage: async({ message }: { message: string }) => {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }
      if (!isTokenUPInstalled()) {
        throw new Error('TokenUP wallet is not installed');
      }

      const web3Kit = new Web3Kit();
      // 签名消息并返回签名
      const signature = await web3Kit.request({
        chainType: ChainType.EVM,
        methodName: 'eth_sign',
        params: [ (await getTokenUPAccount()) || '', message ],
      });
      return signature as `0x${ string }`;
    },

    // 签名个人消息
    signPersonalMessage: async({ message }: { message: string }) => {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }
      if (!isTokenUPInstalled()) {
        throw new Error('TokenUP wallet is not installed');
      }

      const web3Kit = new Web3Kit();
      // 签名个人消息并返回签名
      const signature = await web3Kit.request({
        chainType: ChainType.EVM,
        methodName: 'personal_sign',
        params: [ message, (await getTokenUPAccount()) || '' ],
      });
      return signature as `0x${ string }`;
    },

    // 签名类型化数据
    signTypedData: async() => {
      throw new Error('signTypedData not implemented');
    },
  });
}

const getChainTransportFromConfig = (config: typeof appConfig, readOnly?: boolean): Record<string, Transport> => {
  if (!config.chain.id) {
    return {};
  }

  return {
    [config.chain.id]: fallback(
      config.chain.rpcUrls
        .concat(readOnly ? `${ config.apis.general.endpoint }/api/eth-rpc` : '')
        .filter(Boolean)
        .map((url) => http(url, { batch: { wait: 100 } })),
    ),
  };
};

const reduceClusterChainsToTransportConfig = (readOnly: boolean): Record<string, Transport> => {
  const config = multichainConfig();

  if (!config) {
    return {};
  }

  return config.chains
    .map(({ config }) => getChainTransportFromConfig(config, readOnly))
    .reduce((result, item) => {
      Object.entries(item).map(([ id, transport ]) => {
        result[id] = transport;
      });
      return result;
    }, {} as Record<string, Transport>);
};

const wagmiConfig = (() => {
  if (!currentChain) {
    return null;
  }
  const chains: CreateConfigParameters['chains'] = [ currentChain ];
  if (!feature.isEnabled) {
    const wagmiConfig = createConfig({
      chains: [ currentChain ],
      transports: {
        ...getChainTransportFromConfig(appConfig, true),
        ...(parentChain ? { [parentChain.id]: http(parentChain.rpcUrls.default.http[0]) } : {}),
        ...reduceClusterChainsToTransportConfig(true),
      },
      ssr: true,
      batch: { multicall: { wait: 100 } },
    });

    return wagmiConfig;
  }

  const wagmiConfig = defaultWagmiConfig({
    chains,
    multiInjectedProviderDiscovery: true,
    transports: {
      [currentChain.id]: http(),
    },
    connectors: [
      createTokenUpConnector(),
    ],
    projectId: feature.walletConnect.projectId,
    metadata: {
      name: `${ appConfig.chain.name } explorer`,
      description: `${ appConfig.chain.name } explorer`,
      url: appConfig.app.baseUrl,
      icons: [ appConfig.UI.navigation.icon.default ].filter(Boolean),
    },
    auth: {
      email: true,
      socials: [],
    },
    ssr: true,
    batch: { multicall: { wait: 100 } },
  });

  return wagmiConfig;
})();

export default wagmiConfig;
