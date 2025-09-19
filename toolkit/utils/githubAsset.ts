/**
 * 用于处理 GitHub 资源的工具函数
 */

import { isBrowser } from './isBrowser';

/**
 * 检查 GitHub 资源是否存在
 * @param url 资源 URL
 * @returns Promise<boolean> 资源是否存在
 */
export const checkGitHubAssetExists = async(url: string): Promise<boolean> => {
  if (!isBrowser()) {
    // 在服务器端无法直接检查资源是否存在，默认返回 true
    return true;
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      redirect: 'follow',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * 获取存在的 GitHub 资源 URL
 * @param basePath 基础路径
 * @param address 地址
 * @returns Promise<string | undefined> 存在的资源 URL 或 undefined
 */
export const getExistingGitHubTokenIconUrl = async(
  basePath: string,
  address: string,
): Promise<string | undefined> => {
  const url = basePath.replace('[address]', address);
  const exists = await checkGitHubAssetExists(url);
  return exists ? url : undefined;
};
