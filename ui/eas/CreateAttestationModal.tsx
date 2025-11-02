import { Box, Flex, Input, Stack, Text } from '@chakra-ui/react';
import React from 'react';

import { Button } from 'toolkit/chakra/button';
import { Checkbox } from 'toolkit/chakra/checkbox';
import { DialogBody, DialogContent, DialogHeader, DialogRoot } from 'toolkit/chakra/dialog';
import { Textarea } from 'toolkit/chakra/textarea';
import { toaster } from 'toolkit/chakra/toaster';
import IconSvg from 'ui/shared/IconSvg';

interface Schema {
  uid: string;
  schema: string;
  fields: Array<{ name: string; type: string; isArray: boolean }>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schema: Schema;
}

// 数组 Bool Checkbox
const ArrayBoolCheckbox = ({
  value,
  index,
  fieldIndex,
  onCheckedChange,
}: {
  value: string;
  index: number;
  fieldIndex: number;
  onCheckedChange: (fieldIndex: number, index: number, details: { checked: string | boolean }) => void;
}) => {
  const handleChange = React.useCallback((details: { checked: string | boolean }) => {
    onCheckedChange(fieldIndex, index, details);
  }, [ fieldIndex, index, onCheckedChange ]);

  return (
    <Checkbox
      flex={ 1 }
      checked={ value === 'true' }
      onCheckedChange={ handleChange }
    >
      <Text fontSize="sm">{ `Item ${ index + 1 }` }</Text>
    </Checkbox>
  );
};

// 辅助组件：单个 Bool Checkbox
const SingleBoolCheckbox = ({
  value,
  fieldIndex,
  onCheckedChange,
}: {
  value: string;
  fieldIndex: number;
  onCheckedChange: (fieldIndex: number, details: { checked: string | boolean }) => void;
}) => {
  const handleChange = React.useCallback((details: { checked: string | boolean }) => {
    onCheckedChange(fieldIndex, details);
  }, [ fieldIndex, onCheckedChange ]);

  return (
    <Checkbox
      checked={ value === 'true' }
      onCheckedChange={ handleChange }
    >
      <Text fontSize="sm">{ value === 'true' ? 'True' : 'False' }</Text>
    </Checkbox>
  );
};

const CreateAttestationModal = ({ isOpen, onClose, schema }: Props) => {
  const [ recipientAddress, setRecipientAddress ] = React.useState('');
  const [ fieldValues, setFieldValues ] = React.useState<Record<number, string | Array<string>>>({});

  // 初始化字段值（使用索引作为 key）
  React.useEffect(() => {
    if (isOpen && schema.fields) {
      const initialValues: Record<number, string | Array<string>> = {};
      schema.fields.forEach((field, index) => {
        // 对于数组类型，初始化为包含一个空字符串的数组
        // 对于 bool 类型，初始化为 'false'
        if (field.isArray) {
          initialValues[index] = [ '' ];
        } else if (field.type === 'bool') {
          initialValues[index] = 'false';
        } else {
          initialValues[index] = '';
        }
      });
      setFieldValues(initialValues);
    }
  }, [ isOpen, schema.fields ]);

  // 更新 Recipient Address
  const handleRecipientAddressChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value);
  }, []);

  // 更新字段值（普通输入框）
  const handleFieldValueChange = React.useCallback((fieldIndex: number) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFieldValues(prev => ({
        ...prev,
        [fieldIndex]: e.target.value,
      }));
    };
  }, []);

  // 更新 bool 类型字段值
  const handleBoolChange = React.useCallback((fieldIndex: number) => {
    return (checked: boolean) => {
      setFieldValues(prev => ({
        ...prev,
        [fieldIndex]: checked.toString(),
      }));
    };
  }, []);

  // 更新数组类型字段值（特定索引）
  const handleArrayItemChange = React.useCallback((fieldIndex: number, itemIndex: number) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFieldValues(prev => {
        const currentArray = Array.isArray(prev[fieldIndex]) ? prev[fieldIndex] as Array<string> : [ '' ];
        const newArray = [ ...currentArray ];
        newArray[itemIndex] = e.target.value;
        return {
          ...prev,
          [fieldIndex]: newArray,
        };
      });
    };
  }, []);

  // 添加数组项
  const handleAddArrayItem = React.useCallback((fieldIndex: number) => {
    return () => {
      setFieldValues(prev => {
        const currentArray = Array.isArray(prev[fieldIndex]) ? prev[fieldIndex] as Array<string> : [ '' ];
        return {
          ...prev,
          [fieldIndex]: [ ...currentArray, '' ],
        };
      });
    };
  }, []);

  // 删除数组项
  const handleRemoveArrayItem = React.useCallback((fieldIndex: number, itemIndex: number) => {
    return () => {
      setFieldValues(prev => {
        const currentArray = Array.isArray(prev[fieldIndex]) ? prev[fieldIndex] as Array<string> : [ '' ];
        if (currentArray.length <= 1) {
          return prev; // 至少保留一个输入框
        }
        const newArray = currentArray.filter((_, i) => i !== itemIndex);
        return {
          ...prev,
          [fieldIndex]: newArray,
        };
      });
    };
  }, []);

  // 表单验证
  const validateForm = React.useCallback(() => {
    // 检查 Recipient Address 格式
    if (recipientAddress && !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      toaster.create({
        title: 'Validation Failed',
        description: 'Invalid Recipient Address format',
        type: 'error',
        duration: 3000,
      });
      return false;
    }

    // 检查是否所有必填字段都有值
    const hasEmptyFields = schema.fields.some((field, index) => {
      const value = fieldValues[index];

      // 对于数组类型，检查是否有空值
      if (Array.isArray(value)) {
        return value.length === 0 || value.some(item => !item || item.trim() === '');
      }

      // 对于 bool 类型，不需要验证（已有默认值）
      if (field.type === 'bool') {
        return false;
      }

      // 对于普通类型，检查是否为空
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (hasEmptyFields) {
      toaster.create({
        title: 'Validation Failed',
        description: 'Please fill in all fields',
        type: 'error',
        duration: 3000,
      });
      return false;
    }

    return true;
  }, [ recipientAddress, fieldValues, schema.fields ]);

  // 创建 Attestation
  const handleCreateAttestation = React.useCallback(() => {
    if (!validateForm()) {
      return;
    }

    // Schema UID: schema.uid
    // Recipient: recipientAddress || '0x0000000000000000000000000000000000000000'
    // Data: fieldValues

    // 显示成功提示
    toaster.create({
      title: 'Attestation Created Successfully',
      description: `Attestation created for Schema ${ schema.uid.slice(0, 10) }...`,
      type: 'success',
      duration: 5000,
    });

    // 关闭弹窗
    onClose();

    // 重置表单
    setRecipientAddress('');
    setFieldValues({});
  }, [ schema.uid, onClose, validateForm ]);

  const handleOpenChange = React.useCallback(({ open }: { open: boolean }) => {
    if (!open) {
      onClose();
    }
  }, [ onClose ]);

  // 格式化 schema 显示
  const formattedSchema = React.useMemo(() => {
    return schema.fields.map(field => {
      const typeStr = field.isArray ? `${ field.type }[]` : field.type;
      return `${ typeStr } ${ field.name }`;
    }).join(', ');
  }, [ schema.fields ]);

  // 判断是否为数字类型
  const isNumberType = React.useCallback((type: string) => {
    return type.startsWith('uint') || type.startsWith('int');
  }, []);

  // 判断是否为字节类型
  const isBytesType = React.useCallback((type: string) => {
    return type === 'bytes' || type.startsWith('bytes');
  }, []);

  // 处理数组 bool 类型的 change
  const handleBoolArrayItemChange = React.useCallback((fieldIndex: number, itemIndex: number, details: { checked: string | boolean }) => {
    const checkedValue = typeof details.checked === 'boolean' ? details.checked : details.checked === 'true';
    const e = {
      target: { value: checkedValue.toString() },
    } as React.ChangeEvent<HTMLInputElement>;
    handleArrayItemChange(fieldIndex, itemIndex)(e);
  }, [ handleArrayItemChange ]);

  // 处理单个 bool 类型的 change
  const handleSingleBoolChange = React.useCallback((fieldIndex: number, details: { checked: string | boolean }) => {
    const checkedValue = typeof details.checked === 'boolean' ? details.checked : details.checked === 'true';
    handleBoolChange(fieldIndex)(checkedValue);
  }, [ handleBoolChange ]);

  // 渲染输入框（根据类型）
  const renderFieldInput = React.useCallback((field: { name: string; type: string; isArray: boolean }, fieldIndex: number) => {
    const currentValue = fieldValues[fieldIndex];

    // 数组类型
    if (field.isArray) {
      const arrayValues = Array.isArray(currentValue) ? currentValue : [ '' ];

      return (
        <Stack gap={ 2 }>
          { arrayValues.map((value, index) => {
            let inputElement;

            if (field.type === 'bool') {
              inputElement = (
                <ArrayBoolCheckbox
                  value={ value }
                  index={ index }
                  fieldIndex={ fieldIndex }
                  onCheckedChange={ handleBoolArrayItemChange }
                />
              );
            } else if (field.type === 'string') {
              inputElement = (
                <Textarea
                  flex={ 1 }
                  placeholder={ `Enter ${ field.name } item ${ index + 1 }...` }
                  value={ value }
                  onChange={ handleArrayItemChange(fieldIndex, index) }
                  minH="80px"
                  resize="vertical"
                />
              );
            } else {
              inputElement = (
                <Input
                  flex={ 1 }
                  placeholder={ `Enter ${ field.name } item ${ index + 1 }...` }
                  value={ value }
                  onChange={ handleArrayItemChange(fieldIndex, index) }
                  size="lg"
                  type={ isNumberType(field.type) ? 'number' : 'text' }
                  fontFamily={ field.type === 'address' || isBytesType(field.type) ? 'mono' : 'inherit' }
                />
              );
            }

            return (
              <Flex key={ index } gap={ 2 } align="center">
                { inputElement }
                { arrayValues.length > 1 && (
                  <Button
                    variant="ghost"
                    colorPalette="red"
                    size="md"
                    onClick={ handleRemoveArrayItem(fieldIndex, index) }
                    px={ 2 }
                  >
                    <IconSvg name="delete" boxSize={ 5 }/>
                  </Button>
                ) }
              </Flex>
            );
          }) }
          <Button
            variant="outline"
            size="sm"
            onClick={ handleAddArrayItem(fieldIndex) }
            alignSelf="flex-start"
          >
            <IconSvg name="plus" boxSize={ 4 } mr={ 1 }/>
            Add item
          </Button>
        </Stack>
      );
    }

    // bool 类型
    if (field.type === 'bool') {
      return (
        <SingleBoolCheckbox
          value={ typeof currentValue === 'string' ? currentValue : 'false' }
          fieldIndex={ fieldIndex }
          onCheckedChange={ handleSingleBoolChange }
        />
      );
    }

    // string 类型（非数组）
    if (field.type === 'string') {
      return (
        <Textarea
          placeholder={ `Enter ${ field.name }...` }
          value={ typeof currentValue === 'string' ? currentValue : '' }
          onChange={ handleFieldValueChange(fieldIndex) }
          minH="120px"
          resize="vertical"
        />
      );
    }

    // 其他类型（数字、地址、bytes等）
    return (
      <Input
        placeholder={ `Enter ${ field.name }...` }
        value={ typeof currentValue === 'string' ? currentValue : '' }
        onChange={ handleFieldValueChange(fieldIndex) }
        size="lg"
        type={ isNumberType(field.type) ? 'number' : 'text' }
        fontFamily={ field.type === 'address' || isBytesType(field.type) ? 'mono' : 'inherit' }
      />
    );
  }, [
    fieldValues,
    isNumberType,
    isBytesType,
    handleFieldValueChange,
    handleBoolArrayItemChange,
    handleSingleBoolChange,
    handleArrayItemChange,
    handleAddArrayItem,
    handleRemoveArrayItem,
  ]);

  return (
    <DialogRoot
      open={ isOpen }
      onOpenChange={ handleOpenChange }
    >
      <DialogContent maxW="700px" borderRadius="xl" p={ 0 }>
        <DialogHeader pt={ 8 } px={ 8 }>
          <Box>
            <Text fontSize="32px" fontWeight="bold" lineHeight="1.2">
              Create Attestation
            </Text>
            <Text fontSize="16px" fontWeight="normal" color="text.secondary" mt={ 1 }>
              Create a new attestation for this schema
            </Text>
          </Box>
        </DialogHeader>
        <DialogBody pb={ 8 } px={ 8 } mt={ 2 }>
          <Stack gap={ 4 }>
            { /* Schema Format 显示 */ }
            <Box>
              <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" color="fg.muted" mb={ 2 }>
                Schema Format:
              </Text>
              <Box
                p={ 3 }
                bg="bg.subtle"
                borderRadius="md"
                borderWidth="1px"
                borderColor="border"
              >
                <Text fontSize="sm" fontFamily="mono" color="fg">
                  { formattedSchema }
                </Text>
              </Box>
            </Box>

            { /* Recipient Address */ }
            <Box>
              <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" color="fg.muted" mb={ 1 }>
                Recipient Address
              </Text>
              <Input
                placeholder="0x0000000000000000000000000000000000000000"
                value={ recipientAddress }
                onChange={ handleRecipientAddressChange }
                size="lg"
                fontFamily="mono"
              />
              <Text fontSize="xs" color="fg.muted" mt={ 1 }>
                Leave empty to use zero address
              </Text>
            </Box>

            { /* 动态字段 */ }
            { schema.fields.map((field, index) => {
              const fieldLabel = `${ field.name } (${ field.isArray ? `${ field.type }[]` : field.type })`;

              return (
                <Box key={ index }>
                  <Text fontSize="sm" fontWeight="bold" color="fg" mb={ 2 }>
                    { fieldLabel }
                  </Text>
                  { renderFieldInput(field, index) }
                </Box>
              );
            }) }

            { /* 按钮组 */ }
            <Flex gap={ 3 } mt={ 4 } justify="flex-end">
              <Button
                variant="outline"
                size="lg"
                onClick={ onClose }
                minW="140px"
              >
                Cancel
              </Button>
              <Button
                colorPalette="green"
                size="lg"
                onClick={ handleCreateAttestation }
                minW="180px"
              >
                Create Attestation
              </Button>
            </Flex>
          </Stack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default CreateAttestationModal;
