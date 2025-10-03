# Cloudflare Pages 部署指南

## 已完成的修复工作

为了使项目能够在 Cloudflare Pages 上部署，已修复了 **22 个文件**的浏览器 API 兼容性问题。

### 修复文件清单

#### 1. 新建核心工具文件
- **lib/utils/browser.ts** - 提供安全的浏览器 API 包装函数

#### 2. 核心库文件 (6个)
- lib/metadata/update.ts
- lib/contexts/scrollDirection.tsx
- lib/contexts/addressHighlight.tsx
- lib/hooks/useClientRect.tsx
- lib/downloadBlob.ts
- lib/hooks/useNavItems.tsx

#### 3. UI 组件文件 (10个)
- ui/snippets/searchBar/SearchBarSuggest/SearchBarSuggest.tsx
- ui/snippets/topBar/settings/SettingsColorTheme.tsx
- ui/sol2uml/Sol2UmlDiagram.tsx
- ui/shared/SocketAlert.tsx
- ui/shared/chart/ChartMenu.tsx
- ui/shared/chart/ChartWidgetContent.tsx
- ui/shared/HashStringShortenDynamic.tsx
- ui/tx/TxSocketAlert.tsx
- ui/stats/ChartsLoadingErrorAlert.tsx
- ui/shared/AccessVerification.tsx

#### 4. 广告相关文件 (3个)
- ui/shared/ad/AdbutlerBanner.tsx
- ui/shared/ad/adbutlerScript.ts
- ui/shared/ad/hypeBannerScript.ts

#### 5. Cloudflare Turnstile 文件 (2个)
- ui/shared/cloudflareTurnstile/useCloudflareTurnstile.tsx
- ui/shared/cloudflareTurnstile/CloudflareTurnstile.tsx

### 修复模式

所有修复都遵循以下三种安全模式：

1. **浏览器检查模式**：
```typescript
if (typeof window === 'undefined' || !window.document) return;
// 浏览器代码
```

2. **条件访问模式**：
```typescript
const href = typeof window !== 'undefined' && window.document?.location
  ? window.document.location.href
  : '#';
```

3. **工具函数包装模式**：
```typescript
import { runInBrowser } from 'lib/utils/browser';
runInBrowser(() => {
  // 浏览器代码
});
```

---

## Cloudflare Pages 部署步骤

### 方法一：通过 Cloudflare Dashboard（推荐）

#### 1. 前置准备

确保代码已提交到 Git 仓库：

```bash
cd /Users/alice/Downloads/xonescan/xone_explorer
git add .
git commit -m "feat: add Cloudflare Pages SSR compatibility fixes

- Add browser API safety guards in 22 files
- Add server-side checks for document/window access
- Fix localStorage access in AccessVerification
- Add browser utility wrapper functions"
git push origin main  # 或你的分支名
```

#### 2. 在 Cloudflare Dashboard 中配置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 页面
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权并选择你的 Git 仓库
6. 配置构建设置：

**构建配置：**
```
Framework preset: Next.js
Build command: npx @cloudflare/next-on-pages@1
Build output directory: .vercel/output/static
Root directory: (留空或填写项目根目录)
```

**环境变量：**
将 `.env` 文件中的所有环境变量添加到 Cloudflare Pages：
- 点击 **Environment variables** 部分
- 逐个添加你的环境变量（所有 `NEXT_PUBLIC_` 开头的变量）

主要变量（从你的 .env 文件复制）：
```
NEXT_PUBLIC_NETWORK_NAME=XOC Testnet
NEXT_PUBLIC_NETWORK_ID=3721
NEXT_PUBLIC_NETWORK_RPC_URL=https://rpc-testnet.xone.org
...（其他环境变量）
```

#### 3. 部署

点击 **Save and Deploy**，Cloudflare 将自动：
1. 克隆你的仓库
2. 安装依赖
3. 运行构建命令
4. 部署到 Cloudflare Pages

构建时间预计：5-10 分钟

---

### 方法二：通过 Wrangler CLI（命令行）

#### 1. 安装依赖

```bash
npm install -g wrangler
npm install --save-dev @cloudflare/next-on-pages
```

#### 2. 本地构建测试（可选）

```bash
# 跳过本地 Next.js 构建（因为路由类型问题）
# 直接使用 Cloudflare 的构建工具
npx @cloudflare/next-on-pages@1
```

如果成功，会在 `.vercel/output/static` 生成静态文件。

#### 3. 登录 Cloudflare

```bash
wrangler login
```

#### 4. 部署到 Cloudflare Pages

```bash
wrangler pages deploy .vercel/output/static --project-name=xonescan
```

---

## 需要提供的信息

为了成功部署，请准备以下信息：

### 必需信息：
1. **Git 仓库 URL**（如果使用 Dashboard 部署）
   - 例如：`https://github.com/your-username/xone_explorer`

2. **Cloudflare 账户**
   - 登录邮箱和密码
   - 或者 API Token（如果使用 CLI）

3. **环境变量**
   - 当前 `.env` 文件中的所有变量
   - 特别是区块链 RPC、网络 ID 等关键配置

### 可选信息：
4. **自定义域名**（如果需要）
   - 例如：`xonescan.com`

5. **生产环境特定配置**
   - 生产环境的 RPC URL
   - 生产环境的 API keys

---

## 预期构建输出

成功部署后，你应该看到：

```
✨ Success! Uploaded 150+ files (1.2s)
✨ Deployment complete!
🌍 https://xonescan-xxx.pages.dev
```

---

## 故障排查

### 如果构建失败：

#### 1. 检查构建日志
在 Cloudflare Dashboard 中：
- Pages → 你的项目 → Deployments → 点击失败的部署
- 查看 **Build log**

#### 2. 常见错误及解决方法

**错误：`document is not defined`**
- 说明：还有文件未修复
- 解决：在构建日志中找到具体文件名，添加浏览器检查

**错误：`Module not found: Can't resolve 'fs'`**
- 说明：某些 Node.js 模块在客户端被引用
- 解决：在 `next.config.js` 中已添加 `config.resolve.fallback`

**错误：`Environment variable ... is not defined`**
- 说明：缺少环境变量
- 解决：在 Cloudflare Pages 设置中添加所有必需的环境变量

#### 3. 构建命令调整

如果默认构建命令失败，可以尝试：

```bash
# 方案1：跳过类型检查
SKIP_ENV_VALIDATION=true npx @cloudflare/next-on-pages@1 --skip-build

# 方案2：使用实验性构建
npx @cloudflare/next-on-pages@1 --experimental-minify

# 方案3：增加内存限制
NODE_OPTIONS="--max-old-space-size=4096" npx @cloudflare/next-on-pages@1
```

---

## 部署后验证

部署成功后，访问 Cloudflare 提供的 URL，检查：

1. ✅ 首页能否正常加载
2. ✅ 区块链数据能否正常显示
3. ✅ 搜索功能是否正常
4. ✅ 图表是否能正常渲染
5. ✅ 广告横幅是否显示（如果启用）
6. ✅ Cloudflare Turnstile 验证是否工作

---

## 注意事项

1. **API Routes 限制**
   - Cloudflare Pages Functions 对 API Routes 有限制
   - 如果有 8 个 API routes，需要确保它们都兼容 Cloudflare Workers 环境

2. **服务端渲染 (SSR)**
   - `getServerSideProps` 在 Cloudflare 上会转换为 Edge Functions
   - 确保没有使用 Node.js 特有的 API（如 `fs`, `path` 等）

3. **静态资源**
   - 确保所有图片、字体等静态资源路径正确
   - Cloudflare Pages 会自动优化和缓存静态资源

4. **构建时间**
   - 首次构建可能需要 5-10 分钟
   - 后续增量构建会更快（1-3 分钟）

---

## 下一步

部署成功后：

1. **配置自定义域名**（如果需要）
   - Pages → 你的项目 → Custom domains
   - 添加你的域名并配置 DNS

2. **设置构建钩子**
   - 配置 Webhook 实现自动部署
   - 每次 push 代码自动触发构建

3. **性能优化**
   - 启用 Cloudflare 的 CDN 和缓存
   - 配置 Cache Rules 优化性能

4. **监控和日志**
   - 使用 Cloudflare Analytics 监控流量
   - 配置错误日志收集

---

## 联系支持

如果遇到问题：
1. 查看 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
2. 查看 [@cloudflare/next-on-pages 文档](https://github.com/cloudflare/next-on-pages)
3. 在项目 GitHub Issues 中提问
