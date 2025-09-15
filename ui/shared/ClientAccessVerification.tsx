import React from 'react';

import AccessVerificationProvider from './AccessVerificationProvider';

interface Props {
  children: React.ReactNode;
  enabled?: boolean;
}

const ClientAccessVerification = ({ children, enabled = true }: Props) => {
  // 只在客户端渲染
  const [ isClient, setIsClient ] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return children;
  }

  return (
    <AccessVerificationProvider enabled={ enabled }>
      { children }
    </AccessVerificationProvider>
  );
};

export default ClientAccessVerification;
