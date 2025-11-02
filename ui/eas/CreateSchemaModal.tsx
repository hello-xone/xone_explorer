import { Box, Flex, Input, Stack, Text } from '@chakra-ui/react';
import React from 'react';

import { Button } from 'toolkit/chakra/button';
import { Checkbox } from 'toolkit/chakra/checkbox';
import { DialogBody, DialogContent, DialogHeader, DialogRoot } from 'toolkit/chakra/dialog';
import { IconButton } from 'toolkit/chakra/icon-button';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from 'toolkit/chakra/popover';
import { toaster } from 'toolkit/chakra/toaster';
import IconSvg from 'ui/shared/IconSvg';

import { SOLIDITY_TYPES } from './constants';
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

  return (
    <Flex
      key={ field.id }
      gap={ 3 }
      align="center"
      p={ 4 }
      bg={ isDragging ? 'bg' : 'bg.subtle' }
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border"
      draggable
      onDragStart={ handleDragStart }
      onDragOver={ handleDragOver }
      onDragEnd={ handleDragEnd }
      opacity={ isDragging ? 0.5 : 1 }
      cursor={ isDragging ? 'grabbing' : 'default' }
      transition="all 0.2s"
    >
      { /* 拖拽图标 */ }
      <Box cursor="grab" color="fg.muted" _hover={{ color: 'fg' }} _active={{ cursor: 'grabbing' }}>
        <IconSvg name="dots" boxSize={ 5 }/>
      </Box>

      { /* 字段名称输入框 */ }
      <Input
        placeholder="Field name"
        value={ field.name }
        onChange={ onNameChange }
        flex={ 1 }
        borderRadius="md"
        borderWidth="1px"
        borderColor="border"
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
            minW="160px"
            maxW="200px"
            textAlign="left"
            fontWeight="medium"
            variant="outline"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={ 3 }
            py={ 2 }
            h="auto"
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
            <Text fontSize="sm" fontWeight="medium" truncate flex={ 1 } color={ field.type ? 'fg' : 'fg.muted' }>
              { field.type || 'Select type' }
            </Text>
            <IconSvg
              name="arrows/east-mini"
              boxSize={ 4 }
              color="fg.muted"
              transform={ isPopoverOpen ? 'rotate(90deg)' : 'rotate(-90deg)' }
              transition="transform 0.2s ease"
              flexShrink={ 0 }
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

      { /* Array 复选框 */ }
      <Checkbox
        checked={ field.isArray }
        onCheckedChange={ onArrayChange }
      >
        <Text fontSize="sm">Array</Text>
      </Checkbox>

      { /* 删除按钮 */ }
      { canRemove && (
        <IconButton
          aria-label="Delete field"
          size="md"
          variant="ghost"
          colorPalette="red"
          onClick={ onRemove }
        >
          <IconSvg name="delete" boxSize={ 5 }/>
        </IconButton>
      ) }
    </Flex>
  );
});

const CreateSchemaModal = ({ isOpen, onClose }: Props) => {
  const [ fields, setFields ] = React.useState<Array<SchemaField>>([
    { id: '1', name: '', type: '', isArray: false },
  ]);
  const [ resolverAddress, setResolverAddress ] = React.useState('');
  const [ isRevocable, setIsRevocable ] = React.useState(true);
  const [ typeSearchQuery, setTypeSearchQuery ] = React.useState<Record<string, string>>({});
  const [ draggedIndex, setDraggedIndex ] = React.useState<number | null>(null);

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

    // 检查 Resolver Address 格式（如果填写了）
    if (resolverAddress && !/^0x[a-fA-F0-9]{40}$/.test(resolverAddress)) {
      toaster.create({
        title: 'Validation Failed',
        description: 'Invalid Resolver Address format',
        type: 'error',
        duration: 3000,
      });
      return false;
    }

    return true;
  }, [ fields, resolverAddress ]);

  // 创建 Schema
  const handleCreateSchema = React.useCallback(() => {
    if (!validateForm()) {
      return;
    }

    // 构建 schema 字符串
    const schemaString = fields.map(field => {
      const typeStr = field.isArray ? `${ field.type }[]` : field.type;
      return `${ typeStr } ${ field.name }`;
    }).join(', ');

    // Schema string: schemaString
    // Resolver address: resolverAddress || 'None'
    // Is revocable: isRevocable

    // 显示成功提示
    toaster.create({
      title: 'Schema Created Successfully',
      description: `Schema created with ${ fields.length } field(s): ${ schemaString }`,
      type: 'success',
      duration: 5000,
    });

    // 关闭弹窗
    onClose();

    // 重置表单
    setFields([ { id: Date.now().toString(), name: '', type: '', isArray: false } ]);
    setResolverAddress('');
    setIsRevocable(true);
    setTypeSearchQuery({});
  }, [ fields, onClose, validateForm ]);

  const handleOpenChange = React.useCallback(({ open }: { open: boolean }) => {
    if (!open) {
      onClose();
    }
  }, [ onClose ]);

  return (
    <DialogRoot
      open={ isOpen }
      onOpenChange={ handleOpenChange }
    >
      <DialogContent maxW="700px" borderRadius="xl" p={ 0 }>
        <DialogHeader pt={ 8 } px={ 8 }>
          <Box>
            <Text fontSize="32px" fontWeight="bold" lineHeight="1.2">Create a Schema</Text>
            <Text fontSize="16px" fontWeight="normal" color="text.secondary" mt={ 1 }>
              Add fields below that are relevant to your use case.
            </Text>
          </Box>
        </DialogHeader>
        <DialogBody pb={ 8 } px={ 8 } mt={ 2 }>
          <Stack gap={ 2 }>
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
            >
              <IconSvg name="plus" boxSize={ 4 } mr={ 2 }/>
              Add field
            </Button>

            { /* Resolver Address */ }
            <Box mt={ 2 }>
              <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" color="fg.muted" mb={ 1 }>
                RESOLVER ADDRESS
              </Text>
              <Text fontSize="sm" color="fg.muted" mb={ 3 }>
                Optional smart contract that gets executed with every attestation of this type.
                (Can be used to verify, limit, act upon any attestation)
              </Text>
              <Input
                placeholder="ex: 0x00000000000000000000000000000000000000000"
                value={ resolverAddress }
                onChange={ handleResolverAddressChange }
                size="lg"
              />
            </Box>

            { /* Is Revocable */ }
            <Box mt={ 4 }>
              <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" color="fg.muted" mb={ 1 }>
                IS REVOCABLE
              </Text>
              <Text fontSize="sm" color="fg.muted" mb={ 3 }>
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
                w="50%"
              >
                <Button
                  flex={ 1 }
                  variant="ghost"
                  size="md"
                  borderRadius="full"
                  onClick={ handleSetRevocableTrue }
                  bg={ isRevocable ? 'blue.600' : 'transparent' }
                  color={ isRevocable ? 'white' : 'fg' }
                  fontWeight={ isRevocable ? 'bold' : 'medium' }
                  _hover={{
                    bg: isRevocable ? 'blue.700' : '',
                  }}
                  transition="all 0.2s ease"
                >
                  Yes
                </Button>
                <Button
                  flex={ 1 }
                  variant="ghost"
                  size="md"
                  borderRadius="full"
                  onClick={ handleSetRevocableFalse }
                  bg={ !isRevocable ? 'blue.600' : 'transparent' }
                  color={ !isRevocable ? 'white' : 'fg' }
                  fontWeight={ !isRevocable ? 'bold' : 'medium' }
                  _hover={{
                    bg: !isRevocable ? 'blue.700' : '',
                  }}
                  transition="all 0.2s ease"
                >
                  No
                </Button>
              </Flex>
            </Box>

            { /* Create Schema 按钮 */ }
            <Button
              mt={ 6 }
              colorPalette="blue"
              size="lg"
              w="100%"
              onClick={ handleCreateSchema }
            >
              Create Schema
            </Button>
          </Stack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default CreateSchemaModal;
