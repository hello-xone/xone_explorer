import { Text } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import { Button } from 'toolkit/chakra/button';
import { toaster } from 'toolkit/chakra/toaster';
import { SECOND } from 'toolkit/utils/consts';
import { apos } from 'toolkit/utils/htmlEntities';
import CloudflareTurnstile from 'ui/shared/cloudflareTurnstile/CloudflareTurnstile';
import useCloudflareTurnstile from 'ui/shared/cloudflareTurnstile/useCloudflareTurnstile';

import AppErrorIcon from '../AppErrorIcon';
import AppErrorTitle from '../AppErrorTitle';

function formatTimeLeft(timeLeft: number) {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return `${ hours.toString().padStart(2, '0') }h ${ minutes.toString().padStart(2, '0') }m ${ seconds.toString().padStart(2, '0') }s`;
}

interface Props {
  bypassOptions?: string;
  reset?: string;
}

const AppErrorTooManyRequests = ({ bypassOptions, reset }: Props) => {

  const [ timeLeft, setTimeLeft ] = React.useState(reset ? Math.ceil(Number(reset) / SECOND) : undefined);

  const turnstile = useCloudflareTurnstile();

  const handleSubmit = React.useCallback(async() => {
    try {
      const token = await turnstile.executeAsync();
      console.log('token', token);

      if (!token) {
        throw new Error('Turnstile is not solved');
      }

      window.location.reload();

    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Unable to get client key.',
        type: 'error',
      });
    }
  }, [ turnstile ]);

  React.useEffect(() => {
    if (reset === undefined) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev > 1) {
          return prev - 1;
        }

        window.clearInterval(interval);
        window.location.reload();

        return 0;
      });
    }, SECOND);

    return () => {
      window.clearInterval(interval);
    };
  }, [ reset ]);

  if (!config.services.cloudflareTurnstile.siteKey) {
    throw new Error('Cloudflare Turnstile site key is not set');
  }

  const text = (() => {
    if (timeLeft === undefined && bypassOptions === 'no_bypass') {
      return 'Rate limit exceeded.';
    }

    const timeLeftText = timeLeft !== undefined ? `wait ${ formatTimeLeft(timeLeft) } ` : '';
    const bypassText = bypassOptions !== 'no_bypass' ? `verify you${ apos }re human ` : '';
    const orText = timeLeft !== undefined && bypassOptions !== 'no_bypass' ? 'OR ' : '';

    return `Rate limit exceeded. Please ${ timeLeftText }${ orText }${ bypassText }before making another request.`;
  })();

  return (
    <>
      <AppErrorIcon statusCode={ 429 }/>
      <AppErrorTitle title="Too many requests"/>
      <Text color="text.secondary" mt={ 3 }>
        { text }
      </Text>
      <CloudflareTurnstile { ...turnstile }/>
      { bypassOptions !== 'no_bypass' && <Button onClick={ handleSubmit } disabled={ turnstile.isInitError } mt={ 8 }>I'm not a robot</Button> }
    </>
  );
};

export default AppErrorTooManyRequests;
