import React from 'react';
import type { FieldValues } from 'react-hook-form';

import type { FormFieldPropsBase } from './types';

import { Image } from 'toolkit/chakra/image';

import { urlValidator } from '../validators/url';
import { FormFieldText } from './FormFieldText';

const FormFieldUrlContent = <FormFields extends FieldValues>(
  props: FormFieldPropsBase<FormFields>,
) => {
  const rules = React.useMemo(
    () => ({
      ...props.rules,
      validate: {
        ...props.rules?.validate,
        url: urlValidator,
      },
    }),
    [ props.rules ],
  );
  return (
    <FormFieldText { ...props } group={{
      endElement: () => {
        return (
          <Image
            src={ `/static/social/${ props.name }.svg` }
            w={ 8 }
            h={ 8 }
            marginRight={ 6 }
            alt="check"
          />
        );
      },
    }} rules={ rules }/>
  );
};

export const FormFieldSocial = React.memo(FormFieldUrlContent) as typeof FormFieldUrlContent;
