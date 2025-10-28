import { chakra } from '@chakra-ui/react';
import type { UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';

import type { FormFields } from './types';
import type { UserInfo } from 'types/api/account';

import config from 'configs/app';
import useApiFetch from 'lib/api/useApiFetch';
import getErrorMessage from 'lib/errors/getErrorMessage';
import getErrorObjPayload from 'lib/errors/getErrorObjPayload';
import * as mixpanel from 'lib/mixpanel';
import { Button } from 'toolkit/chakra/button';
import { Heading } from 'toolkit/chakra/heading';
import { toaster } from 'toolkit/chakra/toaster';
import { FormFieldText } from 'toolkit/components/forms/fields/FormFieldText';
import { useDisclosure } from 'toolkit/hooks/useDisclosure';
import CloudflareTurnstile from 'ui/shared/cloudflareTurnstile/CloudflareTurnstile';
import useCloudflareTurnstile from 'ui/shared/cloudflareTurnstile/useCloudflareTurnstile';
import AuthModal from 'ui/snippets/auth/AuthModal';

import MyProfileFieldsEmail from './fields/MyProfileFieldsEmail';

const MIXPANEL_CONFIG = {
  account_link_info: {
    source: 'Profile' as const,
  },
};

interface Props {
  profileQuery: UseQueryResult<UserInfo, unknown>;
}

const MyProfileEmail = ({ profileQuery }: Props) => {
  const authModal = useDisclosure();
  const apiFetch = useApiFetch();
  const turnstile = useCloudflareTurnstile();

  const formApi = useForm<FormFields>({
    mode: 'onBlur',
    defaultValues: {
      email: profileQuery.data?.email || '',
      name: profileQuery.data?.name || profileQuery.data?.nickname || '',
    },
  });

  const authFetchFactory = React.useCallback((email: string) => (turnstileToken?: string) => {
    return apiFetch('general:auth_send_otp', {
      fetchParams: {
        method: 'POST',
        body: { email, turnstile_response: turnstileToken },
        headers: {
          ...(turnstileToken && { 'cf-turnstile-response': turnstileToken }),
        },
      },
    });
  }, [ apiFetch ]);

  const onFormSubmit: SubmitHandler<FormFields> = React.useCallback(async(formData) => {
    try {
      await turnstile.fetchProtectedResource(authFetchFactory(formData.email));
      mixpanel.logEvent(mixpanel.EventTypes.ACCOUNT_LINK_INFO, {
        Source: 'Profile',
        Status: 'OTP sent',
        Type: 'Email',
      });
      authModal.onOpen();
    } catch(error) {
      const apiError = getErrorObjPayload<{ message: string }>(error);
      toaster.error({
        title: 'Error',
        description: apiError?.message || getErrorMessage(error) || 'Something went wrong',
      });
    }
  }, [ authFetchFactory, authModal, turnstile ]);

  const hasDirtyFields = Object.keys(formApi.formState.dirtyFields).length > 0;

  return (
    <section>
      <Heading level="2" mb={ 3 }>Notifications</Heading>
      <FormProvider { ...formApi }>
        <chakra.form
          noValidate
          onSubmit={ formApi.handleSubmit(onFormSubmit) }
        >
          <FormFieldText<FormFields> name="name" placeholder="Name" readOnly mb={ 3 }/>
          <MyProfileFieldsEmail
            isReadOnly={ !config.services.cloudflareTurnstile.siteKey || Boolean(profileQuery.data?.email) }
            defaultValue={ profileQuery.data?.email || undefined }
          />
          { config.services.cloudflareTurnstile.siteKey && !profileQuery.data?.email && <CloudflareTurnstile { ...turnstile }/> }
          { config.services.cloudflareTurnstile.siteKey && !profileQuery.data?.email && (
            <Button
              mt={ 6 }
              size="sm"
              variant="outline"
              type="submit"
              disabled={ formApi.formState.isSubmitting || !hasDirtyFields || turnstile.isInitError }
              loading={ formApi.formState.isSubmitting }
              loadingText="Save changes"
            >
              Save changes
            </Button>
          ) }
        </chakra.form>
      </FormProvider>
      { authModal.open && (
        <AuthModal
          initialScreen={{ type: 'otp_code', isAuth: true, email: formApi.getValues('email') }}
          onClose={ authModal.onClose }
          mixpanelConfig={ MIXPANEL_CONFIG }
        />
      ) }
    </section>
  );
};

export default React.memo(MyProfileEmail);
