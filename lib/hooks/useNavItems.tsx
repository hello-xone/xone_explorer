import { useRouter } from 'next/router';
import React from 'react';

import type { NavItemInternal, NavItem, NavGroupItem } from 'types/client/navigation';

import config from 'configs/app';
import { rightLineArrow } from 'toolkit/utils/htmlEntities';

interface ReturnType {
  mainNavItems: Array<NavItem | NavGroupItem>;
  accountNavItems: Array<NavItem>;
}

export function isGroupItem(item: NavItem | NavGroupItem): item is NavGroupItem {
  return 'subItems' in item;
}

export function isInternalItem(item: NavItem): item is NavItemInternal {
  return 'nextRoute' in item;
}

export const useExtraNavItems = (): Array<NavItem | NavGroupItem> => {
  const router = useRouter();
  const pathname = router.pathname;

  return React.useMemo(() => {
    const isEasActive = pathname.startsWith('/eas');

    // 二级菜单项
    const easSubItems: Array<NavItem> = [
      {
        text: 'Overview',
        nextRoute: { pathname: '/eas' as const },
        isActive: pathname === '/eas',
      },
      {
        text: 'Schemas',
        nextRoute: { pathname: '/eas/schemas' as const },
        isActive: pathname === '/eas/schemas' || pathname.startsWith('/eas/schemaDetail') || pathname.startsWith('/eas/schemAttestationList'),
      },
      {
        text: 'Attestations',
        nextRoute: { pathname: '/eas/attestations' as const },
        isActive: pathname === '/eas/attestations' || pathname.startsWith('/eas/attestationDetail'),
      },
    ];

    return [
      {
        text: 'EAS',
        iconComponent: ({ size = 30, className }: { size?: number; className?: string }) => {
          return (
            <span className={ className } style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
              { /* 默认图标 (灰色) */ }
              <svg
                width={ size }
                height={ size }
                viewBox="0 0 22 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  opacity: isEasActive ? 0 : 1,
                  transition: 'opacity 0.2s ease',
                }}
                className="icon-default"
              >
                <path d="M12.3514 1H9.10811L1 22.9388V26H21V23.449L12.3514 1Z" fill="#262626"/>
                <path d="M11.9459 6H9.67568L4 21.7959V24H18V22.1633L11.9459 6Z" fill="white" fillOpacity="0.46"/>
                <path d="M11.5405 11H10.2432L7 20.6531V22H15V20.8776L11.5405 11Z" fill="white" fillOpacity="0.9"/>
              </svg>
              { /* Hover/Active 图标 (红色) */ }
              <svg
                width={ size }
                height={ size }
                viewBox="0 0 22 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  opacity: isEasActive ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }}
                className="icon-hover"
              >
                <path d="M12.3514 1H9.10811L1 22.9388V26H21V23.449L12.3514 1Z" fill="#FE0420"/>
                <path d="M11.9459 6H9.67568L4 21.7959V24H18V22.1633L11.9459 6Z" fill="white" fillOpacity="0.46"/>
                <path d="M11.5405 11H10.2432L7 20.6531V22H15V20.8776L11.5405 11Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </span>
          );
        },
        isActive: isEasActive,
        subItems: easSubItems,
      },
    ];
  }, [ pathname ]);
};

export default function useNavItems(): ReturnType {
  const router = useRouter();
  const pathname = router.pathname;

  return React.useMemo(() => {
    let blockchainNavItems: Array<NavItem> | Array<Array<NavItem>> = [];

    const topAccounts: NavItem | null = !config.UI.views.address.hiddenViews?.top_accounts ? {
      text: 'Top accounts',
      nextRoute: { pathname: '/accounts' as const },
      icon: 'top-accounts',
      isActive: pathname === '/accounts',
    } : null;
    const blocks: NavItem | null = {
      text: 'Blocks',
      nextRoute: { pathname: '/blocks' as const },
      icon: 'block',
      isActive: pathname === '/blocks' || pathname === '/block/[height_or_hash]' || pathname === '/chain/[chain-slug]/block/[height_or_hash]',
    };
    const txs: NavItem | null = {
      text: 'Transactions',
      nextRoute: { pathname: '/txs' as const },
      icon: 'transactions',
      isActive: pathname === '/txs' || pathname === '/tx/[hash]' || pathname === '/chain/[chain-slug]/tx/[hash]',
    };
    const operations: NavItem | null = config.features.tac.isEnabled ? {
      text: 'Operations',
      nextRoute: { pathname: '/operations' as const },
      icon: 'operation',
      isActive: pathname === '/operations' || pathname === '/operation/[id]',
    } : null;
    const internalTxs: NavItem | null = {
      text: 'Internal transactions',
      nextRoute: { pathname: '/internal-txs' as const },
      icon: 'internal_txns',
      isActive: pathname === '/internal-txs',
    };
    const userOps: NavItem | null = config.features.userOps.isEnabled ? {
      text: 'User operations',
      nextRoute: { pathname: '/ops' as const },
      icon: 'user_op',
      isActive: pathname === '/ops' || pathname === '/op/[hash]' || pathname === '/chain/[chain-slug]/op/[hash]',
    } : null;

    const verifiedContracts: NavItem | null =
    {
      text: 'Verified contracts',
      nextRoute: { pathname: '/verified-contracts' as const },
      icon: 'verified',
      isActive: pathname === '/verified-contracts',
    };
    const ensLookup = config.features.nameService.isEnabled ? {
      text: 'Name services lookup',
      nextRoute: { pathname: '/name-domains' as const },
      icon: 'ENS',
      isActive: pathname === '/name-domains' || pathname === '/name-domains/[name]',
    } : null;
    const validators = config.features.validators.isEnabled ? {
      text: 'Validators',
      nextRoute: { pathname: '/validators' as const },
      icon: 'validator',
      isActive: pathname === '/validators' || pathname === '/validators/[id]',
    } : null;
    const rollupDeposits = {
      text: `Deposits (L1${ rightLineArrow }L2)`,
      nextRoute: { pathname: '/deposits' as const },
      icon: 'arrows/south-east',
      isActive: pathname === '/deposits',
    };
    const rollupWithdrawals = {
      text: `Withdrawals (L2${ rightLineArrow }L1)`,
      nextRoute: { pathname: '/withdrawals' as const },
      icon: 'arrows/north-east',
      isActive: pathname === '/withdrawals',
    };
    const rollupTxnBatches = {
      text: 'Txn batches',
      nextRoute: { pathname: '/batches' as const },
      icon: 'txn_batches',
      isActive: pathname === '/batches',
    };
    const rollupOutputRoots = {
      text: 'Output roots',
      nextRoute: { pathname: '/output-roots' as const },
      icon: 'output_roots',
      isActive: pathname === '/output-roots',
    };
    const rollupDisputeGames = config.features.faultProofSystem.isEnabled ? {
      text: 'Dispute games',
      nextRoute: { pathname: '/dispute-games' as const },
      icon: 'games',
      isActive: pathname === '/dispute-games',
    } : null;
    const mudWorlds = config.features.mudFramework.isEnabled ? {
      text: 'MUD worlds',
      nextRoute: { pathname: '/mud-worlds' as const },
      icon: 'MUD_menu',
      isActive: pathname === '/mud-worlds',
    } : null;
    const epochs = config.features.celo.isEnabled ? {
      text: 'Epochs',
      nextRoute: { pathname: '/epochs' as const },
      icon: 'hourglass',
      isActive: pathname.startsWith('/epochs'),
    } : null;

    const rollupFeature = config.features.rollup;

    const rollupInteropMessages = rollupFeature.isEnabled && rollupFeature.interopEnabled ? {
      text: 'Interop messages',
      nextRoute: { pathname: '/interop-messages' as const },
      icon: 'interop',
      isActive: pathname === '/interop-messages',
    } : null;

    if (rollupFeature.isEnabled && (
      rollupFeature.type === 'optimistic' ||
      rollupFeature.type === 'arbitrum' ||
      rollupFeature.type === 'zkEvm' ||
      rollupFeature.type === 'scroll'
    )) {
      blockchainNavItems = [
        [
          txs,
          internalTxs,
          rollupDeposits,
          rollupWithdrawals,
          rollupInteropMessages,
        ].filter(Boolean),
        [
          blocks,
          rollupTxnBatches,
          rollupDisputeGames,
          rollupFeature.outputRootsEnabled ? rollupOutputRoots : undefined,
        ].filter(Boolean),
        [
          userOps,
          topAccounts,
          mudWorlds,
          validators,
          verifiedContracts,
          ensLookup,
        ].filter(Boolean),
      ];
    } else if (rollupFeature.isEnabled && rollupFeature.type === 'shibarium') {
      blockchainNavItems = [
        [
          txs,
          internalTxs,
          rollupDeposits,
          rollupWithdrawals,
        ],
        [
          blocks,
          userOps,
          topAccounts,
          verifiedContracts,
          ensLookup,
        ].filter(Boolean),
      ];
    } else if (rollupFeature.isEnabled && rollupFeature.type === 'zkSync') {
      blockchainNavItems = [
        [
          txs,
          internalTxs,
          userOps,
          blocks,
          rollupTxnBatches,
        ].filter(Boolean),
        [
          topAccounts,
          validators,
          verifiedContracts,
          ensLookup,
        ].filter(Boolean),
      ];
    } else {
      blockchainNavItems = [
        txs,
        operations,
        internalTxs,
        userOps,
        blocks,
        epochs,
        topAccounts,
        validators,
        verifiedContracts,
        ensLookup,
        config.features.beaconChain.isEnabled && {
          text: 'Deposits',
          nextRoute: { pathname: '/deposits' as const },
          icon: 'arrows/south-east',
          isActive: pathname === '/deposits',
        },
        config.features.beaconChain.isEnabled && {
          text: 'Withdrawals',
          nextRoute: { pathname: '/withdrawals' as const },
          icon: 'arrows/north-east',
          isActive: pathname === '/withdrawals',
        },
      ].filter(Boolean);
    }

    const tokensNavItems = [
      {
        text: 'Tokens',
        nextRoute: { pathname: '/tokens' as const },
        icon: 'token',
        isActive: pathname === '/tokens' || pathname.startsWith('/token/'),
      },
      {
        text: 'Token transfers',
        nextRoute: { pathname: '/token-transfers' as const },
        icon: 'token-transfers',
        isActive: pathname === '/token-transfers',
      },
      config.features.pools.isEnabled && {
        text: 'DEX tracker',
        nextRoute: { pathname: '/pools' as const },
        icon: 'token',
        isActive: pathname === '/pools' || pathname.startsWith('/pool/'),
      },
    ].filter(Boolean);

    const apiNavItem: NavItem | null = config.features.apiDocs.isEnabled ? {
      text: 'API',
      nextRoute: { pathname: '/api-docs' as const },
      icon: 'restAPI',
      isActive: pathname.startsWith('/api-docs'),
    } : null;

    const otherNavItems: Array<NavItem> | Array<Array<NavItem>> = [
      config.features.opSuperchain.isEnabled ? {
        text: 'Verify contract',
        // TODO @tom2drum adjust URL to Vera
        url: 'https://vera.blockscout.com',
      } : {
        text: 'Verify contract',
        nextRoute: { pathname: '/contract-verification' as const },
        isActive: pathname.startsWith('/contract-verification'),
      },
      {
        text: 'Submit public tag',
        nextRoute: { pathname: '/public-tags/submit' as const },
        isActive: pathname.startsWith('/public-tags/submit'),
      },
      config.features.gasTracker.isEnabled && {
        text: 'Gas tracker',
        nextRoute: { pathname: '/gas-tracker' as const },
        isActive: pathname.startsWith('/gas-tracker'),
      },
      rollupFeature.isEnabled && rollupFeature.type === 'arbitrum' && {
        text: 'Txn withdrawals',
        nextRoute: { pathname: '/txn-withdrawals' as const },
        isActive: pathname.startsWith('/txn-withdrawals'),
      },
      ...config.UI.navigation.otherLinks,
    ].filter(Boolean);

    const mainNavItems: ReturnType['mainNavItems'] = [
      {
        text: 'Blockchain',
        icon: 'globe-b',
        isActive: blockchainNavItems.flat().some(item => isInternalItem(item) && item.isActive),
        subItems: blockchainNavItems,
      },
      {
        text: 'Tokens',
        icon: 'token',
        isActive: tokensNavItems.flat().some(item => isInternalItem(item) && item.isActive),
        subItems: tokensNavItems,
      },
      config.features.marketplace.isEnabled ? {
        text: 'DApps',
        nextRoute: { pathname: '/apps' as const },
        icon: 'apps',
        isActive: pathname.startsWith('/app'),
      } : null,
      config.features.stats.isEnabled ? {
        text: 'Charts & stats',
        nextRoute: { pathname: '/stats' as const },
        icon: 'stats',
        isActive: pathname.startsWith('/stats'),
      } : null,
      {
        text: 'BVI',
        icon: 'bvi',
        url: 'https://bvi.xone.org',
        isActive: false,
      },
      apiNavItem,
      {
        text: 'Other',
        icon: 'gear',
        isActive: otherNavItems.flat().some(item => isInternalItem(item) && item.isActive),
        subItems: otherNavItems,
      },
    ].filter(Boolean);

    const accountNavItems: ReturnType['accountNavItems'] = [
      {
        text: 'Watch list',
        nextRoute: { pathname: '/account/watchlist' as const },
        icon: 'watchlist',
        isActive: pathname === '/account/watchlist',
      },
      {
        text: 'Private tags',
        nextRoute: { pathname: '/account/tag-address' as const },
        icon: 'privattags',
        isActive: pathname === '/account/tag-address',
      },
      {
        text: 'API keys',
        nextRoute: { pathname: '/account/api-key' as const },
        icon: 'API',
        isActive: pathname === '/account/api-key',
      },
      {
        text: 'Custom ABI',
        nextRoute: { pathname: '/account/custom-abi' as const },
        icon: 'ABI',
        isActive: pathname === '/account/custom-abi',
      },
      config.features.addressVerification.isEnabled && {
        text: 'Verified addrs',
        nextRoute: { pathname: '/account/verified-addresses' as const },
        icon: 'verified',
        isActive: pathname === '/account/verified-addresses',
      },
    ].filter(Boolean);

    return { mainNavItems, accountNavItems };
  }, [ pathname ]);
}
