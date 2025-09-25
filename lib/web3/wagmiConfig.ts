import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { http } from 'viem';
import type { CreateConfigParameters, Transport } from 'wagmi';
import { createConfig, fallback } from 'wagmi';

import appConfig from 'configs/app';
import multichainConfig from 'configs/multichain';
import { currentChain, parentChain } from 'lib/web3/chains';
const feature = appConfig.features.blockchainInteraction;

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
