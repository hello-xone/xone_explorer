import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import { Button } from 'toolkit/chakra/button';
import { Skeleton } from 'toolkit/chakra/skeleton';

interface SchemaField {
  type: string;
  name: string;
}

interface Props {
  schema: string;
  isLoading?: boolean;
  maxFields?: number;
  defaultShowCount?: number; // 默认显示的字段数量
}

const SchemaFieldBadges = ({ schema, isLoading, maxFields, defaultShowCount = 3 }: Props) => {
  const [ isExpanded, setIsExpanded ] = React.useState(false);

  const allFields = React.useMemo(() => {
    if (!schema) return [];

    try {
      // 解析 schema 字符串，格式如: "string credentialType,string entityId,string metadata"
      const fieldParts = schema.split(',').map(part => part.trim());
      const parsedFields: Array<SchemaField> = [];

      for (const part of fieldParts) {
        // 匹配类型和名称，如 "string credentialType" 或 "uint256 amount"
        const match = part.match(/^(\w+(?:\[\])?)\s+(\w+)$/);
        if (match) {
          parsedFields.push({
            type: match[1].toUpperCase(),
            name: match[2],
          });
        }
      }

      // 如果指定了最大字段数，则截取
      if (maxFields && parsedFields.length > maxFields) {
        return parsedFields.slice(0, maxFields);
      }

      return parsedFields;
    } catch {
      return [];
    }
  }, [ schema, maxFields ]);

  // 确定要显示的字段
  const displayFields = React.useMemo(() => {
    if (isExpanded || allFields.length <= defaultShowCount) {
      return allFields;
    }
    return allFields.slice(0, defaultShowCount);
  }, [ allFields, isExpanded, defaultShowCount ]);

  const hasMoreFields = allFields.length > defaultShowCount;
  const remainingCount = allFields.length - defaultShowCount;

  const handleToggleExpand = React.useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  if (isLoading) {
    return (
      <Flex gap={ 1.5 } flexWrap="wrap">
        { [ 1, 2, 3 ].map((i) => (
          <Skeleton key={ i } loading={ true } w={{ base: '90px', md: '100px' }} h={{ base: '38px', md: '42px' }} borderRadius="md"/>
        )) }
      </Flex>
    );
  }

  if (allFields.length === 0) {
    return (
      <Text fontSize="xs" color="text.secondary" fontFamily="mono">
        { schema || 'No schema defined' }
      </Text>
    );
  }

  return (
    <Box>
      <Flex gap={ 2 } flexWrap="wrap">
        { displayFields.map((field, index) => (
          <Box
            key={ index }
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            px={{ base: 1.5, md: 2 }}
            py={{ base: 1, md: 1.5 }}
            bg="gray.50"
            _dark={{
              borderColor: 'gray.600',
              bg: 'gray.700',
            }}
          >
            <Text
              fontSize={{ base: '10px', md: '11px' }}
              color="text.secondary"
              fontWeight={ 500 }
              textTransform="uppercase"
              mb={ 0.5 }
              lineHeight="1.2"
            >
              { field.type }
            </Text>
            <Text
              fontSize={{ base: '11px', md: '12px' }}
              fontWeight={ 600 }
              color="text.primary"
              fontFamily="mono"
              lineHeight="1.3"
            >
              { field.name }
            </Text>
          </Box>
        )) }

        { /* 展开/收起按钮 */ }
        { hasMoreFields && (
          <Button
            variant="outline"
            size="xs"
            onClick={ handleToggleExpand }
            minW={{ base: '80px', md: '90px' }}
            h={{ base: '38px', md: '42px' }}
            px={{ base: 2, md: 2.5 }}
            fontSize={{ base: '10px', md: '11px' }}
            fontWeight={ 600 }
            lineHeight="1.2"
            borderRadius="md"
            borderWidth="1px"
            borderColor="border"
            bg="bg.subtle"
            color="fg"
            transition="all 0.15s"
            _hover={{
              borderColor: 'border.emphasized',
              bg: 'bg.muted',
            }}
          >
            { isExpanded ? 'Collapse ↑' : `+${ remainingCount } More` }
          </Button>
        ) }
      </Flex>
    </Box>
  );
};

export default SchemaFieldBadges;
