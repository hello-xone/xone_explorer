import { Box, Flex, Input, Stack, Text } from '@chakra-ui/react';
import { EAS } from '@ethereum-attestation-service/eas-sdk';
import React from 'react';

import useEthersSigner from 'lib/web3/useEthersSigner';
import { Button } from 'toolkit/chakra/button';
import { DialogBody, DialogContent, DialogHeader, DialogRoot } from 'toolkit/chakra/dialog';
import { toaster } from 'toolkit/chakra/toaster';
import IconSvg from 'ui/shared/IconSvg';

import { EAS_CONFIG } from './constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultAttestationUid?: string;
  defaultSchemaId?: string;
  onRevokeComplete?: (uid: string) => void;
  onRevokeError?: (error: Error) => void;
}

const RevokeAttestationModal = ({
  isOpen,
  onClose,
  defaultAttestationUid = '',
  defaultSchemaId = '',
  onRevokeComplete,
  onRevokeError,
}: Props) => {
  const [ attestationUid, setAttestationUid ] = React.useState('');
  const [ schemaId, setSchemaId ] = React.useState('');
  const [ isRevoking, setIsRevoking ] = React.useState(false);
  const [ loadingStatus, setLoadingStatus ] = React.useState('');

  // 获取 signer
  const signer = useEthersSigner();

  // 初始化字段值
  React.useEffect(() => {
    if (isOpen) {
      setAttestationUid(defaultAttestationUid);
      setSchemaId(defaultSchemaId);
    }
  }, [ isOpen, defaultAttestationUid, defaultSchemaId ]);

  // 验证表单
  const validateForm = React.useCallback(() => {
    // 验证 Attestation UID 格式
    if (!attestationUid || !attestationUid.match(/^0x[a-fA-F0-9]{64}$/)) {
      toaster.error({
        title: 'Validation Failed',
        description: 'Invalid Attestation UID format. Must be a 66-character hex string starting with 0x.',
      });
      return false;
    }

    // 验证 Schema ID 格式
    if (!schemaId || !schemaId.match(/^0x[a-fA-F0-9]{64}$/)) {
      toaster.error({
        title: 'Validation Failed',
        description: 'Invalid Schema ID format. Must be a 66-character hex string starting with 0x.',
      });
      return false;
    }

    return true;
  }, [ attestationUid, schemaId ]);

  // 处理撤销
  const handleRevoke = React.useCallback(async() => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsRevoking(true);
      setLoadingStatus('Validating...');

      /* eslint-disable no-console */
      console.log('\n=== 🔄 Starting Attestation Revocation ===');
      console.log('EAS Contract Address:', EAS_CONFIG.contractAddress);
      console.log('Attestation UID:', attestationUid);
      console.log('Schema ID:', schemaId);

      // 1. 验证输入
      if (!attestationUid || attestationUid.trim() === '') {
        toaster.create({
          title: '❌ Please Enter Attestation UID',
          description: 'Attestation UID cannot be empty',
          type: 'error',
        });
        return;
      }

      // 验证 UID 格式（应该是 66 字符的十六进制字符串，包括 0x）
      if (!attestationUid.startsWith('0x') || attestationUid.length !== 66) {
        toaster.create({
          title: '❌ Invalid UID Format',
          description: 'Attestation UID should be a 64-character hex string starting with 0x',
          type: 'error',
        });
        return;
      }

      if (!schemaId || schemaId.trim() === '') {
        toaster.create({
          title: '❌ Please Enter Schema ID',
          description: 'Schema ID cannot be empty',
          type: 'error',
        });
        return;
      }

      if (!schemaId.startsWith('0x') || schemaId.length !== 66) {
        toaster.create({
          title: '❌ Invalid Schema ID Format',
          description: 'Schema ID should be a 64-character hex string starting with 0x',
          type: 'error',
        });
        return;
      }

      // 2. 检查 signer
      if (!signer) {
        toaster.create({
          title: '❌ Wallet Not Connected',
          description: 'Please connect your wallet before revoking attestation',
          type: 'error',
        });
        return;
      }

      console.log('✅ All validations passed');

      // 3. 初始化 EAS
      setLoadingStatus('Initializing EAS...');
      console.log('\n🔍 Step 1: Initialize EAS');

      if (!EAS_CONFIG.contractAddress) {
        toaster.create({
          title: '❌ Configuration Error',
          description: 'EAS contract address is not configured',
          type: 'error',
        });
        return;
      }

      const eas = new EAS(EAS_CONFIG.contractAddress);
      eas.connect(signer);
      console.log('✅ EAS connected');

      // 4. 撤销 attestation
      setLoadingStatus('Sending revoke transaction...');
      console.log('\n📝 Step 2: Revoke attestation');
      console.log('Sending revoke transaction...');

      const tx = await eas.revoke({
        schema: schemaId,
        data: {
          uid: attestationUid,
          value: BigInt(0), // 通常为 0，除非需要额外费用
        },
      });

      console.log('✅ Revoke transaction sent');

      setLoadingStatus('Waiting for confirmation...');
      console.log('\n⏳ Step 3: Waiting for transaction confirmation');
      await tx.wait();
      console.log('✅ Transaction confirmed');
      console.log('\n🎉 Attestation revoked successfully!');
      console.log('   UID:', attestationUid);

      const uidShort = `${ attestationUid.slice(0, 10) }...${ attestationUid.slice(-8) }`;
      const refreshMsg = `Please refresh after ${ EAS_CONFIG.refreshTime } seconds to see the updated record.`;
      toaster.create({
        title: '✅ Attestation Revoked Successfully',
        description: `Successfully revoked attestation ${ uidShort }. ${ refreshMsg }`,
        type: 'success',
      });

      console.log('=== ✅ Attestation revocation flow completed ===\n');
      /* eslint-enable no-console */

      onRevokeComplete?.(attestationUid);

      // 关闭弹窗
      onClose();

      // 如果不是初始提供的 UID，重置表单
      if (!defaultAttestationUid) {
        setAttestationUid('');
        setSchemaId('');
      }
    } catch(error) {
      /* eslint-disable no-console */
      console.error('\n=== ❌ Attestation Revocation Failed ===');
      console.error('Full error:', error);
      console.error('Error code:', (error as { code?: string })?.code);
      console.error('Error reason:', (error as { reason?: string })?.reason);
      /* eslint-enable no-console */

      const err = error as { code?: string; reason?: string; message?: string };
      let errorTitle = '❌ Failed to Revoke Attestation';
      let errorDescription = '';

      if (err?.code === 'ACTION_REJECTED') {
        errorTitle = '❌ Transaction Rejected';
        errorDescription = 'You cancelled the transaction signature';
      } else if (err?.code === 'INSUFFICIENT_FUNDS') {
        errorTitle = '❌ Insufficient Funds';
        errorDescription = 'Account doesn\'t have enough gas fees';
      } else if (err?.code === 'CALL_EXCEPTION') {
        errorTitle = '❌ Contract Call Failed';
        errorDescription = 'Possible causes: attestation doesn\'t exist, not revocable, you\'re not the creator, schema ID mismatch, or already revoked';
      } else if (err?.code === 'NETWORK_ERROR') {
        errorTitle = '❌ Network Error';
        errorDescription = 'Unable to connect to RPC node';
      } else if (err?.message) {
        errorDescription = err.message;
      } else {
        errorDescription = 'Unknown error, please check console logs';
      }

      toaster.create({
        title: errorTitle,
        description: errorDescription,
        type: 'error',
      });

      onRevokeError?.(error as Error);
    } finally {
      setIsRevoking(false);
      setLoadingStatus('');
    }
  }, [ validateForm, attestationUid, schemaId, signer, defaultAttestationUid, onRevokeComplete, onRevokeError, onClose ]);

  // 处理 Attestation UID 变化
  const handleAttestationUidChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAttestationUid(e.target.value);
  }, []);

  // 处理 Schema ID 变化
  const handleSchemaIdChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSchemaId(e.target.value);
  }, []);

  // 重置表单
  const handleClose = React.useCallback(() => {
    setAttestationUid('');
    setSchemaId('');
    setIsRevoking(false);
    onClose();
  }, [ onClose ]);

  // 处理 Dialog 状态变化
  const handleOpenChange = React.useCallback((e: { open: boolean }) => {
    if (!e.open && !isRevoking) {
      handleClose();
    }
  }, [ isRevoking, handleClose ]);

  return (
    <DialogRoot
      open={ isOpen }
      onOpenChange={ handleOpenChange }
      size="xl"
    >
      <DialogContent>
        <DialogHeader fontSize="32px" fontWeight="bold" pb={ 2 }>
          Revoke Attestation
        </DialogHeader>

        <DialogBody>
          <Stack gap={ 6 }>
            { /* 描述 */ }
            <Text fontSize="md" color="fg.muted">
              Revoke an existing attestation (this action is irreversible)
            </Text>

            { /* 重要提示框 */ }
            <Box
              bg="red.50"
              _dark={{ bg: 'red.950' }}
              p={{ base: 3, md: 4 }}
              borderRadius={{ base: 'md', md: 'lg' }}
              borderLeftWidth={{ base: '3px', md: '4px' }}
              borderLeftColor="red.500"
              shadow="sm"
            >
              <Flex align="start" gap={{ base: 2, md: 3 }}>
                <IconSvg
                  name="status/error"
                  boxSize={{ base: 4, md: 5 }}
                  color="red.500"
                  flexShrink={ 0 }
                  mt={{ base: 0.5, md: 0.5 }}
                />
                <Box flex={ 1 }>
                  <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="700"
                    color="red.700"
                    _dark={{ color: 'red.300' }}
                    mb={{ base: 2, md: 3 }}
                  >
                    Important Notice
                  </Text>
                  <Stack
                    gap={{ base: 1.5, md: 2 }}
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color="red.700"
                    _dark={{ color: 'red.300' }}
                    lineHeight={{ base: '1.5', md: '1.6' }}
                  >
                    <Flex gap={{ base: 1.5, md: 2 }} align="start">
                      <Text fontWeight="600" mt={ 0.5 }>•</Text>
                      <Text flex={ 1 }>Revocation is irreversible, attestation will be permanently marked as revoked</Text>
                    </Flex>
                    <Flex gap={{ base: 1.5, md: 2 }} align="start">
                      <Text fontWeight="600" mt={ 0.5 }>•</Text>
                      <Text flex={ 1 }>Only the attestation creator can revoke it</Text>
                    </Flex>
                    <Flex gap={{ base: 1.5, md: 2 }} align="start">
                      <Text fontWeight="600" mt={ 0.5 }>•</Text>
                      <Text flex={ 1 }>Attestation must be set as revocable (revocable = true) when created</Text>
                    </Flex>
                    <Flex gap={{ base: 1.5, md: 2 }} align="start">
                      <Text fontWeight="600" mt={ 0.5 }>•</Text>
                      <Text flex={ 1 }>This operation requires gas fees</Text>
                    </Flex>
                  </Stack>
                </Box>
              </Flex>
            </Box>

            { /* Attestation UID */ }
            <Stack gap={ 2 }>
              <Flex align="center" gap={ 1 } mb={ 1 }>
                <Text fontSize="sm" fontWeight="600" textTransform="uppercase" letterSpacing="0.05em">
                  Attestation UID
                </Text>
                <Text fontSize="sm" color="red.500" fontWeight="700">
                  *
                </Text>
              </Flex>
              <Input
                placeholder="0x0000000000000000000000000000000000000000000000000000000000000000"
                value={ attestationUid }
                onChange={ handleAttestationUidChange }
                size="lg"
                fontFamily="mono"
                fontSize="sm"
                bg="bg.subtle"
                _focus={{ bg: 'bg', borderColor: 'blue.500' }}
              />
              <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                Unique identifier of the attestation to revoke (66 characters including 0x)
              </Text>
            </Stack>

            { /* Schema ID */ }
            <Stack gap={ 2 }>
              <Flex align="center" gap={ 1 } mb={ 1 }>
                <Text fontSize="sm" fontWeight="600" textTransform="uppercase" letterSpacing="0.05em">
                  Schema ID
                </Text>
                <Text fontSize="sm" color="red.500" fontWeight="700">
                  *
                </Text>
              </Flex>
              <Input
                placeholder="0x0000000000000000000000000000000000000000000000000000000000000000"
                value={ schemaId }
                onChange={ handleSchemaIdChange }
                size="lg"
                fontFamily="mono"
                fontSize="sm"
                bg="bg.subtle"
                _focus={{ bg: 'bg', borderColor: 'blue.500' }}
              />
              <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
                Schema ID that the attestation belongs to (66 characters including 0x)
              </Text>
            </Stack>

            { /* Loading Status */ }
            { isRevoking && loadingStatus && (
              <Box mt={ 4 } textAlign="center">
                <Text fontSize="sm" color="fg.muted">{ loadingStatus }</Text>
              </Box>
            ) }

            { /* 按钮组 */ }
            <Flex justify="flex-end" gap={ 3 } mt={ 6 } pt={ 4 } borderTopWidth="1px" borderColor="border.muted">
              <Button
                variant="outline"
                size="md"
                onClick={ handleClose }
                disabled={ isRevoking }
                px={ 6 }
                fontWeight="600"
              >
                Cancel
              </Button>
              <Button
                colorPalette="red"
                size="md"
                onClick={ handleRevoke }
                disabled={ isRevoking }
                loading={ isRevoking }
                px={ 6 }
                fontWeight="600"
                shadow="sm"
                _hover={{ shadow: 'md' }}
              >
                Confirm Revoke
              </Button>
            </Flex>
          </Stack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default RevokeAttestationModal;
