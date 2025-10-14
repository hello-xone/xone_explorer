import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import PageNextJs from 'nextjs/PageNextJs';

const EAS = dynamic(() => import('ui/pages/EASSearch'), { ssr: false });

const Page: NextPage = () => {
  return (
    <PageNextJs pathname="/">
      <EAS/>
    </PageNextJs>
  );
};

export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps/main';
