import { Box, Flex, Input, Stack, Text } from '@chakra-ui/react';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import React from 'react';

import useAccount from 'lib/web3/useAccount';
import useEthersSigner from 'lib/web3/useEthersSigner';
import { Button } from 'toolkit/chakra/button';
import { Checkbox } from 'toolkit/chakra/checkbox';
import { DialogBody, DialogContent, DialogHeader, DialogRoot } from 'toolkit/chakra/dialog';
import { Textarea } from 'toolkit/chakra/textarea';
import { toaster } from 'toolkit/chakra/toaster';
import IconSvg from 'ui/shared/IconSvg';
import NetworkSwitchDialog from 'ui/shared/NetworkSwitchDialog';

import { EAS_CONFIG } from './constants';

interface Schema {
  uid: string;
  schema: string;
  fields: Array<{ name: string; type: string; isArray: boolean }>;
  revocable: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schema: Schema;
  onAttestationComplete?: (uid: string) => void;
  onAttestationError?: (error: Error) => void;
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

const CreateAttestationModal = ({ isOpen, onClose, schema, onAttestationComplete, onAttestationError }: Props) => {
  const [ recipientAddress, setRecipientAddress ] = React.useState('');
  const [ fieldValues, setFieldValues ] = React.useState<Record<number, string | Array<string>>>({});
  const [ expirationTime, setExpirationTime ] = React.useState('');
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

  // 初始化字段值（使用索引作为 key）
  React.useEffect(() => {
    if (isOpen && schema.fields) {
      const initialValues: Record<number, string | Array<string>> = {};
      schema.fields.forEach((field, index) => {
        if (field.isArray) {
          // 对于 bool 数组，初始化为 ['false']，其他数组类型初始化为 ['']
          if (field.type === 'bool') {
            initialValues[index] = [ 'false' ];
          } else {
            initialValues[index] = [ '' ];
          }
        } else if (field.type === 'bool') {
          // 单个 bool 字段，初始化为 'false'
          initialValues[index] = 'false';
        } else {
          // 其他单个字段，初始化为空字符串
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

  // 更新 Expiration Time
  const handleExpirationTimeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExpirationTime(e.target.value);
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
        // 根据字段类型决定新增项的默认值：bool 类型为 'false'，其他类型为空字符串
        const field = schema.fields[fieldIndex];
        const defaultValue = field?.type === 'bool' ? 'false' : '';
        return {
          ...prev,
          [fieldIndex]: [ ...currentArray, defaultValue ],
        };
      });
    };
  }, [ schema.fields ]);

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

  // 获取字段的默认值
  const getDefaultValue = React.useCallback((type: string) => {
    if (type === 'bool') {
      return false;
    }
    if (type.startsWith('uint') || type.startsWith('int')) {
      return 0;
    }
    if (type === 'address') {
      return '0x0000000000000000000000000000000000000000';
    }
    if (type === 'bytes' || type.startsWith('bytes')) {
      return '0x';
    }
    return '';
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

    // 验证过期时间格式
    if (expirationTime) {
      const dateFormatRegex = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/;
      if (!dateFormatRegex.test(expirationTime)) {
        toaster.create({
          title: 'Validation Failed',
          description: 'Invalid expiration time format. Use: YYYY-MM-DD HH:mm (e.g., 2025-12-31 23:59)',
          type: 'error',
          duration: 5000,
        });
        return false;
      }

      // 验证日期是否有效
      const match = expirationTime.match(dateFormatRegex);
      if (match) {
        const [ , year, month, day, hour, minute ] = match;
        const testDate = new Date(`${ year }-${ month }-${ day }T${ hour }:${ minute }:00`);
        if (isNaN(testDate.getTime())) {
          toaster.create({
            title: 'Validation Failed',
            description: 'Invalid date/time value',
            type: 'error',
            duration: 3000,
          });
          return false;
        }

        // 检查日期是否在未来
        if (testDate <= new Date()) {
          toaster.create({
            title: 'Validation Failed',
            description: 'Expiration time must be in the future',
            type: 'error',
            duration: 3000,
          });
          return false;
        }
      }
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
  }, [ recipientAddress, expirationTime, fieldValues, schema.fields ]);

  // 创建 Attestation
  const handleCreateAttestation = React.useCallback(async() => {
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
      console.log('\n=== 🚀 Starting Attestation Creation ===');
      console.log('Schema ID:', schema.uid);
      console.log('Schema Format:', schema.schema);
      console.log('Field Values:', fieldValues);

      // 0. 检查 schema
      if (!schema.schema) {
        toaster.create({
          title: '❌ Failed to Load Schema',
          description: 'Unable to retrieve schema format. Please refresh and try again.',
          type: 'error',
        });
        return;
      }

      // 1. 检查 signer
      if (!signer) {
        toaster.create({
          title: '❌ Wallet Not Connected',
          description: 'Please connect your wallet before creating attestation',
          type: 'error',
        });
        return;
      }

      // 2. 验证 recipient 地址格式（如果不为空且不是零地址）
      const recipient = recipientAddress || '0x0000000000000000000000000000000000000000';
      const zeroAddress = '0x0000000000000000000000000000000000000000';
      if (recipient && recipient !== zeroAddress) {
        if (!ethers.isAddress(recipient)) {
          toaster.create({
            title: '❌ Invalid Recipient Address',
            description: 'Please enter a valid Ethereum address (42 hex characters starting with 0x)',
            type: 'error',
          });
          return;
        }
      }

      // 3. 验证所有 address 类型字段的格式
      const invalidAddressFields: Array<string> = [];
      schema.fields.forEach((field, index) => {
        if (field.type === 'address') {
          const value = fieldValues[index];
          if (field.isArray) {
            const arrayValue = Array.isArray(value) ? value : [ value || '' ];
            arrayValue.forEach((v, i) => {
              const strValue = String(v || '').trim();
              if (strValue && !ethers.isAddress(strValue)) {
                invalidAddressFields.push(`${ field.name }[${ i }]`);
              }
            });
          } else {
            const strValue = String(value || '').trim();
            if (strValue && !ethers.isAddress(strValue)) {
              invalidAddressFields.push(field.name);
            }
          }
        }
      });

      if (invalidAddressFields.length > 0) {
        toaster.create({
          title: '❌ Invalid Address Format',
          description: `Invalid addresses in: ${ invalidAddressFields.join(', ') }. ` +
            'Ethereum addresses must be 42 characters starting with "0x" (e.g., 0x1234...abcd). ' +
            'Leave empty to use zero address, or remove the item if not needed.',
          type: 'error',
          duration: 8000,
        });
        return;
      }

      console.log('✅ All validations passed');

      // 初始化 EAS
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

      // 验证 EAS 合约是否存在
      const provider = new ethers.JsonRpcProvider(EAS_CONFIG.rpcProvider);
      const easContractCode = await provider.getCode(EAS_CONFIG.contractAddress);
      if (easContractCode === '0x') {
        console.error('❌ EAS Contract doesn\'t exist at address:', EAS_CONFIG.contractAddress);
        toaster.create({
          title: '❌ EAS Contract Not Found',
          description: `EAS contract not deployed at ${ EAS_CONFIG.contractAddress.slice(0, 10) }...${ EAS_CONFIG.contractAddress.slice(-8) }. ` +
            'Please check your network configuration.',
          type: 'error',
          duration: 10000,
        });
        return;
      }
      console.log('✅ EAS contract verified (code size:', (easContractCode.length - 2) / 2, 'bytes)');

      const eas = new EAS(EAS_CONFIG.contractAddress);
      eas.connect(signer);
      console.log('✅ EAS connected');

      // 验证 Schema 是否存在于链上
      setLoadingStatus('Verifying schema on chain...');
      console.log('\n🔍 Step 1.5: Verify Schema exists on chain');
      console.log('   Schema UID:', schema.uid);
      console.log('   Schema Format:', schema.schema);

      try {
        // 调用 SchemaRegistry 合约查询 schema
        // 正确的 ABI：getSchema 返回一个 SchemaRecord struct
        const schemaRegistryABI = [
          'function getSchema(bytes32 uid) external view returns (tuple(bytes32 uid, address resolver, bool revocable, string schema))',
        ];
        const schemaRegistry = new ethers.Contract(
          EAS_CONFIG.schemaRegistryAddress || '',
          schemaRegistryABI,
          provider,
        );

        const onChainSchema = await schemaRegistry.getSchema(schema.uid);
        console.log('   On-chain Schema:', onChainSchema);

        // 检查 schema 是否存在
        // 注意：resolver 为零地址是合法的！表示不使用自定义 resolver
        // 只有当 schema string 为空时，才表示 Schema 不存在
        const schemaString = String(onChainSchema[3] || '');
        const schemaUid = String(onChainSchema[0] || '');

        if (!schemaString || schemaString.trim() === '') {
          console.error('❌ Schema does NOT exist on chain!');
          console.error('   Schema UID queried:', schema.uid);
          console.error('   Returned schema string is empty');
          toaster.create({
            title: '❌ Schema Not Found on Chain',
            description: `Schema ${ schema.uid.slice(0, 10) }...${ schema.uid.slice(-8) } does not exist on the blockchain. ` +
              'It may not have been created yet, or the creation transaction failed. ' +
              'Please verify the schema exists before creating attestations.',
            type: 'error',
            duration: 12000,
          });
          return;
        }

        console.log('✅ Schema verified on chain');
        console.log('   UID:', schemaUid);
        console.log('   Resolver:', onChainSchema.resolver || onChainSchema[1], '(zero address = no custom resolver)');
        console.log('   Revocable:', onChainSchema.revocable ?? onChainSchema[2]);
        console.log('   Schema String:', schemaString);

        // 比较 schema format（可选：可以检测格式差异）
        const dbSchemaString = schema.schema;
        if (schemaString !== dbSchemaString) {
          console.warn('⚠️ Schema format mismatch!');
          console.warn('   Database:', dbSchemaString);
          console.warn('   On-chain:', schemaString);
          console.warn('   This might cause encoding issues. Using on-chain version...');
        }
      } catch(schemaVerifyError) {
        console.error('❌ Failed to verify schema:', schemaVerifyError);
        // 不中断流程，继续尝试创建 attestation
        console.warn('⚠️ Schema verification failed, but will continue...');
      }

      // 动态构建 encoder 基于实际 schema
      setLoadingStatus('Encoding data...');
      console.log('\n🔍 Step 2: Encode attestation data');
      console.log('Using Schema Format:', schema.schema);
      console.log('Parsed Schema Fields:', schema.fields);

      const schemaEncoder = new SchemaEncoder(schema.schema);

      // 构建编码数据
      console.log('\n📦 Encoding data for each field:');
      const encodeDataItems = schema.fields.map((field, index) => {
        const value = fieldValues[index];
        let processedValue;
        console.log(`   Field "${ field.name }" (${ field.type }${ field.isArray ? '[]' : '' }):`, value);

        // 处理数组类型
        if (field.isArray) {
          const arrayValue = Array.isArray(value) ? value : [ value || '' ];
          // 根据类型转换数组中的每个值
          if (field.type === 'bool') {
            // bool 类型：只有明确的 'true' 才是 true，其他都是 false（包括空字符串）
            processedValue = arrayValue.map(v => {
              const strValue = String(v || '').trim();
              const boolValue = strValue === 'true';
              return boolValue;
            });
          } else if (field.type === 'address') {
            // 验证并处理 address 类型数组
            processedValue = arrayValue.map(v => {
              const strValue = String(v || '').trim();
              // 如果是空值或无效地址，使用零地址
              if (!strValue || !ethers.isAddress(strValue)) {
                return '0x0000000000000000000000000000000000000000';
              }
              return strValue;
            });
          } else if (field.type.startsWith('uint') || field.type.startsWith('int')) {
            processedValue = arrayValue.map(v => v || '0');
          } else {
            processedValue = arrayValue;
          }
        } else {
          // 处理单个值
          if (field.type === 'bool') {
            // bool 类型：只有明确的 'true' 才是 true，其他都是 false（包括空值、'false'、空字符串等）
            const strValue = String(value || '').trim();
            processedValue = strValue === 'true';
            console.log(`     → bool value: "${ strValue }" → ${ processedValue } (default: false if empty)`);
          } else if (field.type === 'address') {
            // 验证并处理 address 类型
            const strValue = String(value || '').trim();
            // 如果是空值或无效地址，使用零地址
            if (!strValue || !ethers.isAddress(strValue)) {
              processedValue = '0x0000000000000000000000000000000000000000';
            } else {
              processedValue = strValue;
            }
          } else {
            processedValue = value || getDefaultValue(field.type);
          }
        }

        return {
          name: field.name,
          value: processedValue,
          type: field.isArray ? `${ field.type }[]` : field.type,
        };
      });

      const encodedData = schemaEncoder.encodeData(encodeDataItems);
      console.log('✅ Data encoding complete');

      setLoadingStatus('Sending transaction...');
      console.log('\n📝 Step 3: Create on-chain attestation');
      console.log('Sending transaction...');

      // 处理过期时间：将日期时间转换为 Unix 时间戳（秒）
      let expirationTimestamp = BigInt(0); // 默认：永不过期
      if (expirationTime) {
        try {
          // 支持格式: YYYY-MM-DD HH:mm 或标准 ISO 格式
          let date: Date;

          // 尝试解析 "YYYY-MM-DD HH:mm" 格式
          const customFormatMatch = expirationTime.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
          if (customFormatMatch) {
            const [ , year, month, day, hour, minute ] = customFormatMatch;
            date = new Date(`${ year }-${ month }-${ day }T${ hour }:${ minute }:00`);
          } else {
            // 尝试标准日期格式
            date = new Date(expirationTime);
          }

          if (!isNaN(date.getTime())) {
            expirationTimestamp = BigInt(Math.floor(date.getTime() / 1000));
            console.log(`   Expiration Time: ${ expirationTime } → Unix: ${ expirationTimestamp }`);
          } else {
            console.warn('   Invalid expiration time format, using 0 (never expires)');
          }
        } catch(e) {
          console.warn('   Invalid expiration time, using 0 (never expires):', e);
        }
      } else {
        console.log('   Expiration Time: Not set (never expires)');
      }

      const attestOptions = {
        schema: schema.uid,
        data: {
          recipient: recipient,
          expirationTime: expirationTimestamp,
          revocable: schema.revocable,
          data: encodedData,
        },
      };

      console.log('Attest Options:', attestOptions);
      // 创建链上 attestation
      const tx = await eas.attest(attestOptions);

      console.log('✅ Transaction sent');

      setLoadingStatus('Waiting for confirmation...');
      console.log('\n⏳ Step 4: Waiting for transaction confirmation');

      const newAttestationUID = await tx.wait();

      console.log('✅ Transaction confirmed');
      console.log('\n🎉 Attestation created successfully!');
      console.log('   UID:', newAttestationUID);

      const uidShort = `${ newAttestationUID.slice(0, 10) }...${ newAttestationUID.slice(-8) }`;
      const refreshMsg = `Please refresh after ${ EAS_CONFIG.refreshTime } seconds to see the record.`;
      toaster.create({
        title: '✅ Attestation Created Successfully',
        description: `UID: ${ uidShort }. ${ refreshMsg }`,
        type: 'success',
      });

      console.log('=== ✅ Attestation creation flow completed ===\n');
      /* eslint-enable no-console */

      onAttestationComplete?.(newAttestationUID);

      // 关闭弹窗
      onClose();

      // 延迟重置表单，让关闭动画完成后再清空
      const timer = setTimeout(() => {
        setRecipientAddress('');
        setExpirationTime('');
        setFieldValues({});
        clearTimeout(timer);
      }, 300);
    } catch(error) {
      const err = error as { code?: string | number; reason?: string; message?: string; info?: { error?: { code?: number } } };

      // 检查是否是用户拒绝交易（支持多种格式）
      const isUserRejected = err?.code === 'ACTION_REJECTED' ||
                            err?.code === 4001 ||
                            err?.info?.error?.code === 4001 ||
                            err?.reason === 'rejected' ||
                            err?.message?.includes('user rejected') ||
                            err?.message?.includes('User denied');

      /* eslint-disable no-console */
      if (isUserRejected) {
        // 用户拒绝交易是正常操作，只记录简单日志
        console.log('ℹ️ User cancelled the transaction');
      } else {
        // 其他错误输出详细信息
        console.error('\n=== ❌ Attestation Creation Failed ===');
        console.error('Full error:', error);
        console.error('Error code:', err?.code);
        console.error('Error reason:', err?.reason);
      }
      /* eslint-enable no-console */

      let errorTitle = '❌ Failed to Create Attestation';
      let errorDescription = '';

      if (isUserRejected) {
        errorTitle = '🚫 Transaction Cancelled';
        errorDescription = 'You rejected the transaction in your wallet. No worries, you can try again when ready.';
      } else if (err?.code === 'INSUFFICIENT_FUNDS') {
        errorTitle = '❌ Insufficient Funds';
        errorDescription = 'Your account doesn\'t have enough funds to pay for gas fees. Please add more funds and try again.';
      } else if (err?.code === 'CALL_EXCEPTION') {
        errorTitle = '❌ Contract Call Failed';
        errorDescription = 'The transaction failed during execution. ' +
          'Possible causes:\n' +
          '• Schema format mismatch\n' +
          '• Incorrect field values\n' +
          '• Network configuration error\n' +
          'Please verify your inputs and try again.';
      } else if (err?.code === 'NETWORK_ERROR') {
        errorTitle = '❌ Network Error';
        errorDescription = 'Unable to connect to the blockchain network. Please check your internet connection and RPC settings.';
      } else if (err?.code === 'TIMEOUT') {
        errorTitle = '⏱️ Transaction Timeout';
        errorDescription = 'The transaction took too long to process. Please try again.';
      } else if (err?.message) {
        // 简化错误消息，移除技术细节
        const simpleMessage = err.message.split('\n')[0].substring(0, 150);
        errorDescription = simpleMessage;
      } else {
        errorDescription = 'An unexpected error occurred. Please check the console for details.';
      }

      toaster.create({
        title: errorTitle,
        description: errorDescription,
        type: isUserRejected ? 'warning' : 'error',
        duration: isUserRejected ? 4000 : 8000,
      });

      onAttestationError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [
    schema, recipientAddress, expirationTime, fieldValues,
    validateForm, signer, getDefaultValue,
    onAttestationComplete, onAttestationError, onClose, isWrongNetwork,
  ]);

  const handleOpenChange = React.useCallback(({ open }: { open: boolean }) => {
    if (!open) {
      onClose();
      // 延迟清空表单值，让关闭动画完成后再清空
      const timer = setTimeout(() => {
        setRecipientAddress('');
        setExpirationTime('');
        setFieldValues({});
        clearTimeout(timer);
      }, 300);
    }
  }, [ onClose ]);

  const handleCloseNetworkDialog = React.useCallback(() => {
    setShowNetworkDialog(false);
  }, []);

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
                  size="md"
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

              { /* Expiration Time */ }
              <Box>
                <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" color="fg.muted" mb={ 1 }>
                  Expiration Time (Optional)
                </Text>
                <Input
                  type="text"
                  placeholder="YYYY-MM-DD HH:mm (e.g., 2025-12-31 23:59)"
                  value={ expirationTime }
                  onChange={ handleExpirationTimeChange }
                  size="lg"
                  fontFamily="mono"
                />
                <Text fontSize="xs" color="fg.muted" mt={ 1 }>
                  💡 Format: YYYY-MM-DD HH:mm (24-hour). Leave empty for no expiration.
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
                    { /* 为 address 类型添加提示 */ }
                    { field.type === 'address' && (
                      <Text fontSize="xs" color="fg.muted" mt={ 1 }>
                        💡 Must be a valid Ethereum address (42 chars, starting with 0x). Leave empty for zero address.
                      </Text>
                    ) }
                  </Box>
                );
              }) }

              { /* Loading Status */ }
              { isLoading && loadingStatus && (
                <Box mt={ 4 } textAlign="center">
                  <Text fontSize="sm" color="fg.muted">{ loadingStatus }</Text>
                </Box>
              ) }

              { /* 按钮组 */ }
              <Flex gap={ 3 } mt={ 4 } justify="flex-end">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={ onClose }
                  minW="140px"
                  disabled={ isLoading }
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="green"
                  size="lg"
                  onClick={ handleCreateAttestation }
                  minW="180px"
                  disabled={ isLoading }
                  loading={ isLoading }
                >
                  { isLoading ? 'Creating...' : 'Create Attestation' }
                </Button>
              </Flex>
            </Stack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default CreateAttestationModal;
