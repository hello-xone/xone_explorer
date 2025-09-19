import { Box, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';

import chain from 'configs/app/chain';
import type { ResourceError } from 'lib/api/resources';
import useApiFetch from 'lib/api/useApiFetch';
import useAddChainClick from 'lib/web3/useAddChainClick';
import { WALLETS_INFO } from 'lib/web3/wallets';
import { Button } from 'toolkit/chakra/button';
import { useColorModeValue } from 'toolkit/chakra/color-mode';
import { Heading } from 'toolkit/chakra/heading';
import { Link } from 'toolkit/chakra/link';
import { toaster } from 'toolkit/chakra/toaster';
import { isEmail } from 'ui/address/contract/methods/utils';
import IconSvg from 'ui/shared/IconSvg';

import EmailInput from './EmailInput';

//   const { data: backendVersionData } = useApiQuery('general:config_backend_version', {
//     queryOptions: {
//       staleTime: Infinity,
//       enabled: !config.features.opSuperchain.isEnabled,
//     },
//   });
//   const apiVersionUrl = getApiVersionUrl(backendVersionData?.backend_version);
//   const issueUrl = useIssueUrl(backendVersionData?.backend_version);

//   const BLOCKSCOUT_LINKS = [
//     {
//       icon: 'edit' as const,
//       iconSize: '16px',
//       text: 'Submit an issue',
//       url: issueUrl,
//     },
//     {
//       icon: 'social/git' as const,
//       iconSize: '18px',
//       text: 'Contribute',
//       url: 'https://github.com/blockscout/blockscout',
//     },
//     {
//       icon: 'social/twitter' as const,
//       iconSize: '18px',
//       text: 'X (ex-Twitter)',
//       url: 'https://x.com/blockscout',
//     },
//     {
//       icon: 'social/discord' as const,
//       iconSize: '24px',
//       text: 'Discord',
//       url: 'https://discord.gg/blockscout',
//     },
//     {
//       icon: 'brands/blockscout' as const,
//       iconSize: '18px',
//       text: 'All chains',
//       url: 'https://www.blockscout.com/chains-and-projects',
//     },
//     {
//       icon: 'donate' as const,
//       iconSize: '20px',
//       text: 'Donate',
//       url: 'https://eth.blockscout.com/address/0xfB4aF6A8592041E9BcE186E5aC4BDbd2B137aD11',
//     },
//   ];

//   const frontendLink = (() => {
//     if (config.UI.footer.frontendVersion) {
//       return <Link href={ FRONT_VERSION_URL } target="_blank">{ config.UI.footer.frontendVersion }</Link>;
//     }

//     if (config.UI.footer.frontendCommit) {
//       return <Link href={ FRONT_COMMIT_URL } target="_blank">{ config.UI.footer.frontendCommit }</Link>;
//     }

//     return null;
//   })();

//   const fetch = useFetch();

//   const { isPlaceholderData, data: linksData } = useQuery<unknown, ResourceError<unknown>, Array<CustomLinksGroup>>({
//     queryKey: [ 'footer-links' ],
//     queryFn: async() => fetch(config.UI.footer.links || '', undefined, { resource: 'footer-links' }),
//     enabled: Boolean(config.UI.footer.links),
//     staleTime: Infinity,
//     placeholderData: [],
//   });

//   const colNum = isPlaceholderData ? 1 : Math.min(linksData?.length || Infinity, MAX_LINKS_COLUMNS) + 1;

//   const renderNetworkInfo = React.useCallback((gridArea?: GridProps['gridArea']) => {
//     return (
//       <Flex
//         gridArea={ gridArea }
//         flexWrap="wrap"
//         columnGap={ 8 }
//         rowGap={ 6 }
//         mb={{ base: 5, lg: 10 }}
//         _empty={{ display: 'none' }}
//       >
//         { !config.UI.indexingAlert.intTxs.isHidden && <IntTxsIndexingStatus/> }
//         <NetworkAddToWallet/>
//       </Flex>
//     );
//   }, []);

//   const renderProjectInfo = React.useCallback((gridArea?: GridProps['gridArea']) => {
//     const logoColor = { base: 'blue.600', _dark: 'white' };

//     return (
//       <Box gridArea={ gridArea }>
//         <Flex columnGap={ 2 } textStyle="xs" alignItems="center">
//           <span>Made with</span>
//           <Link href="https://www.blockscout.com" target="_blank" display="inline-flex" color={ logoColor } _hover={{ color: logoColor }}>
//             <IconSvg
//               name="networks/logo-placeholder"
//               width="80px"
//               height={ 4 }
//             />
//           </Link>
//         </Flex>
//         <Text mt={ 3 } fontSize="xs">
//           Blockscout is a tool for inspecting and analyzing EVM based blockchains. Blockchain explorer for Ethereum Networks.
//         </Text>
//         <Box mt={ 6 } alignItems="start" textStyle="xs">
//           { apiVersionUrl && (
//             <Text>
//               Backend: <Link href={ apiVersionUrl } target="_blank">{ backendVersionData?.backend_version }</Link>
//             </Text>
//           ) }
//           { frontendLink && (
//             <Text>
//               Frontend: { frontendLink }
//             </Text>
//           ) }
//           <Text>
//             Copyright { copy } Blockscout Limited 2023-{ (new Date()).getFullYear() }
//           </Text>
//         </Box>
//       </Box>
//     );
//   }, [ apiVersionUrl, backendVersionData?.backend_version, frontendLink ]);

//   const containerProps: HTMLChakraProps<'div'> = {
//     as: 'footer',
//     borderTopWidth: '1px',
//     borderTopColor: 'border.divider',
//   };

//   const contentProps: GridProps = {
//     px: { base: 4, lg: config.UI.navigation.layout === 'horizontal' ? 6 : 12, '2xl': 6 },
//     py: { base: 4, lg: 8 },
//     gridTemplateColumns: { base: '1fr', lg: 'minmax(auto, 470px) 1fr' },
//     columnGap: { lg: '32px', xl: '100px' },
//     maxW: `${ CONTENT_MAX_WIDTH }px`,
//     m: '0 auto',
//   };

//   const renderRecaptcha = (gridArea?: GridProps['gridArea']) => {
//     if (!config.services.reCaptchaV2.siteKey) {
//       return <Box gridArea={ gridArea }/>;
//     }

//     return (
//       <Box gridArea={ gridArea } textStyle="xs" mt={ 6 }>
//         <span>This site is protected by reCAPTCHA and the Google </span>
//         <Link href="https://policies.google.com/privacy" external noIcon>Privacy Policy</Link>
//         <span> and </span>
//         <Link href="https://policies.google.com/terms" external noIcon>Terms of Service</Link>
//         <span> apply.</span>
//       </Box>
//     );
//   };

//   if (config.UI.footer.links) {
//     return (
//       <Box { ...containerProps }>
//         <Grid { ...contentProps }>
//           <div>
//             { renderNetworkInfo() }
//             { renderProjectInfo() }
//             { renderRecaptcha() }
//           </div>

//           <Grid
//             gap={{ base: 6, lg: colNum === MAX_LINKS_COLUMNS + 1 ? 2 : 8, xl: 12 }}
//             gridTemplateColumns={{
//               base: 'repeat(auto-fill, 160px)',
//               lg: `repeat(${ colNum }, 135px)`,
//               xl: `repeat(${ colNum }, 160px)`,
//             }}
//             justifyContent={{ lg: 'flex-end' }}
//             mt={{ base: 8, lg: 0 }}
//           >
//             {
//               ([
//                 { title: 'Blockscout', links: BLOCKSCOUT_LINKS },
//                 ...(linksData || []),
//               ])
//                 .slice(0, colNum)
//                 .map(linkGroup => (
//                   <Box key={ linkGroup.title }>
//                     <Skeleton fontWeight={ 500 } mb={ 3 } display="inline-block" loading={ isPlaceholderData }>{ linkGroup.title }</Skeleton>
//                     <VStack gap={ 1 } alignItems="start">
//                       { linkGroup.links.map(link => <FooterLinkItem { ...link } key={ link.text } isLoading={ isPlaceholderData }/>) }
//                     </VStack>
//                   </Box>
//                 ))
//             }
//           </Grid>
//         </Grid>
//       </Box>
//     );
//   }

//   return (
//     <Box { ...containerProps }>
//       <Grid
//         { ...contentProps }
//         gridTemplateAreas={{
//           lg: `
//           "network links-top"
//           "info links-bottom"
//           "recaptcha links-bottom"
//         `,
//         }}
//       >

//         { renderNetworkInfo({ lg: 'network' }) }
//         { renderProjectInfo({ lg: 'info' }) }
//         { renderRecaptcha({ lg: 'recaptcha' }) }

//         <Grid
//           gridArea={{ lg: 'links-bottom' }}
//           gap={ 1 }
//           gridTemplateColumns={{
//             base: 'repeat(auto-fill, 160px)',
//             lg: 'repeat(2, 160px)',
//             xl: 'repeat(3, 160px)',
//           }}
//           gridTemplateRows={{
//             base: 'auto',
//             lg: 'repeat(3, auto)',
//             xl: 'repeat(2, auto)',
//           }}
//           gridAutoFlow={{ base: 'row', lg: 'column' }}
//           alignContent="start"
//           justifyContent={{ lg: 'flex-end' }}
//           mt={{ base: 8, lg: 0 }}
//         >
//           { BLOCKSCOUT_LINKS.map(link => <FooterLinkItem { ...link } key={ link.text }/>) }
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

const Footer = () => {
  const apiFetch = useApiFetch();

  const handleAddToWalletClick = useAddChainClick();
  const [ email, setEmail ] = useState<string>('');
  const buttonColor = useColorModeValue('black', 'white');
  // const formik = useFormik({
  //   initialValues: {
  //     email: '',
  //   },
  //   onSubmit: () => { },
  // });
  // const { values, getFieldProps, setFieldValue } = formik;
  const onAddChain = useCallback(async() => {
    try {
      await handleAddToWalletClick();
      toaster.success({
        title: 'Success',
        description: 'Successfully added network to your wallet',
      });
    } catch (error) {
      toaster.error({
        title: 'Error',
        description: (error as Error)?.message || 'Something went wrong',
      });

    }
  }, [ handleAddToWalletClick ]);

  const send = useCallback(async() => {
    if (email && isEmail(email)) {
      try {
        apiFetch('xonePublic:subscribe', {
          fetchParams: {
            method: 'POST',
            body: {
              email: [ email ],
            },
          },
        });
        setEmail('');
        toaster.success({
          title: 'Success',
          description: 'Subscribed',
        });
      } catch (error) {
        toaster.error({
          title: 'Error',
          description: (error as ResourceError<{ message: string }>)?.payload?.message || 'Something went wrong. Try again later.',
        });
      }
    } else {
      toaster.error({
        title: 'Error',
        description: 'Please enter a valid email address',
      });
    }

  }, [ apiFetch, email ]);

  return (
    <Box display={{ md: 'flex' }} as="footer" p={ 4 } borderTop="1px solid" borderColor="divider">
      <VStack alignItems="start" minH="140px" >
        <Button variant="outline" borderColor="priRed.500" onClick={ onAddChain } _hover={{
          borderColor: 'priRed.700',
        }} size="sm">
          <IconSvg name={ WALLETS_INFO['metamask'].icon } boxSize={ 6 } mr="2"/>
          <Text color={ buttonColor }>Add { chain.name }</Text>
        </Button>
        <Box marginTop={ 6 }>
          <Box w="386px" position="relative" marginBottom={ 4 }>
            <Heading fontSize="lg" mb={ 4 } color={ buttonColor }>Subscribe to Newsletter</Heading>
            <Box fontSize="sm" color="#6B6A6A" mb={ 4 } >
              Xone Chain is a modular Layer-1 that goes beyond scalability and efficiency, ensuring every on-chain action creates tangible, traceable value.
            </Box>
            <Box display="flex" alignItems="center" gap={ 2 }>
              <EmailInput email={ email } setEmail={ setEmail }></EmailInput>
              <Button onClick={ send } size="sm" flexShrink={ 0 }>
                Join
              </Button>
            </Box>
          </Box>
          <Text mt="auto" fontSize="sm" color="#828E9D">&copy; 2025 Xone.</Text>
        </Box>
      </VStack>
      <SimpleGrid mt={{ base: '5', md: '0' }} columns={{ base: 2, lg: 3 }} ml={{ md: 'auto' }} w="100%" maxW="500px" gap="4">
        <Links title="Xone" links={ [
          { text: 'Home', to: 'https://xone.org' },
          { text: 'About', to: 'https://docs.xone.org/study/xone' },
          { text: 'Terms of Service', to: 'https://docs.xone.org/study/service' },
          { text: 'Privacy Policy', to: 'https://docs.xone.org/study/privacy' },
          { text: 'Events', to: 'https://lu.ma/xone' },
        ] }/>

        <Links title="Developers" links={ [
          { text: 'Docs', to: 'https://docs.xone.org/developers/ready' },
          { text: 'RPC Endpoints', to: 'https://docs.xone.org/developers/rpc' },
          { text: 'Tools', to: 'https://docs.xone.org/developers/tools' },
          { text: 'Faucets', to: 'https://faucet.xone.org/' },
          { text: 'Github', to: 'https://github.com/hello-xone' },
          { text: 'Gmail', to: 'mailto:developers@xone.org' },
        ] }/>

        <Links title="Community" links={ [
          { text: 'Telegram', to: 'https://t.me/hello_xonechain/2' },
          { text: 'X', to: 'https://x.com/xone_chain' },
          { text: 'Youtube', to: 'https://www.youtube.com/@HelloXone' },
          { text: 'Medium', to: 'https://medium.com/@xone_chain' },
        ] }/>

      </SimpleGrid>
    </Box>
  );
};

const Links = ({ title, links }: { title: string; links: Array<{ text: string; to: string }> }) => {
  const titleColor = useColorModeValue('black', 'white');
  const hoverColor = useColorModeValue('black', 'white');
  return (
    <Box>
      <Heading fontSize="lg" color={ titleColor }>{ title }</Heading>
      <Box>
        { links.map((li, i) => {
          return (
            <Box key={ i } py="1">
              <Link href={ li.to || '' } color="#6B6A6A" _hover={{
                color: hoverColor,
              }} fontSize="sm">{ li.text }</Link>
            </Box>
          );
        }) }
      </Box>
    </Box>
  );
};

export default React.memo(Footer);
