import type { HTMLChakraProps } from '@chakra-ui/react';
import { type IconName } from 'public/icons/name';
import React from 'react';

import { Skeleton } from 'toolkit/chakra/skeleton';

export const href = '/icons/sprite.f1b6c3f3.svg';

export { IconName };

interface Props extends HTMLChakraProps<'div'> {
  name: IconName;
  isLoading?: boolean;
}

export const IconSvg = ({ name, isLoading, ...props }: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
  return (
    <Skeleton loading={ !isLoading } display="inline-block" { ...props } ref={ ref }>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <use href={ `${ href }#${ name }` }/>
      </svg>
    </Skeleton>
  );
};
