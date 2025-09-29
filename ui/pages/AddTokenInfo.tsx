import React from 'react';

import useApiQuery from 'lib/api/useApiQuery';
import AddTokenInfoForm from 'ui/addTokenInfo/AddTokenInfoForm';
import ContentLoader from 'ui/shared/ContentLoader';
import DataFetchAlert from 'ui/shared/DataFetchAlert';
import PageTitle from 'ui/shared/Page/PageTitle';
import useProfileQuery from 'ui/snippets/auth/useProfileQuery';

type Screen = 'form' | 'result' | 'initializing' | 'error';

const AddTokenInfo = () => {

  const [ screen, setScreen ] = React.useState<Screen>('initializing');

  const profileQuery = useProfileQuery();
  const configQuery = useApiQuery('metadata:public_tag_types', { queryOptions: { enabled: !profileQuery.isLoading } });

  React.useEffect(() => {
    if (!configQuery.isPending) {
      setScreen(configQuery.isError ? 'error' : 'form');
    }
  }, [ configQuery.isError, configQuery.isPending ]);

  const content = (() => {
    switch (screen) {
      case 'initializing':
        return <ContentLoader/>;
      case 'error':
        return <DataFetchAlert/>;
      case 'form':
        return <AddTokenInfoForm/>;
      default:
        return null;
    }
  })();

  return (
    <>
      <PageTitle title="Update Token Info"/>
      { content }
    </>
  );
};

export default AddTokenInfo;
