import { Box, Flex, Input, Stack, Text } from '@chakra-ui/react';
import React from 'react';

import { Button } from 'toolkit/chakra/button';
import { DialogBody, DialogContent, DialogHeader, DialogRoot } from 'toolkit/chakra/dialog';
import { toaster } from 'toolkit/chakra/toaster';
import IconSvg from 'ui/shared/IconSvg';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultAttestationUid?: string;
  defaultSchemaId?: string;
}

const RevokeAttestationModal = ({ isOpen, onClose, defaultAttestationUid = '', defaultSchemaId = '' }: Props) => {
  const [ attestationUid, setAttestationUid ] = React.useState('');
  const [ schemaId, setSchemaId ] = React.useState('');
  const [ isRevoking, setIsRevoking ] = React.useState(false);

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
  const handleRevoke = React.useCallback(() => {
    if (!validateForm()) {
      return;
    }

    setIsRevoking(true);

    // 模拟 API 调用
    setTimeout(() => {
      toaster.success({
        title: 'Attestation Revoked',
        description: `Attestation ${ attestationUid } has been successfully revoked.`,
      });

      setIsRevoking(false);
      onClose();
    }, 1500);
  }, [ validateForm, attestationUid, onClose ]);

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
              p={ 4 }
              borderRadius="lg"
              borderLeftWidth="4px"
              borderLeftColor="red.500"
              shadow="sm"
            >
              <Flex align="start" gap={ 3 }>
                <IconSvg
                  name="status/error"
                  boxSize={ 5 }
                  color="red.500"
                  flexShrink={ 0 }
                  mt={ 0.5 }
                />
                <Box flex={ 1 }>
                  <Text fontSize="md" fontWeight="700" color="red.700" _dark={{ color: 'red.300' }} mb={ 3 }>
                    Important Notice
                  </Text>
                  <Stack gap={ 2 } fontSize="sm" color="red.700" _dark={{ color: 'red.300' }} lineHeight="1.6">
                    <Flex gap={ 2 } align="start">
                      <Text fontWeight="600" mt={ 0.5 }>•</Text>
                      <Text flex={ 1 }>Revocation is irreversible, attestation will be permanently marked as revoked</Text>
                    </Flex>
                    <Flex gap={ 2 } align="start">
                      <Text fontWeight="600" mt={ 0.5 }>•</Text>
                      <Text flex={ 1 }>Only the attestation creator can revoke it</Text>
                    </Flex>
                    <Flex gap={ 2 } align="start">
                      <Text fontWeight="600" mt={ 0.5 }>•</Text>
                      <Text flex={ 1 }>Attestation must be set as revocable (revocable = true) when created</Text>
                    </Flex>
                    <Flex gap={ 2 } align="start">
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

            { /* 按钮组 */ }
            <Flex justify="flex-end" gap={ 3 } mt={ 6 } pt={ 4 } borderTopWidth="1px" borderColor="border.muted">
              <Button
                variant="outline"
                size="lg"
                onClick={ handleClose }
                disabled={ isRevoking }
                px={ 8 }
                fontWeight="600"
              >
                Cancel
              </Button>
              <Button
                colorPalette="red"
                size="lg"
                onClick={ handleRevoke }
                disabled={ isRevoking }
                loading={ isRevoking }
                px={ 8 }
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
