import { chakra, Grid, GridItem } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, FormProvider } from 'react-hook-form';
import { useSignMessage, useSwitchChain } from 'wagmi';

import type { FormFields, FormSubmitResult } from './types';
import type { UserInfo } from 'types/api/account';
import type { PublicTagTypesResponse } from 'types/api/addressMetadata';

import appConfig from 'configs/app';
import useApiFetch from 'lib/api/useApiFetch';
import getErrorObj from 'lib/errors/getErrorObj';
import getErrorObjPayload from 'lib/errors/getErrorObjPayload';
import useIsMobile from 'lib/hooks/useIsMobile';
import useAccount from 'lib/web3/useAccount';
import useWeb3Wallet from 'lib/web3/useWallet';
import { Button } from 'toolkit/chakra/button';
import { Heading } from 'toolkit/chakra/heading';
import { toaster } from 'toolkit/chakra/toaster';
import { FormFieldEmail } from 'toolkit/components/forms/fields/FormFieldEmail';
import { FormFieldText } from 'toolkit/components/forms/fields/FormFieldText';
import { FormFieldUrl } from 'toolkit/components/forms/fields/FormFieldUrl';
import { Hint } from 'toolkit/components/Hint/Hint';
import CloudflareTurnstile from 'ui/shared/cloudflareTurnstile/CloudflareTurnstile';
import useCloudflareTurnstile from 'ui/shared/cloudflareTurnstile/useCloudflareTurnstile';

import PublicTagsSubmitFieldAddresses from './fields/PublicTagsSubmitFieldAddresses';
import PublicTagsSubmitFieldTags from './fields/PublicTagsSubmitFieldTags';
import { convertFormDataToRequestsBody, getFormDefaultValues } from './utils';

interface Props {
  config?: PublicTagTypesResponse | undefined;
  userInfo?: UserInfo | undefined;
  onSubmitResult: (result: FormSubmitResult) => void;
}

const PublicTagsSubmitForm = ({ config, userInfo, onSubmitResult }: Props) => {
  const web3Wallet = useWeb3Wallet({ source: 'Header' });

  const isMobile = useIsMobile();
  const router = useRouter();
  const apiFetch = useApiFetch();
  const turnstile = useCloudflareTurnstile();
  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const formApi = useForm<FormFields>({
    mode: 'onBlur',
    defaultValues: getFormDefaultValues(router.query, userInfo),
  });

  React.useEffect(() => {
    if (
      router.query.addresses ||
      router.query.requesterName ||
      router.query.requesterEmail ||
      router.query.companyName ||
      router.query.companyWebsite
    ) {
      router.replace({ pathname: '/public-tags/submit' }, undefined, { shallow: true });
    }
  }, [ router ]);

  const onFormSubmit: SubmitHandler<FormFields> = React.useCallback(async(data) => {
    if (address && isConnected) {
      try {
        // 切换到正确的链
        await switchChainAsync({ chainId: Number(appConfig.chain.id) });

        // 生成签名消息
        const timestamp = new Date().toISOString();
        const message = [
          `${ window.location.hostname } wants you to authorize this public tag submission`,
          '',
          `Address: ${ address }`,
          `Chain ID: ${ appConfig.chain.id }`,
          `Timestamp: ${ timestamp }`,
          '',
          'By signing this message, you authorize the submission of public tags.',
        ].join('\n');

        // 请求用户签名
        const signature = await signMessageAsync({ message });

        const requestsBody = convertFormDataToRequestsBody(data);

        const result = await Promise.all(requestsBody.map(async(body) => {
          return new Promise<void>((resolve) => resolve())
            .then(() => {
              return apiFetch<'metadata:public_tag_application', unknown, { message: string }>('metadata:public_tag_application', {
                pathParams: { chainId: appConfig.chain.id },
                fetchParams: {
                  method: 'POST',
                  body: {
                    submission: body,
                    signature,
                    signedMessage: message,
                  },
                },
              });
            })
            .then(() => ({ error: null, payload: body }))
            .catch((error: unknown) => {
              const errorObj = getErrorObj(error);
              const messageFromPayload = getErrorObjPayload<{ message?: string }>(errorObj)?.message;
              const messageFromError = errorObj && 'message' in errorObj && typeof errorObj.message === 'string' ? errorObj.message : undefined;
              const message = messageFromPayload || messageFromError || 'Something went wrong.';
              return { error: message, payload: body };
            });
        }));
        onSubmitResult(result as FormSubmitResult);
      } catch(error) {
        // 处理签名错误
        const errorObj = getErrorObj(error);
        const shortMessage = errorObj && 'shortMessage' in errorObj && typeof errorObj.shortMessage === 'string' ? errorObj.shortMessage : undefined;
        const errorMessage = shortMessage || (errorObj && 'message' in errorObj && typeof errorObj.message === 'string' ? errorObj.message : undefined);

        toaster.error({
          title: '钱包授权失败',
          description: errorMessage || '用户取消签名或签名过程中出现错误',
        });
      }
    } else {
      web3Wallet.openModal();
    }
  }, [ apiFetch, onSubmitResult, web3Wallet, address, isConnected, signMessageAsync, switchChainAsync ]);

  if (!appConfig.services.cloudflareTurnstile.siteKey) {
    return null;
  }

  return (
    <FormProvider { ...formApi }>
      <chakra.form
        noValidate
        onSubmit={ formApi.handleSubmit(onFormSubmit) }
      >
        <Grid
          columnGap={ 3 }
          rowGap={ 3 }
          templateColumns={{ base: '1fr', lg: '1fr 1fr minmax(0, 200px)', xl: '1fr 1fr minmax(0, 250px)' }}
        >
          <GridItem colSpan={{ base: 1, lg: 3 }}>
            <Heading level="2">
              Company info
            </Heading>
          </GridItem>
          <FormFieldText<FormFields> name="requesterName" required placeholder="Your name"/>
          <FormFieldEmail<FormFields> name="requesterEmail" required/>

          { !isMobile && <div/> }
          <FormFieldText<FormFields> name="companyName" placeholder="Company name"/>
          <FormFieldUrl<FormFields> name="companyWebsite" placeholder="Company website"/>
          { !isMobile && <div/> }

          <GridItem colSpan={{ base: 1, lg: 3 }} mt={{ base: 3, lg: 5 }}>
            <Heading level="2" display="flex" alignItems="center" columnGap={ 1 }>
              Public tags/labels
              <Hint label="Submit a public tag proposal for our moderation team to review"/>
            </Heading>
          </GridItem>
          <PublicTagsSubmitFieldAddresses/>
          <PublicTagsSubmitFieldTags tagTypes={ config?.tagTypes }/>
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <FormFieldText<FormFields>
              name="description"
              required
              placeholder={
                isMobile ?
                  'Confirm the connection between addresses and tags' :
                  'Provide a comment to confirm the connection between addresses and tags (max 500 characters)'
              }
              maxH="160px"
              rules={{ maxLength: 500 }}
              asComponent="Textarea"
              size="2xl"
            />
          </GridItem>

          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <CloudflareTurnstile { ...turnstile }/>
          </GridItem>
          { !isMobile && <div/> }

          <Button
            variant="solid"
            type="submit"
            mt={ 3 }
            loading={ formApi.formState.isSubmitting }
            loadingText="Send request"
            w="min-content"
            disabled={ turnstile.isInitError }
          >
            Send request
          </Button>
        </Grid>
      </chakra.form>
    </FormProvider>
  );
};

export default React.memo(PublicTagsSubmitForm);
