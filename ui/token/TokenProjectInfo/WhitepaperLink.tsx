import React from 'react';

import { Image } from 'toolkit/chakra/image';
import { Link } from 'toolkit/chakra/link';
interface Props {
  url: string;
}

const WhitepaperLink = ({ url }: Props) => {

  return (
    <Link
      href={ url }
      target="_blank"
      display="inline-flex"
      alignItems="center"
      columnGap={ 1 }
    >

      <Image alt="Whitepaper" src="/static/social/whitepaper.svg" boxSize={ 6 } color="icon.primary"/>
      <span>{ url }</span>
    </Link>
  );
};

export default WhitepaperLink;
