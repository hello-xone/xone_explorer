import type { TurnstileInstance } from '@marsidev/react-turnstile';
import React from 'react';

import getErrorCauseStatusCode from 'lib/errors/getErrorCauseStatusCode';
import getErrorObjStatusCode from 'lib/errors/getErrorObjStatusCode';

export default function useCloudflareTurnstile() {
  const ref = React.useRef<TurnstileInstance>(null);
  const rejectCb = React.useRef<((error: Error) => void) | null>(null);

  const [ isOpen, setIsOpen ] = React.useState(false);
  const [ isInitError, setIsInitError ] = React.useState(false);

  const executeAsync: () => Promise<string | null> = React.useCallback(async() => {
    setIsOpen(true);

    const tokenPromise = (ref.current as TurnstileInstance).getResponsePromise();

    const modalOpenPromise = new Promise<null>((resolve, reject) => {
      rejectCb.current = reject;
    });

    return Promise.race([ tokenPromise, modalOpenPromise ]);
  }, [ ref ]);

  const handleContainerClick = React.useCallback(() => {
    setIsOpen(false);
    rejectCb.current?.(new Error('Turnstile is not solved'));
  }, []);

  const handleInitError = React.useCallback(() => {
    setIsInitError(true);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const container = window.document.querySelector('div:has(div):has(iframe[title*="turnstile"])');
    container?.addEventListener('click', handleContainerClick);

    return () => {
      container?.removeEventListener('click', handleContainerClick);
    };
  }, [ isOpen, handleContainerClick ]);

  const fetchProtectedResource: <T>(fetcher: (token?: string) => Promise<T>, token?: string) => Promise<T> = React.useCallback(async(fetcher, token) => {
    try {
      const result = await fetcher(token);
      return result;
    } catch(error) {
      const statusCode = error instanceof Error ? getErrorCauseStatusCode(error) : getErrorObjStatusCode(error);
      if (statusCode === 429) {
        const token = await executeAsync();

        if (!token) {
          throw new Error('Turnstile is not solved');
        }

        return fetchProtectedResource(fetcher, token);
      }

      throw error;
    }
  }, [ executeAsync ]);

  return React.useMemo(() => ({
    ref,
    executeAsync,
    isInitError,
    onInitError: handleInitError,
    fetchProtectedResource,
  }), [ ref, executeAsync, isInitError, handleInitError, fetchProtectedResource ]);
}
