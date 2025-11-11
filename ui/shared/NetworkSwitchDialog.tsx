import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { useSwitchChain } from 'wagmi';

import { Button } from 'toolkit/chakra/button';
import {
  DialogActionTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from 'toolkit/chakra/dialog';
import { toaster } from 'toolkit/chakra/toaster';
import IconSvg from 'ui/shared/IconSvg';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentChainId: number | undefined;
  targetChainId: string | number;
  onSwitchSuccess?: () => void;
}

const NetworkSwitchDialog = ({ isOpen, onClose, currentChainId, targetChainId, onSwitchSuccess }: Props) => {
  const [ isSwitching, setIsSwitching ] = React.useState(false);
  const { switchChainAsync } = useSwitchChain();

  // Switch network
  const handleSwitchNetwork = React.useCallback(async() => {
    if (!targetChainId) {
      toaster.create({
        title: '❌ Configuration Error',
        description: 'Target network ID is not configured',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSwitching(true);
    try {
      await switchChainAsync?.({ chainId: Number(targetChainId) });
      onClose();

      toaster.create({
        title: '✅ Network Switched',
        description: 'Network switched successfully. You can continue with your operation.',
        type: 'success',
        duration: 3000,
      });

      onSwitchSuccess?.();
    } catch(error) {
      const err = error as { code?: number | string; message?: string };

      if (err?.code === 4001 || err?.message?.includes('User rejected')) {
        toaster.create({
          title: 'ℹ️ Request Cancelled',
          description: 'You cancelled the network switch request',
          type: 'info',
          duration: 3000,
        });
      } else {
        toaster.create({
          title: '❌ Network Switch Failed',
          description: err?.message || 'Unable to switch network. Please try switching manually in your wallet.',
          type: 'error',
          duration: 5000,
        });
      }
    } finally {
      setIsSwitching(false);
    }
  }, [ switchChainAsync, targetChainId, onClose, onSwitchSuccess ]);

  // Handle dialog close
  const handleOpenChange = React.useCallback((e: { open: boolean }) => {
    if (!isSwitching) {
      if (!e.open) {
        onClose();
      }
    }
  }, [ isSwitching, onClose ]);

  return (
    <DialogRoot
      open={ isOpen }
      onOpenChange={ handleOpenChange }
    >
      <DialogContent maxW="540px" borderRadius="xl">
        <DialogHeader pb={ 2 }>
          <DialogTitle fontSize="xl" fontWeight="bold">
            Switch Networks
          </DialogTitle>
        </DialogHeader>

        <DialogDescription>
          <Stack gap={ 4 }>
            <Text fontSize="sm" color="fg.muted" lineHeight="1.6">
              Please switch to the target network and continue with your operation.
            </Text>

            <Box
              p={ 4 }
              borderRadius="lg"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border"
            >
              <Stack gap={ 3 }>
                <Flex align="center" gap={ 2 }>
                  <Box
                    w={ 2 }
                    h={ 2 }
                    borderRadius="full"
                    bg="orange.500"
                  />
                  <Text fontSize="sm" color="fg.muted">
                    Current Network:
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="orange.600" fontFamily="mono">
                    Chain ID { currentChainId }
                  </Text>
                </Flex>

                <Flex align="center" justify="center">
                  <Text fontSize="lg" color="fg.muted">↓</Text>
                </Flex>

                <Flex align="center" gap={ 2 }>
                  <Box
                    w={ 2 }
                    h={ 2 }
                    borderRadius="full"
                    bg="green.500"
                  />
                  <Text fontSize="sm" color="fg.muted">
                    Target Network:
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="green.600" fontFamily="mono">
                    Chain ID { targetChainId }
                  </Text>
                </Flex>
              </Stack>
            </Box>

            <Box
              p={ 3 }
              borderRadius="md"
              bg="blue.50"
              borderWidth="1px"
              borderColor="blue.200"
              _dark={{ bg: 'blue.900/10', borderColor: 'blue.800' }}
            >
              <Flex gap={ 2 }>
                <IconSvg
                  name="info"
                  boxSize={ 4 }
                  color="blue.600"
                  _dark={{ color: 'blue.400' }}
                  mt={ 0.5 }
                />
                <Text fontSize="xs" color="blue.700" _dark={{ color: 'blue.300' }} lineHeight="1.5">
                  After clicking "Switch Network", please confirm the network switch in your wallet popup.
                </Text>
              </Flex>
            </Box>
          </Stack>
        </DialogDescription>

        <DialogFooter mt={ 6 }>
          <Flex gap={ 3 } w="100%" justify="flex-end">
            <DialogActionTrigger asChild>
              <Button
                variant="outline"
                size="md"
                disabled={ isSwitching }
                minW="120px"
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              colorPalette="orange"
              size="md"
              onClick={ handleSwitchNetwork }
              loading={ isSwitching }
              disabled={ isSwitching }
              minW="160px"
            >
              { isSwitching ? 'Switching...' : 'Switch Network' }
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default NetworkSwitchDialog;
