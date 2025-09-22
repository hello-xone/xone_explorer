import type CspDev from 'csp-dev';
import { uniq } from 'es-toolkit';

export const KEY_WORDS = {
  BLOB: 'blob:',
  DATA: 'data:',
  NONE: '\'none\'',
  REPORT_SAMPLE: `'report-sample'`,
  SELF: '\'self\'',
  STRICT_DYNAMIC: `'strict-dynamic'`,
  UNSAFE_INLINE: '\'unsafe-inline\'',
  UNSAFE_EVAL: '\'unsafe-eval\'',
};

export function mergeDescriptors(...descriptors: Array<CspDev.DirectiveDescriptor>) {
  return descriptors.reduce((result, item) => {
    for (const _key in item) {
      const key = _key as CspDev.Directive;
      const value = item[key];

      if (!value) {
        continue;
      }

      if (result[key]) {
        result[key]?.push(...value);
      } else {
        result[key] = [ ...value ];
      }
    }

    return result;
  }, {} as CspDev.DirectiveDescriptor);
}

export function makePolicyString(policyDescriptor: CspDev.DirectiveDescriptor) {
  // 确保只包含ASCII字符
  const ensureAscii = (str: string): string => {
    return str.split('').map(char => {
      const code = char.charCodeAt(0);
      // 如果字符码大于255，替换为安全的ASCII字符
      return code > 255 ? ' ' : char;
    }).join('');
  };

  return Object.entries(policyDescriptor)
    .map(([ key, value ]) => {
      if (!value || value.length === 0) {
        return;
      }

      const uniqueValues = uniq(value);
      // 对每个值和最终的策略字符串进行ASCII检查
      const asciiValues = uniqueValues.map(val => ensureAscii(val));
      const policyPart = [ key, asciiValues.join(' ') ].join(' ');
      return ensureAscii(policyPart);
    })
    .filter(Boolean)
    .join(';');
}
