import React from 'react';

import { Alert } from 'toolkit/chakra/alert';
import { Link } from 'toolkit/chakra/link';
interface Props {
  status: 'error' | 'close';
}

const TxSocketAlert = ({ status }: Props) => {
  const text = status === 'close' ?
    'Connection is lost. Please click here to update transaction info.' :
    'An error has occurred while fetching transaction info. Please click here to update.';

  const reloadHref = typeof window !== 'undefined' && window.document?.location
    ? window.document.location.href
    : '#';

  return (
    <Link href={ reloadHref } asChild>
      <Alert status="warning">{ text }</Alert>
    </Link>
  );
};

export default React.memo(TxSocketAlert);
