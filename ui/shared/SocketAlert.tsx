import { Text, chakra } from '@chakra-ui/react';
import React from 'react';

import { Alert } from 'toolkit/chakra/alert';
import { Link } from 'toolkit/chakra/link';

interface Props {
  className?: string;
}

const SocketAlert = ({ className }: Props) => {
  const reloadHref = typeof window !== 'undefined' && window.document?.location
    ? window.document.location.href
    : '#';

  return (
    <Alert status="warning" className={ className }>
      <Text whiteSpace="pre">Connection lost, click </Text>
      <Link href={ reloadHref }>to load newer records</Link>
    </Alert>
  );
};

export default chakra(SocketAlert);
