import type { NextPage } from 'next';
import React from 'react';

import PageNextJs from 'nextjs/PageNextJs';

import AddTokenInfo from 'ui/pages/AddTokenInfo';

const Page: NextPage = () => {
  return (
    <PageNextJs pathname="/add-token-info">
      <AddTokenInfo/>
    </PageNextJs>
  );
};

export default Page;

export { publicTagsSubmit as getServerSideProps } from 'nextjs/getServerSideProps/main';
