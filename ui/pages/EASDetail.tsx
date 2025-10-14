import { Box, Flex, Grid, HStack, Text } from '@chakra-ui/react';
import React from 'react';

import { Heading } from 'toolkit/chakra/heading';
import { Link } from 'toolkit/chakra/link';
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'toolkit/chakra/tabs';
import { mockSchemaDetail } from 'ui/eas/mockData';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';
import IconSvg from 'ui/shared/IconSvg';
import TimeWithTooltip from 'ui/shared/time/TimeWithTooltip';

const EASDetail = () => {
  const schema = mockSchemaDetail;

  // SDK 示例代码
  const sdkExampleCode = `import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

const easContractAddress = "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587";
const schemaUID = "${ schema.uid }";

const eas = new EAS(easContractAddress);

// Signer must be an ethers-like signer.
await eas.connect(signer);

// Initialize SchemaEncoder with the schema string
const schemaEncoder = new SchemaEncoder("${ schema.schema }");
const encodedData = schemaEncoder.encodeData([
${ schema.decodedSchema.map((field) => `  { name: "${ field.name }", value: "", type: "${ field.type }" }`).join(',\n') }
]);

const tx = await eas.attest({
  schema: schemaUID,
  data: {
    recipient: "0x0000000000000000000000000000000000000000",
    expirationTime: 0,
    revocable: ${ schema.revocable ? 'true' : 'false' }, // Be aware that if your schema is not revocable, this MUST be false
    data: encodedData,
  },
});

const newAttestationUID = await tx.wait();

console.log("New attestation UID:", newAttestationUID);`;

  return (
    <>
      { /* 顶部标题和UID */ }
      <Flex justifyContent="space-between" alignItems="flex-start" mb={ 6 } flexWrap="wrap" gap={ 4 }>
        <Box>
          <Flex alignItems="center" gap={ 3 } mb={ 2 }>
            <Box
              px={ 4 }
              py={ 2 }
              bg={{ _light: 'blue.500', _dark: 'blue.400' }}
              color={{ _light: 'white', _dark: 'gray.900' }}
              borderRadius="md"
              fontWeight={ 700 }
              fontSize="lg"
            >
              #{ schema.number }
            </Box>
            <HashStringShortenDynamic
              hash={ schema.uid }
              fontWeight={ 600 }
            />
          </Flex>
        </Box>
      </Flex>

      { /* Tabs */ }
      <TabsRoot defaultValue="overview" mb={ 6 }>
        <TabsList borderBottomWidth="1px" borderColor="divider">
          <TabsTrigger value="overview" fontWeight={ 600 } gap={ 2 }>
            <IconSvg name="info" boxSize={ 4 }/>
            Overview
          </TabsTrigger>
          <TabsTrigger value="code" fontWeight={ 600 } gap={ 2 }>
            <IconSvg name="docs" boxSize={ 4 }/>
            Code Sample
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" px={ 0 } py={ 6 }>
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1.2fr' }}
            gap={ 8 }
            mb={ 8 }
          >
            { /* 左侧：详细信息 */ }
            <Box>
              { /* Created */ }
              <Box mb={ 6 }>
                <Text fontSize="sm" fontWeight={ 600 } color="text.secondary" mb={ 2 } textTransform="uppercase">
                  Created:
                </Text>
                <TimeWithTooltip
                  timestamp={ new Date(schema.created * 1000).toISOString() }
                  enableIncrement
                />
              </Box>

              { /* Creator */ }
              <Box mb={ 6 }>
                <Text fontSize="sm" fontWeight={ 600 } color="text.secondary" mb={ 2 } textTransform="uppercase">
                  Creator:
                </Text>
                <AddressEntity
                  address={{ hash: schema.creator }}
                  truncation="none"
                />
              </Box>

              { /* Transaction ID */ }
              <Box mb={ 6 }>
                <Text fontSize="sm" fontWeight={ 600 } color="text.secondary" mb={ 2 } textTransform="uppercase">
                  Transaction ID:
                </Text>
                <Link
                  href={ `https://easscan.org/tx/${ schema.transactionId }` }
                  target="_blank"
                  fontFamily="mono"
                >
                  <HashStringShortenDynamic hash={ schema.transactionId }/>
                </Link>
              </Box>

              { /* Resolver Contract */ }
              <Box mb={ 6 }>
                <Text fontSize="sm" fontWeight={ 600 } color="text.secondary" mb={ 2 } textTransform="uppercase">
                  Resolver Contract:
                </Text>
                <AddressEntity
                  address={{ hash: schema.resolver }}
                  truncation="none"
                />

                <Flex
                  gap={ 3 }
                  p={ 3 }
                  mt={ 3 }
                  bg={{ _light: 'yellow.50', _dark: 'yellow.950' }}
                  borderRadius="md"
                  borderLeftWidth="4px"
                  borderLeftColor={{ _light: 'yellow.500', _dark: 'yellow.400' }}
                >
                  <IconSvg
                    name="info"
                    boxSize={ 5 }
                    color={{ _light: 'yellow.600', _dark: 'yellow.400' }}
                    flexShrink={ 0 }
                    mt={ 0.5 }
                  />
                  <Text fontSize="sm" color="text">
                    This schema uses a custom Resolver contract. Resolvers can execute custom logic during attestation
                    creation or revocation. Please ensure you trust this contract.
                  </Text>
                </Flex>
              </Box>

              { /* Revocable Attestations */ }
              <Box mb={ 6 }>
                <Text fontSize="sm" fontWeight={ 600 } color="text.secondary" mb={ 2 } textTransform="uppercase">
                  Revocable Attestations:
                </Text>
                <Text fontSize="md">{ schema.revocable ? 'Yes' : 'No' }</Text>
              </Box>

              { /* Attestation Count */ }
              <Box>
                <Text fontSize="sm" fontWeight={ 600 } color="text.secondary" mb={ 2 } textTransform="uppercase">
                  Attestation Count:
                </Text>
                <Box mb={ 2 } display="flex" alignItems="center" gap={ 1 }>
                  <Link
                    href={ `https://easscan.org/attestations/forSchema/${ schema.uid }` }
                    target="_blank"
                    color="link"
                    fontWeight={ 600 }
                  >
                    { schema.onchainAttestations }
                  </Link>
                  <br/>
                  <Text fontSize="sm">
                    attestation{ schema.onchainAttestations !== 1 ? 's' : '' } onchain
                  </Text>
                </Box>
                <Box display="flex" alignItems="center" gap={ 1 }>
                  <Link
                    href={ `https://easscan.org/attestations/forSchema/${ schema.uid }` }
                    target="_blank"
                    color="link"
                    fontWeight={ 600 }
                  >
                    { schema.offchainAttestations }
                  </Link>
                  <br/>
                  <Text fontSize="sm">
                    attestation{ schema.offchainAttestations !== 1 ? 's' : '' } offchain
                  </Text>
                </Box>
              </Box>
            </Box>

            { /* 右侧：Schema信息 */ }
            <Box>
              { /* Decoded Schema */ }
              <Box mb={ 6 }>
                <Text fontSize="sm" fontWeight={ 600 } color="text.secondary" mb={ 3 } textTransform="uppercase">
                  Decoded Schema:
                </Text>
                <HStack gap={ 2 } flexWrap="wrap">
                  { schema.decodedSchema.map((field, index) => (
                    <Box
                      key={ index }
                      borderWidth="1px"
                      borderColor="divider"
                      borderRadius="md"
                      p={ 3 }
                      bg="dialog.bg"
                    >
                      <Text fontSize="xs" color="text.secondary" mb={ 1 } textTransform="uppercase">
                        { field.type }
                      </Text>
                      <Text fontSize="sm" fontWeight={ 600 }>
                        { field.name }
                      </Text>
                    </Box>
                  )) }
                </HStack>
              </Box>

              { /* Raw Schema */ }
              <Box>
                <Text fontSize="sm" fontWeight={ 600 } color="text.secondary" mb={ 3 } textTransform="uppercase">
                  Raw Schema:
                </Text>
                <Box
                  p={ 4 }
                  bg="dialog.bg"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="divider"
                >
                  <Text fontFamily="mono" fontSize="sm" wordBreak="break-word">
                    { schema.schema }
                  </Text>
                </Box>
              </Box>
            </Box>
          </Grid>

          { /* Info Box */ }
          <Flex
            gap={ 3 }
            p={ 4 }
            bg={{ _light: 'blue.50', _dark: 'blue.950' }}
            borderRadius="md"
            borderLeftWidth="4px"
            borderLeftColor={{ _light: 'blue.500', _dark: 'blue.400' }}
          >
            <IconSvg name="info" boxSize={ 5 } color={{ _light: 'blue.500', _dark: 'blue.400' }} flexShrink={ 0 } mt={ 0.5 }/>
            <Text fontSize="sm" color="text">
              Schemas define the structure and type of data that can be included in an attestation.
            </Text>
          </Flex>
        </TabsContent>

        <TabsContent value="code" px={ 0 } py={ 6 }>
          { /* SDK Example */ }
          <Box mb={ 6 }>
            <Heading as="h2" size="lg" mb={ 2 }>
              SDK Example
            </Heading>
            <Text fontSize="sm" color="text.secondary" mb={ 4 }>
              Wondering how to make an attestation using this schema? Here&apos;s some example code using the{ ' ' }
              <Link
                href="https://github.com/ethereum-attestation-service/eas-sdk"
                target="_blank"
                color="link"
                fontWeight={ 600 }
              >
                EAS SDK
              </Link>
              .
            </Text>

            { /* 代码块 */ }
            <Box position="relative">
              <Box
                position="absolute"
                top={ 3 }
                right={ 3 }
                zIndex={ 1 }
              >
                <CopyToClipboard text={ sdkExampleCode }/>
              </Box>
              <Box
                p={ 4 }
                bg="dialog.bg"
                borderRadius="md"
                borderWidth="1px"
                borderColor="divider"
                overflowX="auto"
              >
                <Text
                  as="pre"
                  fontFamily="mono"
                  fontSize="sm"
                  whiteSpace="pre"
                  color="text"
                  lineHeight="1.6"
                >
                  { sdkExampleCode }
                </Text>
              </Box>
            </Box>
          </Box>

          { /* Info Box */ }
          <Flex
            gap={ 3 }
            p={ 4 }
            bg={{ _light: 'blue.50', _dark: 'blue.950' }}
            borderRadius="md"
            borderLeftWidth="4px"
            borderLeftColor={{ _light: 'blue.500', _dark: 'blue.400' }}
          >
            <IconSvg name="info" boxSize={ 5 } color={{ _light: 'blue.500', _dark: 'blue.400' }} flexShrink={ 0 } mt={ 0.5 }/>
            <Text fontSize="sm" color="text">
              Schemas define the structure and type of data that can be included in an attestation.
            </Text>
          </Flex>
        </TabsContent>
      </TabsRoot>
    </>
  );
};

export default EASDetail;
