import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import PageNextJs from 'nextjs/PageNextJs';

const EASAttestations = dynamic(() => import('ui/pages/EASAttestations'), { ssr: false });

const Page: NextPage = () => {
  return (
    <PageNextJs pathname="/eas/attestations">
      <EASAttestations/>
    </PageNextJs>
  );
};

export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps/main';
