import type { ApiResource } from '../types';

export const USER_OPS_API_RESOURCES = {
  addEmail: {
    path: '/api/v2/email/subscribe',
  },
} satisfies Record<string, ApiResource>;

export type UserOpsApiResourceName = `userOps:${ keyof typeof USER_OPS_API_RESOURCES }`;

export type UserOpsApiResourcePayload = never;
