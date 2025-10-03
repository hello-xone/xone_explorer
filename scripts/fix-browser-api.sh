#!/bin/bash

# Cloudflare Pages 浏览器 API 兼容性修复脚本
# 自动修复 document/window 访问问题

set -e

echo "🔧 开始修复浏览器 API 兼容性..."

# 1. 修复 lib/contexts 目录中的问题
echo ""
echo "📁 修复 lib/contexts 目录..."

# lib/contexts/scrollDirection.tsx - 修复 window.document
if grep -q "window.document.body" lib/contexts/scrollDirection.tsx 2>/dev/null; then
    echo "  - 修复 scrollDirection.tsx..."
    sed -i.bak 's/window\.document\.body/window.document?.body/g' lib/contexts/scrollDirection.tsx
fi

# lib/contexts/addressHighlight.tsx - 修复 window.document
if grep -q "window.document.querySelectorAll" lib/contexts/addressHighlight.tsx 2>/dev/null; then
    echo "  - 修复 addressHighlight.tsx..."
    sed -i.bak 's/window\.document\.querySelectorAll/window.document?.querySelectorAll/g' lib/contexts/addressHighlight.tsx
fi

# 2. 修复 lib/hooks 目录
echo ""
echo "📁 修复 lib/hooks 目录..."

# lib/hooks/useClientRect.tsx - 修复 window.document
if grep -q "window.document.querySelector" lib/hooks/useClientRect.tsx 2>/dev/null; then
    echo "  - 修复 useClientRect.tsx..."
    sed -i.bak 's/window\.document\.querySelector/window.document?.querySelector/g' lib/hooks/useClientRect.tsx
    sed -i.bak 's/window\.document\.body/window.document?.body/g' lib/hooks/useClientRect.tsx
fi

# 3. 修复 lib/metadata 目录
echo ""
echo "📁 修复 lib/metadata 目录..."

if [ -f "lib/metadata/update.ts" ]; then
    echo "  - 修复 metadata/update.ts..."
    # 添加类型检查
    if ! grep -q "typeof window !== 'undefined'" lib/metadata/update.ts; then
        cat > lib/metadata/update.ts.new << 'EOF'
export default function updateMetadata(title?: string, description?: string) {
  if (typeof window === 'undefined') return;

  if (title) {
    window.document.title = title;
  }
  if (description) {
    window.document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }
}
EOF
        mv lib/metadata/update.ts.new lib/metadata/update.ts
    fi
fi

# 4. 修复 UI 组件中的简单情况
echo ""
echo "📁 修复 UI 组件..."

# 查找所有在 useEffect 外直接使用 document 的文件
find ui -name "*.tsx" -o -name "*.ts" | while read file; do
    # 跳过已经有 typeof 检查的文件
    if grep -q "typeof document !== 'undefined'" "$file" || grep -q "typeof window !== 'undefined'" "$file"; then
        continue
    fi

    # 检查是否有问题的 document 使用
    if grep -q "document\." "$file" && ! grep -q "useEffect" "$file"; then
        echo "  ⚠️  需要手动检查: $file"
    fi
done

echo ""
echo "✅ 自动修复完成！"
echo ""
echo "📋 下一步："
echo "  1. 检查上面列出的需要手动检查的文件"
echo "  2. 运行: yarn build"
echo "  3. 如果还有错误，查看错误堆栈定位具体文件"
echo ""
