import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import PageNextJs from 'nextjs/PageNextJs';

const EASAttestationCreate = dynamic(() => import('ui/pages/EASAttestationCreate'), { ssr: false });

const Page: NextPage = () => {
  return (
    <PageNextJs pathname="/eas/attestationCreate">
      <EASAttestationCreate/>
    </PageNextJs>
  );
};

export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps/main';
