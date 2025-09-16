import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import React from 'react';

import config from 'configs/app';
import { Alert } from 'toolkit/chakra/alert';
import { Link } from 'toolkit/chakra/link';

interface Props {
  onInitError: () => void;
  hideWarning?: boolean;
}

const CloudflareTurnstileInvisible = ({
  onInitError,
  hideWarning = false,
}: Props, ref: React.Ref<TurnstileInstance>) => {
  const [ attempt, setAttempt ] = React.useState(0);
  const [ isError, setIsError ] = React.useState(false);
  const [ , setIsVisible ] = React.useState(false);

  const handleChange = React.useCallback(() => {
    setAttempt(attempt + 1);
  }, [ attempt ]);

  const handleError = React.useCallback(() => {
    setIsError(true);
    onInitError();
  }, [ onInitError ]);

  const handleClick = React.useCallback(() => {
    const badge = window.document.querySelector('.cf-turnstile');
    if (badge) {
      setIsVisible((prev) => {
        const nextValue = !prev;
        (badge as HTMLElement).style.visibility = nextValue ? 'visible' : 'hidden';
        (badge as HTMLElement).style.right = nextValue ? '14px' : '-1000px';
        return nextValue;
      });
    }
  }, [ ]);

  if (!config.services.cloudflareTurnstile.siteKey) {
    return null;
  }

  return (
    <>
      <Turnstile
        ref={ ref }
        key={ attempt }
        siteKey={ config.services.cloudflareTurnstile.siteKey }
        onSuccess={ handleChange }
        onError={ handleError }
        options={{
          theme: 'auto',
          size: 'invisible',
        }}
      />

      { isError && !hideWarning && (
        <Alert status="warning" whiteSpace="pre-wrap" w="fit-content" mt={ 3 } descriptionProps={{ display: 'block' }}>
          This feature is not available due to a Cloudflare Turnstile initialization error. Please contact the project team on Discord to report this issue.
          Click <Link onClick={ handleClick } display="inline">here</Link> to show/hide Turnstile widget content.
        </Alert>
      ) }
    </>
  );
};

export default React.forwardRef(CloudflareTurnstileInvisible);
