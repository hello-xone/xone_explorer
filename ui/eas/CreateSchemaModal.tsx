import { Box, Flex, Input, Stack, Text } from '@chakra-ui/react';
import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import React from 'react';

import buildUrl from 'lib/api/buildUrl';
import { GET_SCHEMAS_BY_RESOLVER } from 'lib/graphql/easQueries';
import useAccount from 'lib/web3/useAccount';
import useEthersSigner from 'lib/web3/useEthersSigner';
import { Button } from 'toolkit/chakra/button';
import { Checkbox } from 'toolkit/chakra/checkbox';
import { DialogBody, DialogContent, DialogHeader, DialogRoot } from 'toolkit/chakra/dialog';
import { IconButton } from 'toolkit/chakra/icon-button';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from 'toolkit/chakra/popover';
import { toaster } from 'toolkit/chakra/toaster';
import IconSvg from 'ui/shared/IconSvg';
import NetworkSwitchDialog from 'ui/shared/NetworkSwitchDialog';

import { EAS_CONFIG, FIELD_NAME_REGEX, SOLIDITY_TYPES } from './constants';
import type { SolidityType } from './constants';

interface SchemaField {
  id: string;
  name: string;
  type: string;
  isArray: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSchemaCreated?: (schemaId: string) => void;
  onSchemaCreationError?: (error: Error) => void;
}

interface FieldRowProps {
  field: SchemaField;
  searchQuery: string;
  index: number;
  isDragging: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (type: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onArrayChange: (details: { checked: boolean | string }) => void;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  canRemove: boolean;
}

const FieldRow = React.memo(({
  field,
  searchQuery,
  index,
  isDragging,
  onNameChange,
  onTypeChange,
  onSearchChange,
  onArrayChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  canRemove,
}: FieldRowProps) => {
  // Popover 打开状态
  const [ isPopoverOpen, setIsPopoverOpen ] = React.useState(false);

  // 搜索过滤逻辑：只搜索类型名称
  const filteredTypes = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return SOLIDITY_TYPES;
    }

    const query = searchQuery.toLowerCase().trim();
    return SOLIDITY_TYPES.filter(type =>
      type.name.toLowerCase().includes(query),
    );
  }, [ searchQuery ]);

  // 点击选择类型
  const handleTypeItemClick = React.useCallback((typeName: string) => {
    return () => {
      onTypeChange(typeName);
      setIsPopoverOpen(false);
    };
  }, [ onTypeChange ]);

  // 键盘事件处理：ESC 关闭 Popover（保留搜索状态）
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setIsPopoverOpen(false);
    }
  }, []);

  // Popover 打开状态变化（保留搜索状态）
  const handlePopoverOpenChange = React.useCallback((details: { open: boolean }) => {
    setIsPopoverOpen(details.open);
    // 不清空搜索，保留用户的搜索状态和列表数据
  }, []);

  // 清除搜索
  const handleClearSearch = React.useCallback(() => {
    onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
  }, [ onSearchChange ]);

  // 拖拽事件处理
  const handleDragStart = React.useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(index);
  }, [ index, onDragStart ]);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(index);
  }, [ index, onDragOver ]);

  const handleDragEnd = React.useCallback(() => {
    onDragEnd();
  }, [ onDragEnd ]);

  // 防止输入框内的拖拽触发整行拖拽
  const handleInputDragStart = React.useCallback((e: React.DragEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Flex
      key={ field.id }
      gap={{ base: 2, md: 3 }}
      align={{ base: 'stretch', md: 'center' }}
      p={{ base: 3, md: 4 }}
      bg={ isDragging ? 'bg' : 'bg.subtle' }
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border"
      onDragOver={ handleDragOver }
      opacity={ isDragging ? 0.5 : 1 }
      cursor="default"
      transition="all 0.2s"
      flexWrap={{ base: 'wrap', md: 'nowrap' }}
      position="relative"
    >
      { /* 拖拽图标 - 移动端隐藏 */ }
      <Box
        draggable
        onDragStart={ handleDragStart }
        onDragEnd={ handleDragEnd }
        cursor="grab"
        color="fg.muted"
        _hover={{ color: 'fg' }}
        _active={{ cursor: 'grabbing' }}
        display={{ base: 'none', md: 'block' }}
      >
        <IconSvg name="dots" boxSize={ 5 }/>
      </Box>

      { /* 字段名称输入框 - 移动端全宽 */ }
      <Input
        placeholder="Field name"
        value={ field.name }
        onChange={ onNameChange }
        onDragStart={ handleInputDragStart }
        flex={{ base: '1 1 100%', md: 1 }}
        minW={{ base: '100%', md: 'auto' }}
        borderRadius="md"
        borderWidth="1px"
        borderColor="border"
        size={{ base: 'sm', md: 'md' }}
        fontSize={{ base: 'sm', md: 'md' }}
        _focus={{
          boxShadow: 'none',
        }}
      />

      { /* 类型选择下拉框 */ }
      <PopoverRoot
        positioning={{
          placement: 'bottom',
          offset: {
            mainAxis: 8,
          },
        }}
        open={ isPopoverOpen }
        onOpenChange={ handlePopoverOpenChange }
        lazyMount={ false }
        unmountOnExit={ false }
      >
        <PopoverTrigger asChild>
          <Button
            minW={{ base: 'auto', md: '160px' }}
            maxW={{ base: 'none', md: '200px' }}
            flex={{ base: '1', md: 'initial' }}
            textAlign="left"
            fontWeight="medium"
            variant="outline"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={{ base: 2.5, md: 3 }}
            py={{ base: 1.5, md: 2 }}
            h={{ base: '36px', md: 'auto' }}
            borderRadius="md"
            borderWidth="1px"
            borderColor="border"
            bg="bg"
            color="fg"
            _hover={{
              color: 'hover',
              fontWeight: 'bold',
            }}
          >
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight="medium"
              truncate
              flex={ 1 }
              color={ field.type ? 'fg' : 'fg.muted' }
            >
              { field.type || 'Select type' }
            </Text>
            <IconSvg
              name="arrows/east-mini"
              boxSize={{ base: 3.5, md: 4 }}
              color="fg.muted"
              transform={ isPopoverOpen ? 'rotate(90deg)' : 'rotate(-90deg)' }
              transition="transform 0.2s ease"
              flexShrink={ 0 }
              ml={ 1 }
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          portalled={ false }
          maxW={{ base: '90vw', md: '620px' }}
          w={{ base: '90vw', md: 'auto' }}
          p={ 0 }
          boxShadow="lg"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border"
          bg="bg"
          zIndex={ 10 }
        >
          <PopoverBody p={ 0 }>
            <Box
              px={{ base: 3, md: 4 }}
              py={ 3 }
              borderBottomWidth="1px"
              borderColor="border"
            >
              <Flex justify="space-between" align="center" mb={ 2 }>
                <Text fontSize="sm" fontWeight="bold" color="fg.muted">
                  Select type
                </Text>
                { searchQuery && (
                  <Text fontSize="xs" color="fg.muted">
                    { filteredTypes.length } of { SOLIDITY_TYPES.length }
                  </Text>
                ) }
              </Flex>
              <Box position="relative">
                <Input
                  placeholder="Search types..."
                  value={ searchQuery }
                  onChange={ onSearchChange }
                  onKeyDown={ handleKeyDown }
                  size="sm"
                  pl={ 9 }
                  pr={ searchQuery ? 9 : 3 }
                />
                <Box
                  position="absolute"
                  left={ 3 }
                  top="50%"
                  transform="translateY(-50%)"
                  color="fg.muted"
                  pointerEvents="none"
                >
                  <IconSvg name="search" boxSize={ 4 }/>
                </Box>
                { searchQuery && (
                  <Box
                    position="absolute"
                    right={ 2 }
                    top="50%"
                    transform="translateY(-50%)"
                    cursor="pointer"
                    onClick={ handleClearSearch }
                    color="fg.muted"
                    _hover={{ color: 'fg' }}
                    p={ 1 }
                    borderRadius="sm"
                  >
                    <IconSvg name="close" boxSize={ 3 }/>
                  </Box>
                ) }
              </Box>
            </Box>
            <Box maxH={{ base: '50vh', md: '400px' }} overflowY="auto">
              { filteredTypes.length > 0 ? (
                filteredTypes.map((type: SolidityType) => (
                  <Box
                    key={ type.name }
                    px={{ base: 3, md: 4 }}
                    py={{ base: 3, md: 3 }}
                    cursor="pointer"
                    _hover={{ bg: 'bg.muted' }}
                    _active={{ bg: 'bg.muted' }}
                    transition="background 0.2s"
                    onClick={ handleTypeItemClick(type.name) }
                    minH={{ base: '52px', md: 'auto' }}
                  >
                    <Text fontWeight="medium" fontSize="sm">
                      { type.name }
                    </Text>
                    <Text fontSize="xs" color="fg.muted" mt={ 1 } lineHeight="1.4">
                      { type.description }
                    </Text>
                  </Box>
                ))
              ) : (
                <Box px={{ base: 3, md: 4 }} py={ 8 } textAlign="center">
                  <Text fontSize="sm" color="fg.muted" mb={ 1 }>
                    No types found
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    Try searching with different keywords
                  </Text>
                </Box>
              ) }
            </Box>
          </PopoverBody>
        </PopoverContent>
      </PopoverRoot>

      { /* Array 复选框 - 移动端调整 */ }
      <Checkbox
        checked={ field.isArray }
        onCheckedChange={ onArrayChange }
        flex={{ base: '0 0 auto', md: 'initial' }}
      >
        <Text fontSize={{ base: 'xs', md: 'sm' }}>Array</Text>
      </Checkbox>

      { /* 删除按钮 - 移动端调整 */ }
      { canRemove && (
        <IconButton
          aria-label="Delete field"
          size="md"
          variant="ghost"
          colorPalette="red"
          onClick={ onRemove }
          minW={{ base: '32px', md: 'auto' }}
          h={{ base: '32px', md: 'auto' }}
          p={{ base: 1, md: 2 }}
        >
          <IconSvg name="delete" boxSize={{ base: 4, md: 5 }}/>
        </IconButton>
      ) }
    </Flex>
  );
});

/* eslint-disable no-console */
async function analyzeMissingRevertDataError(error: Error & { code?: string }, provider: ethers.JsonRpcProvider) {
  console.error('\n🔍 Starting error analysis...');
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);

  try {
    console.error('\n📊 System environment check:');
    console.error('   Schema Registry Address:', EAS_CONFIG.schemaRegistryAddress);
    console.error('   RPC Provider:', EAS_CONFIG.rpcProvider);
    console.error('   Expected Chain ID:', EAS_CONFIG.chainId);

    const network = await provider.getNetwork();
    console.error('   Connected Chain ID:', network.chainId);

    if (network.chainId !== BigInt(EAS_CONFIG.chainId as string)) {
      console.error('   ❌ Chain ID mismatch detected!');
      console.error(`   Expected: ${ EAS_CONFIG.chainId }, Got: ${ network.chainId }`);
    } else {
      console.error('   ✅ Chain ID matched');
    }

    if (EAS_CONFIG.schemaRegistryAddress) {
      const code = await provider.getCode(EAS_CONFIG.schemaRegistryAddress);
      if (code === '0x') {
        console.error('   ❌ Schema Registry contract not deployed at configured address');
      } else {
        console.error('   ✅ Contract exists');
        console.error('   Code size:', (code.length - 2) / 2, 'bytes');
      }
    }
  } catch(analysisError) {
    console.error('Error during analysis:', analysisError);
  }

  console.error('\n💡 Suggestions:');
  console.error('   1. Verify Schema Registry address is correct');
  console.error('   2. Ensure you\'re connected to the correct network');
  console.error('   3. Check if EAS contracts have been deployed on XONE Chain');
  console.error('   4. Verify wallet is connected to the same network as RPC provider');
}
/* eslint-enable no-console */

const CreateSchemaModal = ({ isOpen, onClose, onSchemaCreated, onSchemaCreationError }: Props) => {
  const [ fields, setFields ] = React.useState<Array<SchemaField>>([
    { id: '1', name: '', type: '', isArray: false },
  ]);
  const [ resolverAddress, setResolverAddress ] = React.useState('');
  const [ isRevocable, setIsRevocable ] = React.useState(true);
  const [ typeSearchQuery, setTypeSearchQuery ] = React.useState<Record<string, string>>({});
  const [ draggedIndex, setDraggedIndex ] = React.useState<number | null>(null);
  const [ isLoading, setIsLoading ] = React.useState(false);
  const [ loadingStatus, setLoadingStatus ] = React.useState('');
  const [ showNetworkDialog, setShowNetworkDialog ] = React.useState(false);

  // 获取 signer 和账户信息
  const signer = useEthersSigner();
  const account = useAccount();

  // 检查网络是否匹配
  const isWrongNetwork = React.useMemo(() => {
    if (!account.chainId || !EAS_CONFIG.chainId) {
      return false;
    }
    return account.chainId !== Number(EAS_CONFIG.chainId);
  }, [ account.chainId ]);

  // 拖拽处理
  const handleDragStart = React.useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = React.useCallback((index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    // 实时更新字段顺序
    setFields(prevFields => {
      const newFields = [ ...prevFields ];
      const draggedField = newFields[draggedIndex];
      newFields.splice(draggedIndex, 1);
      newFields.splice(index, 0, draggedField);
      return newFields;
    });

    setDraggedIndex(index);
  }, [ draggedIndex ]);

  const handleDragEnd = React.useCallback(() => {
    setDraggedIndex(null);
  }, []);

  // 添加字段
  const handleAddField = React.useCallback(() => {
    const newField: SchemaField = {
      id: Date.now().toString(),
      name: '',
      type: '',
      isArray: false,
    };
    setFields(prevFields => [ ...prevFields, newField ]);
  }, []);

  // 为每个字段创建回调工厂
  const createFieldCallbacks = React.useCallback((id: string) => ({
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setFields(prevFields => prevFields.map(field =>
        field.id === id ? { ...field, name } : field,
      ));
    },
    onTypeChange: (type: string) => {
      setFields(prevFields => prevFields.map(field =>
        field.id === id ? { ...field, type } : field,
      ));
      // 保留搜索状态，不清空
    },
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypeSearchQuery(prev => ({ ...prev, [id]: e.target.value }));
    },
    onArrayChange: (details: { checked: boolean | string }) => {
      const isArray = typeof details.checked === 'boolean' ? details.checked : details.checked === 'true';
      setFields(prevFields => prevFields.map(field =>
        field.id === id ? { ...field, isArray } : field,
      ));
    },
    onRemove: () => {
      if (fields.length > 1) {
        setFields(fields.filter(field => field.id !== id));
      }
    },
  }), [ fields ]);

  // 更新 Resolver Address
  const handleResolverAddressChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setResolverAddress(e.target.value);
  }, []);

  // 设置可撤销为 true
  const handleSetRevocableTrue = React.useCallback(() => {
    setIsRevocable(true);
  }, []);

  // 设置可撤销为 false
  const handleSetRevocableFalse = React.useCallback(() => {
    setIsRevocable(false);
  }, []);

  // 表单验证
  const validateForm = React.useCallback(() => {
    // 检查是否所有字段都有名称
    const hasEmptyFieldNames = fields.some(field => !field.name.trim());
    if (hasEmptyFieldNames) {
      toaster.create({
        title: 'Validation Failed',
        description: 'Please enter names for all fields',
        type: 'error',
        duration: 3000,
      });
      return false;
    }

    // 检查是否所有字段都有类型
    const hasEmptyFieldTypes = fields.some(field => !field.type.trim());
    if (hasEmptyFieldTypes) {
      toaster.create({
        title: 'Validation Failed',
        description: 'Please select types for all fields',
        type: 'error',
        duration: 3000,
      });
      return false;
    }

    // 检查是否有重复的字段名称
    const fieldNames = fields.map(f => f.name.trim());
    const hasDuplicateNames = new Set(fieldNames).size !== fieldNames.length;
    if (hasDuplicateNames) {
      toaster.create({
        title: 'Validation Failed',
        description: 'Field names must be unique',
        type: 'error',
        duration: 3000,
      });
      return false;
    }

    // 检查字段名是否符合 Solidity/ABI 规范
    const invalidFieldNames = fields.filter(field => !FIELD_NAME_REGEX.test(field.name.trim()));
    if (invalidFieldNames.length > 0) {
      const exampleName = invalidFieldNames[0].name;
      toaster.create({
        title: 'Invalid Field Name',
        description: `Field name "${ exampleName }" is invalid. Names must start with a letter or underscore, ` +
          'and contain only letters, numbers, and underscores (no hyphens or special characters).',
        type: 'error',
        duration: 5000,
      });
      return false;
    }

    // 检查 Resolver Address 格式（如果填写了）
    // 零地址被视为"无 Resolver"，是有效的
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    if (resolverAddress && resolverAddress.trim() !== '' && resolverAddress !== zeroAddress) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(resolverAddress)) {
        toaster.create({
          title: 'Validation Failed',
          description: 'Invalid Resolver Address format',
          type: 'error',
          duration: 3000,
        });
        return false;
      }
    }

    return true;
  }, [ fields, resolverAddress ]);

  // 创建 Schema
  const handleCreateSchema = React.useCallback(async() => {
    if (!validateForm()) {
      return;
    }

    // 检查网络是否匹配 - 显示对话框
    if (isWrongNetwork) {
      setShowNetworkDialog(true);
      return;
    }

    try {
      setIsLoading(true);
      setLoadingStatus('Validating...');

      /* eslint-disable no-console */
      console.log('\n=== 🚀 Starting Schema Creation ===');
      console.log('📋 Configuration:');
      console.log('   Chain ID:', EAS_CONFIG.chainId);
      console.log('   RPC:', EAS_CONFIG.rpcProvider);

      // 构建 schema 字符串
      const schemaString = fields.map(field => {
        const typeStr = field.isArray ? `${ field.type }[]` : field.type;
        return `${ typeStr } ${ field.name }`;
      }).join(', ');

      console.log('   Schema Definition:', schemaString);
      console.log('   Resolver Address:', resolverAddress || '0x0000000000000000000000000000000000000000');
      console.log('   Revocable:', isRevocable);

      // 0. 验证 Schema 格式：检查参数名和类型名是否冲突 (Solidity/ABI/ethers.js 规范要求)
      console.log('\n🔍 Step 0: Validate Schema Format (Solidity/ABI Compliance)');
      const conflictingFields = fields.filter(field => {
        const normalizedType = field.type.toLowerCase();
        const normalizedName = field.name.toLowerCase();
        return normalizedType === normalizedName;
      });

      if (conflictingFields.length > 0) {
        const conflictList = conflictingFields.map(f => `"${ f.type } ${ f.name }"`).join(', ');
        toaster.create({
          title: '❌ Invalid Schema Format',
          description: `Parameter name cannot be the same as type name. ` +
            `Conflicting fields: ${ conflictList }. ` +
            `This violates Solidity/ABI standards and will prevent Attestation creation. ` +
            `Example: use "address recipient" instead of "address address", ` +
            `"uint256 tokenId" instead of "uint256 uint256".`,
          type: 'error',
          duration: 12000,
        });
        return;
      }
      console.log('✅ Schema format validated (no type/name conflicts)');

      // 1. 检查 Resolver 和 Schema 组合是否已存在
      const finalResolverAddress = resolverAddress;

      // 验证地址格式（如果不是零地址）
      if (finalResolverAddress) {
        if (!ethers.isAddress(finalResolverAddress)) {
          toaster.create({
            title: '❌ Invalid Address Format',
            description: 'Resolver address format is incorrect. Please enter a valid Ethereum address',
            type: 'error',
          });
          return;
        }

        console.log('🔍 Checking if Resolver and Schema combination already exists...');
        setLoadingStatus('Checking for existing schema...');

        try {
          const graphqlUrl = buildUrl('eas:graphql');
          const response = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              query: GET_SCHEMAS_BY_RESOLVER,
              variables: {
                where: {
                  resolver: {
                    equals: finalResolverAddress,
                  },
                  schema: {
                    equals: schemaString,
                  },
                },
              },
            }),
          });

          if (response.ok) {
            const result = await response.json() as {
              data?: {
                schemata?: Array<{ id: string; schema: string; resolver: string }>;
              };
            };
            if (result.data?.schemata && result.data.schemata.length > 0) {
              const existingSchema = result.data.schemata[0];
              console.log('❌ Existing schema found:', existingSchema);
              const schemaIdShort = `${ existingSchema.id.slice(0, 8) }...`;
              toaster.create({
                title: '⚠️ Schema Already Exists',
                description: `The same Resolver and Schema definition already exists (ID: ${ schemaIdShort }). ` +
                  'Database constraint: the same Resolver cannot define the same Schema repeatedly.',
                type: 'error',
              });
              return;
            }
            console.log('✅ No existing schema found, proceeding...');
          }
        } catch(checkError) {
          console.warn('⚠️ Failed to check existing schema, proceeding anyway:', checkError);
        }
      }

      // 1. 检查 signer
      if (!signer) {
        toaster.create({
          title: '❌ Wallet Not Connected',
          description: 'Please connect your wallet before creating schema',
          type: 'error',
        });
        return;
      }

      // 获取 signer 地址
      let signerAddress = 'Unknown';
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof (signer as any).getAddress === 'function') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signerAddress = await (signer as any).getAddress();
        }
      } catch(e) {
        console.warn('Unable to get signer address:', e);
      }

      console.log('\n✅ Signer Info:');
      console.log('   Address:', signerAddress);

      // 2. 创建 provider 进行预检
      setLoadingStatus('Validating contract...');

      if (!EAS_CONFIG.rpcProvider) {
        toaster.create({
          title: '❌ Configuration Error',
          description: 'RPC provider is not configured',
          type: 'error',
        });
        return;
      }

      const provider = new ethers.JsonRpcProvider(EAS_CONFIG.rpcProvider);

      // 3. 预检：验证合约存在
      console.log('\n🔍 Step 2: Validate Schema Registry Contract');
      console.log('   Address:', EAS_CONFIG.schemaRegistryAddress);

      if (!EAS_CONFIG.schemaRegistryAddress) {
        toaster.create({
          title: '❌ Configuration Error',
          description: 'Schema Registry address is not configured',
          type: 'error',
        });
        return;
      }

      const registryCode = await provider.getCode(EAS_CONFIG.schemaRegistryAddress);
      if (registryCode === '0x') {
        console.error('❌ Schema Registry contract doesn\'t exist!');
        toaster.create({
          title: '❌ Schema Registry Contract Not Deployed',
          description: `Contract not found at address ${ EAS_CONFIG.schemaRegistryAddress.slice(0, 10) }...${ EAS_CONFIG.schemaRegistryAddress.slice(-8) }`,
          type: 'error',
        });
        return;
      }
      console.log('✅ Contract deployed');
      console.log('   Code size:', (registryCode.length - 2) / 2, 'bytes');

      // 4. 验证网络匹配
      console.log('\n🔍 Step 3: Validate Network');
      const network = await provider.getNetwork();
      console.log('   Current Network Chain ID:', network.chainId);
      console.log('   Configured Chain ID:', EAS_CONFIG.chainId);
      if (network.chainId !== BigInt(EAS_CONFIG.chainId as string)) {
        toaster.create({
          title: '❌ Network Mismatch',
          description: `Wallet connected to Chain ID ${ network.chainId }, but configuration requires ${ EAS_CONFIG.chainId }`,
          type: 'error',
        });
        return;
      }
      console.log('✅ Network matched');

      // 5. 初始化 Schema Registry 并提交到链上
      console.log('\n🔍 Step 4: Initialize Schema Registry');
      const schemaRegistry = new SchemaRegistry(EAS_CONFIG.schemaRegistryAddress);
      schemaRegistry.connect(signer);
      console.log('✅ Schema Registry connected');

      console.log('\n📝 Step 5: Register Schema On-chain');
      console.log('   Starting transaction...');
      setLoadingStatus('Sending transaction...');

      // 创建 schema 并提交到链上
      const transaction = await schemaRegistry.register({
        schema: schemaString,
        resolverAddress: finalResolverAddress,
        revocable: isRevocable,
      });

      console.log('✅ Transaction sent');
      console.log('   Transaction hash:', transaction);

      console.log('\n⏳ Step 6: Waiting for transaction confirmation...');
      setLoadingStatus('Waiting for confirmation...');

      // 添加超时机制和进度提示
      const TIMEOUT = 120000; // 120 秒超时
      let elapsedTime = 0;

      // 进度计时器 - 每 10 秒提醒一次
      const progressInterval = setInterval(() => {
        elapsedTime += 10000;
        const seconds = elapsedTime / 1000;
        console.log(`   ⏰ Waited ${ seconds } seconds...`);
        setLoadingStatus(`Waiting for confirmation (${ seconds }s)...`);
      }, 10000);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          clearInterval(progressInterval);
          reject(new Error(`Transaction confirmation timeout (waited ${ TIMEOUT / 1000 } seconds)`));
        }, TIMEOUT);
      });

      // 等待交易确认，带超时和进度提示
      let schemaId: string;
      try {
        schemaId = await Promise.race([
          transaction.wait(),
          timeoutPromise,
        ]) as string;

        clearInterval(progressInterval);
        console.log(`   ✅ Transaction confirmed! Total time: ${ elapsedTime / 1000 } seconds`);
      } catch(timeoutError) {
        clearInterval(progressInterval);
        throw timeoutError;
      }

      console.log('\n🎉 Schema created successfully!');
      console.log('   Schema ID:', schemaId);

      const schemaIdShort = `${ schemaId.slice(0, 10) }...${ schemaId.slice(-8) }`;
      const refreshMsg = `Please refresh after ${ EAS_CONFIG.refreshTime } seconds to see the record.`;
      toaster.create({
        title: '✅ Schema Created Successfully',
        description: `Schema ID: ${ schemaIdShort }. ${ refreshMsg }`,
        type: 'success',
      });

      // 触发回调
      onSchemaCreated?.(schemaId);

      // 关闭弹窗
      onClose();

      // 重置表单
      setFields([ { id: Date.now().toString(), name: '', type: '', isArray: false } ]);
      setResolverAddress('');
      setIsRevocable(true);
      setTypeSearchQuery({});

      console.log('=== ✅ Schema creation flow completed ===\n');
    } catch(error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as Error & { code?: string; transaction?: any; message?: string };

      console.error('\n=== ❌ Schema Creation Failed ===');
      console.error('Error type:', err?.code || 'Unknown');
      console.error('Error message:', err?.message || 'No message');

      if (err?.transaction) {
        console.error('Transaction info:', err.transaction);
      }

      let errorTitle = '❌ Failed to Create Schema';
      let errorDescription = '';

      // 详细错误分析
      if (err?.message?.includes('timeout') || err?.message?.includes('超时')) {
        errorTitle = '⚠️ Transaction Confirmation Timeout';
        errorDescription = 'Transaction may still be processing. Please check your wallet to confirm transaction status.';
        console.warn('\n⚠️  Note: Timeout doesn\'t mean transaction failed!');
      } else if (err?.code === 'CALL_EXCEPTION' || err?.message?.includes('missing revert data')) {
        console.error('\n🔍 Detected CALL_EXCEPTION error, starting analysis...');

        try {
          const provider = new ethers.JsonRpcProvider(EAS_CONFIG.rpcProvider);
          await analyzeMissingRevertDataError(err, provider);
        } catch(analysisError) {
          console.error('Error analysis failed:', analysisError);
        }

        errorTitle = '❌ Contract Call Failed';
        errorDescription = 'Possible causes: Schema Registry contract not properly deployed or ' +
          'network configuration mismatch. Please check console for details.';
      } else if (err?.code === 'ACTION_REJECTED') {
        errorTitle = '❌ Transaction Rejected';
        errorDescription = 'You cancelled the transaction signature';
      } else if (err?.code === 'INSUFFICIENT_FUNDS') {
        errorTitle = '❌ Insufficient Funds';
        errorDescription = 'Account doesn\'t have enough gas fees';
      } else if (err?.code === 'NETWORK_ERROR') {
        errorTitle = '❌ Network Error';
        errorDescription = 'Unable to connect to RPC node';
      } else if (err?.message) {
        errorDescription = err.message;
      } else {
        errorDescription = 'Unknown error, please check console logs';
      }

      console.error('\nUser-friendly error message:');
      console.error('Title:', errorTitle);
      console.error('Details:', errorDescription);
      console.error('\nFull error object:', err);

      toaster.create({
        title: errorTitle,
        description: errorDescription,
        type: 'error',
      });

      onSchemaCreationError?.(err as Error);
      console.error('=== ❌ Schema creation flow ended ===\n');
      /* eslint-enable no-console */
    } finally {
      setIsLoading(false);
    }
  }, [
    fields,
    resolverAddress,
    isRevocable,
    validateForm,
    signer,
    onSchemaCreated,
    onSchemaCreationError,
    onClose,
    isWrongNetwork,
  ]);

  const handleOpenChange = React.useCallback(({ open }: { open: boolean }) => {
    if (!open) {
      onClose();
      // 延迟清空表单值，让关闭动画完成后再清空
      const timer = setTimeout(() => {
        setFields([ { id: Date.now().toString(), name: '', type: '', isArray: false } ]);
        setResolverAddress('');
        setIsRevocable(true);
        setTypeSearchQuery({});
        clearTimeout(timer);
      }, 300);
    }
  }, [ onClose ]);

  const handleCloseNetworkDialog = React.useCallback(() => {
    setShowNetworkDialog(false);
  }, []);

  return (
    <>
      <NetworkSwitchDialog
        isOpen={ showNetworkDialog }
        onClose={ handleCloseNetworkDialog }
        currentChainId={ account.chainId }
        targetChainId={ EAS_CONFIG.chainId as string }
      />

      <DialogRoot
        open={ isOpen }
        onOpenChange={ handleOpenChange }
      >
        <DialogContent
          maxW={{ base: '95vw', sm: '90vw', md: '700px' }}
          borderRadius={{ base: 'lg', md: 'xl' }}
          p={ 0 }
          maxH={{ base: '90vh', md: '85vh' }}
          overflowY="auto"
        >
          <DialogHeader
            pt={{ base: 6, sm: 6, md: 8 }}
            px={{ base: 5, sm: 6, md: 8 }}
            pb={{ base: 2, md: 0 }}
          >
            <Box>
              <Text
                fontSize={{ base: '20px', sm: '24px', md: '32px' }}
                fontWeight="bold"
                lineHeight="1.2"
              >
                Create a Schema
              </Text>
              <Text
                fontSize={{ base: '13px', sm: '14px', md: '16px' }}
                fontWeight="normal"
                color="text.secondary"
                mt={ 1 }
                lineHeight="1.5"
              >
                Add fields below that are relevant to your use case.
              </Text>
            </Box>
          </DialogHeader>
          <DialogBody
            pb={{ base: 4, sm: 6, md: 8 }}
            px={{ base: 4, sm: 6, md: 8 }}
            mt={{ base: 2, md: 2 }}
          >
            <Stack gap={{ base: 3, md: 2 }}>
              { /* 字段列表 */ }
              { fields.map(function renderField(field, index) {
                const callbacks = createFieldCallbacks(field.id);
                return (
                  <FieldRow
                    key={ field.id }
                    field={ field }
                    searchQuery={ typeSearchQuery[field.id] || '' }
                    index={ index }
                    isDragging={ draggedIndex === index }
                    onNameChange={ callbacks.onNameChange }
                    onTypeChange={ callbacks.onTypeChange }
                    onSearchChange={ callbacks.onSearchChange }
                    onArrayChange={ callbacks.onArrayChange }
                    onRemove={ callbacks.onRemove }
                    onDragStart={ handleDragStart }
                    onDragOver={ handleDragOver }
                    onDragEnd={ handleDragEnd }
                    canRemove={ fields.length > 1 }
                  />
                );
              }) }

              { /* Add field 按钮 */ }
              <Button
                variant="ghost"
                colorPalette="blue"
                onClick={ handleAddField }
                justifyContent="flex-start"
                size={{ base: 'sm', md: 'md' }}
                fontSize={{ base: 'sm', md: 'md' }}
              >
                <IconSvg name="plus" boxSize={{ base: 3.5, md: 4 }} mr={ 2 }/>
                Add field
              </Button>

              { /* Resolver Address */ }
              <Box mt={{ base: 3, md: 2 }}>
                <Text
                  fontSize={{ base: 'xs', sm: 'xs', md: 'sm' }}
                  fontWeight="bold"
                  textTransform="uppercase"
                  color="fg.muted"
                  mb={ 1 }
                >
                  RESOLVER ADDRESS
                </Text>
                <Text
                  fontSize={{ base: 'xs', sm: 'xs', md: 'sm' }}
                  color="fg.muted"
                  mb={{ base: 2, md: 3 }}
                  lineHeight="1.5"
                >
                  Optional smart contract that gets executed with every attestation of this type.
                  (Can be used to verify, limit, act upon any attestation)
                </Text>
                <Input
                  placeholder="ex: 0x0000000000000000000000000000000000000000"
                  value={ resolverAddress }
                  onChange={ handleResolverAddressChange }
                  size={{ base: 'md', md: 'lg' }}
                  fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                />
              </Box>

              { /* Is Revocable */ }
              <Box mt={{ base: 3, md: 4 }}>
                <Text
                  fontSize={{ base: 'xs', sm: 'xs', md: 'sm' }}
                  fontWeight="bold"
                  textTransform="uppercase"
                  color="fg.muted"
                  mb={ 1 }
                >
                  IS REVOCABLE
                </Text>
                <Text
                  fontSize={{ base: 'xs', sm: 'xs', md: 'sm' }}
                  color="fg.muted"
                  mb={{ base: 2, md: 3 }}
                  lineHeight="1.5"
                >
                  Determine if attestations of this schema can be revocable
                </Text>
                <Flex
                  borderRadius="full"
                  borderWidth="2px"
                  borderColor="border"
                  overflow="hidden"
                  bg="bg.subtle"
                  p={ 1 }
                  gap={ 1 }
                  w={{ base: '100%', sm: '70%', md: '50%' }}
                >
                  <Button
                    flex={ 1 }
                    variant="ghost"
                    size={{ base: 'sm', md: 'md' }}
                    borderRadius="full"
                    onClick={ handleSetRevocableTrue }
                    bg={ isRevocable ? 'red.500' : 'transparent' }
                    color={ isRevocable ? 'white' : 'fg' }
                    fontWeight={ isRevocable ? 'bold' : 'medium' }
                    fontSize={{ base: 'sm', md: 'md' }}
                    _hover={{
                      bg: isRevocable ? 'red.600' : '',
                    }}
                    transition="all 0.2s ease"
                  >
                    Yes
                  </Button>
                  <Button
                    flex={ 1 }
                    variant="ghost"
                    size={{ base: 'sm', md: 'md' }}
                    borderRadius="full"
                    onClick={ handleSetRevocableFalse }
                    bg={ !isRevocable ? 'red.500' : 'transparent' }
                    color={ !isRevocable ? 'white' : 'fg' }
                    fontWeight={ !isRevocable ? 'bold' : 'medium' }
                    fontSize={{ base: 'sm', md: 'md' }}
                    _hover={{
                      bg: !isRevocable ? 'red.600' : '',
                    }}
                    transition="all 0.2s ease"
                  >
                    No
                  </Button>
                </Flex>
              </Box>

              { /* Loading Status */ }
              { isLoading && loadingStatus && (
                <Box mt={{ base: 3, md: 4 }} textAlign="center">
                  <Text
                    fontSize={{ base: 'xs', sm: 'xs', md: 'sm' }}
                    color="fg.muted"
                  >
                    { loadingStatus }
                  </Text>
                </Box>
              ) }

              { /* Create Schema 按钮 */ }
              <Button
                mt={{ base: 4, sm: 5, md: 6 }}
                colorPalette="blue"
                size={{ base: 'md', md: 'lg' }}
                w="100%"
                onClick={ handleCreateSchema }
                disabled={ isLoading }
                loading={ isLoading }
                fontSize={{ base: 'sm', md: 'md' }}
              >
                { isLoading ? 'Creating...' : 'Create Schema' }
              </Button>
            </Stack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default CreateSchemaModal;
