import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import { Skeleton } from 'toolkit/chakra/skeleton';

interface SchemaField {
  type: string;
  name: string;
}

interface Props {
  schema: string;
  isLoading?: boolean;
  maxFields?: number;
}

const SchemaFieldBadges = ({ schema, isLoading, maxFields }: Props) => {
  const fields = React.useMemo(() => {
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

  if (isLoading) {
    return (
      <Flex gap={ 2 } flexWrap="wrap">
        { [ 1, 2, 3 ].map((i) => (
          <Skeleton key={ i } loading={ true } w="120px" h="56px" borderRadius="md"/>
        )) }
      </Flex>
    );
  }

  if (fields.length === 0) {
    return (
      <Text fontSize="sm" color="text.secondary" fontFamily="mono">
        { schema || 'No schema defined' }
      </Text>
    );
  }

  return (
    <Flex gap={ 2 } flexWrap="wrap" paddingRight={ 2 }>
      { fields.map((field, index) => (
        <Box
          key={ index }
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          px={ 3 }
          py={ 2 }
          bg="gray.50"
          _dark={{
            borderColor: 'gray.600',
            bg: 'gray.700',
          }}
        >
          <Text
            fontSize="xs"
            color="text.secondary"
            fontWeight={ 500 }
            textTransform="uppercase"
            mb={ 1 }
          >
            { field.type }
          </Text>
          <Text
            fontSize="sm"
            fontWeight={ 600 }
            color="text.primary"
            fontFamily="mono"
          >
            { field.name }
          </Text>
        </Box>
      )) }
    </Flex>
  );
};

export default SchemaFieldBadges;
