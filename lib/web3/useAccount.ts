import type { UseAccountReturnType } from 'wagmi';
import { useAccount as useWagmiAccount } from 'wagmi';

import config from 'configs/app';

function useAccountFallback(): UseAccountReturnType {
  return {
    address: undefined,
    addresses: undefined,
    chain: undefined,
    chainId: undefined,
    connector: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
    isReconnecting: false,
    status: 'disconnected',
  };
}

function useCustomAccount(): UseAccountReturnType {
  const wagmiAccount = useWagmiAccount();

  // 直接返回原始对象，但在返回前处理isConnecting状态
  // 当地址存在时，强制设置isConnecting为false
  if (wagmiAccount.address && wagmiAccount.isConnecting && !wagmiAccount.isReconnecting) {
    // 使用类型断言确保返回正确的类型
    return {
      ...wagmiAccount,
      isConnecting: false,
      status: 'connected' as const,
      isConnected: true,
      isDisconnected: false,
    } as UseAccountReturnType;
  }
  // 正常情况下返回原始状态
  return wagmiAccount;
}

const hook = config.features.blockchainInteraction.isEnabled ? useCustomAccount : useAccountFallback;

export default hook;
