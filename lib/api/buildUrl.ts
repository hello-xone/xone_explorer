import { compile } from 'path-to-regexp';

import config from 'configs/app';

import isNeedProxy from './isNeedProxy';
import { RESOURCES } from './resources';
import type {
  ApiResource,
  ResourceName,
  ResourcePathParams,
} from './resources';

export default function buildUrl<R extends ResourceName>(
  resourceName: R,
  pathParams?: ResourcePathParams<R>,
  queryParams?: Record<
    string,
    string | Array<string> | number | boolean | null | undefined
  >,
  noProxy?: boolean,
): string {
  // /node-api/proxy
  const resource: ApiResource = RESOURCES[resourceName];
  let _isNeedProxy = !noProxy && isNeedProxy();
  _isNeedProxy = false;

  const baseUrl = _isNeedProxy ? config.app.baseUrl : resource.endpoint || config.api.endpoint;
  const basePath = resource.basePath !== undefined ?
    resource.basePath :
    config.api.basePath;
  const path = _isNeedProxy ?
    basePath + resource.path :
    basePath + resource.path;

  const url = new URL(compile(path)(pathParams), baseUrl);

  if (queryParams) {
    Object.entries(queryParams).forEach(([ key, value ]) => {
      // there are some pagination params that can be null or false for the next page
      if (value !== undefined && value !== '') url.searchParams.append(key, String(value));
    });
  }

  if (path.includes('epochInfos')) return path;

  return url.toString();
}
