import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import type { Route } from 'nextjs-routes';
import PageNextJs from 'nextjs/PageNextJs';

const SchemaDetail = dynamic(() => import('ui/pages/EASSchemaDetail'), { ssr: false });

interface Props {
  query: Route['query'];
}

const Page: NextPage<Props> = (props: Props) => {
  return (
    <PageNextJs pathname="/eas/schemaDetail/[index]" query={ props.query }>
      <SchemaDetail/>
    </PageNextJs>
  );
};

export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps/main';
