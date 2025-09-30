import { chakra, createListCollection, Grid, GridItem } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, FormProvider } from 'react-hook-form';

import type { FormFields } from './types';

import appConfig from 'configs/app';
import useApiFetch from 'lib/api/useApiFetch';
import useIsMobile from 'lib/hooks/useIsMobile';
import { TOKEN_TYPE_IDS } from 'lib/token/tokenTypes';
import { Button } from 'toolkit/chakra/button';
import { Heading } from 'toolkit/chakra/heading';
import { FormFieldAddress } from 'toolkit/components/forms/fields/FormFieldAddress';
import { FormFieldEmail } from 'toolkit/components/forms/fields/FormFieldEmail';
import { FormFieldSelect } from 'toolkit/components/forms/fields/FormFieldSelect';
import { FormFieldSocial } from 'toolkit/components/forms/fields/FormFieldSocial';
import { FormFieldText } from 'toolkit/components/forms/fields/FormFieldText';
import { FormFieldUrl } from 'toolkit/components/forms/fields/FormFieldUrl';
import useCloudflareTurnstile from 'ui/shared/cloudflareTurnstile/useCloudflareTurnstile';

import { convertFormDataToRequestsBody } from './utils';

const collection = createListCollection({
  items: TOKEN_TYPE_IDS.map((typeId) => ({
    label: typeId.toUpperCase(),
    value: typeId.toLowerCase(),
  })),
});

const AddTokenInfoForm = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const apiFetch = useApiFetch();
  const turnstile = useCloudflareTurnstile();

  const formApi = useForm<FormFields>({
    mode: 'onBlur',
  });

  React.useEffect(() => {
    if (
      router.query.addresses ||
      router.query.requesterName ||
      router.query.requesterEmail ||
      router.query.companyName ||
      router.query.companyWebsite
    ) {
      router.replace({ pathname: '/public-tags/submit' }, undefined, {
        shallow: true,
      });
    }
  }, [ router ]);

  const onFormSubmit: SubmitHandler<FormFields> = React.useCallback(
    async(data) => {
      const requestsBody = convertFormDataToRequestsBody(data);

      apiFetch<'metadata:public_tag_application', unknown, { message: string }>(
        'metadata:public_tag_application',
        {
          pathParams: { chainId: appConfig.chain.id },
          fetchParams: {
            method: 'POST',
            body: { submission: requestsBody },
          },
        },
      );
      // debugger
      // onSubmitResult(result as FormSubmitResult);
    },
    [ apiFetch ],
  );

  if (!appConfig.services.cloudflareTurnstile.siteKey) {
    return null;
  }

  return (
    <FormProvider { ...formApi }>
      <chakra.form noValidate onSubmit={ formApi.handleSubmit(onFormSubmit) }>
        <Grid
          columnGap={ 3 }
          rowGap={ 3 }
          templateColumns={{
            base: '1fr',
            lg: '1fr 1fr minmax(0, 200px)',
            xl: '1fr 1fr minmax(0, 250px)',
          }}
        >
          <GridItem colSpan={{ base: 1, lg: 3 }}>
            <Heading level="2">Basic Information</Heading>
          </GridItem>
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <FormFieldAddress<FormFields>
              name="id"
              required
              placeholder="Address (0x...)"
            />
          </GridItem>
          { !isMobile && <div/> }
          <FormFieldText<FormFields>
            name="name"
            required
            placeholder="Token name"
          />
          <FormFieldText<FormFields>
            name="symbol"
            required
            placeholder="Token symbol"
          />
          { !isMobile && <div/> }

          <FormFieldText<FormFields>
            name="decimals"
            required
            placeholder="Token decimals"
          />
          <FormFieldSelect<FormFields, `type`>
            name="type"
            placeholder="Token type"
            collection={ collection }
            required
          />
          { !isMobile && <div/> }
          <FormFieldUrl<FormFields>
            name="explorer"
            required
            placeholder="Explorer"
          />
          <FormFieldUrl<FormFields>
            name="website"
            required
            placeholder="Website"
          />
          { !isMobile && <div/> }

          <FormFieldEmail<FormFields>
            name="email"
            required
            placeholder="Email"
          />
          <FormFieldUrl<FormFields>
            name="whitepaper"
            required
            placeholder="Whitepaper"
          />
          { !isMobile && <div/> }
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <FormFieldText<FormFields>
              name="description"
              required
              placeholder="Description"
              maxH="160px"
              rules={{ maxLength: 500 }}
              asComponent="Textarea"
              size="2xl"
            />
          </GridItem>
          <GridItem colSpan={{ base: 1, lg: 3 }} mt={{ base: 3, lg: 5 }}>
            <Heading level="2" display="flex" alignItems="center" columnGap={ 1 }>
              Social Profiles
            </Heading>
          </GridItem>

          <FormFieldSocial<FormFields> name="twitter" placeholder="Twitter"/>
          <FormFieldSocial<FormFields> name="telegram" placeholder="Telegram"/>
          { !isMobile && <div/> }
          <FormFieldSocial<FormFields> name="reddit" placeholder="Reddit"/>
          <FormFieldSocial<FormFields> name="discord" placeholder="Discord"/>
          { !isMobile && <div/> }

          <FormFieldSocial<FormFields> name="slack" placeholder="Slack"/>
          <FormFieldSocial<FormFields>
            name="instagram"
            placeholder="instagram"
          />
          { !isMobile && <div/> }
          <FormFieldSocial<FormFields> name="wechat" placeholder="Wechat"/>
          <FormFieldSocial<FormFields> name="facebook" placeholder="Facebook"/>
          { !isMobile && <div/> }
          <FormFieldSocial<FormFields> name="medium" placeholder="Medium"/>
          <FormFieldSocial<FormFields> name="github" placeholder="Github"/>
          { !isMobile && <div/> }
          <FormFieldSocial<FormFields> name="blog" placeholder="Blog"/>
          <FormFieldSocial<FormFields>
            name="bitcointalk"
            placeholder="Bitcointalk"
          />
          { !isMobile && <div/> }
          <FormFieldSocial<FormFields> name="youtube" placeholder="Youtube"/>
          <FormFieldSocial<FormFields> name="tiktok" placeholder="Tiktok"/>
          { !isMobile && <div/> }
          <FormFieldSocial<FormFields> name="forum" placeholder="Forum"/>
          <FormFieldSocial<FormFields> name="linkedin" placeholder="Linkedin"/>
          { !isMobile && <div/> }
          <FormFieldSocial<FormFields> name="opensea" placeholder="Opensea"/>
          { !isMobile && <div/> }
          <GridItem colSpan={{ base: 1, lg: 2 }} marginTop={ 3 }>
            <Heading level="2" display="flex" alignItems="center" columnGap={ 1 }>
              Price Data
            </Heading>
          </GridItem>
          { !isMobile && <div/> }
          <FormFieldSocial<FormFields>
            name="coinMarketCap"
            placeholder="CoinMarketCap"
          />
          <FormFieldSocial<FormFields> name="coinGecko" placeholder="CoinGecko"/>
          { !isMobile && <div/> }
          <FormFieldSocial<FormFields> name="ave" placeholder="Ave"/>
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

export default React.memo(AddTokenInfoForm);
