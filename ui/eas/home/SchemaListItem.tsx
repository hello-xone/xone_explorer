import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import React from 'react';

import { Tooltip } from 'toolkit/chakra/tooltip';
import { useClipboard } from 'toolkit/hooks/useClipboard';
import { SCHEMA_FIELD_REGEX } from 'ui/eas/constants';
import IconSvg from 'ui/shared/IconSvg';

export interface SchemaField {
  type: string;
  name: string;
}

// 解析 schema 字符串（用于显示）
export const parseSchemaString = (schemaStr: string): Array<SchemaField> => {
  const fields = schemaStr.split(',').map(field => field.trim());
  return fields.map(field => {
    const match = field.match(SCHEMA_FIELD_REGEX);
    if (match) {
      const [ , type, name ] = match;
      return { type, name };
    }
    return null;
  }).filter((field): field is SchemaField => field !== null);
};

// 简化显示 UID
export const shortenUID = (uid: string, startLength = 10, endLength = 4): string => {
  if (uid.length <= startLength + endLength + 3) return uid;
  return `${ uid.slice(0, startLength) }...${ uid.slice(-endLength) }`;
};

export interface TopSchema {
  id: string;
  index: string;
  schema: string;
  revocable: boolean;
  time: number;
  creator: string;
  attestations: Array<{ id: string }>;
  _count?: {
    attestations: number;
  };
}

interface SchemaListItemProps {
  schema: TopSchema;
  attestationsCount: number;
  parsedFields: Array<SchemaField>;
  onClick: () => void;
  index: number;
}

const SchemaListItem: React.FC<SchemaListItemProps> = ({ schema, attestationsCount, parsedFields, onClick }) => {
  const { copy, hasCopied } = useClipboard(schema.id);
  const [ isExpanded, setIsExpanded ] = React.useState(false);

  const handleCopy = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    copy();
  }, [ copy ]);

  const handleToggleExpand = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <Flex
      p={{ base: 2, md: 2.5 }}
      align="center"
      gap={{ base: 2, md: 3 }}
      bg="bg"
      borderRadius="md"
      borderWidth="1px"
      borderColor="divider"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        borderColor: 'border.emphasized',
      }}
      onClick={ onClick }
    >
      <Flex
        align="center"
        justify="center"
        p={{ base: 1.5, md: 2 }}
        bg="red.50"
        _dark={{ bg: 'red.900' }}
        borderRadius="md"
        minW={{ base: '36px', md: '42px' }}
      >
        <Text
          fontSize={{ base: '2xs', md: 'xs' }}
          fontWeight="700"
          color="red.600"
          _dark={{ color: 'red.300' }}
          lineHeight="1"
        >
          #{ schema.index }
        </Text>
      </Flex>
      <VStack flex={ 1 } align="stretch" gap={{ base: 1, md: 1.5 }}>
        { /* 头部信息 */ }
        <Flex align="center" gap={{ base: 2, md: 4 }}>
          <Box flex={ 1 } minW={ 0 }>
            <Flex align="center" gap={ 2 } flexWrap="wrap">
              <Tooltip content={ hasCopied ? 'Copied!' : schema.id }>
                <Flex
                  align="center"
                  gap={{ base: 0.5, md: 1 }}
                  px={{ base: 1, md: 1.5 }}
                  py={ 0.5 }
                  pr={{ base: 0.5, md: 0.8 }}
                  bg="bg.muted"
                  borderRadius="sm"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: 'bg.subtle' }}
                  onClick={ handleCopy }
                >
                  <Text fontSize="2xs" color="text.secondary" fontWeight="500">{ shortenUID(schema.id) }</Text>
                  <IconSvg
                    name={ hasCopied ? 'check' : 'copy' }
                    boxSize={{ base: 2.5, md: 3 }}
                    color={ hasCopied ? 'green.500' : 'text.secondary' }
                  />
                </Flex>
              </Tooltip>
              <Text fontSize={{ base: '2xs', md: 'xs' }} color="text.secondary" fontWeight="500">
                { attestationsCount } attestations
              </Text>
              { /* Revocable 状态 */ }
              <Flex align="center" gap={{ base: 1, md: 1.5 }} flexShrink={ 0 } display={{ base: 'none', sm: 'flex' }}>
                <Box
                  w={{ base: '5px', md: '6px' }}
                  h={{ base: '5px', md: '6px' }}
                  bg={ schema.revocable ? 'green.500' : 'orange.500' }
                  borderRadius="full"
                />
                <Text fontSize={{ base: '2xs', md: 'xs' }} color="text.secondary" fontWeight="500">
                  { schema.revocable ? 'Revocable' : 'Non-revocable' }
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Flex>

        { /* Schema 字段 */ }
        { parsedFields && parsedFields.length > 0 && (
          <Flex wrap="wrap" gap={{ base: 1, md: 1.5 }}>
            { (isExpanded ? parsedFields : parsedFields.slice(0, 3)).map((field, fieldIndex) => (
              <Box
                key={ fieldIndex }
                px={{ base: 1, md: 1.5 }}
                py={{ base: 0.5, md: 0.5 }}
                bg="bg.muted"
                borderRadius="sm"
                fontSize="2xs"
              >
                <Text
                  as="span"
                  color="blue.600"
                  _dark={{ color: 'blue.400' }}
                  fontWeight="600"
                  fontFamily="mono"
                >
                  { field.type }
                </Text>
                <Text as="span" fontWeight="500" color="text.secondary" ml={{ base: 0.5, md: 1 }}>
                  { field.name }
                </Text>
              </Box>
            )) }
            { parsedFields.length > 3 && (
              <Tooltip content={ isExpanded ? 'Show less' : 'Show all fields' }>
                <Flex
                  align="center"
                  gap={{ base: 0.5, md: 1 }}
                  px={{ base: 1, md: 1.5 }}
                  py={{ base: 0.5, md: 0.5 }}
                  bg="blue.subtle"
                  borderRadius="sm"
                  fontSize="2xs"
                  color="blue.fg"
                  fontWeight="600"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: 'blue.emphasized',
                    transform: 'scale(1.05)',
                  }}
                  onClick={ handleToggleExpand }
                >
                  { isExpanded ? (
                    <>
                      <IconSvg name="minus" boxSize={{ base: 2, md: 2.5 }}/>
                      <Text display={{ base: 'none', sm: 'block' }}>Show less</Text>
                    </>
                  ) : (
                    <>
                      <Text>+{ parsedFields.length - 3 }</Text>
                      <IconSvg name="plus" boxSize={{ base: 2, md: 2.5 }}/>
                    </>
                  ) }
                </Flex>
              </Tooltip>
            ) }
          </Flex>
        ) }
      </VStack>
      { /* 箭头图标 */ }
      <IconSvg
        name="arrows/east"
        boxSize={{ base: 3.5, md: 4.5 }}
        color="text.secondary"
        opacity={ 0.5 }
        flexShrink={ 0 }
      />
    </Flex>
  );
};

export default SchemaListItem;
