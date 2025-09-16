import { Center, Spinner } from '@chakra-ui/react';
import React from 'react';

import type { ScreenSuccess } from '../types';
import type { UserInfo } from 'types/api/account';

import type * as mixpanel from 'lib/mixpanel';
import CloudflareTurnstileInvisible from 'ui/shared/cloudflareTurnstile/CloudflareTurnstile';
import useCloudflareTurnstile from 'ui/shared/cloudflareTurnstile/useCloudflareTurnstile';

import useSignInWithWallet from '../useSignInWithWallet';

interface Props {
  onSuccess: (screen: ScreenSuccess) => void;
  onError: (isAuth?: boolean) => void;
  isAuth?: boolean;
  source?: mixpanel.EventPayload<mixpanel.EventTypes.WALLET_CONNECT>['Source'];
  loginToRewards?: boolean;
}

const AuthModalScreenConnectWallet = ({ onSuccess, onError, isAuth, source, loginToRewards }: Props) => {
  const isStartedRef = React.useRef(false);
  const turnstile = useCloudflareTurnstile();

  const handleSignInSuccess = React.useCallback(({ address, profile, rewardsToken }: { address: string; profile: UserInfo; rewardsToken?: string }) => {
    onSuccess({ type: 'success_wallet', address, isAuth, profile, rewardsToken });
  }, [ onSuccess, isAuth ]);

  const handleSignInError = React.useCallback(() => {
    onError(isAuth);
  }, [ onError, isAuth ]);

  const { start } = useSignInWithWallet({
    onSuccess: handleSignInSuccess,
    onError: handleSignInError,
    source,
    isAuth,
    fetchProtectedResource: turnstile.fetchProtectedResource,
    loginToRewards,
  });

  React.useEffect(() => {
    if (!isStartedRef.current) {
      isStartedRef.current = true;
      start();
    }
  }, [ start ]);

  return (
    <Center minH="100px" flexDir="column">
      { !turnstile.isInitError && <Spinner size="xl"/> }
      <CloudflareTurnstileInvisible { ...turnstile }/>
    </Center>
  );
};

export default React.memo(AuthModalScreenConnectWallet);
