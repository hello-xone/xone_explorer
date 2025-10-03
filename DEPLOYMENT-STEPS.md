# Cloudflare Pages 部署步骤（GitHub 方式）

## 第一步：创建 GitHub 仓库

### 1.1 访问 GitHub 创建仓库
1. 打开 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `xone_explorer` （或任何你喜欢的名字）
   - **Description**: XOC Blockchain Explorer
   - **Visibility**: 选择 **Private**（私有仓库，推荐）
   - ❌ **不要** 勾选 "Add a README file"
   - ❌ **不要** 勾选 "Add .gitignore"
   - ❌ **不要** 选择 License
3. 点击 **Create repository**

### 1.2 复制仓库地址
创建后会看到一个 HTTPS 地址，格式类似：
```
https://github.com/你的用户名/xone_explorer.git
```
**复制这个地址**，稍后会用到。

---

## 第二步：推送代码到 GitHub

打开终端，在项目目录执行：

```bash
cd /Users/alice/Downloads/xonescan/xone_explorer

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/xone_explorer.git

# 推送代码
git push -u origin main

# 如果遇到 main/master 分支问题，使用：
git branch -M main
git push -u origin main
```

如果提示需要登录，输入你的 GitHub 用户名和 Personal Access Token（不是密码）。

**如果没有 Token**：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token
5. 在终端输入 token 作为密码

---

## 第三步：在 Cloudflare Pages 配置项目

### 3.1 登录 Cloudflare Dashboard
1. 访问 https://dash.cloudflare.com/
2. 登录你的账户
3. 在左侧菜单选择 **Pages**

### 3.2 创建新项目
1. 点击 **Create a project**
2. 点击 **Connect to Git**
3. 选择 **GitHub** 并授权
4. 选择你刚创建的仓库：`xone_explorer`
5. 点击 **Begin setup**

### 3.3 配置构建设置

#### Build settings:
```
Framework preset: Next.js
Build command: npx @cloudflare/next-on-pages@1
Build output directory: .vercel/output/static
Root directory: (留空)
Branch: main
```

#### Environment variables (生产环境):

**⚠️ 重要：需要添加以下环境变量**

点击 **Add variable** 按钮，逐个添加：

##### 必需变量（从你的 .env 文件复制）：

```bash
NEXT_PUBLIC_NETWORK_NAME=XOC Testnet
NEXT_PUBLIC_NETWORK_ID=3721
NEXT_PUBLIC_NETWORK_RPC_URL=https://rpc-testnet.xone.org
NEXT_PUBLIC_NETWORK_CURRENCY_NAME=XOC
NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL=XOC
NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS=18
NEXT_PUBLIC_IS_TESTNET=true

# API 配置
NEXT_PUBLIC_API_PROTOCOL=http
NEXT_PUBLIC_API_HOST=47.128.11.165
NEXT_PUBLIC_API_PORT=80
NEXT_PUBLIC_API_BASE_PATH=/
NEXT_PUBLIC_API_WEBSOCKET_PROTOCOL=ws

# Stats API
NEXT_PUBLIC_STATS_API_HOST=http://47.128.11.165:8080

# 其他配置
NEXT_PUBLIC_APP_HOST=xonescan.com
NEXT_PUBLIC_APP_PROTOCOL=https
NEXT_PUBLIC_NETWORK_VERIFICATION_TYPE=validation
NEXT_PUBLIC_FEATURED_NETWORKS=https://raw.githubusercontent.com/blockscout/frontend-configs/main/configs/featured-networks/eth-goerli.json

# 可选：根据需要添加
# NEXT_PUBLIC_GOOGLE_ANALYTICS_PROPERTY_ID=your-ga-id
# NEXT_PUBLIC_AD_BANNER_PROVIDER=none
```

**📝 提示**：
- 从你的 `.env` 文件复制所有 `NEXT_PUBLIC_` 开头的变量
- 每个变量占一行，格式：`KEY=value`
- 不要包含引号

### 3.4 开始部署

1. 检查所有配置
2. 点击 **Save and Deploy**

---

## 第四步：等待构建完成

构建过程预计 5-10 分钟。

### 4.1 查看构建日志
- 在 Deployments 页面可以看到实时构建进度
- 点击部署记录可以查看详细日志

### 4.2 构建成功标志
看到以下信息表示成功：
```
✨ Success! Uploaded XXX files
✨ Deployment complete!
🌍 https://xone-explorer-xxx.pages.dev
```

### 4.3 如果构建失败
**查看日志中的错误信息**，常见问题：

#### 错误 1: `document is not defined`
这是我们一直在修复的问题。如果在 Cloudflare 环境仍然出现：
- 复制完整的错误堆栈
- 找到具体是哪个文件
- 我会帮你继续修复

#### 错误 2: 环境变量缺失
- 检查是否添加了所有必需的环境变量
- 在 Settings > Environment variables 中补充

#### 错误 3: 构建命令失败
- 检查 Build command 是否正确
- 尝试修改为：`yarn build` 或 `npm run build`

---

## 第五步：访问部署的网站

### 5.1 获取 URL
部署成功后，Cloudflare 会提供一个 URL：
```
https://xone-explorer-xxx.pages.dev
```

### 5.2 测试功能
访问网站并检查：
- ✅ 首页加载正常
- ✅ 区块链数据显示
- ✅ 搜索功能
- ✅ 图表渲染
- ✅ 页面导航

### 5.3 绑定自定义域名（可选）
1. 在 Cloudflare Pages 项目中
2. 进入 **Custom domains**
3. 添加你的域名（如 `xonescan.com`）
4. 按提示配置 DNS

---

## 常见问题

### Q1: 推送代码时提示权限错误？
**A**: 使用 Personal Access Token 而不是密码。

### Q2: 构建时间过长？
**A**: Next.js 项目首次构建较慢（5-10分钟），后续会更快。

### Q3: 如何查看构建日志？
**A**: Pages 项目 → Deployments → 点击具体的部署 → View build log

### Q4: 如何重新部署？
**A**:
- 方式1：推送新代码到 GitHub，自动触发部署
- 方式2：在 Cloudflare Dashboard 点击 "Retry deployment"

### Q5: 如何更新环境变量？
**A**: Settings → Environment variables → Edit → Redeploy

---

## 部署后优化建议

### 1. 设置自动部署
已默认启用，每次 push 到 main 分支自动部署。

### 2. 配置 Preview Deployments
为每个 Pull Request 创建预览环境：
- Settings → Builds & deployments
- 启用 "Enable preview deployments"

### 3. 配置缓存
Cloudflare 会自动优化：
- 静态资源 CDN 缓存
- Edge 缓存
- 图片优化

### 4. 启用 Analytics
- 在 Pages 项目中启用 Web Analytics
- 查看访问量、性能指标

### 5. 配置环境
分别为 Production 和 Preview 配置不同的环境变量。

---

## 需要帮助？

如果遇到问题：

1. **复制完整的错误日志**
2. **截图构建失败的页面**
3. **告诉我具体的错误信息**

我会帮你继续解决！

---

## 快速命令参考

```bash
# 查看 Git 状态
git status

# 添加新修改
git add .
git commit -m "fix: your message"
git push

# 查看远程仓库
git remote -v

# 切换分支
git checkout -b feature-name

# 查看日志
git log --oneline
```

---

**祝部署顺利！🚀**
