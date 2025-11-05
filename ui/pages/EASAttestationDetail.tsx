import { Box, Flex, Grid, GridItem, HStack, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import dayjs from 'lib/date/dayjs';
import { GET_ATTESTATION_DETAIL } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import { Badge } from 'toolkit/chakra/badge';
import { Button } from 'toolkit/chakra/button';
import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { EAS_CONFIG } from 'ui/eas/constants';
import RevokeAttestationModal from 'ui/eas/RevokeAttestationModal';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import DataListDisplay from 'ui/shared/DataListDisplay';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import TxEntity from 'ui/shared/entities/tx/TxEntity';

interface Schema {
  id: string;
  index: string;
  schema: string;
  creator: string;
  resolver: string;
  revocable: boolean;
  time: number;
  txid: string;
}

interface Attestation {
  id: string;
  attester: string;
  recipient: string;
  refUID: string;
  revocable: boolean;
  revocationTime: number;
  expirationTime: number;
  time: number;
  timeCreated: number;
  txid: string;
  data: string;
  schemaId: string;
  ipfsHash: string;
  isOffchain: boolean;
  decodedDataJson: string;
  schema?: Schema;
}

interface AttestationDetailResponse {
  attestations: Array<Attestation>;
}

const EASAttestationDetail = () => {
  const router = useRouter();
  const uid = router.query.uid as string;
  const [ isRevokeModalOpen, setIsRevokeModalOpen ] = React.useState(false);

  const queryVariables = React.useMemo(() => ({ uid }), [ uid ]);

  // 获取 attestation 详情
  const { data, loading, error } = useEasGraphQL<AttestationDetailResponse>({
    query: GET_ATTESTATION_DETAIL,
    variables: queryVariables,
    enabled: Boolean(uid),
  });

  const attestation = data?.attestations?.[0];

  // 处理打开 Revoke Modal
  const handleOpenRevokeModal = React.useCallback(() => {
    setIsRevokeModalOpen(true);
  }, []);

  // 处理关闭 Revoke Modal
  const handleCloseRevokeModal = React.useCallback(() => {
    setIsRevokeModalOpen(false);
  }, []);

  // 将 hex 转换为有符号或无符号的十进制字符串
  const hexToDecimal = React.useCallback((hexStr: string, isSigned: boolean = false): string => {
    try {
      // 处理可能的负号前缀（虽然这不是标准的十六进制格式）
      let isNegative = false;
      let cleanHex = hexStr;

      if (hexStr.startsWith('-')) {
        isNegative = true;
        cleanHex = hexStr.slice(1);
      }

      // 确保以 0x 开头
      const hex = cleanHex.startsWith('0x') ? cleanHex : `0x${ cleanHex }`;

      let value: bigint;
      try {
        value = BigInt(hex);
      } catch(parseErr) {
        if (/^-?\d+$/.test(hexStr)) {
          return hexStr;
        }
        return hexStr;
      }

      // 如果输入就带负号，直接返回负数
      if (isNegative) {
        return `-${ value.toString() }`;
      }

      // 如果是无符号整数，直接返回
      if (!isSigned) {
        return value.toString();
      }

      // 对于有符号整数，需要处理负数（二补数表示法）
      // int256 的范围：-2^255 到 2^255-1
      // 如果值 >= 2^255，说明是负数（二补数表示）
      const maxPositive = BigInt(1) << BigInt(255); // 2^255
      const maxValue = BigInt(1) << BigInt(256); // 2^256

      if (value >= maxPositive) {
        // 转换为负数：value - 2^256
        const negativeValue = value - maxValue;
        return negativeValue.toString();
      }

      return value.toString();
    } catch(err) {
      // 如果是已经是十进制数字字符串，直接返回
      if (/^-?\d+$/.test(hexStr)) {
        return hexStr;
      }
      return hexStr;
    }
  }, []);

  // 提取对象中的实际值（专门处理 BigNumber 和其他复杂对象）
  const extractValue = React.useCallback((value: unknown, type?: string): unknown => {
    // 处理 null/undefined
    if (value === null || value === undefined) {
      return value;
    }

    // 如果是基本类型，直接返回
    if (typeof value !== 'object') {
      return value;
    }

    // 如果是数组，递归处理每个元素
    if (Array.isArray(value)) {
      return value.map(item => extractValue(item, type));
    }

    const obj = value as Record<string, unknown>;

    // 判断是否为有符号整数类型
    const baseType = type?.replace('[]', '') || '';
    const isSigned = /^int\d*$/.test(baseType);

    // ethers v6 BigNumber 对象：{ type: 'BigNumber', hex: '0x...' }
    if (obj.type === 'BigNumber' && typeof obj.hex === 'string') {
      return hexToDecimal(obj.hex, isSigned);
    }

    // ethers v5 BigNumber 对象：{ _hex: '0x...', _isBigNumber: true }
    if (obj._hex && typeof obj._hex === 'string') {
      return hexToDecimal(obj._hex, isSigned);
    }

    // 递归检查 value 属性（可能是嵌套结构）
    if ('value' in obj && obj.value !== value) { // 避免无限循环
      return extractValue(obj.value, type);
    }

    // 尝试使用 toString() 方法
    if (typeof obj.toString === 'function') {
      try {
        const str = obj.toString();
        if (str !== '[object Object]') {
          return str;
        }
      } catch(err) {
        /* eslint-disable no-console */
        console.error('  → toString() failed:', err);
        /* eslint-enable no-console */
      }
    }

    // 如果对象只有一个属性，可能是包装对象
    const keys = Object.keys(obj);
    if (keys.length === 1) {
      /* eslint-disable no-console */
      console.log('  → Single key object, extracting key:', keys[0]);
      /* eslint-enable no-console */
      return extractValue(obj[keys[0]], type);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }, [ hexToDecimal ]);

  // 格式化不同类型的值
  const formatValue = React.useCallback((value: unknown, type: string): string => {
    // 先提取对象中的实际值（传递类型信息用于正确处理有符号整数）
    const extractedValue = extractValue(value, type);

    // 处理 null/undefined
    if (extractedValue === null || extractedValue === undefined) {
      return '-';
    }

    // 去除数组标记以获取基础类型
    const baseType = type.replace('[]', '');
    const isArray = type.endsWith('[]');

    // 如果是数组类型
    if (isArray && Array.isArray(extractedValue)) {
      const formattedItems = extractedValue.map(item => formatValue(item, baseType));
      return `[${ formattedItems.join(', ') }]`;
    }

    // bool 类型
    if (baseType === 'bool') {
      return String(extractedValue) === 'true' || extractedValue === true ? 'true' : 'false';
    }

    // address 类型
    if (baseType === 'address') {
      const addr = String(extractedValue);
      // 确保以 0x 开头
      return addr.startsWith('0x') ? addr : `0x${ addr }`;
    }

    // bytes 类型（bytes, bytes1-bytes32）
    if (baseType === 'bytes' || /^bytes\d+$/.test(baseType)) {
      const bytes = String(extractedValue);
      // 确保以 0x 开头
      return bytes.startsWith('0x') ? bytes : `0x${ bytes }`;
    }

    // uint 类型（uint8-uint256）
    if (/^uint\d*$/.test(baseType)) {
      // 对于大数字，保持字符串格式
      return String(extractedValue);
    }

    // int 类型（int8-int256）
    if (/^int\d*$/.test(baseType)) {
      return String(extractedValue);
    }

    // string 类型
    if (baseType === 'string') {
      return String(extractedValue);
    }

    // 其他类型，默认转换为字符串
    return String(extractedValue);
  }, [ extractValue ]);

  // 解码 data 字段
  const decodedData = React.useMemo(() => {
    if (!attestation?.decodedDataJson) return [];

    try {
      const parsed = JSON.parse(attestation.decodedDataJson) as Array<{
        name: string;
        type: string;
        value: { value: unknown } | { value: Array<unknown> };
      }>;

      return parsed.map((item) => {
        const rawValue = item.value.value;

        const formattedValue = formatValue(rawValue, item.type);

        return {
          name: item.name,
          type: item.type,
          value: formattedValue,
        };
      });
    } catch(error) {
      /* eslint-disable no-console */
      console.error('Failed to parse decodedDataJson:', error);
      /* eslint-enable no-console */
      return [];
    }
  }, [ attestation?.decodedDataJson, formatValue ]);

  // 动态解析 schema 生成 types
  const schemaTypes = React.useMemo(() => {
    if (!attestation?.schema?.schema) {
      return [];
    }

    try {
      // 解析 schema 字符串，格式如: "uint256 eventId, string name"
      const fieldParts = attestation.schema.schema.split(',').map(part => part.trim());
      const types: Array<{ name: string; type: string }> = [];

      for (const part of fieldParts) {
        // 匹配格式: "type name" 或 "type[] name"
        const match = part.match(/^(\w+(?:\[\])?)\s+(\w+)$/);
        if (match) {
          const type = match[1];
          const name = match[2];
          types.push({ name, type });
        }
      }

      return types;
    } catch {
      return [];
    }
  }, [ attestation?.schema?.schema ]);

  // 解析 raw data
  const rawData = React.useMemo(() => {
    if (!attestation) return {};

    // 构建 Attest 类型定义（基础字段 + schema 字段）
    const attestTypes = [
      {
        name: 'version',
        type: 'uint16',
      },
      {
        name: 'schema',
        type: 'bytes32',
      },
      {
        name: 'recipient',
        type: 'address',
      },
      {
        name: 'time',
        type: 'uint64',
      },
      {
        name: 'expirationTime',
        type: 'uint64',
      },
      {
        name: 'revocable',
        type: 'bool',
      },
      {
        name: 'refUID',
        type: 'bytes32',
      },
      {
        name: 'data',
        type: 'bytes',
      },
      {
        name: 'salt',
        type: 'bytes32',
      },
    ];

    // 构建完整的 types 对象
    const types: Record<string, Array<{ name: string; type: string }>> = {
      Attest: attestTypes,
    };

    // 如果有 schema 类型，添加到 types 中
    if (schemaTypes.length > 0) {
      types.Schema = schemaTypes;
    }

    return {
      sig: {
        version: 2,
        uid: attestation.id,
        domain: {
          name: 'EAS',
          version: '0.26',
          chainId: String(EAS_CONFIG.chainId),
          verifyingContract: EAS_CONFIG.contractAddress || '',
        },
        primaryType: 'Attest',
        message: {
          version: 2,
          schema: attestation.schemaId,
          recipient: attestation.recipient,
          time: String(attestation.time),
          expirationTime: String(attestation.expirationTime || 0),
          revocationTime: String(attestation.revocationTime || 0),
          nonce: '0',
          revocable: attestation.revocable,
          refUID: attestation.refUID || '0x0000000000000000000000000000000000000000000000000000000000000000',
          data: attestation.data,
          salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
        types,
        signature: {
          v: 0,
          r: '0x0000000000000000000000000000000000000000000000000000000000000000',
          s: '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
      },
      signer: attestation.attester,
    };
  }, [ attestation, schemaTypes ]);

  // 下载 attestation 数据
  const handleDownload = React.useCallback(() => {
    if (!rawData.sig?.uid) return;

    const blob = new Blob([ JSON.stringify(rawData, null, 2) ], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attestation-${ rawData.sig.uid.slice(0, 10) }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [ rawData ]);

  if (error) {
    return (
      <Box p={ 6 }>
        <Text color="red.500">Error loading attestation details</Text>
      </Box>
    );
  }

  return (
    <DataListDisplay
      isError={ Boolean(error) }
      itemsNum={ attestation ? 1 : 0 }
      emptyText="Attestation not found."
    >
      { /* 标题 */ }
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={ 6 }
        gap={ 4 }
        flexWrap="wrap"
      >
        <HStack gap={ 3 }>
          <Skeleton loading={ loading }>
            <Text fontSize={{ base: '24px', lg: '32px' }} fontWeight="bold">
              Offchain Attestation
            </Text>
          </Skeleton>
          {
            attestation?.revocationTime ? (
              <Badge mt={ 1 } ml={ 2 } colorPalette="red" variant="solid" fontSize="xs" px={ 2 } py={ 1 }>
                Revoked
              </Badge>
            ) :
              null
          }
        </HStack>
        {
          !attestation?.revocationTime && data && data.attestations?.[0]?.schema?.revocable ? (
            <Button
              variant="solid"
              size="sm"
              colorScheme="blue"
              onClick={ handleOpenRevokeModal }
              disabled={ loading || !attestation }
            >
              Revoke Attestation
            </Button>
          ) :
            null
        }
      </Flex>

      { /* UID */ }
      <Box mb={ 6 }>
        <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
          UID:
        </Text>
        <Skeleton loading={ loading }>
          <HStack gap={ 2 }>
            <Text fontSize="sm" fontFamily="mono" wordBreak="break-all">
              { attestation?.id }
            </Text>
            { attestation?.id && <CopyToClipboard text={ attestation.id }/> }
          </HStack>
        </Skeleton>
      </Box>

      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        gap={{ base: 6, lg: 8 }}
        mb={ 8 }
      >
        { /* 左列 */ }
        <GridItem>
          <VStack align="stretch" gap={ 6 }>
            { /* SCHEMA */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 3 } textTransform="uppercase">
                Schema:
              </Text>
              <Skeleton loading={ loading }>
                <Flex
                  bg="gray.100"
                  _dark={{ bg: 'gray.800' }}
                  borderRadius="md"
                  overflow="hidden"
                  alignItems="stretch"
                >
                  <Badge
                    colorPalette="purple"
                    variant="solid"
                    fontSize="lg"
                    px={ 4 }
                    py={ 3 }
                    borderRadius="none"
                    fontWeight={ 600 }
                    display="flex"
                    alignItems="center"
                  >
                    #{ attestation?.schema?.index }
                  </Badge>
                  <Flex
                    flex={ 1 }
                    px={ 4 }
                    py={ 3 }
                    alignItems="center"
                  >
                    <Text
                      fontSize="sm"
                      color="blue.500"
                      _dark={{ color: 'blue.300' }}
                      fontFamily="mono"
                      truncate
                    >
                      { attestation?.schema?.id }
                    </Text>
                  </Flex>
                  <Link href={ `/eas/schemaDetail/${ attestation?.schema?.index }` }>
                    <Flex
                      px={ 4 }
                      py={ 3 }
                      bg="gray.200"
                      _dark={{ bg: 'gray.700' }}
                      alignItems="center"
                      justifyContent="center"
                      cursor="pointer"
                      transition="all 0.1s ease"
                      _hover={{
                        bg: 'gray.300',
                        _dark: { bg: 'gray.600' },
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7z
                          m0 11.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm0-7a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"
                          fill="currentColor"
                        />
                      </svg>
                    </Flex>
                  </Link>
                </Flex>
              </Skeleton>
            </Box>

            { /* FROM */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                From:
              </Text>
              <Skeleton loading={ loading } hideBelow="lg">
                { attestation?.attester && (
                  <AddressEntity address={{ hash: attestation.attester }}/>
                ) }
              </Skeleton>
              <Skeleton loading={ loading } hideFrom="lg">
                { attestation?.attester && (
                  <AddressEntity address={{ hash: attestation.attester }} truncation="constant"/>
                ) }
              </Skeleton>
            </Box>

            { /* TO */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                To:
              </Text>
              <Skeleton loading={ loading } hideBelow="lg">
                { attestation?.recipient && (
                  <AddressEntity address={{ hash: attestation.recipient }}/>
                ) }
              </Skeleton>
              <Skeleton loading={ loading } hideFrom="lg">
                { attestation?.recipient && (
                  <AddressEntity address={{ hash: attestation.recipient }} truncation="constant"/>
                ) }
              </Skeleton>
            </Box>

            { /* Transactions ID */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                Transaction ID:
              </Text>
              <Skeleton loading={ loading }>
                { attestation?.txid && <TxEntity hash={ attestation.txid } truncation="dynamic"/> }
              </Skeleton>
            </Box>
          </VStack>
        </GridItem>

        { /* 右列 */ }
        <GridItem>
          <VStack align="stretch" gap={ 6 }>
            { /* CREATED */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                Created:
              </Text>
              <Skeleton loading={ loading }>
                <Text fontSize="sm">
                  { attestation?.timeCreated ? dayjs(attestation.timeCreated * 1000).format('YYYY-M-D HH:mm:ss') : '-' }
                  { attestation?.timeCreated && ` (${ dayjs(attestation.timeCreated * 1000).fromNow() })` }
                </Text>
              </Skeleton>
            </Box>

            { /* EXPIRATION TIME */ }
            {
              attestation?.expirationTime ? (
                <Box>
                  <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                    Expiration Time:
                  </Text>
                  <Skeleton loading={ loading }>
                    <Text fontSize="sm">
                      { attestation?.expirationTime ? dayjs(attestation.expirationTime * 1000).format('YYYY-M-D HH:mm:ss') : '-' }
                    </Text>
                  </Skeleton>
                </Box>
              ) :
                null
            }

            { /* REVOCATION TIME */ }
            {
              attestation?.revocationTime ? (
                <Box>
                  <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                    Revocation Time:
                  </Text>
                  <Skeleton loading={ loading }>
                    <Text fontSize="sm">
                      { attestation?.revocationTime ? dayjs(attestation.revocationTime * 1000).format('YYYY-M-D HH:mm:ss') : '-' }
                    </Text>
                  </Skeleton>
                </Box>
              ) :
                null
            }

            { /* REVOKED */ }
            <Box>
              <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 2 } textTransform="uppercase">
                Revoked:
              </Text>
              <Skeleton loading={ loading }>
                <Text fontSize="sm">
                  { attestation?.revocationTime && attestation.revocationTime > 0 ? 'Yes' : 'No' }
                </Text>
              </Skeleton>
            </Box>
          </VStack>
        </GridItem>
      </Grid>

      { /* DECODED DATA */ }
      <Box mb={ 8 }>
        <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 3 } textTransform="uppercase">
          Decoded Data:
        </Text>
        <Skeleton loading={ loading }>
          <VStack align="stretch" gap={ 3 }>
            { decodedData.map((field: { name: string; type: string; value: string }, idx: number) => (
              <Flex
                key={ idx }
                gap={ 4 }
                alignItems="center"
                borderTopRadius="md"
                borderBottomRadius="md"
                overflow="hidden"
                borderColor="gray.200"
                bg="gray.100"
                _dark={{ bg: 'gray.800' }}
              >
                <Box
                  color="white"
                  borderRadius="md"
                  minW="180px"
                >
                  <Flex
                    flexDirection="column"
                    justifyContent="center"
                    bg="gray.50"
                    _dark={{
                      bg: 'gray.700',
                    }}
                    px={ 3 }
                    py={ 2 }
                    h="60px"
                  >
                    <Text
                      fontSize="11px"
                      color="text.secondary"
                      fontWeight={ 500 }
                      textTransform="uppercase"
                    >
                      { field.type }
                    </Text>
                    <Text
                      fontSize="14px"
                      fontWeight={ 600 }
                      color="text.primary"
                      fontFamily="mono"
                      mt="2px"
                    >
                      { field.name }
                    </Text>
                  </Flex>
                </Box>
                <Text fontSize="sm">{ field.value }</Text>
              </Flex>
            )) }
          </VStack>
        </Skeleton>
      </Box>

      { /* IPFS HASH */ }
      { attestation?.ipfsHash && (
        <Box mb={ 8 }>
          <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 3 } textTransform="uppercase">
            IPFS Hash:
          </Text>
          <Skeleton loading={ loading }>
            <VStack align="stretch" gap={ 2 }>
              <Text fontSize="sm" fontFamily="mono" wordBreak="break-all">
                { attestation.ipfsHash }
              </Text>
              <Link
                fontSize="sm"
                color="link"
                href={ `https://eas.infura-ipfs.io/ipfs/${ attestation.ipfsHash }` }
                target="_blank"
              >
                https://eas.infura-ipfs.io/ipfs/{ attestation.ipfsHash }
              </Link>
            </VStack>
          </Skeleton>
        </Box>
      ) }

      { /* RAW DATA */ }
      <Box mb={ 8 }>
        <Text fontSize="xs" color="text.secondary" fontWeight={ 600 } mb={ 3 } textTransform="uppercase">
          Raw Data:
        </Text>
        <Skeleton loading={ loading }>
          <Box
            bg="gray.50"
            p={ 4 }
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
            maxH="300px"
            overflowY="auto"
          >
            <Text
              fontSize="xs"
              fontFamily="mono"
              whiteSpace="pre-wrap"
              wordBreak="break-all"
            >
              { attestation && JSON.stringify(rawData, null, 2) }
            </Text>
          </Box>
        </Skeleton>
      </Box>

      { /* 操作按钮 */ }
      <HStack gap={ 4 }>
        <Button
          variant="solid"
          colorScheme="blue"
          onClick={ handleDownload }
          disabled={ !attestation }
        >
          Download
        </Button>
      </HStack>

      { attestation && (
        <RevokeAttestationModal
          isOpen={ isRevokeModalOpen }
          onClose={ handleCloseRevokeModal }
          defaultAttestationUid={ attestation.id }
          defaultSchemaId={ attestation.schemaId }
        />
      ) }
    </DataListDisplay>
  );
};

export default EASAttestationDetail;
