import type { ApiResource } from '../types';

export const EAS_API_RESOURCES = {
  graphql: {
    path: '/graphql',
  },
} satisfies Record<string, ApiResource>;

export type EasApiResourceName = `eas:${ keyof typeof EAS_API_RESOURCES }`;

/* eslint-disable @stylistic/indent */
export type EasApiResourcePayload<R extends EasApiResourceName> =
  R extends 'eas:graphql' ? unknown :
  never;
/* eslint-enable @stylistic/indent */
