import React from 'react';

import { GET_HOME_SCHEMA_AND_ATTESTATIONS_COUNT } from 'lib/graphql/easQueries';
import useEasGraphQL from 'lib/hooks/useEasGraphQL';
import HomeHeader from 'ui/eas/Header';
import HomeAttestation from 'ui/eas/home/HomeAttestation';
import HomeSchema from 'ui/eas/home/HomeSchema';

interface CountAggregate {
  _count: {
    _all: number;
  };
}

interface HomeTotalsResponse {
  aggregateAttestation: CountAggregate;
  aggregateSchema: CountAggregate;
}

const EAS = () => {

  const { data, loading } = useEasGraphQL<HomeTotalsResponse>({
    query: GET_HOME_SCHEMA_AND_ATTESTATIONS_COUNT,
    enabled: true,
  });

  // 从 GraphQL 响应中提取数据
  const totalAttestations = React.useMemo(() => {
    if (!data?.aggregateAttestation?._count?._all) return 0;
    return data.aggregateAttestation._count._all;
  }, [ data ]);

  const totalSchemas = React.useMemo(() => {
    if (!data?.aggregateSchema?._count?._all) return 0;
    return data.aggregateSchema._count._all;
  }, [ data ]);

  return (
    <>
      <HomeHeader
        loading={ loading }
        isMakeAttestationButton
        title="Dashboard"
        description="Showing the most recent EAS activity."
        gridList={ [ { label: 'Total Attestations', value: totalAttestations }, { label: 'Total Schemas', value: totalSchemas } ] }
      />
      <HomeAttestation/>
      <HomeSchema/>
    </>
  );
};

export default EAS;
