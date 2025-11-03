import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import PageNextJs from 'nextjs/PageNextJs';

const EASSchemas = dynamic(() => import('ui/pages/EASSchemas'), { ssr: false });

const Page: NextPage = () => {
  return (
    <PageNextJs pathname="/eas/schemas">
      <EASSchemas/>
    </PageNextJs>
  );
};

export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps/main';
