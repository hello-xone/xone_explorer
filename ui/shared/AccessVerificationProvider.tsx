import React from 'react';

import config from 'configs/app';

import AccessVerification from './AccessVerification';

interface Props {
  children: React.ReactNode;
  enabled?: boolean;
}

const AccessVerificationProvider = ({ children, enabled = true }: Props) => {
  const [ showVerification, setShowVerification ] = React.useState(false);

  // 检查是否需要显示验证
  React.useEffect(() => {
    if (!enabled || !config.services.cloudflareTurnstile.siteKey) {
      return;
    }

    // 检查是否已经验证过
    const verified = localStorage.getItem('access_verified');
    const timestamp = localStorage.getItem('access_verified_timestamp');

    if (!verified || !timestamp) {
      setShowVerification(true);
      return;
    }

    const verifiedTime = parseInt(timestamp);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24小时

    if ((now - verifiedTime) >= twentyFourHours) {
      setShowVerification(true);
    }
  }, [ enabled ]);

  const handleVerificationSuccess = React.useCallback(() => {
    setShowVerification(false);
  }, []);

  const handleVerificationError = React.useCallback((error: Error) => {
    // Access verification failed
    // eslint-disable-next-line no-console
    console.error('Access verification failed:', error);
  }, []);

  return (
    <>
      { children }
      { showVerification && (
        <AccessVerification
          onVerificationSuccess={ handleVerificationSuccess }
          onVerificationError={ handleVerificationError }
        />
      ) }
    </>
  );
};

export default AccessVerificationProvider;
