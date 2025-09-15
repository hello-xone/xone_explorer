import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import PageNextJs from 'nextjs/PageNextJs';

const DexTracker = dynamic(() => import('ui/dex/DexTracker'), { ssr: false });

const Page: NextPage = () => {
  return (
    <PageNextJs pathname="/dex-tracker">
      <DexTracker/>
    </PageNextJs>
  );
};

export default Page;

export { base as getServerSideProps } from 'nextjs/getServerSideProps/main';
