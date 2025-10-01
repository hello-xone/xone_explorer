import React from 'react';

import type { AdvancedFilterParams } from 'types/api/advancedFilter';

import buildUrl from 'lib/api/buildUrl';
import { useMultichainContext } from 'lib/contexts/multichain';
import dayjs from 'lib/date/dayjs';
import downloadBlob from 'lib/downloadBlob';
import { Button } from 'toolkit/chakra/button';
import { toaster } from 'toolkit/chakra/toaster';
import CloudflareTurnstileInvisible from 'ui/shared/cloudflareTurnstile/CloudflareTurnstile';
import useCloudflareTurnstile from 'ui/shared/cloudflareTurnstile/useCloudflareTurnstile';

type Props = {
  filters: AdvancedFilterParams;
};

const ExportCSV = ({ filters }: Props) => {
  const multichainContext = useMultichainContext();
  const turnstile = useCloudflareTurnstile();

  const [ isLoading, setIsLoading ] = React.useState(false);

  const apiFetchFactory = React.useCallback(async(turnstileToken?: string) => {
    const url = buildUrl('general:advanced_filter_csv', undefined, {
      ...filters,
      turnstile_response: turnstileToken,
    }, undefined, multichainContext?.chain);

    const response = await fetch(url, {
      headers: {
        'content-type': 'application/octet-stream',
        ...(turnstileToken && { 'turnstile-response': turnstileToken }),
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText, {
        cause: {
          status: response.status,
        },
      });
    }

    return response;
  }, [ filters, multichainContext?.chain ]);

  const handleExportCSV = React.useCallback(async() => {
    try {
      setIsLoading(true);

      const response = await turnstile.fetchProtectedResource(apiFetchFactory);

      const blob = await response.blob();

      const chainText = multichainContext?.chain ? `${ multichainContext.chain.slug.replace(/-/g, '_') }_` : '';
      const fileName = `${ chainText }export-filtered-txs-${ dayjs().format('YYYY-MM-DD-HH-mm-ss') }.csv`;
      downloadBlob(blob, fileName);

    } catch (error) {
      toaster.error({
        title: 'Error',
        description: (error as Error)?.message || 'Something went wrong. Try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [ apiFetchFactory, turnstile, multichainContext?.chain ]);

  return (
    <>
      <Button
        onClick={ handleExportCSV }
        variant="outline"
        loading={ isLoading }
        size="sm"
        mr={ 3 }
      >
        Export to CSV
      </Button>
      <CloudflareTurnstileInvisible { ...turnstile } hideWarning/>
    </>
  );
};

export default ExportCSV;
