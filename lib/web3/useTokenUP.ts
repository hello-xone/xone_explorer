import React from 'react';
import { useAccount } from 'wagmi';

import config from 'configs/app';

import type {
  IConnectRes,
} from './tokenup';
import {
  connectTokenUP as connectTokenUPWallet,
  isTokenUPInstalled,
} from './tokenup';

interface UseTokenUPReturn {
  connectTokenUP: () => Promise<IConnectRes>;
  isConnected: boolean;
  address: string | undefined;
  error: Error | null;
  isLoading: boolean;
  isInstalled: boolean;
}

export default function useTokenUP(): UseTokenUPReturn {
  const [ error, setError ] = React.useState<Error | null>(null);
  const [ isLoading, setIsLoading ] = React.useState(false);
  const { address } = useAccount();
  const chainId = config.chain.id || '3721';

  const connectTokenUP = React.useCallback(async(): Promise<IConnectRes> => {
    setIsLoading(true);
    setError(null);

    try {
      const serRes = await connectTokenUPWallet(chainId);
      return serRes;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect to TokenUP'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ chainId ]);

  return React.useMemo(() => ({
    connectTokenUP,
    isConnected: Boolean(address),
    address,
    error,
    isLoading,
    isInstalled: isTokenUPInstalled(),
  }), [ connectTokenUP, address, error, isLoading ]);
}
