import { type ButtonProps } from '@chakra-ui/react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import React from 'react';

import { useMarketplaceContext } from 'lib/contexts/marketplace';
import useWeb3AccountWithDomain from 'lib/web3/useAccountWithDomain';
import useWeb3Wallet from 'lib/web3/useWallet';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from 'toolkit/chakra/popover';
import { useDisclosure } from 'toolkit/hooks/useDisclosure';

import UserWalletButton from './UserWalletButton';
import UserWalletMenuContent from './UserWalletMenuContent';

interface Props {
  buttonSize?: ButtonProps['size'];
  buttonVariant?: ButtonProps['variant'];
}

const UserWalletDesktop = ({ buttonSize, buttonVariant = 'header' }: Props) => {
  const walletMenu = useDisclosure();
  const { close } = useWeb3Modal();

  const web3Wallet = useWeb3Wallet({ source: 'Header' });
  const web3AccountWithDomain = useWeb3AccountWithDomain(web3Wallet.isConnected);
  const { isAutoConnectDisabled } = useMarketplaceContext();
  const isPending =
    (web3Wallet.isConnected && web3AccountWithDomain.isLoading) ||
    (!web3Wallet.isConnected && web3Wallet.isOpen);
  const handleOpenWalletClick = React.useCallback(() => {
    web3Wallet.openModal();
    walletMenu.onClose();
  }, [ web3Wallet, walletMenu ]);

  const handleDisconnectClick = React.useCallback(() => {
    web3Wallet.disconnect();
    walletMenu.onClose();
    close();
    localStorage.removeItem('wagmi.store');
    sessionStorage.removeItem('wagmi.store');
    localStorage.removeItem('w3m_last_connected');
    localStorage.removeItem('wagmi.recentConnectorId');
  }, [ close, web3Wallet, walletMenu ]);

  const handleOpenChange = React.useCallback(({ open }: { open: boolean }) => {
    if (!web3Wallet.isConnected) {
      web3Wallet.openModal();
      return;
    }

    if (open) {
      walletMenu.onOpen();
    } else {
      walletMenu.onClose();
    }
  }, [ walletMenu, web3Wallet ]);
  return (
    <PopoverRoot positioning={{ placement: 'bottom-end' }} lazyMount open={ walletMenu.open } onOpenChange={ handleOpenChange }>
      <PopoverTrigger>
        <UserWalletButton
          size={ buttonSize }
          variant={ buttonVariant }
          address={ web3AccountWithDomain.address }
          domain={ web3AccountWithDomain.domain }
          isPending={ isPending }
          isAutoConnectDisabled={ isAutoConnectDisabled }
        />
      </PopoverTrigger>
      { web3AccountWithDomain.address && walletMenu.open && (
        <PopoverContent w="235px">
          <PopoverBody>
            <UserWalletMenuContent
              address={ web3AccountWithDomain.address }
              domain={ web3AccountWithDomain.domain }
              isAutoConnectDisabled={ isAutoConnectDisabled }
              isReconnecting={ web3Wallet.isReconnecting }
              onOpenWallet={ handleOpenWalletClick }
              onDisconnect={ handleDisconnectClick }
            />
          </PopoverBody>
        </PopoverContent>
      ) }
    </PopoverRoot>
  );
};

export default React.memo(UserWalletDesktop);
