# WorkEase 模块说明

## 一、模块总览

WorkEase 由多个独立模块组成，每个模块负责特定的功能领域。所有模块均采用 IIFE 封装，避免全局变量污染。

```
┌─────────────────────────────────────────────────────────────────┐
│                        WorkEase 模块                          │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     Service 模块                        │   │
│  │                                                         │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │   │
│  │  │StorageService │  │ThemeService   │  │HealthService│  │   │
│  │  │(存储服务)     │  │(主题服务)     │  │(健康评分)   │  │   │
│  │  └───────────────┘  └───────────────┘  └─────────────┘  │   │
│  │                                                         │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │   │
│  │  │SmartCoach     │  │SmartRhythm    │  │WorkSense    │  │   │
│  │  │Service        │  │Service        │  │Service      │  │   │
│  │  │(智能教练)     │  │(节奏分析)     │  │(状态感知)   │  │   │
│  │  └───────────────┘  └───────┬───────┘  └───────┬─────┘  │   │
│  │                            │                   │        │   │
│  │                            └───────────────────┘        │   │
│  │                                    │                   │   │
│  │  ┌───────────────┐                 │                   │   │
│  │  │HealthRecord   │◄────────────────┘                   │   │
│  │  │Service        │(健康记录)                           │   │
│  │  └───────────────┘                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     UI 组件模块                        │   │
│  │                                                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │   │
│  │  │Toast     │  │Skeleton  │  │WorkSense │  │Health  │  │   │
│  │  │(提示)    │  │(骨架屏)  │  │Card      │  │Score   │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  │Card    │  │   │
│  │                                            └────────┘  │   │
│  │  ┌──────────┐  ┌──────────┐                            │   │
│  │  │Smart     │  │Smart     │                            │   │
│  │  │CoachCard │  │Rhythm    │                            │   │
│  │  │(智能教练)│  │Card      │                            │   │
│  │  └──────────┘  └──────────┘                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     工具模块                            │   │
│  │                                                         │   │
│  │  ┌───────────┐                                         │   │
│  │  │healthRule │(健康评分规则)                            │   │
│  │  └───────────┘                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## 二、Service 模块

### 2.1 StorageService

**文件**: `services/StorageService.js`

**职责**: 统一封装 LocalStorage 操作

**核心方法**:
- `get(key)` - 获取存储数据
- `set(key, value)` - 存储数据
- `remove(key)` - 删除数据
- `clear()` - 清空所有数据

**特点**:
- 添加 'workease_' 前缀，避免键名冲突
- 处理 QuotaExceededError，提供用户友好提示
- 支持 JSON 序列化/反序列化

### 2.2 ThemeService

**文件**: `services/ThemeService.js`

**职责**: 管理主题切换

**核心方法**:
- `getTheme()` - 获取当前主题
- `setTheme(theme)` - 设置主题
- `toggleTheme()` - 切换主题

**特点**:
- 使用 CSS Variables 通过 data-theme 属性切换
- 无需页面刷新
- 自动保存用户偏好

### 2.3 HealthService

**文件**: `services/HealthService.js`

**职责**: 健康评分计算

**核心方法**:
- `calculateScore()` - 计算综合健康评分
- `getBreakdown()` - 获取各维度评分详情
- `updateScore(dimension, value)` - 更新特定维度分数

**评分维度**:
| 维度 | 权重 | 说明 |
|------|------|------|
| 坐姿 | 25% | 基于姿态检测 |
| 运动 | 25% | 基于拉伸完成次数 |
| 休息 | 20% | 基于休息频率 |
| 作息 | 15% | 基于工作时长 |
| 护眼 | 15% | 基于护眼提醒完成率 |

### 2.4 SmartRhythmService

**文件**: `services/rhythm.service.js`

**职责**: 工作节奏分析引擎（WorkSense 的底层核心）

**核心方法**:
- `analyseWorkRhythm()` - 分析当前工作节奏
- `getCurrentState()` - 获取当前状态
- `calculateNextReminder()` - 计算下次提醒时间
- `confirmStateTransition()` - 确认状态转换

**状态机**:
- **Focus** (深度专注): 高频操作，延迟提醒
- **Normal** (正常办公): 中等操作，正常提醒
- **Relax** (休息中): 低操作或离开，立即建议

**特点**:
- 滞后机制（5分钟确认）防止状态频繁切换
- 事件节流（500ms）优化性能
- 所有数据本地分析

### 2.5 WorkSenseService

**文件**: `services/worksense.service.js`

**职责**: WorkSense™ 智能工作状态感知引擎（核心创新模块）

**核心方法**:
- `analyseState()` - 分析当前状态并生成 AI 解释
- `estimateBenefit(action)` - 估算健康收益
- `generateInsight()` - 生成今日 AI 洞察
- `getFocusStatistics()` - 获取今日专注统计

**AI 分析能力**:
- 动态生成自然语言解释
- 根据实际数据生成个性化洞察
- 健康收益预测（评分变化、疲劳指数、久坐风险）

**状态颜色规范**:
| 状态 | 颜色 | 含义 |
|------|------|------|
| Focus | #10b981 (绿色) | 深度专注 |
| Normal | #3b82f6 (蓝色) | 正常办公 |
| Relax | #8b5cf6 (紫色) | 休息中 |

### 2.6 SmartCoachService

**文件**: `services/SmartCoachService.js`

**职责**: 智能教练推荐服务

**核心方法**:
- `recommend()` - 根据当前状态推荐动作
- `estimateScore()` - 估算评分提升
- `recommendReason()` - 生成推荐理由
- `recordSkip()` - 记录跳过推荐
- `recordAccept()` - 记录采纳推荐

**推荐策略**:
- 根据连续坐立时间、姿势检测、健康评分、时间等因素动态选择
- 推荐 5 分钟舒缓动作
- AI 自然语言解释推荐理由

### 2.7 HealthRecordService

**文件**: `services/healthRecord.service.js`

**职责**: AI 健康记录服务

**核心方法**:
- `generateDailyRecord()` - 生成每日健康记录
- `recordEvent(type, title, data)` - 记录时间轴事件
- `generateHighlights()` - 生成今日亮点
- `generateTomorrowGoal()` - 生成明日目标
- `generateBadges()` - 生成成就徽章

**成就徽章**:
| 徽章 | 解锁条件 |
|------|---------|
| 第一次坚持 | 完成1次拉伸 |
| 连续3天打卡 | 连续3天完成拉伸 |
| 连续5天打卡 | 连续5天完成拉伸 |
| 连续7天打卡 | 连续7天完成拉伸 |
| 完成5次拉伸 | 累计5次 |
| 完成10次拉伸 | 累计10次 |
| 完成20次拉伸 | 累计20次 |
| 护眼达人 | 护眼提醒≥3次 |
| 专注一小时 | 最长专注≥60分钟 |
| 超长专注 | 最长专注≥90分钟 |
| 健康评分80+ | 评分≥80 |
| 健康评分90+ | 评分≥90 |
| 久坐终结者 | 采纳率≥80% |
| 完美一天 | 综合条件达标 |

## 三、UI 组件模块

### 3.1 Toast

**文件**: `components/Toast.js`

**职责**: 统一提示组件

**特点**:
- 支持多种类型：success/error/warning/info/loading
- 队列机制，自动排队显示
- 可配置时长、位置
- 平滑进入/退出动画

### 3.2 Skeleton

**文件**: `components/Skeleton.js`

**职责**: 骨架屏组件

**支持类型**:
- healthScore - 健康评分卡片
- smartCoach - 智能教练卡片
- statsCard - 统计卡片
- statsGrid - 统计网格
- stretchCard - 拉伸卡片
- stretchGrid - 拉伸网格
- emptyState - 空状态
- loading - 加载动画

### 3.3 WorkSenseCard

**文件**: `components/WorkSenseCard.js`

**职责**: WorkSense™ 状态卡片（首页顶部）

**展示内容**:
- 当前工作状态（Focus/Normal/Relax）
- 连续工作时间（数字滚动动画）
- AI 分析文本
- 今日专注统计（累计、最长、智能延迟、采纳率）
- 健康收益预测
- 今日 AI 洞察
- 隐私提示

**动画效果**:
- 状态切换淡入淡出动画
- 数字滚动动画
- 轻微浮动动画

### 3.4 HealthScoreCard

**文件**: `components/HealthScoreCard.js`

**职责**: 健康评分卡片

**展示内容**:
- 综合健康评分（数字滚动动画）
- 五维度评分详情
- 改善建议

**交互**:
- 点击维度查看详情
- 按钮点击反馈动画

### 3.5 SmartCoachCard

**文件**: `components/SmartCoachCard.js`

**职责**: 智能教练卡片

**展示内容**:
- 推荐动作名称
- AI 解释文本
- 预计改善效果
- 评分提升预估

**操作按钮**:
- 开始训练
- 稍后提醒（10分钟后）
- 换一个推荐

### 3.6 SmartRhythmCard

**文件**: `components/SmartRhythmCard.js`

**状态**: 已集成到 WorkSenseCard，保留作为备用

## 四、工具模块

### 4.1 healthRule

**文件**: `utils/healthRule.js`

**职责**: 健康评分规则配置

**内容**:
- 各维度评分规则
- 评分计算逻辑
- 等级划分标准

## 五、样式模块

### 5.1 theme.css

**职责**: 主题样式，包含 Light/Dark 主题变量

### 5.2 design.css

**职责**: 统一设计规范，包含：
- 阴影、圆角、留白
- 字体大小、颜色层级
- 按钮、卡片、输入框样式

### 5.3 animation.css

**职责**: 统一动画系统，包含：
- 缓动函数定义
- 页面切换动画
- 交互反馈动画
- Toast/Modal 动画

### 5.4 loading.css

**职责**: 加载体验样式，包含：
- 页面加载动画
- 骨架屏样式
- 按钮加载状态

### 5.5 worksense.css

**职责**: WorkSense 状态卡片样式

### 5.6 healthScore.css

**职责**: 健康评分卡片样式

### 5.7 smartCoach.css

**职责**: 智能教练卡片样式

### 5.8 healthRecord.css

**职责**: AI 健康记录页面样式

## 六、模块依赖关系

```
                     index.html
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
  StorageService    ThemeService    Toast
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
              ┌───────────────────┐
              │   HealthService   │
              │   SmartCoach      │
              │   SmartRhythm     │
              └─────────┬─────────┘
                        ▼
              ┌───────────────────┐
              │   WorkSense       │
              │   HealthRecord    │
              └─────────┬─────────┘
                        ▼
              ┌───────────────────┐
              │   UI Components   │
              │   (Cards)         │
              └───────────────────┘
```

## 七、模块通信机制

1. **事件监听**: 通过 `window.addEventListener` 和 `dispatchEvent` 实现跨模块通信
2. **全局实例**: 核心服务通过 `window.*` 暴露，便于组件访问
3. **依赖注入**: Service 层通过构造函数注入依赖

## 八、扩展指南

### 添加新模块步骤

1. **创建 Service 文件** (`services/*.service.js`)
2. **创建 UI 组件** (`components/*.js`)（可选）
3. **创建样式文件** (`styles/*.css`)（可选）
4. **在 index.html 中引入**
5. **在初始化脚本中创建实例**

### 注意事项

- 业务逻辑必须放在 Service 文件中
- UI 组件只负责展示，不包含业务逻辑
- 使用 IIFE 封装，避免全局变量污染
- 通过 StorageService 访问 LocalStorage，禁止直接调用
- 事件监听器必须保存引用并在销毁时清理