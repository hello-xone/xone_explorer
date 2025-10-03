import { Text } from '@chakra-ui/react';
import React from 'react';

import { Alert } from 'toolkit/chakra/alert';
import { Link } from 'toolkit/chakra/link';
import { apos } from 'toolkit/utils/htmlEntities';

function ChartsLoadingErrorAlert() {
  const reloadHref = typeof window !== 'undefined' && window.document?.location
    ? window.document.location.href
    : '#';

  return (
    <Alert status="warning" mb={ 4 } closable>
      <Text mr={ 2 }>
        { `Some of the charts did not load because the server didn${ apos }t respond. To reload charts ` }
        <Link href={ reloadHref }>click once again.</Link>
      </Text>
    </Alert>
  );
}

export default ChartsLoadingErrorAlert;
