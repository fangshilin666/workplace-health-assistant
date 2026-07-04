# WorkEase

> 不是提醒你休息，而是在最合适的时间提醒你休息。

![WorkEase](https://img.shields.io/badge/WorkEase-v1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Platform](https://img.shields.io/badge/Platform-Web-blue.svg)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen.svg)](https://fangshilin666.github.io/workplace-health-assistant/)

---

## 项目简介

WorkEase 是一款基于 AI 的智能工位健康助手，旨在通过实时感知用户工作状态，动态调整健康提醒策略，实现「Less Interrupt, More Care」的核心理念。

传统的久坐提醒采用固定时间间隔（如每45分钟提醒一次），容易打断用户的工作节奏。WorkEase 采用 **WorkSense™ 智能工作状态感知引擎**，通过分析用户的键盘输入、鼠标移动、页面可见性等行为数据，自动识别用户当前处于「深度专注」「正常办公」或「休息状态」，并据此动态调整提醒时机。

## 产品定位

| 维度 | 传统久坐提醒 | WorkEase |
|------|------------|----------|
| 提醒方式 | 固定时间间隔 | 智能感知状态 |
| 用户体验 | 被动打扰 | 主动关怀 |
| 个性化 | 无 | AI动态调整 |
| 数据处理 | 云端处理 | 本地分析 |
| 隐私保护 | 弱 | 强（零数据上传） |

## 核心亮点

### 1. WorkSense™ 智能工作状态感知
- 实时分析用户工作节奏
- 三状态自动识别：深度专注、正常办公、休息状态
- 基于行为数据的智能提醒策略
- 所有分析均在浏览器本地完成

### 2. AI 健康评分引擎
- 多维度健康评估：坐姿、运动、休息、作息、护眼
- 实时评分更新与趋势追踪
- 个性化改善建议

### 3. Smart Coach 智能教练
- 基于当前状态的个性化动作推荐
- AI 自然语言解释推荐理由
- 预计健康收益预测

### 4. AI 健康记录
- 每日健康报告自动生成
- 时间轴记录全天健康行为
- 成就徽章系统激励用户坚持
- AI 分析与明日目标推荐

### 5. 极致隐私保护
- ✅ 所有数据本地存储
- ✅ 无云端数据上传
- ✅ 不记录键盘输入内容
- ✅ 不上传鼠标轨迹
- ✅ 仅统计行为次数

## 技术栈

- **前端框架**: 原生 HTML5 + JavaScript ES6+
- **样式**: Tailwind CSS 3 + 自定义 CSS
- **图标**: Lucide Icons
- **AI 分析**: 本地 JavaScript 引擎（无需外部 AI API）
- **存储**: LocalStorage（通过 StorageService 封装）
- **动画**: CSS Animations + requestAnimationFrame

## 功能展示

### 首页概览
![首页概览](docs/screenshots/home.png)

### AI 工作状态感知
![AI工作状态](docs/screenshots/worksense.png)

### 健康评分
![健康评分](docs/screenshots/health-score.png)

### 智能教练推荐
![智能教练](docs/screenshots/smart-coach.png)

### AI 健康记录
![健康记录](docs/screenshots/health-record.png)

### 设置中心
![设置中心](docs/screenshots/settings.png)

## 项目结构

```
WorkEase/
├── index.html                    # 主页面
├── README.md                     # 项目说明
├── LICENSE                       # 许可证
├── .gitignore                    # Git 忽略配置
├── styles/                       # 样式文件
│   ├── theme.css                 # 主题样式
│   ├── design.css                # 统一设计规范
│   ├── animation.css             # 统一动画系统
│   ├── loading.css               # 加载体验样式
│   ├── healthScore.css           # 健康评分样式
│   ├── smartCoach.css            # 智能教练样式
│   ├── smartRhythm.css           # 工作节奏样式（底层引擎）
│   ├── worksense.css             # WorkSense 样式
│   └── healthRecord.css          # 健康记录样式
├── services/                     # 服务层
│   ├── StorageService.js         # 存储服务
│   ├── ThemeService.js           # 主题服务
│   ├── HealthService.js          # 健康评分服务
│   ├── SmartCoachService.js      # 智能教练服务
│   ├── rhythm.service.js         # SmartRhythm 底层分析引擎
│   ├── worksense.service.js      # WorkSense 工作状态感知服务
│   └── healthRecord.service.js   # AI 健康记录服务
├── components/                   # UI 组件
│   ├── Toast.js                  # 统一提示组件
│   ├── Skeleton.js               # 骨架屏组件
│   ├── HealthScoreCard.js        # 健康评分卡片
│   ├── SmartCoachCard.js         # 智能教练卡片
│   ├── SmartRhythmCard.js        # 工作节奏卡片（已集成到 WorkSense）
│   └── WorkSenseCard.js          # WorkSense 状态卡片
├── utils/                        # 工具函数
│   └── healthRule.js             # 健康评分规则
└── docs/                         # 项目文档
    ├── architecture.md           # 系统架构
    ├── modules.md                # 模块说明
    ├── roadmap.md                # 开发路线
    ├── changelog.md              # 更新日志
    ├── deployment.md             # 部署说明
    └── screenshots/              # 项目截图
```

## 本地运行

项目为纯静态 HTML 项目，无需任何构建工具或依赖安装。

### 方式一：直接打开

1. 克隆或下载项目
2. 使用浏览器直接打开 `index.html` 文件
3. 即可开始使用

### 方式二：本地服务器（推荐）

```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js
npx serve .

# 使用 PHP
php -S localhost:8080
```

然后访问 `http://localhost:8080`

## 部署方式

### 静态托管

项目可部署到任何静态托管平台：

- **GitHub Pages**: 直接部署到 GitHub Pages
- **Vercel**: 一键部署
- **Netlify**: 一键部署
- **阿里云 OSS / 腾讯云 COS**: 静态文件托管

### 部署步骤

1. 确保项目根目录包含 `index.html`
2. 将所有文件上传到静态托管服务
3. 配置自定义域名（可选）

## 后续规划

### 短期目标（1-3个月）
- [ ] 支持多语言切换
- [ ] 导出健康报告为 PDF
- [ ] 分享卡片 PNG 生成
- [ ] 移动端 PWA 支持

### 中期目标（3-6个月）
- [ ] AI 聊天助手模块
- [ ] 语音提醒功能
- [ ] 个性化训练计划
- [ ] 多日学习与自适应推荐

### 长期目标（6-12个月）
- [ ] WebRTC 实时视频分析
- [ ] 智能手环/手表集成
- [ ] 团队健康管理版本
- [ ] 企业级部署方案

## 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 项目地址: [https://github.com/fangshilin666/WorkEase](https://github.com/fangshilin666/WorkEase)
- 邮箱: 2094821175@qq.com

---

> 💡 **提示**: 项目所有数据均在本地处理，无需担心隐私泄露。