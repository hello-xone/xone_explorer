import { Box, chakra } from '@chakra-ui/react';
import React from 'react';

import type { TokenInfo } from 'types/api/token';

import { route } from 'nextjs/routes';

import { useMultichainContext } from 'lib/contexts/multichain';
import getChainTooltipText from 'lib/multichain/getChainTooltipText';
import getIconUrl from 'lib/multichain/getIconUrl';
import getTokenIconPath from 'lib/token/getTokenIconPath';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { TruncatedTextTooltip } from 'toolkit/components/truncation/TruncatedTextTooltip';
import * as EntityBase from 'ui/shared/entities/base/components';

import { distributeEntityProps, getIconProps } from '../base/utils';

type LinkProps = EntityBase.LinkBaseProps & Pick<EntityProps, 'token'>;

const Link = chakra((props: LinkProps) => {
  const defaultHref = route(
    { pathname: '/token/[hash]', query: { ...props.query, hash: props.token.address_hash } },
    props.chain ? { chain: props.chain } : undefined,
  );

  return (
    <EntityBase.Link
      { ...props }
      href={ props.href ?? defaultHref }
    >
      { props.children }
    </EntityBase.Link>
  );
});

type IconProps = Pick<EntityProps, 'token' | 'className'> & EntityBase.IconBaseProps;

const Icon = (props: IconProps) => {
  if (props.noIcon) {
    return null;
  }
  const styles = {
    ...getIconProps(props, Boolean(props.shield ?? props.chain)),
    borderRadius: props.token.type === 'ERC-20' ? 'full' : 'base',
  };

  // 创建首字母头像作为 fallback
  const getInitial = () => {
    const text = props.token.name || props.token.symbol || '';
    if (!text) return '?';
    const firstChar = text.trim().charAt(0).toUpperCase();
    return firstChar || '';
  };

  // 使用与 EntityBase.Icon 相同的尺寸
  const iconSize = styles.boxSize;

  const InitialAvatar = () => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight={ 600 }
      fontSize="sm"
      bgColor={{ _light: 'gray.200', _dark: 'gray.600' }}
      color={{ _light: 'gray.600', _dark: 'gray.200' }}
      borderRadius={ props.token.type === 'ERC-20' ? 'full' : 'base' }
      transitionProperty="background-color,color"
      transitionDuration="normal"
      transitionTimingFunction="ease"
      w={ iconSize }
      h={ iconSize }
      minW={ iconSize }
      minH={ iconSize }
      mr={ 2 }
    >
      { getInitial() }
    </Box>
  );

  return (
    <EntityBase.Icon
      { ...styles }
      className={ props.className }
      src={ props.token.isIconAddress ? props.token.icon_url : getTokenIconPath(props.token.address_hash) }
      alt={ `${ props.token.name || 'token' } logo` }
      fallback={ <InitialAvatar/> }
      shield={ props.shield ?? (props.chain ? { src: getIconUrl(props.chain) } : undefined) }
      hint={ props.chain ? getChainTooltipText(props.chain, 'Token on ') : undefined }
      { ...props }
    />
  );
};

type ContentProps = Omit<EntityBase.ContentBaseProps, 'text'> & Pick<EntityProps, 'token' | 'jointSymbol' | 'onlySymbol'>;

const Content = chakra((props: ContentProps) => {
  const nameString = [
    !props.onlySymbol && (props.token.name ?? 'Unnamed token'),
    props.onlySymbol && (props.token.symbol ?? props.token.name ?? 'Unnamed token'),
    props.token.symbol && props.jointSymbol && !props.onlySymbol && `(${ props.token.symbol })`,
  ].filter(Boolean).join(' ');

  return (
    <EntityBase.Content
      { ...props }
      text={ nameString }
      truncation="tail"
    />
  );
});

type SymbolProps = Pick<EntityProps, 'token' | 'isLoading' | 'noSymbol' | 'jointSymbol' | 'onlySymbol'>;

const Symbol = (props: SymbolProps) => {
  const symbol = props.token.symbol;

  if (!symbol || props.noSymbol || props.jointSymbol || props.onlySymbol) {
    return null;
  }

  return (
    <Skeleton
      loading={ props.isLoading }
      display="inline-flex"
      alignItems="center"
      maxW="20%"
      ml={ 2 }
      color="text.secondary"
    >
      <div>(</div>
      <TruncatedTextTooltip label={ symbol }>
        <chakra.span
          display="inline-block"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          height="fit-content"
        >
          { symbol }
        </chakra.span>
      </TruncatedTextTooltip>
      <div>)</div>
    </Skeleton>
  );
};

type CopyProps = Omit<EntityBase.CopyBaseProps, 'text'> & Pick<EntityProps, 'token'>;

const Copy = (props: CopyProps) => {
  return (
    <EntityBase.Copy
      { ...props }
      text={ props.token.address_hash }
    />
  );
};

const Container = EntityBase.Container;

export interface EntityProps extends EntityBase.EntityBaseProps {
  token: Pick<TokenInfo, 'address_hash' | 'icon_url' | 'name' | 'symbol' | 'type' | 'isIconAddress'>;
  noSymbol?: boolean;
  jointSymbol?: boolean;
  onlySymbol?: boolean;
}

const TokenEntity = (props: EntityProps) => {
  const multichainContext = useMultichainContext();
  const partsProps = distributeEntityProps(props, multichainContext);

  const content = <Content { ...partsProps.content }/>;

  return (
    <Container w="100%" { ...partsProps.container }>
      <Icon { ...partsProps.icon }/>
      { props.noLink ? content : <Link { ...partsProps.link }>{ content }</Link> }
      <Symbol { ...partsProps.symbol }/>
      <Copy { ...partsProps.copy }/>
    </Container>
  );
};

export default React.memo(chakra(TokenEntity));

export {
  Container,
  Link,
  Icon,
  Content,
  Copy,
};
