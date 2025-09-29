import React from 'react';

import useWeb3Wallet from 'lib/web3/useWallet';
import { useDisclosure } from 'toolkit/hooks/useDisclosure';

import AuthModal from './AuthModal';
import useProfileQuery from './useProfileQuery';

interface InjectedProps {
  onClick: () => void;
}

interface Props {
  children: (props: InjectedProps) => React.ReactNode;
  onAuthSuccess: () => void;
  ensureEmail?: boolean;
}

const AuthGuard = ({ children, onAuthSuccess, ensureEmail }: Props) => {
  const authModal = useDisclosure();
  const profileQuery = useProfileQuery();
  const web3Wallet = useWeb3Wallet({ source: 'Header' });

  const handleClick = React.useCallback(() => {
    if (web3Wallet.isConnected && web3Wallet.address) {
      onAuthSuccess();
    } else {
      web3Wallet.openModal();
    }
  }, [ web3Wallet, onAuthSuccess ]);

  const handleModalClose = React.useCallback((isSuccess?: boolean) => {
    if (isSuccess) {
      if (web3Wallet.isConnected && web3Wallet.address) {
        // If the user has logged in and has not added an email
        // we need to close the modal and open it again
        // so the initial screen will be correct
        authModal.onClose();
        window.setTimeout(() => {
          web3Wallet.openModal();
        }, 500);
        return;
      }
      onAuthSuccess();
    }
    authModal.onClose();
  }, [ authModal, web3Wallet, onAuthSuccess ]);

  return (
    <>
      { children({ onClick: handleClick }) }
      { authModal.open && (
        <AuthModal
          onClose={ handleModalClose }
          initialScreen={ profileQuery.data && !profileQuery.data.email && ensureEmail ? { type: 'email', isAuth: true } : { type: 'select_method' } }
        />
      ) }
    </>
  );
};

export default React.memo(AuthGuard);
