import { Flex, Text, Grid } from '@chakra-ui/react';
import React from 'react';

import type { TokenVerifiedInfo } from 'types/api/token';

import DocsLink from './DocsLink';
import type { Props as ServiceLinkProps } from './ServiceLink';
import ServiceLink from './ServiceLink';
import SupportLink from './SupportLink';

interface Props {
  data: TokenVerifiedInfo;
}

const SOCIAL_LINKS: Array<Omit<ServiceLinkProps, 'href'>> = [
  { field: 'github', icon: '/static/social/github.svg', title: 'Github' },
  { field: 'twitter', icon: '/static/social/twitter.svg', title: 'X (ex-Twitter)' },
  { field: 'telegram', icon: '/static/social/telegram.svg', title: 'Telegram' },
  { field: 'discord', icon: '/static/social/discord.svg', title: 'Discord' },
  { field: 'medium', icon: '/static/social/medium.svg', title: 'Medium' },
  { field: 'reddit', icon: '/static/social/reddit.svg', title: 'Reddit' },
  { field: 'slack', icon: '/static/social/slack.svg', title: 'Slack' },
  { field: 'instagram', icon: '/static/social/instagram.svg', title: 'Instagram' },
  { field: 'wechat', icon: '/static/social/wechat.svg', title: 'Wechat' },
  { field: 'facebook', icon: '/static/social/facebook.svg', title: 'Facebook' },
  { field: 'blog', icon: '/static/social/blog.svg', title: 'Blog' },
  { field: 'bitcointalk', icon: '/static/social/bitcointalk.svg', title: 'BitcoinTalk' },
  { field: 'youtube', icon: '/static/social/youtube.svg', title: 'YouTube' },
  { field: 'tiktok', icon: '/static/social/tiktok.svg', title: 'TikTok' },
  { field: 'forum', icon: '/static/social/forum.svg', title: 'Forum' },
  { field: 'linkedin', icon: '/static/social/linkedin.svg', title: 'LinkedIn' },
  { field: 'opensea', icon: '/static/social/opensea.svg', title: 'OpenSea' },
];

const PRICE_TICKERS: Array<Omit<ServiceLinkProps, 'href'>> = [
  { field: 'coinGecko', icon: '/static/social/coinGecko.svg', title: 'CoinGecko' },
  { field: 'coinMarketCap', icon: '/static/social/coinMarketCap.svg', title: 'CoinMarketCap' },
  { field: 'ave', icon: '/static/social/ave.svg', title: 'DefiLlama' },
];

export function hasContent(data: TokenVerifiedInfo): boolean {
  const fields: Array<keyof TokenVerifiedInfo> = [
    'projectDescription',
    'docs',
    'support',
    ...SOCIAL_LINKS.map(({ field }) => field),
    ...PRICE_TICKERS.map(({ field }) => field),
  ];
  return fields.some((field) => data[field]);
}

const Content = ({ data }: Props) => {
  const docs = data.docs ? <DocsLink href={ data.docs }/> : null;
  const support = data.support ? <SupportLink url={ data.support }/> : null;
  const description = data.projectDescription ? <Text fontSize="sm" mt={ 3 }>{ data.projectDescription }</Text> : null;

  const socialLinks = SOCIAL_LINKS
    .map((link) => ({ ...link, href: data[link.field] }))
    .filter(({ href }) => href);
  const priceTickersLinks = PRICE_TICKERS
    .map((link) => ({ ...link, href: data[link.field] }))
    .filter(({ href }) => href);

  return (
    <Flex fontSize="sm" flexDir="column" rowGap={ 5 }>
      { (description || docs || support) && (
        <div>
          <Text color="text.secondary" fontSize="xs">Description and support info</Text>
          { description }
          { (docs || support) && (
            <Flex alignItems="center" flexWrap="wrap" columnGap={ 6 } mt={ 3 }>
              { support }
              { docs }
            </Flex>
          ) }
        </div>
      ) }
      { socialLinks.length > 0 && (
        <div>
          <Text color="text.secondary" fontSize="xs">Links</Text>
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} columnGap={ 4 } rowGap={ 3 } mt={ 3 }>
            { socialLinks.map((link) => <ServiceLink key={ link.field } { ...link }/>) }
          </Grid>
        </div>
      ) }
      { priceTickersLinks.length > 0 && (
        <div>
          <Text color="text.secondary" fontSize="xs">Crypto markets</Text>
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} columnGap={ 4 } rowGap={ 3 } mt={ 3 }>
            { priceTickersLinks.map((link) => <ServiceLink key={ link.field } { ...link }/>) }
          </Grid>
        </div>
      ) }
    </Flex>
  );
};

export default Content;
