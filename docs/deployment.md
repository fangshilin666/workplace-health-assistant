# WorkEase 部署说明

## 一、项目概述

WorkEase 是一个纯前端的静态应用，无需后端服务器支持。所有数据存储在浏览器本地（LocalStorage），所有分析均在客户端完成。

### 技术特点

- 纯原生 JavaScript，无需构建工具
- 所有依赖通过 CDN 引入
- 静态 HTML 文件，可直接部署
- 零后端依赖，无需数据库

## 二、本地运行

### 方式一：直接打开 HTML

最简单的方式是直接在浏览器中打开 `index.html` 文件。

```bash
# 克隆项目
git clone https://github.com/yourusername/workease.git

# 进入项目目录
cd workease

# 直接打开 index.html
# 双击文件或使用浏览器打开
```

### 方式二：使用本地服务器

为了获得更好的开发体验（如路由、API 模拟等），建议使用本地服务器。

#### 使用 Python

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

然后访问 `http://localhost:8000`

#### 使用 Node.js

```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8000
```

然后访问 `http://localhost:8000`

#### 使用 VS Code Live Server

1. 安装 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 扩展
2. 在 VS Code 中打开项目文件夹
3. 右键点击 `index.html`，选择 "Open with Live Server"

## 三、部署到 GitHub Pages

### 方式一：使用 gh-pages 分支

1. 创建 `gh-pages` 分支

```bash
git checkout -b gh-pages
```

2. 推送分支到 GitHub

```bash
git push origin gh-pages
```

3. 在 GitHub 仓库设置中配置

- 进入仓库 Settings → Pages
- Source 选择 `gh-pages` 分支
- 点击 Save

### 方式二：使用 GitHub Actions (推荐)

创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

配置完成后，每次推送到 `main` 分支，自动部署到 GitHub Pages。

### 方式三：手动部署

```bash
# 安装 gh-pages 包
npm install -g gh-pages

# 部署到 gh-pages 分支
gh-pages -d .
```

## 四、部署到 Vercel

1. 访问 [Vercel](https://vercel.com/) 并登录
2. 点击 "New Project"
3. 选择 GitHub 仓库
4. 配置项目：
   - Framework Preset: `Other`
   - Build Command: 留空
   - Output Directory: `.`
5. 点击 "Deploy"

## 五、部署到 Netlify

1. 访问 [Netlify](https://www.netlify.com/) 并登录
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub 仓库
4. 配置项目：
   - Build command: 留空
   - Publish directory: `.`
5. 点击 "Deploy site"

## 六、部署到 Cloudflare Pages

1. 访问 [Cloudflare Pages](https://pages.cloudflare.com/) 并登录
2. 点击 "Create a project"
3. 选择 GitHub 仓库
4. 配置项目：
   - Framework: `None`
   - Build command: 留空
   - Build output directory: `.`
5. 点击 "Save and Deploy"

## 七、部署注意事项

### 1. 路由配置

由于项目使用 hash 路由（`#/path`），大多数静态托管服务无需特殊配置。

如果使用 history 路由，需要配置：
- GitHub Pages: 创建 `404.html` 文件
- Vercel: 在 `vercel.json` 中配置 rewrites
- Netlify: 创建 `_redirects` 文件
- Cloudflare Pages: 在配置中设置 "Always use trailing slash"

### 2. 缓存策略

建议设置合理的缓存策略：
- HTML 文件：不缓存或短时间缓存（5分钟）
- CSS/JS 文件：长期缓存（1年），配合文件版本号
- 静态资源：长期缓存

### 3. HTTPS

所有现代托管服务默认支持 HTTPS，请确保启用。

### 4. 自定义域名

如需使用自定义域名：
- 在托管服务中配置域名
- 在 DNS 中添加 CNAME/A 记录
- 配置 SSL 证书

## 八、环境变量

WorkEase 当前不需要任何环境变量。所有配置通过 `index.html` 中的脚本标签进行。

如需添加环境变量（如 API 密钥等），建议：

1. 创建 `.env` 文件
2. 使用构建工具（如 Vite）注入环境变量
3. 注意不要提交敏感信息到 GitHub

## 九、CI/CD 配置示例

### GitHub Actions 完整配置

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Lint HTML
        uses: htmlhint/action@master
        with:
          config: .htmlhintrc
      
      - name: Lint CSS
        uses: stylelint/stylelint-action@v3
        with:
          config: .stylelintrc
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## 十、常见问题

### Q1: 页面显示空白？

**原因**: JavaScript 执行失败或资源加载失败

**解决方案**:
1. 检查浏览器控制台（F12）查看错误信息
2. 确保 CDN 资源可访问
3. 尝试使用本地服务器运行

### Q2: 数据丢失？

**原因**: 浏览器清除缓存或 LocalStorage 被清空

**解决方案**:
1. 提示用户定期导出数据
2. 实现数据备份功能（未来版本）

### Q3: 移动端显示异常？

**原因**: 响应式布局问题

**解决方案**:
1. 使用 Chrome DevTools 移动设备模式测试
2. 检查 Tailwind CSS 断点配置

### Q4: 部署后样式丢失？

**原因**: 路径配置问题

**解决方案**:
1. 确保 CSS 文件路径正确
2. 检查 CDN 链接是否完整

## 十一、离线运行

WorkEase 支持离线运行，但需要满足以下条件：

1. 浏览器已缓存所有资源
2. 使用 Service Worker（可选，未来版本）

**PWA 支持（未来版本）**:
- 添加 manifest.json
- 实现 Service Worker
- 支持离线安装

---

*最后更新: 2026年7月*

*WorkEase 开发团队*
