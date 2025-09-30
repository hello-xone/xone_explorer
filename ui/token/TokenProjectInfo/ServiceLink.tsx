import React from 'react';

import type { TokenVerifiedInfo } from 'types/api/token';

import { Image } from 'toolkit/chakra/image';
import { Link } from 'toolkit/chakra/link';

export interface Props {
  field: keyof TokenVerifiedInfo;
  icon: string;
  title: string;
  href?: string;
}

const ServiceLink = ({ href, title, icon }: Props) => {
  return (
    <Link
      href={ href }
      aria-label={ title }
      title={ title }
      target="_blank"
      display="inline-flex"
      alignItems="center"
    >
      <Image boxSize={ 5 } mr={ 2 } color="icon.primary" src={ icon }></Image>
      <span>{ title }</span>
    </Link>
  );
};

export default ServiceLink;
