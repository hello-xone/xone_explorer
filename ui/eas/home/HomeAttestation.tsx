import { Box } from '@chakra-ui/react';
import React from 'react';

import type { EASItem } from '../types';

import { GET_HOME_ATTESTATIONS } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import { Link } from 'toolkit/chakra/link';
import DataListDisplay from 'ui/shared/DataListDisplay';

import HomeAttestationList from './AttestationList';
import HomeAttestationTable from './AttestationTable';

interface Schema {
  id: string;
  schema: string;
  creator: string;
  resolver: string;
  revocable: boolean;
  index: string;
  time: number;
}

interface Attestation {
  id: string;
  attester: string;
  recipient: string;
  refUID: string;
  revocable: boolean;
  revocationTime: number | null;
  expirationTime: number | null;
  data: string;
  time: number;
  timeCreated: number;
  txid: string;
  schemaId: string;
  isOffchain: boolean;
  schema: Schema;
}

interface AttestationsResponse {
  attestations: Array<Attestation>;
}

const HomeAttestation = () => {
  const { data, loading, error } = useEasGraphQL<AttestationsResponse>({
    query: GET_HOME_ATTESTATIONS,
    enabled: true,
  });

  // 将 GraphQL 返回的数据转换为 EASItem 格式
  const attestations = React.useMemo(() => {
    if (!data?.attestations) return [];

    return data.attestations.map((item): EASItem => {
      // 从 schema.index 提取 schema ID
      const schemaId = item.schema?.index ? `#${ item.schema.index }` : '';

      return {
        uid: item.id,
        schema: item.schema?.id || item.schemaId,
        schemaId,
        schemaName: '',
        from: item.attester,
        to: item.recipient,
        time: item.time || item.timeCreated || undefined,
      };
    });
  }, [ data ]);

  const content = attestations.length > 0 ? (
    <Box>
      <Box hideBelow="lg">
        <HomeAttestationTable data={ attestations } isLoading={ loading } top={ 0 }/>
      </Box>

      <Box hideFrom="lg">
        <HomeAttestationList data={ attestations } isLoading={ loading }/>
      </Box>

      <Box textAlign="center" mt={ 6 }>
        <Link
          color="link"
          fontSize="sm"
          fontWeight={ 500 }
          href="/eas/attestations"
        >
          View all attestations
        </Link>
      </Box>
    </Box>
  ) : null;

  return (
    <DataListDisplay
      isError={ Boolean(error) }
      itemsNum={ attestations.length }
      emptyText="There are no attestations."
    >
      { content }
    </DataListDisplay>
  );
};

export default HomeAttestation;
