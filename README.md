# 工位健康助手

基于浏览器端姿态识别的工位健康监测工具。

## ✨ 功能特性

- **AI 姿态识别** - 实时检测头部前倾、耸肩、含胸等不良姿势
- **久坐提醒** - 支持 30/45/60 分钟自定义间隔
- **护眼提醒** - 每 20 分钟提醒远眺放松
- **拉伸动作库** - 肩颈、腰背、手腕、眼部四类拉伸方案
- **数据统计** - 每日概览与周趋势图表
- **隐私安全** - 所有数据本地处理，不上传云端

## 🚀 快速开始

### 本地运行

```bash
# 使用 Python 启动本地服务器
python -m http.server 8888

# 或使用 Node.js
npx serve

# 访问地址
http://localhost:8888
```

### 部署到 GitHub Pages

1. **创建仓库** - 在 GitHub 创建新仓库，命名如 `workplace-health-assistant`

2. **上传文件** - 确保仓库包含以下文件：
   - `index.html` - 主页面
   - `.nojekyll` - 禁用 Jekyll 处理

3. **启用 GitHub Pages**
   - 进入仓库 → Settings → Pages
   - Source 选择 `main` 分支，`/root` 目录
   - 点击 Save

4. **访问地址**
   - `https://你的用户名.github.io/workplace-health-assistant`

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **Tailwind CSS** - 样式框架
- **JavaScript ES6+** - 核心逻辑
- **MediaPipe Pose** - 姿态识别
- **Chart.js** - 数据可视化
- **LocalStorage** - 数据持久化

## 📱 兼容性

- ✅ Chrome / Edge (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ 移动端浏览器

## 🔒 隐私说明

- 摄像头数据仅在浏览器端处理，**绝不上传网络**
- 所有用户数据存储在本地浏览器的 LocalStorage 中
- 无需登录，无需注册，无任何云端数据收集

## 📝 License

MIT
