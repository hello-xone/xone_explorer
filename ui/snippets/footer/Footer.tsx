import { Box, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';

import chain from 'configs/app/chain';
import { getEnvValue } from 'configs/app/utils';
import type { ResourceError } from 'lib/api/resources';
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

const Footer = () => {

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
    await handleAddToWalletClick();
  }, [ handleAddToWalletClick ]);

  const send = useCallback(async() => {
    if (email && isEmail(email)) {
      try {
        fetch(`${ getEnvValue('NEXT_PUBLIC_MAIL_API_HOST') }/api/subscribe/submit?token=087a1fef6489`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }).then(async res => {
          if (res.ok) {
            const result = await res.json() as { msg: string; code: number; data: string; message: string };
            setEmail('');
            if (result.code === 200) {
              toaster.success({
                title: 'Success',
                description: result.msg || result.message || 'Subscribed',
              });
            } else {
              toaster.error({
                title: 'Error',
                description: result.msg || result.data || 'Something went wrong',
              });
            }

          } else {
            const result = await res.json() as { msg: string };
            toaster.error({
              title: 'Error',
              description: result.msg || 'Something went wrong',
            });
          }
        });
        // apiFetch('xonePublic:subscribe', {
        //   fetchParams: {
        //     method: 'POST',
        //     body: {
        //       email: [ email ],
        //     },
        //   },
        // });
        // setEmail('');
        // toaster.success({
        //   title: 'Success',
        //   description: 'Subscribed',
        // });
      } catch(error) {
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

  }, [ email ]);

  return (
    <Box display={{ md: 'flex' }} as="footer" p={ 4 } borderTop="1px solid" borderColor="border.divider">
      <VStack alignItems="start" minH="140px" >
        <Button onClick={ onAddChain } bgColor={{ _light: 'theme.topbar.bg._light', _dark: 'theme.topbar.bg._dark' }} size="sm">
          <IconSvg name={ WALLETS_INFO['metamask'].icon } boxSize={ 6 } mr="2"/>
          <Text color={ buttonColor }>Add { chain.name } { chain.isTestnet ? '' : 'Mainnet' }</Text>
        </Button>
        <Box marginTop={ 6 }>
          <Box w={{ base: '100%', md: '386px' }} position="relative" marginBottom={ 4 }>
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
          <Box display="flex" fontSize="sm" color="#6B6A6A" gap={ 2 }>
            <Text mt="auto" fontSize="sm" color="#828E9D">&copy; 2025 Xone Foundation</Text>
            <Box ml={ 4 } pl={ 4 } display="flex" alignItems="center" borderLeft="1px" borderColor="#828E9D">
              <Link color="#828E9D" href="https://docs.xone.org/study/privacy" target="_blank">
                Privacy
              </Link>
              <Box w="2px" h="2px" borderRadius="full" bg="#828E9D" mx={ 4 }></Box>
              <Link color="#828E9D" href="https://docs.xone.org/study/service" target="_blank">
                Terms
              </Link>
            </Box>
          </Box>

        </Box>
      </VStack>
      <SimpleGrid mt={{ base: '5', md: '0' }} columns={{ base: 2, lg: 4 }} ml={{ md: 'auto' }} w="100%" maxW="500px" gap="4">
        <Links title="Xone" links={ [
          { text: 'Home', to: 'https://xone.org' },
          { text: 'About Us', to: 'https://docs.xone.org/study/xone' },
          { text: 'Bounty Hunter', to: 'https://docs.xone.org/study/bug' },
          { text: 'White Paper', to: 'https://docs.xone.org/study/wiki' },
          { text: 'Media Kit', to: 'https://docs.xone.org/study/media' },
          { text: 'Roadmap', to: 'https://docs.xone.org/study/roadmap' },
          // { text: 'Terms of Service', to: 'https://docs.xone.org/study/service' },
          // { text: 'Privacy Policy', to: 'https://docs.xone.org/study/privacy' },
          // { text: 'Events', to: 'https://lu.ma/xone' },
        ] }/>

        <Links title="Building" links={ [
          { text: 'Dev Center', to: 'https://xone.org/developer' },
          { text: 'Dev Docs', to: 'https://docs.xone.org/developers/ready' },
          { text: 'RPC Endpoints', to: 'https://docs.xone.org/developers/rpc' },
          { text: 'Dev Tools', to: 'https://docs.xone.org/developers/tools' },
          { text: 'Faucets', to: 'https://faucet.xone.org/' },
          { text: 'Status', to: 'https://status.xone.org/' },
          { text: 'Github', to: 'https://github.com/hello-xone' },
        ] }/>

        <Links title="Global" links={ [
          { text: 'Forum', to: 'https://forum.xone.org/' },
          { text: 'Cooperation', to: 'https://xone.org/commercial' },
          { text: 'Blog', to: 'https://docs.xone.org/blog' },
          { text: 'Events', to: 'https://luma.com/xone' },
        ] }/>

        <Links title="Community" links={ [
          { text: 'Telegram', to: 'https://t.me/hello_xonechain/2' },
          { text: 'X', to: 'https://x.com/xone_chain' },
          { text: 'Discord', to: 'https://discord.com/invite/Du9y2GHV' },
          { text: 'Youtube', to: 'https://www.youtube.com/@HelloXone' },
          { text: 'Github', to: 'https://github.com/hello-xone/' },
          { text: 'Reddit', to: 'https://www.reddit.com/r/XoneChain/' },
          { text: 'Medium', to: 'https://medium.com/@xone_chain' },
          { text: 'ChatMe', to: 'https://share.chatme.global/share/group/ztgqmws2k?lang=en&mode=light' },
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
