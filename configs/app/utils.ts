import { isBrowser } from 'toolkit/utils/isBrowser';
import * as regexp from 'toolkit/utils/regexp';

export const replaceQuotes = (value: string | undefined) => {
  if (!value) return value;
  // 移除字符串两端的引号（如果存在）
  const trimmedValue = value.trim();
  if ((trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) || 
      (trimmedValue.startsWith('\'') && trimmedValue.endsWith('\''))) {
    return trimmedValue.substring(1, trimmedValue.length - 1);
  }
  // 将单引号替换为双引号（仅适用于没有被引号包裹的字符串）
  return trimmedValue.replaceAll('\'', '"');
};

export const getEnvValue = (envName: string) => {
  // eslint-disable-next-line no-restricted-properties
  const envs = (isBrowser() ? window.__envs : process.env) ?? {};
  if (isBrowser() && envs.NEXT_PUBLIC_APP_INSTANCE === 'pw') {
    const storageValue = localStorage.getItem(envName);

    if (typeof storageValue === 'string') {
      return storageValue;
    }
  }

  return replaceQuotes(envs[envName]);
};

export const parseEnvJson = <DataType>(env: string | undefined): DataType | null => {
  try {
    return JSON.parse(env || 'null') as DataType | null;
  } catch (error) {
    return null;
  }
};

export const getExternalAssetFilePath = (envName: string) => {
  const parsedValue = getEnvValue(envName);

  if (!parsedValue) {
    return;
  }

  return buildExternalAssetFilePath(envName, parsedValue);
};

export const buildExternalAssetFilePath = (name: string, value: string) => {
  try {
    const fileName = name.replace(/^NEXT_PUBLIC_/, '').replace(/_URL$/, '').toLowerCase();

    const fileExtension = getAssetFileExtension(value);
    if (!fileExtension) {
      throw new Error('Cannot get file path');
    }
    return `/assets/configs/${ fileName }.${ fileExtension }`;
  } catch (error) {
    return;
  }
};

function getAssetFileExtension(value: string) {
  try {
    const url = new URL(value);
    return url.pathname.match(regexp.FILE_EXTENSION)?.[1];
  } catch (error) {
    return parseEnvJson(value) ? 'json' : undefined;
  }
}
