# H5 Activity

基于 Vue 3 + TypeScript + Vant 4 的移动端 H5 活动管理应用，支持活动浏览、搜索、报名及个人信息管理。

## 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Vue 3.5 + TypeScript 5.6 |
| 构建 | Vite 6 |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia 2 |
| UI 组件 | Vant 4（按需自动导入） |
| HTTP | Axios |
| 样式 | SCSS + postcss-pxtorem（移动端适配） |
| 日期 | dayjs |
| 包管理 | pnpm |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

开发服务器默认运行在 `http://localhost:5173`，API 请求代理至 `http://47.113.194.28:8080`。

## 环境变量

| 变量 | 说明 | 开发环境 | 生产环境 |
|---|---|---|---|
| `VITE_APP_TITLE` | 应用标题 | `H5 Activity` | `H5 Activity` |
| `VITE_API_BASE_URL` | API 基础路径 | `/api`（走 vite proxy） | `https://api.example.com` |
| `VITE_DEV_PORT` | 开发服务器端口 | `5173` | - |

## 项目结构

```
src/
├── api/                    # API 请求层
│   ├── http.ts             # Axios 封装（拦截器、Token 管理、错误处理）
│   ├── event.ts            # 活动相关接口
│   ├── user.ts             # 用户相关接口
│   ├── industry.ts         # 行业列表接口
│   ├── field.ts            # 领域列表接口
│   └── message.ts          # 消息接口
├── components/             # 全局组件
│   └── FieldSelectDialog.vue  # 领域选择弹窗
├── composables/            # 组合式函数
│   └── usePageTitle.ts     # 动态标题
├── config/
│   └── env.ts              # 环境配置
├── router/
│   └── index.ts            # 路由配置（含导航守卫）
├── stores/                 # Pinia 状态管理
│   ├── activity.ts         # 活动报名状态
│   ├── user.ts             # 用户认证与资料
│   ├── search.ts           # 搜索状态
│   └── message.ts          # 未读消息计数
├── styles/                 # 全局样式
│   ├── index.scss          # 入口样式
│   ├── _variables.scss     # SCSS 变量
│   └── _reset.scss         # CSS 重置
├── types/                  # TypeScript 类型定义
│   ├── event.ts            # 活动类型
│   ├── user.ts             # 用户类型
│   ├── industry.ts         # 行业类型
│   ├── field.ts            # 领域类型
│   └── message.ts          # 消息类型
├── views/                  # 页面视图
│   ├── HomeView.vue               # 首页（活动搜索、Banner、即将开始列表）
│   ├── ActivitiesView.vue         # 全部活动列表（筛选 + 无限滚动）
│   ├── ActivityDetailView.vue     # 活动详情 + 动态报名表单
│   ├── LoginView.vue              # 登录 / 注册
│   ├── MineView.vue               # 个人中心（资料卡片、活动统计、我的报名）
│   ├── MineSettingsView.vue       # 个人信息编辑 + 修改密码 / 手机号
│   ├── MineActivityListView.vue   # 我的报名列表
│   ├── MessagesView.vue           # 消息中心
│   └── NotFoundView.vue           # 404 页面
├── App.vue                 # 根组件（keep-alive + 领域选择弹窗）
└── main.ts                 # 应用入口
```

## 路由表

| 路径 | 名称 | 组件 | 需认证 |
|---|---|---|---|
| `/` | `home` | HomeView | 否 |
| `/activities` | `activities` | ActivitiesView | 否 |
| `/activities/:id` | `activity-detail` | ActivityDetailView | 否 |
| `/login` | `login` | LoginView | 否 |
| `/mine` | `mine` | MineView | 是 |
| `/mine/settings` | `mine-settings` | MineSettingsView | 是 |
| `/mine/activities/:type` | `mine-activity-list` | MineActivityListView | 是 |
| `/messages` | `messages` | MessagesView | 是 |

## API 代理

开发环境下，所有 `/api` 开头的请求会被 Vite 代理到 `http://47.113.194.28:8080`。配置位于 `vite.config.ts` 的 `server.proxy`。

HTTP 客户端封装在 `src/api/http.ts`：
- 请求自动附加 Bearer Token
- 401 自动清除本地凭证
- 错误统一 Toast 提示

## 特性

- **动态报名表单**：活动详情接口返回 `user_info` 字段列表，报名表单据此动态渲染表单项（文本输入 / 行业选择器）
- **报名信息自动同步**：报名成功后，填写的个人信息自动同步至用户资料
- **移动端适配**：`amfe-flexible` + `postcss-pxtorem` 自动 px → rem 转换
- **按需导入**：Vant 组件通过 `unplugin-vue-components` 自动按需引入，无需手动注册
- **keep-alive 缓存**：首页和个人中心页面缓存，切换不丢失状态
