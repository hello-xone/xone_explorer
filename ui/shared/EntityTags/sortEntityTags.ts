import type { EntityTag } from './types';

// 定义标签类型的排序优先级
export const TAG_TYPE_ORDER = [
  'name',
  'generic',
  'information',
  'classifier',
  'protocol',
  'note',
  'internal',
];

export default function sortEntityTags(tagA: EntityTag, tagB: EntityTag): number {
  // 首先按照ordinal排序
  if (tagA.ordinal !== tagB.ordinal) {
    return tagA.ordinal > tagB.ordinal ? -1 : 1;
  }

  // 如果ordinal相同，则按照标签类型排序
  if (tagA.tagType !== tagB.tagType) {
    const indexA = TAG_TYPE_ORDER.indexOf(tagA.tagType);
    const indexB = TAG_TYPE_ORDER.indexOf(tagB.tagType);

    // 如果两个标签类型都在预定义顺序中，则按照预定义顺序排序
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // 如果只有一个标签类型在预定义顺序中，则该标签排在前面
    if (indexA !== -1) {
      return -1;
    }
    if (indexB !== -1) {
      return 1;
    }
  }

  return 0;
}
