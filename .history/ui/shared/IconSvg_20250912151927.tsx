import type { HTMLChakraProps } from '@chakra-ui/react';
import { chakra, Skeleton } from '@chakra-ui/react';
import { type IconName } from 'public/icons/name';
import React from 'react';

export const href = '/icons/sprite.f1b6c3f3.svg';

export { IconName };

interface Props extends HTMLChakraProps<'div'> {
  name: IconName;
  isLoading?: boolean;
}

const IconSvg = React.forwardRef(
  ({ name, isLoading = false, ...props }: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
      <div display="inline-block" ref={ref}>
        {isLoading ? (
          <Skeleton width="100%" height="100%" {...props} />
        ) : (
          <svg width="100%" height="100%" {...props}>
            <use href={`${href}#${name}`} />
          </svg>
        )}
      </div>
    );
  },
);

IconSvg.displayName = 'IconSvg';

export default IconSvg;