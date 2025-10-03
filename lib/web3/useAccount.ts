import { useState, useEffect } from 'react';
import type { UseAccountReturnType } from 'wagmi';
import {
  useAccount as useWagmiAccount,
  useDisconnect,
  useConnect,
} from 'wagmi';

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
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const [ isInitialLoad, setIsInitialLoad ] = useState(true);
  const [ showDisconnected, setShowDisconnected ] = useState(false);
  // 处理页面初始加载逻辑
  useEffect(() => {
    // 页面首次加载时且有授权的情况下，只执行一次断开重连操作
    if (isInitialLoad && wagmiAccount.address && wagmiAccount.connector && wagmiAccount.isConnecting) {
      const connectorId = wagmiAccount.connector.id;

      setShowDisconnected(true);

      // 执行断开重连操作
      const reconnectWithDelay = async() => {
        try {
          // 先断开连接
          await disconnect();
          // 查找对应的连接器并重新连接
          const connector = connectors.find((c) => c.id === connectorId);
          if (connector) {
            await connect({ connector });
          }
        } finally {
          // 无论成功与否，都标记初始加载完成，确保只执行一次
          setIsInitialLoad(false);
        }
      };

      // 执行重连逻辑
      reconnectWithDelay();
    } else if (!isInitialLoad) {
      // 初始加载完成后，重置显示状态
      setShowDisconnected(false);
    } else if (!wagmiAccount.address) {
      // 如果没有地址，标记初始加载完成
      setIsInitialLoad(false);
      setShowDisconnected(false);
    }
  }, [ connect, connectors, disconnect, isInitialLoad, wagmiAccount.address, wagmiAccount.connector, wagmiAccount.isConnecting ]);

  // 在初始加载期间且设置了显示disconnected状态时，返回disconnected状态
  if (isInitialLoad && showDisconnected) {
    return {
      ...wagmiAccount,
      isConnecting: false,
      isConnected: false,
      isDisconnected: true,
      status: 'disconnected' as const,
    } as UseAccountReturnType;
  }

  // 当地址存在且不是重连状态但显示为连接中时，强制设置为已连接状态
  if (
    wagmiAccount.address &&
    wagmiAccount.isConnecting &&
    !wagmiAccount.isReconnecting
  ) {
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

const hook = config.features.blockchainInteraction.isEnabled ?
  useCustomAccount :
  useAccountFallback;

export default hook;
